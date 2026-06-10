<?php
declare(strict_types=1);

require_once __DIR__ . '/config/helpers.php';

require_method(['GET']);

$orderId = (int)($_GET['order_id'] ?? $_GET['id'] ?? 0);
$order = fetch_one('SELECT * FROM orders WHERE id = ?', [$orderId]);

if (!$order) {
    fail('Order not found.', 404);
}

$user = current_user();
$deliveryMan = current_delivery_man();
$allowed = false;

if ($user && !(bool)$user['is_blocked']) {
    $allowed = $user['role'] === 'admin' || (int)$order['user_id'] === (int)$user['id'];
}

if (!$allowed && $deliveryMan) {
    $assignment = fetch_one(
        'SELECT id FROM delivery_assignments WHERE order_id = ? AND delivery_man_id = ? LIMIT 1',
        [$orderId, (int)$deliveryMan['id']]
    );
    $allowed = (bool)$assignment;
}

if (!$allowed) {
    fail('Unauthorized.', 403);
}

$items = fetch_all(
    'SELECT id, menu_item_id, item_name, unit_price, quantity, line_total
     FROM order_items
     WHERE order_id = ?
     ORDER BY id',
    [$orderId]
);

foreach ($items as &$item) {
    $item['unit_price'] = (float)$item['unit_price'];
    $item['quantity'] = (int)$item['quantity'];
    $item['line_total'] = (float)$item['line_total'];
}
unset($item);

ok(['items' => $items]);
