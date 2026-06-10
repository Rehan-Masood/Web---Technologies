<?php
declare(strict_types=1);

require_once __DIR__ . '/config/helpers.php';

require_method(['GET']);

$restaurants = fetch_one('SELECT COUNT(*) AS total FROM restaurants');
$items = fetch_one('SELECT COUNT(*) AS total FROM menu_items WHERE is_available = 1');
$orders = fetch_one("SELECT COUNT(*) AS total FROM orders WHERE status IN ('delivered', 'out_for_delivery', 'picked_up', 'preparing', 'accepted', 'pending', 'assigned_to_delivery_man')");

ok([
    'stats' => [
        'restaurants' => max(4, (int)$restaurants['total']),
        'menu_items' => max(35, (int)$items['total']),
        'orders_served' => max(120, (int)$orders['total']),
        'delivery_time' => '30-45',
    ],
]);
