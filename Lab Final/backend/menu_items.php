<?php
declare(strict_types=1);

require_once __DIR__ . '/config/helpers.php';

$action = action_name('list');

if ($action === 'list') {
    require_method(['GET']);

    $where = ['1 = 1'];
    $params = [];

    if (isset($_GET['category_id']) && (int)$_GET['category_id'] > 0) {
        $where[] = 'mi.category_id = ?';
        $params[] = (int)$_GET['category_id'];
    }

    if (isset($_GET['available'])) {
        $where[] = 'mi.is_available = ?';
        $params[] = in_array(strtolower((string)$_GET['available']), ['1', 'true', 'yes'], true) ? 1 : 0;
    }

    if (isset($_GET['featured'])) {
        $where[] = 'mi.is_featured = ?';
        $params[] = in_array(strtolower((string)$_GET['featured']), ['1', 'true', 'yes'], true) ? 1 : 0;
    }

    if (isset($_GET['search']) && trim((string)$_GET['search']) !== '') {
        $where[] = '(mi.name LIKE ? OR mi.description LIKE ?)';
        $search = '%' . trim((string)$_GET['search']) . '%';
        $params[] = $search;
        $params[] = $search;
    }

    $items = fetch_all(
        'SELECT mi.*, c.name AS category_name
         FROM menu_items mi
         JOIN categories c ON c.id = mi.category_id
         WHERE ' . implode(' AND ', $where) . '
         ORDER BY mi.is_featured DESC, mi.name',
        $params
    );

    foreach ($items as &$item) {
        $item['price'] = (float)$item['price'];
        $item['rating'] = (float)$item['rating'];
        $item['is_available'] = (bool)$item['is_available'];
        $item['is_featured'] = (bool)$item['is_featured'];
    }
    unset($item);

    ok(['items' => $items]);
}

if ($action === 'detail') {
    require_method(['GET']);
    $id = (int)($_GET['id'] ?? 0);
    $item = fetch_one(
        'SELECT mi.*, c.name AS category_name
         FROM menu_items mi
         JOIN categories c ON c.id = mi.category_id
         WHERE mi.id = ?',
        [$id]
    );

    if (!$item) {
        fail('Menu item not found.', 404);
    }

    $item['price'] = (float)$item['price'];
    $item['rating'] = (float)$item['rating'];
    $item['is_available'] = (bool)$item['is_available'];
    $item['is_featured'] = (bool)$item['is_featured'];

    ok(['item' => $item]);
}

if ($action === 'create') {
    require_method(['POST']);
    require_admin();
    $input = json_input();

    $categoryId = int_input($input, 'category_id', int_input($input, 'category'));
    $name = string_input($input, 'name');
    $description = string_input($input, 'description');
    $price = (float)($input['price'] ?? 0);
    $imageUrl = alt_string($input, ['image_url', 'image']);
    $isAvailable = bool_input($input, 'is_available', bool_input($input, 'available', true));
    $isFeatured = bool_input($input, 'is_featured', bool_input($input, 'featured', false));
    $rating = (float)($input['rating'] ?? 4.5);

    if ($categoryId <= 0 || $name === '' || $price <= 0) {
        fail('Category, name and valid price are required.', 422);
    }

    if (!fetch_one('SELECT id FROM categories WHERE id = ?', [$categoryId])) {
        fail('Category not found.', 404);
    }

    db()->prepare(
        'INSERT INTO menu_items (category_id, name, description, price, image_url, is_available, is_featured, rating)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)'
    )->execute([$categoryId, $name, $description, $price, $imageUrl, $isAvailable ? 1 : 0, $isFeatured ? 1 : 0, $rating]);

    ok(['item' => fetch_one('SELECT * FROM menu_items WHERE id = ?', [(int)db()->lastInsertId()])], 201);
}

if ($action === 'update') {
    require_method(['POST', 'PUT', 'PATCH']);
    require_admin();
    $input = json_input();

    $id = int_input($input, 'id', (int)($_GET['id'] ?? 0));
    $item = fetch_one('SELECT * FROM menu_items WHERE id = ?', [$id]);
    if (!$item) {
        fail('Menu item not found.', 404);
    }

    $categoryId = int_input($input, 'category_id', (int)$item['category_id']);
    $name = string_input($input, 'name', $item['name']);
    $description = string_input($input, 'description', (string)$item['description']);
    $price = (float)($input['price'] ?? $item['price']);
    $imageUrl = alt_string($input, ['image_url', 'image'], (string)$item['image_url']);
    $isAvailable = bool_input($input, 'is_available', bool_input($input, 'available', (bool)$item['is_available']));
    $isFeatured = bool_input($input, 'is_featured', bool_input($input, 'featured', (bool)$item['is_featured']));
    $rating = (float)($input['rating'] ?? $item['rating']);

    if ($categoryId <= 0 || $name === '' || $price <= 0) {
        fail('Category, name and valid price are required.', 422);
    }

    db()->prepare(
        'UPDATE menu_items
         SET category_id = ?, name = ?, description = ?, price = ?, image_url = ?,
             is_available = ?, is_featured = ?, rating = ?
         WHERE id = ?'
    )->execute([$categoryId, $name, $description, $price, $imageUrl, $isAvailable ? 1 : 0, $isFeatured ? 1 : 0, $rating, $id]);

    ok(['item' => fetch_one('SELECT * FROM menu_items WHERE id = ?', [$id])]);
}

if ($action === 'delete') {
    require_method(['POST', 'DELETE']);
    require_admin();
    $input = json_input();
    $id = int_input($input, 'id', (int)($_GET['id'] ?? 0));

    if ($id <= 0) {
        fail('Menu item id is required.', 422);
    }

    db()->prepare('DELETE FROM menu_items WHERE id = ?')->execute([$id]);
    ok(['message' => 'Menu item deleted.']);
}

fail('Unknown menu item action.', 404);
