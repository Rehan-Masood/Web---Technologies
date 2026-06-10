<?php
declare(strict_types=1);

require_once __DIR__ . '/database.php';

error_reporting(E_ALL);
ini_set('display_errors', '0');
ini_set('log_errors', '1');

if (!ob_get_level()) {
    ob_start();
}

set_error_handler(static function (int $severity, string $message, string $file, int $line): bool {
    if (!(error_reporting() & $severity)) {
        return false;
    }

    throw new ErrorException($message, 0, $severity, $file, $line);
});

set_exception_handler(static function (Throwable $exception): void {
    if (ob_get_level()) {
        ob_clean();
    }

    if (!headers_sent()) {
        header('Content-Type: application/json; charset=utf-8');
    }

    http_response_code(500);
    echo json_encode([
        'success' => false,
        'error' => 'Server error. Please check Apache/PHP logs.',
        'details' => $exception->getMessage(),
    ], JSON_UNESCAPED_SLASHES);
    exit;
});

const ORDER_STATUSES = [
    'pending',
    'accepted',
    'preparing',
    'ready_for_pickup',
    'assigned_to_delivery_man',
    'picked_up',
    'out_for_delivery',
    'delivered',
    'cancelled',
    'rejected',
    'failed_delivery',
];

const DELIVERY_STATUSES = [
    'assigned',
    'accepted',
    'picked_up',
    'out_for_delivery',
    'delivered',
    'failed',
    'cancelled',
];

function configure_api(): void
{
    $origin = env_value('APP_ORIGIN', '');
    $requestOrigin = $_SERVER['HTTP_ORIGIN'] ?? '';
    $allowOrigin = $origin !== '' ? $origin : ($requestOrigin !== '' ? $requestOrigin : '*');

    header('Content-Type: application/json; charset=utf-8');
    header('Access-Control-Allow-Origin: ' . $allowOrigin);
    header('Access-Control-Allow-Methods: GET, POST, PUT, PATCH, DELETE, OPTIONS');
    header('Access-Control-Allow-Headers: Content-Type, Authorization');

    if ($allowOrigin !== '*') {
        header('Access-Control-Allow-Credentials: true');
    }

    if (($_SERVER['REQUEST_METHOD'] ?? 'GET') === 'OPTIONS') {
        http_response_code(204);
        exit;
    }

    if (session_status() === PHP_SESSION_NONE) {
        session_name(env_value('SESSION_NAME', 'food_express_session'));
        session_start();
    }
}

configure_api();

function respond(array $payload = [], int $status = 200): void
{
    if (ob_get_level()) {
        ob_clean();
    }

    http_response_code($status);
    echo json_encode($payload, JSON_UNESCAPED_SLASHES);
    exit;
}

function fail(string $message, int $status = 400, array $extra = []): void
{
    respond(array_merge([
        'success' => false,
        'error' => $message,
    ], $extra), $status);
}

function ok(array $data = [], int $status = 200): void
{
    respond(array_merge(['success' => true], $data), $status);
}

function request_method(): string
{
    return strtoupper($_SERVER['REQUEST_METHOD'] ?? 'GET');
}

function require_method(array $allowed): void
{
    if (!in_array(request_method(), $allowed, true)) {
        fail('Method not allowed.', 405);
    }
}

function action_name(string $default = 'list'): string
{
    return trim((string)($_GET['action'] ?? $default));
}

function json_input(): array
{
    $raw = file_get_contents('php://input');
    if ($raw === false || trim($raw) === '') {
        return $_POST;
    }

    $data = json_decode($raw, true);
    if (!is_array($data)) {
        fail('Invalid JSON request body.', 400);
    }

    return $data;
}

function string_input(array $input, string $key, string $fallback = ''): string
{
    return trim((string)($input[$key] ?? $fallback));
}

function alt_string(array $input, array $keys, string $fallback = ''): string
{
    foreach ($keys as $key) {
        if (array_key_exists($key, $input)) {
            return string_input($input, $key, $fallback);
        }
    }

    return $fallback;
}

