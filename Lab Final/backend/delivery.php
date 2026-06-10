<?php
declare(strict_types=1);

require_once __DIR__ . '/config/helpers.php';

$action = action_name('assigned');

if ($action === 'login') {
    require_method(['POST']);
    $input = json_input();
    $email = strtolower(string_input($input, 'email'));
    $password = (string)($input['password'] ?? '');

    if ($email === '' || $password === '') {
        fail('Email and password are required.', 422);
    }

    $deliveryMan = fetch_one('SELECT * FROM delivery_men WHERE email = ?', [$email]);
    if (!$deliveryMan || !password_verify($password, $deliveryMan['password_hash'])) {
        fail('Invalid email or password.', 401);
    }

    if (!(bool)$deliveryMan['is_active'] || $deliveryMan['status'] === 'inactive') {
        fail('This delivery account is inactive.', 403);
    }

    session_regenerate_id(true);
    unset($_SESSION['user_id']);
    $_SESSION['delivery_man_id'] = (int)$deliveryMan['id'];

    ok(['delivery_man' => sanitize_delivery_man($deliveryMan)]);
}

if ($action === 'logout') {
    require_method(['POST']);
    unset($_SESSION['delivery_man_id']);
    ok(['message' => 'Logged out successfully.']);
}

if ($action === 'profile') {
    require_method(['GET']);
    $deliveryMan = require_delivery_man();
    ok(['delivery_man' => sanitize_delivery_man($deliveryMan)]);
}

if ($action === 'dashboard') {
    require_method(['GET']);
    $deliveryMan = require_delivery_man();
    $deliveryManId = (int)$deliveryMan['id'];

    $today = fetch_one(
        "SELECT
            COUNT(*) AS today_deliveries,
            SUM(CASE WHEN da.status IN ('assigned', 'accepted') THEN 1 ELSE 0 END) AS pending_pickups,
            SUM(CASE WHEN da.status = 'delivered' THEN 1 ELSE 0 END) AS completed_today,
            SUM(CASE WHEN da.status = 'failed' THEN 1 ELSE 0 END) AS failed_today
         FROM delivery_assignments da
         WHERE da.delivery_man_id = ? AND DATE(da.created_at) = CURDATE()",
        [$deliveryManId]
    );

    $lifetime = fetch_one(
        "SELECT
            SUM(CASE WHEN da.status = 'delivered' THEN 1 ELSE 0 END) AS completed_deliveries,
            SUM(CASE WHEN da.status = 'failed' THEN 1 ELSE 0 END) AS failed_deliveries,
            COALESCE(SUM(CASE WHEN da.status = 'delivered' THEN o.total_amount ELSE 0 END), 0) AS delivered_value
         FROM delivery_assignments da
         JOIN orders o ON o.id = da.order_id
         WHERE da.delivery_man_id = ?",
        [$deliveryManId]
    );

    $commissionRate = (float)$deliveryMan['commission_rate'];
    $deliveredValue = (float)$lifetime['delivered_value'];

    ok([
        'delivery_man' => sanitize_delivery_man($deliveryMan),
        'stats' => [
            'today_deliveries' => (int)$today['today_deliveries'],
            'pending_pickups' => (int)$today['pending_pickups'],
            'completed_today' => (int)$today['completed_today'],
            'failed_today' => (int)$today['failed_today'],
            'completed_deliveries' => (int)$lifetime['completed_deliveries'],
            'failed_deliveries' => (int)$lifetime['failed_deliveries'],
            'estimated_commission' => round($deliveredValue * ($commissionRate / 100), 2),
        ],
    ]);
}

if ($action === 'update_profile') {
    require_method(['POST', 'PUT', 'PATCH']);
    $deliveryMan = require_delivery_man();
    $input = json_input();

    $phone = string_input($input, 'phone', $deliveryMan['phone']);
    if ($phone === '') {
        fail('Phone number is required.', 422);
    }

    db()->prepare('UPDATE delivery_men SET phone = ? WHERE id = ?')->execute([$phone, (int)$deliveryMan['id']]);
    ok(['delivery_man' => sanitize_delivery_man(fetch_one('SELECT * FROM delivery_men WHERE id = ?', [(int)$deliveryMan['id']]))]);
}

