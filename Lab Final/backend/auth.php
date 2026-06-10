<?php
declare(strict_types=1);

require_once __DIR__ . '/config/helpers.php';

$action = action_name('me');

if ($action === 'register') {
    require_method(['POST']);
    $input = json_input();

    $fullName = alt_string($input, ['full_name', 'fullName', 'name']);
    $email = strtolower(string_input($input, 'email'));
    $phone = string_input($input, 'phone');
    $address = string_input($input, 'address');
    $password = (string)($input['password'] ?? '');
    $confirmPassword = (string)($input['confirm_password'] ?? $input['confirmPassword'] ?? $password);

    if ($fullName === '' || $email === '' || $phone === '' || $password === '') {
        fail('Name, email, phone and password are required.', 422);
    }

    if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
        fail('Invalid email address.', 422);
    }

    if ($password !== $confirmPassword) {
        fail('Passwords do not match.', 422);
    }

    if (!preg_match('/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z\d]).{8,}$/', $password)) {
        fail('Password must be at least 8 characters and include uppercase, lowercase, number, and special character.', 422);
    }

    if (fetch_one('SELECT id FROM users WHERE email = ?', [$email])) {
        fail('Email is already registered.', 409);
    }

    db()->prepare(
        'INSERT INTO users (full_name, email, phone, address, default_delivery_address, password_hash, role)
         VALUES (?, ?, ?, ?, ?, ?, ?)'
    )->execute([
        $fullName,
        $email,
        $phone,
        $address,
        $address,
        password_hash($password, PASSWORD_DEFAULT),
        'customer',
    ]);

    $user = fetch_one('SELECT * FROM users WHERE id = ?', [(int)db()->lastInsertId()]);
    ok(['user' => sanitize_user($user)], 201);
}

if ($action === 'login' || $action === 'admin_login') {
    require_method(['POST']);
    $input = json_input();

    $email = strtolower(string_input($input, 'email'));
    $password = (string)($input['password'] ?? '');
    $requiredRole = $action === 'admin_login' ? 'admin' : null;

    if ($email === '' || $password === '') {
        fail('Email and password are required.', 422);
    }

    $user = fetch_one('SELECT * FROM users WHERE email = ?', [$email]);
    if (!$user || !password_verify($password, $user['password_hash'])) {
        fail('Invalid email or password.', 401);
    }

    if ($requiredRole !== null && $user['role'] !== $requiredRole) {
        fail('This account does not have admin access.', 403);
    }

    if ((bool)$user['is_blocked']) {
        fail('This account is blocked.', 403);
    }

    session_regenerate_id(true);
    unset($_SESSION['delivery_man_id']);
    $_SESSION['user_id'] = (int)$user['id'];

    ok(['user' => sanitize_user($user)]);
}

if ($action === 'logout') {
    require_method(['POST']);
    unset($_SESSION['user_id']);
    ok(['message' => 'Logged out successfully.']);
}

if ($action === 'me') {
    require_method(['GET']);
    $user = current_user();
    ok(['user' => $user ? sanitize_user($user) : null]);
}

if ($action === 'update_profile') {
    require_method(['POST', 'PUT', 'PATCH']);
    $user = require_user();
    $input = json_input();

    $fullName = alt_string($input, ['full_name', 'fullName', 'name'], $user['full_name']);
    $phone = string_input($input, 'phone', $user['phone']);
    $address = string_input($input, 'address', (string)$user['address']);
    $defaultAddress = alt_string($input, ['default_delivery_address', 'defaultDeliveryAddress'], (string)($user['default_delivery_address'] ?? $address));

    if ($fullName === '' || $phone === '') {
        fail('Name and phone are required.', 422);
    }

    db()->prepare(
        'UPDATE users
         SET full_name = ?, phone = ?, address = ?, default_delivery_address = ?
         WHERE id = ?'
    )->execute([$fullName, $phone, $address, $defaultAddress, (int)$user['id']]);

    $updated = fetch_one('SELECT * FROM users WHERE id = ?', [(int)$user['id']]);
    ok(['user' => sanitize_user($updated)]);
}

fail('Unknown auth action.', 404);
