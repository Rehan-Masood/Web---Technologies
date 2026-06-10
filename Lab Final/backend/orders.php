<?php
declare(strict_types=1);

require_once __DIR__ . '/config/helpers.php';

$action = action_name('list');

if ($action === 'place' || $action === 'checkout') {
    require_method(['POST']);
    $user = require_customer();
    $input = json_input();
    $userId = (int)$user['id'];

    try {
        $deliveryAddress = alt_string(
            $input,
            ['delivery_address', 'deliveryAddress', 'address'],
            (string)($user['default_delivery_address'] ?? $user['address'] ?? '')
        );
        $specialInstructions = alt_string($input, ['special_instructions', 'specialInstructions', 'notes']);
        $paymentMethod = normalize_key(string_input($input, 'payment_method', 'cash'));
        $allowedMethods = ['cash', 'card', 'easypaisa', 'jazzcash', 'bank_transfer'];

        if ($deliveryAddress === '') {
            fail('Delivery address is required.', 422);
        }

        if (!in_array($paymentMethod, $allowedMethods, true)) {
            fail('Invalid payment method.', 422, ['allowed' => $allowedMethods]);
        }

        // Extract and validate payment details based on method
        $paymentPhone = null;
        $paymentReference = null;
        $cardLast4 = null;
        $cardHolder = null;

        if ($paymentMethod === 'jazzcash' || $paymentMethod === 'easypaisa') {
            $paymentPhone = trim((string)($input['payment_phone'] ?? ''));
            $paymentReference = trim((string)($input['payment_reference'] ?? ''));
            
            if ($paymentPhone === '') {
                fail("Mobile number is required for {$paymentMethod}.", 422);
            }
            
            // Validate Pakistani phone format: 03XXXXXXXXX, +923XXXXXXXXX, or 923XXXXXXXXX
            $phoneRegex = '/^(\+92|0092|03)\d{9}$/';
            $cleanPhone = preg_replace('/\D/', '', $paymentPhone);
            if (strlen($cleanPhone) === 10 && substr($cleanPhone, 0, 1) === '3') {
                $cleanPhone = '03' . substr($cleanPhone, 1);
            } elseif (strlen($cleanPhone) === 12 && substr($cleanPhone, 0, 2) === '92') {
                $cleanPhone = '0' . substr($cleanPhone, 2);
            }
            
            if (!preg_match('/^03\d{9}$/', $cleanPhone)) {
                fail("Invalid phone number format for {$paymentMethod}. Use 03XXXXXXXXX format.", 422);
            }
            $paymentPhone = $cleanPhone;
        } elseif ($paymentMethod === 'card') {
            $cardHolder = trim((string)($input['card_holder'] ?? ''));
            $cardNumber = trim(str_replace(' ', '', (string)($input['card_number'] ?? '')));
            $expiry = trim((string)($input['card_expiry'] ?? ''));
            $cvv = trim((string)($input['card_cvv'] ?? ''));

            if ($cardHolder === '') {
                fail('Card holder name is required.', 422);
            }
            
            if ($cardNumber === '') {
                fail('Card number is required.', 422);
            }
            
            if (!preg_match('/^\d{13,19}$/', $cardNumber)) {
                fail('Card number must be 13-19 digits.', 422);
            }
            
            if ($expiry === '') {
                fail('Card expiry is required.', 422);
            }
            
            if (!preg_match('/^\d{2}\/\d{2}$/', $expiry)) {
                fail('Card expiry must be MM/YY format.', 422);
            }
            
            list($month, $year) = explode('/', $expiry);
            $currentYear = (int)date('y');
            $currentMonth = (int)date('m');
            if ((int)$year < $currentYear || ((int)$year === $currentYear && (int)$month < $currentMonth)) {
                fail('Card has expired.', 422);
            }
            
            if (!preg_match('/^\d{3,4}$/', $cvv)) {
                fail('CVV must be 3 or 4 digits.', 422);
            }
            
            // Store only last 4 digits
            $cardLast4 = substr($cardNumber, -4);
            $paymentReference = 'Card ending in ' . $cardLast4;
        }

        $cartId = ensure_cart($userId);
        $items = fetch_all(
            'SELECT ci.menu_item_id, ci.quantity, mi.name, mi.price
             FROM cart_items ci
             JOIN menu_items mi ON mi.id = ci.menu_item_id
             WHERE ci.cart_id = ? AND mi.is_available = 1',
            [$cartId]
        );

        if (!$items) {
            fail('Cart is empty.', 422);
        }

        $subtotal = 0.0;
        foreach ($items as $item) {
            $subtotal += (float)$item['price'] * (int)$item['quantity'];
        }

        $deliveryFee = 199.0;
        $discountAmount = 0.0;
        $appliedOfferId = null;

        // Try to apply offer if it exists and offers table is available
        try {
            $offerId = (int)($input['applied_offer_id'] ?? 0);
            if ($offerId > 0) {
                $offer = fetch_one(
                    'SELECT id, type, discount_value, max_discount, min_order_amount FROM offers 
                     WHERE id = ? AND is_active = 1 AND DATE(start_date) <= DATE(NOW()) AND DATE(end_date) >= DATE(NOW())',
                    [$offerId]
                );
                
                if ($offer && (float)$subtotal >= (float)$offer['min_order_amount']) {
                    $appliedOfferId = (int)$offer['id'];
                    
                    if ($offer['type'] === 'discount_percent') {
                        $discountAmount = ($subtotal * (float)$offer['discount_value']) / 100;
                        if ($offer['max_discount'] && $discountAmount > (float)$offer['max_discount']) {
                            $discountAmount = (float)$offer['max_discount'];
                        }
                    } elseif ($offer['type'] === 'discount_fixed') {
                        $discountAmount = min((float)$offer['discount_value'], $subtotal);
                    } elseif ($offer['type'] === 'free_delivery') {
                        $deliveryFee = 0;
                    }
                }
            }
        } catch (Exception $e) {
            // Offers table may not exist, continue without discount
        }

        $total = $subtotal + $deliveryFee - $discountAmount;
        $pdo = db();

        try {
            $pdo->beginTransaction();

            $pdo->prepare(
                'INSERT INTO orders
                 (order_number, user_id, delivery_address, special_instructions, status, subtotal, delivery_fee, total_amount,
                  payment_method, payment_status, payment_phone, payment_reference, card_last4, card_holder, discount_amount, applied_offer_id, estimated_delivery_time)
                 VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, DATE_ADD(NOW(), INTERVAL 45 MINUTE))'
            )->execute([
                make_order_number(),
                $userId,
                $deliveryAddress,
                $specialInstructions,
                'pending',
                $subtotal,
                $deliveryFee,
                $total,
                $paymentMethod,
                'pending',
                $paymentPhone,
                $paymentReference,
                $cardLast4,
                $cardHolder,
                $discountAmount,
                $appliedOfferId,
            ]);

            $orderId = (int)$pdo->lastInsertId();
            $itemStmt = $pdo->prepare(
                'INSERT INTO order_items (order_id, menu_item_id, item_name, unit_price, quantity, line_total)
                 VALUES (?, ?, ?, ?, ?, ?)'
            );

            foreach ($items as $item) {
                $lineTotal = (float)$item['price'] * (int)$item['quantity'];
                $itemStmt->execute([
                    $orderId,
                    (int)$item['menu_item_id'],
                    $item['name'],
                    (float)$item['price'],
                    (int)$item['quantity'],
                    $lineTotal,
                ]);
            }

            $pdo->prepare(
                'INSERT INTO payments (order_id, amount, method, status)
                 VALUES (?, ?, ?, ?)'
            )->execute([$orderId, $total, $paymentMethod, 'pending']);

            $pdo->prepare('DELETE FROM cart_items WHERE cart_id = ?')->execute([$cartId]);
            add_order_history($orderId, 'pending', $userId, null, 'Order placed.');
            create_notification($userId, null, 'Order placed', 'Your order has been received.', 'order');

            $pdo->commit();
            ok(['order' => order_payload($orderId)], 201);
        } catch (Throwable $e) {
            if ($pdo->inTransaction()) {
                $pdo->rollBack();
            }
            fail('Failed to create order: ' . $e->getMessage(), 500);
        }
    } catch (Throwable $e) {
        fail($e->getMessage(), 422);
    }
}