if ($action === 'assigned') {
    require_method(['GET']);
    $deliveryMan = require_delivery_man();
    ok([
        'orders' => delivery_orders(
            (int)$deliveryMan['id'],
            "da.status IN ('assigned', 'accepted', 'picked_up', 'out_for_delivery')",
            []
        ),
    ]);
}

if ($action === 'today') {
    require_method(['GET']);
    $deliveryMan = require_delivery_man();
    ok([
        'orders' => delivery_orders(
            (int)$deliveryMan['id'],
            'DATE(da.created_at) = CURDATE()',
            []
        ),
    ]);
}

if ($action === 'history') {
    require_method(['GET']);
    $deliveryMan = require_delivery_man();
    $where = "da.status IN ('delivered', 'failed')";
    $params = [];

    if (isset($_GET['status']) && trim((string)$_GET['status']) !== '') {
        $status = normalize_key((string)$_GET['status']);
        $status = $status === 'failed_delivery' ? 'failed' : $status;
        if (!in_array($status, ['delivered', 'failed'], true)) {
            fail('Invalid delivery history status.', 422);
        }
        $where = 'da.status = ?';
        $params[] = $status;
    }

    if (isset($_GET['date']) && trim((string)$_GET['date']) !== '') {
        $where .= ' AND DATE(da.updated_at) = ?';
        $params[] = trim((string)$_GET['date']);
    }

    ok(['orders' => delivery_orders((int)$deliveryMan['id'], $where, $params)]);
}

if ($action === 'update_status') {
    require_method(['POST', 'PATCH']);
    $deliveryMan = require_delivery_man();
    $input = json_input();
    $orderId = int_input($input, 'order_id', int_input($input, 'id'));
    $rawStatus = alt_string($input, ['status', 'delivery_status', 'deliveryStatus']);
    $note = string_input($input, 'note');
    $failureReason = alt_string($input, ['failure_reason', 'failureReason'], $note);

    $statusMap = [
        'accept' => 'accepted',
        'accept_delivery' => 'accepted',
        'accepted' => 'accepted',
        'picked_up' => 'picked_up',
        'mark_picked_up' => 'picked_up',
        'out_for_delivery' => 'out_for_delivery',
        'mark_out_for_delivery' => 'out_for_delivery',
        'delivered' => 'delivered',
        'mark_delivered' => 'delivered',
        'failed' => 'failed',
        'failed_delivery' => 'failed',
        'mark_failed_delivery' => 'failed',
    ];

    $deliveryStatus = $statusMap[normalize_key($rawStatus)] ?? '';
    if ($deliveryStatus === '') {
        fail('Invalid delivery status.', 422, ['allowed' => array_keys($statusMap)]);
    }

    $assignment = fetch_one(
        'SELECT da.*, o.user_id
         FROM delivery_assignments da
         JOIN orders o ON o.id = da.order_id
         WHERE da.order_id = ? AND da.delivery_man_id = ?
         ORDER BY da.id DESC
         LIMIT 1',
        [$orderId, (int)$deliveryMan['id']]
    );

    if (!$assignment || in_array($assignment['status'], ['cancelled', 'delivered', 'failed'], true)) {
        fail('Assigned delivery not found.', 404);
    }

    $orderStatusMap = [
        'accepted' => 'assigned_to_delivery_man',
        'picked_up' => 'picked_up',
        'out_for_delivery' => 'out_for_delivery',
        'delivered' => 'delivered',
        'failed' => 'failed_delivery',
    ];

    $timeColumnMap = [
        'accepted' => 'accepted_at',
        'picked_up' => 'picked_up_at',
        'out_for_delivery' => 'out_for_delivery_at',
        'delivered' => 'delivered_at',
        'failed' => 'failed_at',
    ];

    $pdo = db();
    try {
        $pdo->beginTransaction();

        $timeColumn = $timeColumnMap[$deliveryStatus];
        $pdo->prepare(
            "UPDATE delivery_assignments
             SET status = ?, notes = ?, failure_reason = ?, {$timeColumn} = NOW()
             WHERE id = ?"
        )->execute([
            $deliveryStatus,
            $note,
            $deliveryStatus === 'failed' ? $failureReason : null,
            (int)$assignment['id'],
        ]);

        $orderStatus = $orderStatusMap[$deliveryStatus];
        $pdo->prepare('UPDATE orders SET status = ? WHERE id = ?')->execute([$orderStatus, $orderId]);

        if ($deliveryStatus === 'delivered') {
            $pdo->prepare("UPDATE orders SET payment_status = 'paid' WHERE id = ?")->execute([$orderId]);
            $pdo->prepare("UPDATE payments SET status = 'paid', paid_at = NOW() WHERE order_id = ?")->execute([$orderId]);
            $pdo->prepare("UPDATE delivery_men SET status = 'available' WHERE id = ?")->execute([(int)$deliveryMan['id']]);
        }

        if ($deliveryStatus === 'failed') {
            $pdo->prepare("UPDATE delivery_men SET status = 'available' WHERE id = ?")->execute([(int)$deliveryMan['id']]);
        }

        add_order_history($orderId, $orderStatus, null, (int)$deliveryMan['id'], $note);
        create_notification((int)$assignment['user_id'], null, 'Delivery update', 'Your order is now ' . str_replace('_', ' ', $orderStatus) . '.', 'delivery');

        $pdo->commit();
        ok(['order' => order_payload($orderId)]);
    } catch (Throwable $e) {
        if ($pdo->inTransaction()) {
            $pdo->rollBack();
        }
        fail('Failed to update delivery status.', 500, ['details' => $e->getMessage()]);
    }
}

