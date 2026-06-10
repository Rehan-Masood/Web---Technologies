<?php
declare(strict_types=1);

require_once __DIR__ . '/config/helpers.php';

$action = action_name('get');
$user = require_customer();
$userId = (int)$user['id'];

if ($action === 'get') {
    require_method(['GET']);
    ok(['cart' => cart_payload($userId)]);
}

if ($action === 'add') {
    require_method(['POST']);
    $input = json_input();
    $itemId = int_input($input, 'menu_item_id', int_input($input, 'item_id'));
    $quantity = max(1, int_input($input, 'quantity', 1));

    $item = fetch_one('SELECT id, is_available FROM menu_items WHERE id = ?', [$itemId]);
    if (!$item) {
        fail('Menu item not found.', 404);
    }

    if (!(bool)$item['is_available']) {
        fail('This item is unavailable.', 409);
    }

    $cartId = ensure_cart($userId);
    db()->prepare(
        'INSERT INTO cart_items (cart_id, menu_item_id, quantity)
         VALUES (?, ?, ?)
         ON DUPLICATE KEY UPDATE quantity = quantity + VALUES(quantity)'
    )->execute([$cartId, $itemId, $quantity]);

    ok(['cart' => cart_payload($userId)]);
}

if ($action === 'update') {
    require_method(['POST', 'PUT', 'PATCH']);
    $input = json_input();
    $itemId = int_input($input, 'menu_item_id', int_input($input, 'item_id'));
    $quantity = int_input($input, 'quantity', 1);

    $cartId = ensure_cart($userId);

    if ($quantity <= 0) {
        db()->prepare('DELETE FROM cart_items WHERE cart_id = ? AND menu_item_id = ?')->execute([$cartId, $itemId]);
    } else {
        db()->prepare(
            'INSERT INTO cart_items (cart_id, menu_item_id, quantity)
             VALUES (?, ?, ?)
             ON DUPLICATE KEY UPDATE quantity = VALUES(quantity)'
        )->execute([$cartId, $itemId, $quantity]);
    }

    ok(['cart' => cart_payload($userId)]);
}

if ($action === 'remove') {
    require_method(['POST', 'DELETE']);
    $input = json_input();
    $itemId = int_input($input, 'menu_item_id', int_input($input, 'item_id', (int)($_GET['item_id'] ?? 0)));
    $cartId = ensure_cart($userId);

    db()->prepare('DELETE FROM cart_items WHERE cart_id = ? AND menu_item_id = ?')->execute([$cartId, $itemId]);
    ok(['cart' => cart_payload($userId)]);
}

if ($action === 'clear') {
    require_method(['POST', 'DELETE']);
    $cartId = ensure_cart($userId);
    db()->prepare('DELETE FROM cart_items WHERE cart_id = ?')->execute([$cartId]);
    ok(['cart' => cart_payload($userId)]);
}

fail('Unknown cart action.', 404);
