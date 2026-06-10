<?php
declare(strict_types=1);

require_once __DIR__ . '/config/helpers.php';

$action = action_name('list');

if ($action === 'book' || $action === 'create') {
    require_method(['POST']);
    $user = require_customer();
    $input = json_input();

    $date = alt_string($input, ['reservation_date', 'reservationDate', 'date']);
    $time = alt_string($input, ['reservation_time', 'reservationTime', 'time']);
    $guests = int_input($input, 'guests', int_input($input, 'numberOfPeople', int_input($input, 'number_of_people')));
    $specialRequest = alt_string($input, ['special_request', 'specialRequests', 'special_requests']);

    if ($date === '' || $time === '' || $guests < 1 || $guests > 20) {
        fail('Date, time and guests between 1 and 20 are required.', 422);
    }

    $timestamp = strtotime($date . ' ' . $time);
    if ($timestamp === false || $timestamp <= time()) {
        fail('Please choose a future reservation date/time.', 422);
    }

    $hour = (int)date('G', $timestamp);
    if ($hour < 12 || $hour >= 23) {
        fail('Reservation time must be between 12:00 and 23:00.', 422);
    }

    db()->prepare(
        'INSERT INTO reservations
         (reservation_number, user_id, guest_name, guest_phone, guest_email, reservation_date, reservation_time, guests, special_request, status)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)'
    )->execute([
        make_reservation_number(),
        (int)$user['id'],
        $user['full_name'],
        $user['phone'],
        $user['email'],
        $date,
        $time,
        $guests,
        $specialRequest,
        'pending',
    ]);

    $reservation = fetch_one('SELECT * FROM reservations WHERE id = ?', [(int)db()->lastInsertId()]);
    create_notification((int)$user['id'], null, 'Reservation requested', 'Your table reservation is pending confirmation.', 'reservation');
    ok(['reservation' => $reservation], 201);
}

if ($action === 'list') {
    require_method(['GET']);
    $user = require_customer();
    $reservations = fetch_all(
        'SELECT *
         FROM reservations
         WHERE user_id = ?
         ORDER BY reservation_date DESC, reservation_time DESC',
        [(int)$user['id']]
    );
    ok(['reservations' => $reservations]);
}

if ($action === 'cancel') {
    require_method(['POST']);
    $user = require_customer();
    $input = json_input();
    $id = int_input($input, 'reservation_id', int_input($input, 'id'));

    $reservation = fetch_one('SELECT * FROM reservations WHERE id = ? AND user_id = ?', [$id, (int)$user['id']]);
    if (!$reservation) {
        fail('Reservation not found.', 404);
    }

    if (!in_array($reservation['status'], ['pending', 'confirmed'], true)) {
        fail('This reservation cannot be cancelled.', 409);
    }

    db()->prepare("UPDATE reservations SET status = 'cancelled' WHERE id = ?")->execute([$id]);
    ok(['reservation' => fetch_one('SELECT * FROM reservations WHERE id = ?', [$id])]);
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

    if (isset($_GET['date']) && trim((string)$_GET['date']) !== '') {
        $where[] = 'reservation_date = ?';
        $params[] = trim((string)$_GET['date']);
    }

    if (isset($_GET['search']) && trim((string)$_GET['search']) !== '') {
        $where[] = '(reservation_number LIKE ? OR guest_name LIKE ? OR guest_phone LIKE ? OR guest_email LIKE ?)';
        $search = '%' . trim((string)$_GET['search']) . '%';
        $params[] = $search;
        $params[] = $search;
        $params[] = $search;
        $params[] = $search;
    }

    $reservations = fetch_all(
        'SELECT *
         FROM reservations
         WHERE ' . implode(' AND ', $where) . '
         ORDER BY reservation_date DESC, reservation_time DESC',
        $params
    );

    ok(['reservations' => $reservations]);
}

if ($action === 'confirm' || $action === 'admin_cancel' || $action === 'complete' || $action === 'no_show') {
    require_method(['POST', 'PATCH']);
    require_admin();
    $input = json_input();
    $id = int_input($input, 'reservation_id', int_input($input, 'id'));
    $statusMap = [
        'confirm' => 'confirmed',
        'admin_cancel' => 'cancelled',
        'complete' => 'completed',
        'no_show' => 'no_show',
    ];

    $reservation = fetch_one('SELECT * FROM reservations WHERE id = ?', [$id]);
    if (!$reservation) {
        fail('Reservation not found.', 404);
    }

    db()->prepare('UPDATE reservations SET status = ? WHERE id = ?')->execute([$statusMap[$action], $id]);
    create_notification((int)$reservation['user_id'], null, 'Reservation updated', 'Your reservation status is now ' . str_replace('_', ' ', $statusMap[$action]) . '.', 'reservation');

    ok(['reservation' => fetch_one('SELECT * FROM reservations WHERE id = ?', [$id])]);
}

fail('Unknown reservation action.', 404);