if ($action === 'add_note') {
    require_method(['POST', 'PATCH']);
    $deliveryMan = require_delivery_man();
    $input = json_input();
    $orderId = int_input($input, 'order_id', int_input($input, 'id'));
    $note = string_input($input, 'note');

    if ($note === '') {
        fail('Note is required.', 422);
    }

    db()->prepare(
        'UPDATE delivery_assignments
         SET notes = ?
         WHERE order_id = ? AND delivery_man_id = ?
         ORDER BY id DESC
         LIMIT 1'
    )->execute([$note, $orderId, (int)$deliveryMan['id']]);

    ok(['order' => order_payload($orderId)]);
}

if ($action === 'admin_list') {
    require_method(['GET']);
    require_admin();

    $where = ['1 = 1'];
    $params = [];

    if (isset($_GET['status']) && trim((string)$_GET['status']) !== '') {
        $where[] = 'status = ?';
        $params[] = normalize_key((string)$_GET['status']);
    }

    if (isset($_GET['search']) && trim((string)$_GET['search']) !== '') {
        $where[] = '(full_name LIKE ? OR email LIKE ? OR phone LIKE ? OR vehicle_number LIKE ?)';
        $search = '%' . trim((string)$_GET['search']) . '%';
        $params[] = $search;
        $params[] = $search;
        $params[] = $search;
        $params[] = $search;
    }

    $deliveryMen = fetch_all(
        'SELECT id, full_name, email, phone, vehicle_number, status, is_active, commission_rate, created_at, updated_at
         FROM delivery_men
         WHERE ' . implode(' AND ', $where) . '
         ORDER BY created_at DESC',
        $params
    );

    foreach ($deliveryMen as &$deliveryMan) {
        $deliveryMan['is_active'] = (bool)$deliveryMan['is_active'];
        $deliveryMan['commission_rate'] = (float)$deliveryMan['commission_rate'];
    }
    unset($deliveryMan);

    ok(['delivery_men' => $deliveryMen]);
}

if ($action === 'admin_create') {
    require_method(['POST']);
    require_admin();
    $input = json_input();

    $fullName = alt_string($input, ['full_name', 'fullName', 'name']);
    $email = strtolower(string_input($input, 'email'));
    $phone = string_input($input, 'phone');
    $vehicleNumber = alt_string($input, ['vehicle_number', 'vehicleNumber']);
    $password = (string)($input['password'] ?? '');
    $commissionRate = (float)($input['commission_rate'] ?? 0);

    if ($fullName === '' || $email === '' || $phone === '' || $vehicleNumber === '' || $password === '') {
        fail('Name, email, phone, vehicle number and password are required.', 422);
    }

    if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
        fail('Invalid email address.', 422);
    }

    db()->prepare(
        'INSERT INTO delivery_men (full_name, email, phone, vehicle_number, password_hash, status, is_active, commission_rate)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)'
    )->execute([$fullName, $email, $phone, $vehicleNumber, password_hash($password, PASSWORD_DEFAULT), 'available', 1, $commissionRate]);

    ok(['delivery_man' => sanitize_delivery_man(fetch_one('SELECT * FROM delivery_men WHERE id = ?', [(int)db()->lastInsertId()]))], 201);
}

