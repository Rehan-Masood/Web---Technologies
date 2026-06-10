<?php
declare(strict_types=1);

require_once __DIR__ . '/config/helpers.php';

$action = action_name('status');

if ($action === 'status') {
    require_method(['GET']);
    $user = require_user(['customer', 'admin']);
    $orderId = (int)($_GET['order_id'] ?? $_GET['id'] ?? 0);

    $order = fetch_one('SELECT * FROM orders WHERE id = ?', [$orderId]);
    if (!$order) {
        fail('Order not found.', 404);
    }

    if ($user['role'] !== 'admin' && (int)$order['user_id'] !== (int)$user['id']) {
        fail('Unauthorized.', 403);
    }

    ok(['payment' => fetch_one('SELECT * FROM payments WHERE order_id = ?', [$orderId])]);
}

if ($action === 'list') {
    require_method(['GET']);
    require_admin();

    $where = ['1 = 1'];
    $params = [];

    if (isset($_GET['status']) && trim((string)$_GET['status']) !== '') {
        $where[] = 'p.status = ?';
        $params[] = normalize_key((string)$_GET['status']);
    }

    $payments = fetch_all(
        'SELECT p.*, o.order_number, u.full_name AS customer_name
         FROM payments p
         JOIN orders o ON o.id = p.order_id
         JOIN users u ON u.id = o.user_id
         WHERE ' . implode(' AND ', $where) . '
         ORDER BY p.created_at DESC',
        $params
    );

    ok(['payments' => $payments]);
}

if ($action === 'update' || $action === 'mark_paid') {
    require_method(['POST', 'PATCH']);
    require_admin();
    $input = json_input();
    $orderId = int_input($input, 'order_id', int_input($input, 'id'));
    $status = $action === 'mark_paid' ? 'paid' : normalize_key(string_input($input, 'status'));
    $reference = alt_string($input, ['transaction_reference', 'transactionReference', 'reference']);

    if (!in_array($status, ['pending', 'paid', 'failed', 'refunded'], true)) {
        fail('Invalid payment status.', 422);
    }

    db()->prepare(
        "UPDATE payments
         SET status = ?, transaction_reference = ?, paid_at = IF(? = 'paid', NOW(), paid_at)
         WHERE order_id = ?"
    )->execute([$status, $reference, $status, $orderId]);

    db()->prepare('UPDATE orders SET payment_status = ? WHERE id = ?')->execute([$status, $orderId]);

    ok(['payment' => fetch_one('SELECT * FROM payments WHERE order_id = ?', [$orderId])]);
}

fail('Unknown payment action.', 404);