if ($action === 'list' || $action === 'history') {
    require_method(['GET']);
    $user = require_customer();
    $orders = fetch_all(
        'SELECT id, order_number, status, total_amount, payment_method, payment_status, assigned_delivery_man_id, created_at, updated_at
         FROM orders
         WHERE user_id = ?
         ORDER BY created_at DESC',
        [(int)$user['id']]
    );

    foreach ($orders as &$order) {
        $order['total_amount'] = (float)$order['total_amount'];
    }
    unset($order);

    ok(['orders' => $orders]);
}

if ($action === 'current') {
    require_method(['GET']);
    $user = require_customer();
    $orders = fetch_all(
        "SELECT id, order_number, status, total_amount, payment_method, payment_status, assigned_delivery_man_id, created_at, updated_at
         FROM orders
         WHERE user_id = ?
           AND status NOT IN ('delivered', 'cancelled', 'rejected', 'failed_delivery')
         ORDER BY created_at DESC",
        [(int)$user['id']]
    );
    ok(['orders' => $orders]);
}

if ($action === 'get' || $action === 'detail') {
    require_method(['GET']);
    $user = require_user(['customer', 'admin']);
    $orderId = (int)($_GET['id'] ?? $_GET['order_id'] ?? 0);
    $order = order_payload($orderId);

    if (!$order) {
        fail('Order not found.', 404);
    }

    if ($user['role'] !== 'admin' && (int)$order['user_id'] !== (int)$user['id']) {
        fail('Unauthorized.', 403);
    }

    ok(['order' => $order]);
}