if ($action === 'admin_update') {
    require_method(['POST', 'PUT', 'PATCH']);
    require_admin();
    $input = json_input();
    $id = int_input($input, 'id', int_input($input, 'delivery_man_id'));
    $deliveryMan = fetch_one('SELECT * FROM delivery_men WHERE id = ?', [$id]);

    if (!$deliveryMan) {
        fail('Delivery man not found.', 404);
    }

    $fullName = alt_string($input, ['full_name', 'fullName', 'name'], $deliveryMan['full_name']);
    $phone = string_input($input, 'phone', $deliveryMan['phone']);
    $vehicleNumber = alt_string($input, ['vehicle_number', 'vehicleNumber'], $deliveryMan['vehicle_number']);
    $status = normalize_key(string_input($input, 'status', $deliveryMan['status']));
    $isActive = bool_input($input, 'is_active', (bool)$deliveryMan['is_active']);
    $commissionRate = (float)($input['commission_rate'] ?? $deliveryMan['commission_rate']);

    if (!in_array($status, ['available', 'busy', 'inactive'], true)) {
        fail('Invalid delivery man status.', 422);
    }

    db()->prepare(
        'UPDATE delivery_men
         SET full_name = ?, phone = ?, vehicle_number = ?, status = ?, is_active = ?, commission_rate = ?
         WHERE id = ?'
    )->execute([$fullName, $phone, $vehicleNumber, $status, $isActive ? 1 : 0, $commissionRate, $id]);

    if (isset($input['password']) && (string)$input['password'] !== '') {
        db()->prepare('UPDATE delivery_men SET password_hash = ? WHERE id = ?')
            ->execute([password_hash((string)$input['password'], PASSWORD_DEFAULT), $id]);
    }

    ok(['delivery_man' => sanitize_delivery_man(fetch_one('SELECT * FROM delivery_men WHERE id = ?', [$id]))]);
}

if ($action === 'admin_deactivate' || $action === 'admin_delete') {
    require_method(['POST', 'DELETE']);
    require_admin();
    $input = json_input();
    $id = int_input($input, 'id', int_input($input, 'delivery_man_id', (int)($_GET['id'] ?? 0)));

    db()->prepare("UPDATE delivery_men SET status = 'inactive', is_active = 0 WHERE id = ?")->execute([$id]);
    ok(['message' => 'Delivery man deactivated.']);
}

if ($action === 'admin_history') {
    require_method(['GET']);
    require_admin();
    $deliveryManId = (int)($_GET['id'] ?? $_GET['delivery_man_id'] ?? 0);
    ok(['orders' => delivery_orders($deliveryManId, '1 = 1', [])]);
}

fail('Unknown delivery action.', 404);

function delivery_orders(int $deliveryManId, string $where, array $params): array
{
    $rows = fetch_all(
        'SELECT da.id AS assignment_id, da.status AS assignment_status, da.notes, da.failure_reason,
                da.assigned_at, da.accepted_at, da.picked_up_at, da.out_for_delivery_at, da.delivered_at, da.failed_at,
                o.id AS order_id
         FROM delivery_assignments da
         JOIN orders o ON o.id = da.order_id
         WHERE da.delivery_man_id = ? AND ' . $where . '
         ORDER BY da.updated_at DESC, da.created_at DESC',
        array_merge([$deliveryManId], $params)
    );

    $orders = [];
    foreach ($rows as $row) {
        $order = order_payload((int)$row['order_id']);
        if (!$order) {
            continue;
        }

        $order['assignment'] = [
            'id' => (int)$row['assignment_id'],
            'status' => $row['assignment_status'],
            'notes' => $row['notes'],
            'failure_reason' => $row['failure_reason'],
            'assigned_at' => $row['assigned_at'],
            'accepted_at' => $row['accepted_at'],
            'picked_up_at' => $row['picked_up_at'],
            'out_for_delivery_at' => $row['out_for_delivery_at'],
            'delivered_at' => $row['delivered_at'],
            'failed_at' => $row['failed_at'],
        ];

        $orders[] = $order;
    }

    return $orders;
}