function int_input(array $input, string $key, int $fallback = 0): int
{
    return (int)($input[$key] ?? $fallback);
}

function bool_input(array $input, string $key, bool $fallback = false): bool
{
    if (!array_key_exists($key, $input)) {
        return $fallback;
    }

    $value = $input[$key];
    if (is_bool($value)) {
        return $value;
    }

    return in_array(strtolower((string)$value), ['1', 'true', 'yes', 'on'], true);
}

function normalize_key(string $value): string
{
    $value = strtolower(trim($value));
    $value = preg_replace('/[^a-z0-9]+/', '_', $value) ?? $value;
    return trim($value, '_');
}

function normalize_status(string $status, array $allowed): string
{
    $normalized = normalize_key($status);
    $aliases = [
        'ready' => 'ready_for_pickup',
        'ready_for_pickup' => 'ready_for_pickup',
        'assigned' => 'assigned_to_delivery_man',
        'assigned_to_delivery' => 'assigned_to_delivery_man',
        'failed' => 'failed_delivery',
        'failed_delivery' => 'failed_delivery',
    ];

    $normalized = $aliases[$normalized] ?? $normalized;

    if (!in_array($normalized, $allowed, true)) {
        fail('Invalid status.', 422, ['allowed' => $allowed]);
    }

    return $normalized;
}

function fetch_one(string $sql, array $params = []): ?array
{
    $stmt = db()->prepare($sql);
    $stmt->execute($params);
    $row = $stmt->fetch();
    return $row === false ? null : $row;
}

function fetch_all(string $sql, array $params = []): array
{
    $stmt = db()->prepare($sql);
    $stmt->execute($params);
    return $stmt->fetchAll();
}

function sanitize_user(array $user): array
{
    unset($user['password_hash']);
    $user['is_blocked'] = (bool)($user['is_blocked'] ?? false);
    return $user;
}

function sanitize_delivery_man(array $deliveryMan): array
{
    unset($deliveryMan['password_hash']);
    $deliveryMan['is_active'] = (bool)($deliveryMan['is_active'] ?? false);
    return $deliveryMan;
}

function current_user(): ?array
{
    $userId = $_SESSION['user_id'] ?? null;
    if (!$userId) {
        return null;
    }

    $user = fetch_one('SELECT * FROM users WHERE id = ?', [(int)$userId]);
    if (!$user) {
        unset($_SESSION['user_id']);
        return null;
    }

    return $user;
}

function require_user(?array $roles = null): array
{
    $user = current_user();
    if (!$user) {
        fail('Authentication required.', 401);
    }

    if ((bool)$user['is_blocked']) {
        fail('This account is blocked.', 403);
    }

    if ($roles !== null && !in_array($user['role'], $roles, true)) {
        fail('Unauthorized.', 403);
    }

    return $user;
}

function require_customer(): array
{
    return require_user(['customer']);
}

function require_admin(): array
{
    return require_user(['admin']);
}

function current_delivery_man(): ?array
{
    $deliveryManId = $_SESSION['delivery_man_id'] ?? null;
    if (!$deliveryManId) {
        return null;
    }

    $deliveryMan = fetch_one('SELECT * FROM delivery_men WHERE id = ?', [(int)$deliveryManId]);
    if (!$deliveryMan) {
        unset($_SESSION['delivery_man_id']);
        return null;
    }

    return $deliveryMan;
}

function require_delivery_man(): array
{
    $deliveryMan = current_delivery_man();
    if (!$deliveryMan) {
        fail('Delivery man authentication required.', 401);
    }

    if (!(bool)$deliveryMan['is_active'] || $deliveryMan['status'] === 'inactive') {
        fail('This delivery account is inactive.', 403);
    }

    return $deliveryMan;
}

function make_order_number(): string
{
    return 'FE-' . date('Ymd-His') . '-' . random_int(100, 999);
}

function make_reservation_number(): string
{
    return 'RES-' . date('Ymd-His') . '-' . random_int(100, 999);
}