if ($action === 'cancel') {
    require_method(['POST']);
    $user = require_customer();
    $input = json_input();
    $orderId = int_input($input, 'order_id', int_input($input, 'id'));
    $reason = string_input($input, 'reason', 'Cancelled by customer.');
    $order = fetch_one('SELECT * FROM orders WHERE id = ? AND user_id = ?', [$orderId, (int)$user['id']]);

    if (!$order) {
        fail('Order not found.', 404);
    }

    if (!in_array($order['status'], ['pending', 'accepted'], true)) {
        fail('Order can only be cancelled before preparation starts.', 409);
    }

    db()->prepare(
        "UPDATE orders SET status = 'cancelled', cancelled_at = NOW(), cancel_reason = ? WHERE id = ?"
    )->execute([$reason, $orderId]);
    add_order_history($orderId, 'cancelled', (int)$user['id'], null, $reason);
    create_notification((int)$user['id'], null, 'Order cancelled', 'Your order was cancelled.', 'warning');

    ok(['order' => order_payload($orderId)]);
}

if ($action === 'reorder') {
    require_method(['POST']);
    $user = require_customer();
    $input = json_input();
    $orderId = int_input($input, 'order_id', int_input($input, 'id'));
    $order = fetch_one('SELECT * FROM orders WHERE id = ? AND user_id = ?', [$orderId, (int)$user['id']]);

    if (!$order) {
        fail('Order not found.', 404);
    }

    $items = fetch_all(
        'SELECT oi.menu_item_id, oi.quantity
         FROM order_items oi
         JOIN menu_items mi ON mi.id = oi.menu_item_id
         WHERE oi.order_id = ? AND mi.is_available = 1',
        [$orderId]
    );

    if (!$items) {
        fail('None of the previous order items are currently available.', 409);
    }

    $cartId = ensure_cart((int)$user['id']);
    db()->prepare('DELETE FROM cart_items WHERE cart_id = ?')->execute([$cartId]);
    $stmt = db()->prepare(
        'INSERT INTO cart_items (cart_id, menu_item_id, quantity)
         VALUES (?, ?, ?)
         ON DUPLICATE KEY UPDATE quantity = quantity + VALUES(quantity)'
    );

    foreach ($items as $item) {
        $stmt->execute([$cartId, (int)$item['menu_item_id'], (int)$item['quantity']]);
    }

    ok(['cart' => cart_payload((int)$user['id'])]);
}

if ($action === 'admin_list') {
    require_method(['GET']);
    require_admin();

    $where = ['1 = 1'];
    $params = [];

    if (isset($_GET['status']) && trim((string)$_GET['status']) !== '') {
        $where[] = 'o.status = ?';
        $params[] = normalize_status((string)$_GET['status'], ORDER_STATUSES);
    }

    if (isset($_GET['search']) && trim((string)$_GET['search']) !== '') {
        $where[] = '(o.order_number LIKE ? OR u.full_name LIKE ? OR u.phone LIKE ?)';
        $search = '%' . trim((string)$_GET['search']) . '%';
        $params[] = $search;
        $params[] = $search;
        $params[] = $search;
    }

    $orders = fetch_all(
        'SELECT o.id, o.order_number, o.status, o.total_amount, o.payment_method, o.payment_status,
                o.created_at, u.full_name AS customer_name, u.phone AS customer_phone,
                dm.full_name AS delivery_man_name
         FROM orders o
         JOIN users u ON u.id = o.user_id
         LEFT JOIN delivery_men dm ON dm.id = o.assigned_delivery_man_id
         WHERE ' . implode(' AND ', $where) . '
         ORDER BY o.created_at DESC',
        $params
    );

    ok(['orders' => $orders]);
}

if ($action === 'admin_get') {
    require_method(['GET']);
    require_admin();
    $order = order_payload((int)($_GET['id'] ?? $_GET['order_id'] ?? 0));
    if (!$order) {
        fail('Order not found.', 404);
    }
    ok(['order' => $order]);
}

