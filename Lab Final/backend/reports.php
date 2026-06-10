<?php
declare(strict_types=1);

require_once __DIR__ . '/config/helpers.php';

require_admin();
$action = action_name('dashboard');

if ($action === 'dashboard') {
    require_method(['GET']);
    ok([
        'daily_sales' => daily_sales_report((string)($_GET['date'] ?? date('Y-m-d'))),
        'total_revenue' => total_revenue_report(),
        'top_selling_items' => top_selling_items_report((int)($_GET['limit'] ?? 10)),
        'customer_order_count' => customer_order_count_report(),
        'delivery_man_performance' => delivery_performance_report(),
        'cancelled_orders_count' => cancelled_orders_report(),
    ]);
}

if ($action === 'daily_sales') {
    require_method(['GET']);
    ok(['daily_sales' => daily_sales_report((string)($_GET['date'] ?? date('Y-m-d')))]);
}

if ($action === 'total_revenue') {
    require_method(['GET']);
    ok(['total_revenue' => total_revenue_report()]);
}

if ($action === 'top_selling_items') {
    require_method(['GET']);
    ok(['items' => top_selling_items_report((int)($_GET['limit'] ?? 10))]);
}

if ($action === 'customer_order_count') {
    require_method(['GET']);
    ok(['customers' => customer_order_count_report()]);
}

if ($action === 'delivery_performance') {
    require_method(['GET']);
    ok(['delivery_men' => delivery_performance_report()]);
}

if ($action === 'cancelled_orders_count') {
    require_method(['GET']);
    ok(['cancelled_orders' => cancelled_orders_report()]);
}

fail('Unknown report action.', 404);

function daily_sales_report(string $date): array
{
    $row = fetch_one(
        "SELECT COUNT(*) AS order_count, COALESCE(SUM(total_amount), 0) AS revenue
         FROM orders
         WHERE DATE(created_at) = ? AND status = 'delivered'",
        [$date]
    );

    return [
        'date' => $date,
        'order_count' => (int)$row['order_count'],
        'revenue' => (float)$row['revenue'],
    ];
}

function total_revenue_report(): array
{
    $row = fetch_one(
        "SELECT COALESCE(SUM(total_amount), 0) AS revenue,
                COUNT(*) AS delivered_orders
         FROM orders
         WHERE status = 'delivered'"
    );

    return [
        'revenue' => (float)$row['revenue'],
        'delivered_orders' => (int)$row['delivered_orders'],
    ];
}

function top_selling_items_report(int $limit): array
{
    $limit = max(1, min($limit, 50));
    return fetch_all(
        "SELECT item_name, SUM(quantity) AS quantity_sold, SUM(line_total) AS revenue
         FROM order_items oi
         JOIN orders o ON o.id = oi.order_id
         WHERE o.status = 'delivered'
         GROUP BY item_name
         ORDER BY quantity_sold DESC, revenue DESC
         LIMIT {$limit}"
    );
}

function customer_order_count_report(): array
{
    return fetch_all(
        "SELECT u.id, u.full_name, u.email,
                COUNT(o.id) AS order_count,
                COALESCE(SUM(CASE WHEN o.status = 'delivered' THEN o.total_amount ELSE 0 END), 0) AS total_spent
         FROM users u
         LEFT JOIN orders o ON o.user_id = u.id
         WHERE u.role = 'customer'
         GROUP BY u.id
         ORDER BY order_count DESC, total_spent DESC"
    );
}

function delivery_performance_report(): array
{
    return fetch_all(
        "SELECT dm.id, dm.full_name, dm.phone, dm.vehicle_number,
                SUM(CASE WHEN da.status = 'delivered' THEN 1 ELSE 0 END) AS completed_deliveries,
                SUM(CASE WHEN da.status = 'failed' THEN 1 ELSE 0 END) AS failed_deliveries,
                COUNT(da.id) AS total_assignments
         FROM delivery_men dm
         LEFT JOIN delivery_assignments da ON da.delivery_man_id = dm.id
         GROUP BY dm.id
         ORDER BY completed_deliveries DESC, failed_deliveries ASC"
    );
}

function cancelled_orders_report(): array
{
    $row = fetch_one(
        "SELECT COUNT(*) AS cancelled_orders
         FROM orders
         WHERE status IN ('cancelled', 'rejected', 'failed_delivery')"
    );

    return ['count' => (int)$row['cancelled_orders']];
}
