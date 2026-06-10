<?php
declare(strict_types=1);

require_once __DIR__ . '/config/helpers.php';

$action = action_name('list');

if ($action === 'list') {
    require_method(['GET']);

    $where = ['1 = 1'];
    $params = [];

    if (isset($_GET['search']) && trim((string)$_GET['search']) !== '') {
        $where[] = '(name LIKE ? OR cuisine LIKE ? OR address LIKE ?)';
        $search = '%' . trim((string)$_GET['search']) . '%';
        $params[] = $search;
        $params[] = $search;
        $params[] = $search;
    }

    if (isset($_GET['open'])) {
        $where[] = 'is_open = ?';
        $params[] = in_array(strtolower((string)$_GET['open']), ['1', 'true', 'yes'], true) ? 1 : 0;
    }

    $rows = fetch_all(
        'SELECT *
         FROM restaurants
         WHERE ' . implode(' AND ', $where) . '
         ORDER BY is_featured DESC, rating DESC, name',
        $params
    );

    foreach ($rows as &$row) {
        $row['rating'] = (float)$row['rating'];
        $row['delivery_fee'] = (float)$row['delivery_fee'];
        $row['is_open'] = (bool)$row['is_open'];
        $row['is_featured'] = (bool)$row['is_featured'];
    }
    unset($row);

    ok(['restaurants' => $rows]);
}

if ($action === 'detail') {
    require_method(['GET']);
    $restaurant = fetch_one('SELECT * FROM restaurants WHERE id = ?', [(int)($_GET['id'] ?? 0)]);
    if (!$restaurant) {
        fail('Restaurant not found.', 404);
    }

    $restaurant['rating'] = (float)$restaurant['rating'];
    $restaurant['delivery_fee'] = (float)$restaurant['delivery_fee'];
    $restaurant['is_open'] = (bool)$restaurant['is_open'];
    $restaurant['is_featured'] = (bool)$restaurant['is_featured'];
    ok(['restaurant' => $restaurant]);
}

if ($action === 'create') {
    require_method(['POST']);
    require_admin();
    $input = json_input();

    $name = string_input($input, 'name');
    $cuisine = string_input($input, 'cuisine');
    $address = string_input($input, 'address');
    $deliveryTime = alt_string($input, ['delivery_time', 'deliveryTime'], '30-45 min');
    $deliveryFee = (float)($input['delivery_fee'] ?? 0);
    $rating = (float)($input['rating'] ?? 4.5);
    $imageUrl = alt_string($input, ['image_url', 'image']);
    $isOpen = bool_input($input, 'is_open', true);
    $isFeatured = bool_input($input, 'is_featured', false);

    if ($name === '' || $cuisine === '' || $address === '') {
        fail('Name, cuisine and address are required.', 422);
    }

    db()->prepare(
        'INSERT INTO restaurants (name, cuisine, address, delivery_time, delivery_fee, rating, image_url, is_open, is_featured)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)'
    )->execute([$name, $cuisine, $address, $deliveryTime, $deliveryFee, $rating, $imageUrl, $isOpen ? 1 : 0, $isFeatured ? 1 : 0]);

    ok(['restaurant' => fetch_one('SELECT * FROM restaurants WHERE id = ?', [(int)db()->lastInsertId()])], 201);
}

if ($action === 'update') {
    require_method(['POST', 'PUT', 'PATCH']);
    require_admin();
    $input = json_input();
    $id = int_input($input, 'id', (int)($_GET['id'] ?? 0));
    $restaurant = fetch_one('SELECT * FROM restaurants WHERE id = ?', [$id]);
    if (!$restaurant) {
        fail('Restaurant not found.', 404);
    }

    $name = string_input($input, 'name', $restaurant['name']);
    $cuisine = string_input($input, 'cuisine', $restaurant['cuisine']);
    $address = string_input($input, 'address', $restaurant['address']);
    $deliveryTime = alt_string($input, ['delivery_time', 'deliveryTime'], $restaurant['delivery_time']);
    $deliveryFee = (float)($input['delivery_fee'] ?? $restaurant['delivery_fee']);
    $rating = (float)($input['rating'] ?? $restaurant['rating']);
    $imageUrl = alt_string($input, ['image_url', 'image'], (string)$restaurant['image_url']);
    $isOpen = bool_input($input, 'is_open', (bool)$restaurant['is_open']);
    $isFeatured = bool_input($input, 'is_featured', (bool)$restaurant['is_featured']);

    db()->prepare(
        'UPDATE restaurants
         SET name = ?, cuisine = ?, address = ?, delivery_time = ?, delivery_fee = ?, rating = ?,
             image_url = ?, is_open = ?, is_featured = ?
         WHERE id = ?'
    )->execute([$name, $cuisine, $address, $deliveryTime, $deliveryFee, $rating, $imageUrl, $isOpen ? 1 : 0, $isFeatured ? 1 : 0, $id]);

    ok(['restaurant' => fetch_one('SELECT * FROM restaurants WHERE id = ?', [$id])]);
}

if ($action === 'delete') {
    require_method(['POST', 'DELETE']);
    require_admin();
    $input = json_input();
    $id = int_input($input, 'id', (int)($_GET['id'] ?? 0));

    if ($id <= 0) {
        fail('Restaurant id is required.', 422);
    }

    db()->prepare('DELETE FROM restaurants WHERE id = ?')->execute([$id]);
    ok(['message' => 'Restaurant deleted.']);
}

fail('Unknown restaurant action.', 404);
