<?php
declare(strict_types=1);

require_once __DIR__ . '/config/helpers.php';

require_admin();
$action = action_name('dashboard');

if ($action === 'dashboard') {
    require_method(['GET']);

    $totalUsers = fetch_one("SELECT COUNT(*) AS total FROM users WHERE role = 'customer'");
    $totalDeliveryMen = fetch_one('SELECT COUNT(*) AS total FROM delivery_men');
    $totalCategories = fetch_one('SELECT COUNT(*) AS total FROM categories');
    $totalMenuItems = fetch_one('SELECT COUNT(*) AS total FROM menu_items');
    $totalOrders = fetch_one('SELECT COUNT(*) AS total FROM orders');
    $totalReservations = fetch_one('SELECT COUNT(*) AS total FROM reservations');
    $totalRevenue = fetch_one("SELECT COALESCE(SUM(total_amount), 0) AS total FROM orders WHERE status = 'delivered'");
    $pendingOrders = fetch_one("SELECT COUNT(*) AS total FROM orders WHERE status = 'pending'");
    $activeDeliveries = fetch_one(
        "SELECT COUNT(*) AS total
         FROM delivery_assignments
         WHERE status IN ('assigned', 'accepted', 'picked_up', 'out_for_delivery')"
    );

    $stats = [
        'total_users' => (int)$totalUsers['total'],
        'total_delivery_men' => (int)$totalDeliveryMen['total'],
        'total_categories' => (int)$totalCategories['total'],
        'total_menu_items' => (int)$totalMenuItems['total'],
        'total_orders' => (int)$totalOrders['total'],
        'total_reservations' => (int)$totalReservations['total'],
        'total_revenue' => (float)$totalRevenue['total'],
        'pending_orders' => (int)$pendingOrders['total'],
        'active_deliveries' => (int)$activeDeliveries['total'],
    ];

    $recentOrders = fetch_all(
        'SELECT o.id, o.order_number, o.status, o.total_amount, o.created_at, u.full_name AS customer_name
         FROM orders o
         JOIN users u ON u.id = o.user_id
         ORDER BY o.created_at DESC
         LIMIT 5'
    );

    $recentReservations = fetch_all(
        'SELECT id, reservation_number, guest_name, reservation_date, reservation_time, guests, status, created_at
         FROM reservations
         ORDER BY created_at DESC
         LIMIT 5'
    );

    ok([
        'stats' => $stats,
        'recent_orders' => $recentOrders,
        'recent_reservations' => $recentReservations,
    ]);
}

fail('Unknown admin action.', 404);
