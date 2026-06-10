<?php
declare(strict_types=1);

require_once __DIR__ . '/config/helpers.php';

$action = action_name('list');
$user = current_user();
$deliveryMan = current_delivery_man();

if (!$user && !$deliveryMan) {
    fail('Authentication required.', 401);
}

if ($user && (bool)$user['is_blocked']) {
    fail('This account is blocked.', 403);
}

if ($action === 'list') {
    require_method(['GET']);

    if ($user && $user['role'] === 'admin' && ($_GET['scope'] ?? '') === 'all') {
        $notifications = fetch_all('SELECT * FROM notifications ORDER BY created_at DESC LIMIT 200');
    } elseif ($user) {
        $notifications = fetch_all(
            'SELECT * FROM notifications WHERE user_id = ? ORDER BY created_at DESC LIMIT 100',
            [(int)$user['id']]
        );
    } else {
        $notifications = fetch_all(
            'SELECT * FROM notifications WHERE delivery_man_id = ? ORDER BY created_at DESC LIMIT 100',
            [(int)$deliveryMan['id']]
        );
    }

    foreach ($notifications as &$notification) {
        $notification['is_read'] = (bool)$notification['is_read'];
    }
    unset($notification);

    ok(['notifications' => $notifications]);
}

if ($action === 'mark_read') {
    require_method(['POST', 'PATCH']);
    $input = json_input();
    $id = int_input($input, 'id', int_input($input, 'notification_id'));

    $where = 'id = ?';
    $params = [$id];

    if ($user && $user['role'] !== 'admin') {
        $where .= ' AND user_id = ?';
        $params[] = (int)$user['id'];
    } elseif ($deliveryMan) {
        $where .= ' AND delivery_man_id = ?';
        $params[] = (int)$deliveryMan['id'];
    }

    db()->prepare("UPDATE notifications SET is_read = 1 WHERE {$where}")->execute($params);
    ok(['message' => 'Notification marked as read.']);
}

if ($action === 'mark_all_read') {
    require_method(['POST', 'PATCH']);

    if ($user) {
        db()->prepare('UPDATE notifications SET is_read = 1 WHERE user_id = ?')->execute([(int)$user['id']]);
    } else {
        db()->prepare('UPDATE notifications SET is_read = 1 WHERE delivery_man_id = ?')->execute([(int)$deliveryMan['id']]);
    }

    ok(['message' => 'Notifications marked as read.']);
}

if ($action === 'create') {
    require_method(['POST']);
    if (!$user || $user['role'] !== 'admin') {
        fail('Admin access required.', 403);
    }

    $input = json_input();
    $title = string_input($input, 'title');
    $message = string_input($input, 'message');
    $type = normalize_key(string_input($input, 'type', 'info'));
    $userId = int_input($input, 'user_id');
    $deliveryManId = int_input($input, 'delivery_man_id');

    if ($title === '' || $message === '') {
        fail('Title and message are required.', 422);
    }

    create_notification($userId > 0 ? $userId : null, $deliveryManId > 0 ? $deliveryManId : null, $title, $message, $type);
    ok(['message' => 'Notification created.'], 201);
}

fail('Unknown notification action.', 404);
