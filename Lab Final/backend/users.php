<?php
declare(strict_types=1);

require_once __DIR__ . '/config/helpers.php';

$action = action_name('list');
$admin = require_admin();

if ($action === 'list') {
    require_method(['GET']);

    $where = ['role = ?'];
    $params = [($_GET['role'] ?? 'customer') === 'admin' ? 'admin' : 'customer'];

    if (isset($_GET['search']) && trim((string)$_GET['search']) !== '') {
        $where[] = '(full_name LIKE ? OR email LIKE ? OR phone LIKE ?)';
        $search = '%' . trim((string)$_GET['search']) . '%';
        $params[] = $search;
        $params[] = $search;
        $params[] = $search;
    }

    $users = fetch_all(
        'SELECT id, full_name, email, phone, address, default_delivery_address, role, is_blocked, created_at, updated_at
         FROM users
         WHERE ' . implode(' AND ', $where) . '
         ORDER BY created_at DESC',
        $params
    );

    foreach ($users as &$user) {
        $user['is_blocked'] = (bool)$user['is_blocked'];
    }
    unset($user);

    ok(['users' => $users]);
}

if ($action === 'detail') {
    require_method(['GET']);
    $id = (int)($_GET['id'] ?? 0);
    $user = fetch_one('SELECT * FROM users WHERE id = ?', [$id]);
    if (!$user) {
        fail('User not found.', 404);
    }

    $summary = fetch_one(
        'SELECT COUNT(*) AS total_orders, COALESCE(SUM(total_amount), 0) AS total_spent
         FROM orders
         WHERE user_id = ?',
        [$id]
    );

    ok([
        'user' => sanitize_user($user),
        'summary' => [
            'total_orders' => (int)$summary['total_orders'],
            'total_spent' => (float)$summary['total_spent'],
        ],
    ]);
}

if ($action === 'orders') {
    require_method(['GET']);
    $id = (int)($_GET['id'] ?? $_GET['user_id'] ?? 0);
    $orders = fetch_all(
        'SELECT id, order_number, status, total_amount, payment_method, payment_status, created_at
         FROM orders
         WHERE user_id = ?
         ORDER BY created_at DESC',
        [$id]
    );

    foreach ($orders as &$order) {
        $order['total_amount'] = (float)$order['total_amount'];
    }
    unset($order);

    ok(['orders' => $orders]);
}

if ($action === 'admin_create' || $action === 'create') {
    require_method(['POST']);
    $input = json_input();

    $fullName = alt_string($input, ['full_name', 'fullName', 'name']);
    $email = strtolower(string_input($input, 'email'));
    $phone = string_input($input, 'phone');
    $address = string_input($input, 'address');
    $password = (string)($input['password'] ?? '');
    $role = normalize_key(string_input($input, 'role', 'customer'));

    if (!in_array($role, ['customer', 'admin'], true)) {
        fail('Invalid user role.', 422);
    }

    if ($fullName === '' || $email === '' || $phone === '' || $password === '') {
        fail('Name, email, phone and password are required.', 422);
    }

    if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
        fail('Invalid email address.', 422);
    }

    if (fetch_one('SELECT id FROM users WHERE email = ?', [$email])) {
        fail('Email is already registered.', 409);
    }

    db()->prepare(
        'INSERT INTO users (full_name, email, phone, address, default_delivery_address, password_hash, role)
         VALUES (?, ?, ?, ?, ?, ?, ?)'
    )->execute([$fullName, $email, $phone, $address, $address, password_hash($password, PASSWORD_DEFAULT), $role]);

    ok(['user' => sanitize_user(fetch_one('SELECT * FROM users WHERE id = ?', [(int)db()->lastInsertId()]))], 201);
}

if ($action === 'admin_update' || $action === 'update') {
    require_method(['POST', 'PUT', 'PATCH']);
    $input = json_input();
    $id = int_input($input, 'id', int_input($input, 'user_id'));
    $user = fetch_one('SELECT * FROM users WHERE id = ?', [$id]);
    if (!$user) {
        fail('User not found.', 404);
    }

    $fullName = alt_string($input, ['full_name', 'fullName', 'name'], $user['full_name']);
    $phone = string_input($input, 'phone', $user['phone']);
    $address = string_input($input, 'address', (string)$user['address']);
    $role = normalize_key(string_input($input, 'role', $user['role']));
    $isBlocked = bool_input($input, 'is_blocked', (bool)$user['is_blocked']);

    if (!in_array($role, ['customer', 'admin'], true)) {
        fail('Invalid user role.', 422);
    }

    db()->prepare(
        'UPDATE users SET full_name = ?, phone = ?, address = ?, default_delivery_address = ?, role = ?, is_blocked = ? WHERE id = ?'
    )->execute([$fullName, $phone, $address, $address, $role, $isBlocked ? 1 : 0, $id]);

    if (isset($input['password']) && (string)$input['password'] !== '') {
        db()->prepare('UPDATE users SET password_hash = ? WHERE id = ?')->execute([password_hash((string)$input['password'], PASSWORD_DEFAULT), $id]);
    }

    ok(['user' => sanitize_user(fetch_one('SELECT * FROM users WHERE id = ?', [$id]))]);
}

if ($action === 'block' || $action === 'unblock') {
    require_method(['POST']);
    $input = json_input();
    $id = int_input($input, 'id', int_input($input, 'user_id'));

    if ($id <= 0) {
        fail('User id is required.', 422);
    }

    $user = fetch_one('SELECT * FROM users WHERE id = ?', [$id]);
    if (!$user) {
        fail('User not found.', 404);
    }

    if ($user['role'] === 'admin') {
        fail('Admin accounts cannot be blocked here.', 403);
    }

    $blocked = $action === 'block' ? 1 : 0;
    db()->prepare('UPDATE users SET is_blocked = ? WHERE id = ?')->execute([$blocked, $id]);

    ok(['user' => sanitize_user(fetch_one('SELECT * FROM users WHERE id = ?', [$id]))]);
}

fail('Unknown user action.', 404);
