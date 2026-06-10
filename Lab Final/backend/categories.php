<?php
declare(strict_types=1);

require_once __DIR__ . '/config/helpers.php';

$action = action_name('list');

if ($action === 'list') {
    require_method(['GET']);
    $rows = fetch_all(
        'SELECT c.*,
                COUNT(mi.id) AS item_count
         FROM categories c
         LEFT JOIN menu_items mi ON mi.category_id = c.id
         GROUP BY c.id
         ORDER BY c.name'
    );

    foreach ($rows as &$row) {
        $row['item_count'] = (int)$row['item_count'];
        $row['is_active'] = (bool)$row['is_active'];
    }
    unset($row);

    ok(['categories' => $rows]);
}

if ($action === 'detail') {
    require_method(['GET']);
    $id = (int)($_GET['id'] ?? 0);
    $category = fetch_one('SELECT * FROM categories WHERE id = ?', [$id]);
    if (!$category) {
        fail('Category not found.', 404);
    }
    $category['is_active'] = (bool)$category['is_active'];
    ok(['category' => $category]);
}

if ($action === 'create') {
    require_method(['POST']);
    require_admin();
    $input = json_input();

    $name = string_input($input, 'name');
    $description = string_input($input, 'description');

    if ($name === '') {
        fail('Category name is required.', 422);
    }

    if (fetch_one('SELECT id FROM categories WHERE LOWER(name) = LOWER(?)', [$name])) {
        fail('Category already exists.', 409);
    }

    db()->prepare('INSERT INTO categories (name, description) VALUES (?, ?)')->execute([$name, $description]);
    ok(['category' => fetch_one('SELECT * FROM categories WHERE id = ?', [(int)db()->lastInsertId()])], 201);
}

if ($action === 'update') {
    require_method(['POST', 'PUT', 'PATCH']);
    require_admin();
    $input = json_input();

    $id = int_input($input, 'id', (int)($_GET['id'] ?? 0));
    $name = string_input($input, 'name');
    $description = string_input($input, 'description');
    $isActive = bool_input($input, 'is_active', true);

    if ($id <= 0 || $name === '') {
        fail('Category id and name are required.', 422);
    }

    if (fetch_one('SELECT id FROM categories WHERE LOWER(name) = LOWER(?) AND id <> ?', [$name, $id])) {
        fail('Another category with this name already exists.', 409);
    }

    db()->prepare(
        'UPDATE categories SET name = ?, description = ?, is_active = ? WHERE id = ?'
    )->execute([$name, $description, $isActive ? 1 : 0, $id]);

    ok(['category' => fetch_one('SELECT * FROM categories WHERE id = ?', [$id])]);
}

if ($action === 'delete') {
    require_method(['POST', 'DELETE']);
    require_admin();
    $input = json_input();
    $id = int_input($input, 'id', (int)($_GET['id'] ?? 0));

    if ($id <= 0) {
        fail('Category id is required.', 422);
    }

    $count = fetch_one('SELECT COUNT(*) AS total FROM menu_items WHERE category_id = ?', [$id]);
    if ((int)$count['total'] > 0) {
        fail('Cannot delete category while menu items exist.', 409);
    }

    db()->prepare('DELETE FROM categories WHERE id = ?')->execute([$id]);
    ok(['message' => 'Category deleted.']);
}

fail('Unknown category action.', 404);