function add_order_history(int $orderId, string $status, ?int $changedByUserId = null, ?int $changedByDeliveryManId = null, string $note = ''): void
{
    db()->prepare(
        'INSERT INTO order_status_history (order_id, status, changed_by_user_id, changed_by_delivery_man_id, note)
         VALUES (?, ?, ?, ?, ?)'
    )->execute([$orderId, $status, $changedByUserId, $changedByDeliveryManId, $note]);
}

function create_notification(?int $userId, ?int $deliveryManId, string $title, string $message, string $type = 'info'): void
{
    db()->prepare(
        'INSERT INTO notifications (user_id, delivery_man_id, title, message, type)
         VALUES (?, ?, ?, ?, ?)'
    )->execute([$userId, $deliveryManId, $title, $message, $type]);
}

function cart_payload(int $userId): array
{
    $cart = fetch_one('SELECT * FROM carts WHERE user_id = ?', [$userId]);
    if (!$cart) {
        return [
            'items' => [],
            'subtotal' => 0,
            'delivery_fee' => 0,
            'total' => 0,
            'item_count' => 0,
        ];
    }

    $items = fetch_all(
        'SELECT ci.menu_item_id, ci.quantity, mi.name, mi.price, mi.image_url, mi.category_id, mi.is_available,
                (ci.quantity * mi.price) AS line_total
         FROM cart_items ci
         JOIN menu_items mi ON mi.id = ci.menu_item_id
         WHERE ci.cart_id = ?
         ORDER BY ci.id',
        [(int)$cart['id']]
    );

    $subtotal = 0.0;
    $itemCount = 0;

    foreach ($items as &$item) {
        $item['quantity'] = (int)$item['quantity'];
        $item['price'] = (float)$item['price'];
        $item['line_total'] = (float)$item['line_total'];
        $item['is_available'] = (bool)$item['is_available'];
        $subtotal += $item['line_total'];
        $itemCount += $item['quantity'];
    }
    unset($item);

    $deliveryFee = count($items) > 0 ? 199.0 : 0.0;

    return [
        'items' => $items,
        'subtotal' => $subtotal,
        'delivery_fee' => $deliveryFee,
        'total' => $subtotal + $deliveryFee,
        'item_count' => $itemCount,
    ];
}

function order_payload(int $orderId): ?array
{
    $order = fetch_one(
        'SELECT o.*, u.full_name AS customer_name, u.email AS customer_email, u.phone AS customer_phone,
                dm.full_name AS delivery_man_name, dm.phone AS delivery_man_phone, dm.vehicle_number
         FROM orders o
         JOIN users u ON u.id = o.user_id
         LEFT JOIN delivery_men dm ON dm.id = o.assigned_delivery_man_id
         WHERE o.id = ?',
        [$orderId]
    );

    if (!$order) {
        return null;
    }

    $order['subtotal'] = (float)$order['subtotal'];
    $order['delivery_fee'] = (float)$order['delivery_fee'];
    $order['total_amount'] = (float)$order['total_amount'];

    $order['items'] = fetch_all(
        'SELECT id, menu_item_id, item_name, unit_price, quantity, line_total
         FROM order_items
         WHERE order_id = ?
         ORDER BY id',
        [$orderId]
    );

    foreach ($order['items'] as &$item) {
        $item['unit_price'] = (float)$item['unit_price'];
        $item['line_total'] = (float)$item['line_total'];
        $item['quantity'] = (int)$item['quantity'];
    }
    unset($item);

    $order['timeline'] = fetch_all(
        'SELECT status, note, created_at
         FROM order_status_history
         WHERE order_id = ?
         ORDER BY created_at, id',
        [$orderId]
    );

    return $order;
}

function ensure_cart(int $userId): int
{
    $cart = fetch_one('SELECT id FROM carts WHERE user_id = ?', [$userId]);
    if ($cart) {
        return (int)$cart['id'];
    }

    db()->prepare('INSERT INTO carts (user_id) VALUES (?)')->execute([$userId]);
    return (int)db()->lastInsertId();
}
