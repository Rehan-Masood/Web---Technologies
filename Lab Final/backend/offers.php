<?php
declare(strict_types=1);

require_once __DIR__ . '/config/helpers.php';

$action = action_name('list');

if ($action === 'list') {
    require_method(['GET']);

    $where = ['1 = 1'];
    $params = [];

    // Only show active offers
    $where[] = 'is_active = 1';

    $rows = fetch_all(
        'SELECT id, title, description, type, discount_value, restaurant_id, category_id, 
                min_order_amount, max_discount, applicable_to, start_date, end_date, priority
         FROM offers
         WHERE ' . implode(' AND ', $where) . '
         ORDER BY priority DESC, start_date DESC',
        $params
    );

    foreach ($rows as &$row) {
        $row['id'] = (int)$row['id'];
        $row['discount_value'] = (float)$row['discount_value'];
        $row['restaurant_id'] = $row['restaurant_id'] ? (int)$row['restaurant_id'] : null;
        $row['category_id'] = $row['category_id'] ? (int)$row['category_id'] : null;
        $row['min_order_amount'] = (float)$row['min_order_amount'];
        $row['max_discount'] = $row['max_discount'] ? (float)$row['max_discount'] : null;
    }
    unset($row);

    ok(['offers' => $rows]);
}

if ($action === 'detail') {
    require_method(['GET']);
    $id = (int)($_GET['id'] ?? 0);
    $offer = fetch_one('SELECT * FROM offers WHERE id = ?', [$id]);

    if (!$offer) {
        fail('Offer not found.', 404);
    }

    $offer['id'] = (int)$offer['id'];
    $offer['discount_value'] = (float)$offer['discount_value'];
    $offer['restaurant_id'] = $offer['restaurant_id'] ? (int)$offer['restaurant_id'] : null;
    $offer['category_id'] = $offer['category_id'] ? (int)$offer['category_id'] : null;
    $offer['min_order_amount'] = (float)$offer['min_order_amount'];
    $offer['max_discount'] = $offer['max_discount'] ? (float)$offer['max_discount'] : null;
    $offer['is_active'] = (bool)$offer['is_active'];

    ok(['offer' => $offer]);
}

if ($action === 'create') {
    require_method(['POST']);
    require_admin();
    $input = json_input();

    $title = string_input($input, 'title');
    $description = string_input($input, 'description');
    $type = normalize_key(string_input($input, 'type'));
    $discountValue = (float)($input['discount_value'] ?? 0);
    $restaurantId = (int)($input['restaurant_id'] ?? 0) ?: null;
    $categoryId = (int)($input['category_id'] ?? 0) ?: null;
    $minOrderAmount = (float)($input['min_order_amount'] ?? 0);
    $maxDiscount = isset($input['max_discount']) ? (float)$input['max_discount'] : null;
    $applicableTo = normalize_key(string_input($input, 'applicable_to', 'all_customers'));
    $startDate = string_input($input, 'start_date');
    $endDate = string_input($input, 'end_date');
    $isActive = bool_input($input, 'is_active', true);
    $priority = (int)($input['priority'] ?? 0);

    if ($title === '' || $type === '' || $startDate === '' || $endDate === '') {
        fail('Title, type, and dates are required.', 422);
    }

    if ($discountValue <= 0) {
        fail('Discount value must be greater than 0.', 422);
    }

    db()->prepare(
        'INSERT INTO offers (title, description, type, discount_value, restaurant_id, category_id, 
                           min_order_amount, max_discount, applicable_to, start_date, end_date, is_active, priority)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)'
    )->execute([
        $title,
        $description,
        $type,
        $discountValue,
        $restaurantId,
        $categoryId,
        $minOrderAmount,
        $maxDiscount,
        $applicableTo,
        $startDate,
        $endDate,
        $isActive ? 1 : 0,
        $priority
    ]);

    ok(['offer' => fetch_one('SELECT * FROM offers WHERE id = ?', [(int)db()->lastInsertId()])], 201);
}

if ($action === 'update') {
    require_method(['POST', 'PUT', 'PATCH']);
    require_admin();
    $input = json_input();
    $id = int_input($input, 'id', (int)($_GET['id'] ?? 0));
    $offer = fetch_one('SELECT * FROM offers WHERE id = ?', [$id]);

    if (!$offer) {
        fail('Offer not found.', 404);
    }

    $title = string_input($input, 'title', $offer['title']);
    $description = string_input($input, 'description', $offer['description']);
    $type = normalize_key(string_input($input, 'type', $offer['type']));
    $discountValue = isset($input['discount_value']) ? (float)$input['discount_value'] : (float)$offer['discount_value'];
    $restaurantId = isset($input['restaurant_id']) ? ((int)$input['restaurant_id'] ?: null) : (int)$offer['restaurant_id'];
    $categoryId = isset($input['category_id']) ? ((int)$input['category_id'] ?: null) : (int)$offer['category_id'];
    $minOrderAmount = isset($input['min_order_amount']) ? (float)$input['min_order_amount'] : (float)$offer['min_order_amount'];
    $maxDiscount = isset($input['max_discount']) ? (float)$input['max_discount'] : (float)$offer['max_discount'];
    $applicableTo = normalize_key(string_input($input, 'applicable_to', $offer['applicable_to']));
    $startDate = string_input($input, 'start_date', $offer['start_date']);
    $endDate = string_input($input, 'end_date', $offer['end_date']);
    $isActive = bool_input($input, 'is_active', (bool)$offer['is_active']);
    $priority = int_input($input, 'priority', (int)$offer['priority']);

    db()->prepare(
        'UPDATE offers SET title = ?, description = ?, type = ?, discount_value = ?, restaurant_id = ?, 
                         category_id = ?, min_order_amount = ?, max_discount = ?, applicable_to = ?, 
                         start_date = ?, end_date = ?, is_active = ?, priority = ?
         WHERE id = ?'
    )->execute([
        $title,
        $description,
        $type,
        $discountValue,
        $restaurantId,
        $categoryId,
        $minOrderAmount,
        $maxDiscount,
        $applicableTo,
        $startDate,
        $endDate,
        $isActive ? 1 : 0,
        $priority,
        $id
    ]);

    ok(['offer' => fetch_one('SELECT * FROM offers WHERE id = ?', [$id])]);
}

if ($action === 'delete') {
    require_method(['POST']);
    require_admin();
    $id = int_input(json_input(), 'id');
    $offer = fetch_one('SELECT id FROM offers WHERE id = ?', [$id]);

    if (!$offer) {
        fail('Offer not found.', 404);
    }

    db()->prepare('DELETE FROM offers WHERE id = ?')->execute([$id]);
    ok(['message' => 'Offer deleted.']);
}

fail('Unknown action.', 400);
?>