if ($action === 'update_status' || $action === 'accept' || $action === 'reject') {
    require_method(['POST', 'PATCH']);
    $admin = require_admin();
    $input = json_input();
    $orderId = int_input($input, 'order_id', int_input($input, 'id'));
    $status = $action === 'accept' ? 'accepted' : ($action === 'reject' ? 'rejected' : normalize_status(string_input($input, 'status'), ORDER_STATUSES));
    $note = string_input($input, 'note');

    $order = fetch_one('SELECT * FROM orders WHERE id = ?', [$orderId]);
    if (!$order) {
        fail('Order not found.', 404);
    }

    db()->prepare(
        "UPDATE orders
         SET status = ?, cancelled_at = IF(? IN ('cancelled', 'rejected'), NOW(), cancelled_at)
         WHERE id = ?"
    )->execute([$status, $status, $orderId]);

    if ($status === 'delivered') {
        db()->prepare("UPDATE orders SET payment_status = 'paid' WHERE id = ?")->execute([$orderId]);
        db()->prepare("UPDATE payments SET status = 'paid', paid_at = NOW() WHERE order_id = ?")->execute([$orderId]);
    }

    add_order_history($orderId, $status, (int)$admin['id'], null, $note);
    create_notification((int)$order['user_id'], null, 'Order status updated', 'Your order status is now ' . str_replace('_', ' ', $status) . '.', 'order');

    ok(['order' => order_payload($orderId)]);
}

if ($action === 'assign' || $action === 'reassign') {
    require_method(['POST']);
    $admin = require_admin();
    $input = json_input();
    $orderId = int_input($input, 'order_id', int_input($input, 'id'));
    $deliveryManId = int_input($input, 'delivery_man_id', int_input($input, 'deliveryManId'));

    $order = fetch_one('SELECT * FROM orders WHERE id = ?', [$orderId]);
    if (!$order) {
        fail('Order not found.', 404);
    }

    $deliveryMan = fetch_one('SELECT * FROM delivery_men WHERE id = ?', [$deliveryManId]);
    if (!$deliveryMan || !(bool)$deliveryMan['is_active'] || $deliveryMan['status'] === 'inactive') {
        fail('Delivery man is not available for assignment.', 409);
    }

    $pdo = db();
    try {
        $pdo->beginTransaction();

        $pdo->prepare(
            "UPDATE delivery_assignments
             SET status = 'cancelled'
             WHERE order_id = ? AND status NOT IN ('delivered', 'failed', 'cancelled')"
        )->execute([$orderId]);

        $pdo->prepare(
            "INSERT INTO delivery_assignments (order_id, delivery_man_id, status, assigned_at)
             VALUES (?, ?, 'assigned', NOW())"
        )->execute([$orderId, $deliveryManId]);

        $pdo->prepare(
            "UPDATE orders
             SET assigned_delivery_man_id = ?, status = 'assigned_to_delivery_man'
             WHERE id = ?"
        )->execute([$deliveryManId, $orderId]);

        $pdo->prepare("UPDATE delivery_men SET status = 'busy' WHERE id = ?")->execute([$deliveryManId]);

        add_order_history($orderId, 'assigned_to_delivery_man', (int)$admin['id'], null, 'Assigned to delivery man.');
        create_notification((int)$order['user_id'], null, 'Delivery assigned', 'A delivery man has been assigned to your order.', 'delivery');
        create_notification(null, $deliveryManId, 'New delivery assigned', 'You have a new order to deliver.', 'delivery');

        $pdo->commit();
        ok(['order' => order_payload($orderId)]);
    } catch (Throwable $e) {
        if ($pdo->inTransaction()) {
            $pdo->rollBack();
        }
        fail('Failed to assign delivery man.', 500, ['details' => $e->getMessage()]);
    }
}

if ($action === 'review') {
    require_method(['POST']);
    $user = require_customer();
    $input = json_input();
    $orderId = int_input($input, 'order_id', int_input($input, 'id'));
    $rating = int_input($input, 'rating');
    $comment = string_input($input, 'comment');

    if ($rating < 1 || $rating > 5) {
        fail('Rating must be between 1 and 5.', 422);
    }

    $order = fetch_one(
        "SELECT * FROM orders WHERE id = ? AND user_id = ? AND status = 'delivered'",
        [$orderId, (int)$user['id']]
    );

    if (!$order) {
        fail('Delivered order not found for this customer.', 404);
    }

    db()->prepare(
        'INSERT INTO reviews (order_id, user_id, rating, comment)
         VALUES (?, ?, ?, ?)
         ON DUPLICATE KEY UPDATE rating = VALUES(rating), comment = VALUES(comment)'
    )->execute([$orderId, (int)$user['id'], $rating, $comment]);

    ok(['review' => fetch_one('SELECT * FROM reviews WHERE order_id = ?', [$orderId])]);
}

fail('Unknown order action.', 404);
