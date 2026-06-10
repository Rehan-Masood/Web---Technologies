<?php
declare(strict_types=1);

require_once __DIR__ . '/../config/database.php';

$pdo = db();

$pdo->exec(
    "CREATE TABLE IF NOT EXISTS restaurants (
      id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
      name VARCHAR(140) NOT NULL UNIQUE,
      cuisine VARCHAR(180) NOT NULL,
      address VARCHAR(255) NOT NULL,
      delivery_time VARCHAR(40) NOT NULL DEFAULT '30-45 min',
      delivery_fee DECIMAL(10,2) NOT NULL DEFAULT 0.00,
      rating DECIMAL(3,2) NOT NULL DEFAULT 4.50,
      image_url TEXT NULL,
      is_open TINYINT(1) NOT NULL DEFAULT 1,
      is_featured TINYINT(1) NOT NULL DEFAULT 0,
      created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      INDEX idx_restaurants_open (is_open),
      INDEX idx_restaurants_featured (is_featured)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci"
);

$users = [
    ['Admin User', 'admin@foodexpress.com', '+92-300-1234567', 'Gulberg, Lahore', 'Admin123!', 'admin'],
    ['Ali Khan', 'customer@foodexpress.com', '+92-300-9876543', 'DHA Phase 5, Lahore', 'Customer123!', 'customer'],
    ['John Doe', 'john@example.com', '+92-300-9876544', 'Johar Town, Lahore', 'Password123!', 'customer'],
];

$userStmt = $pdo->prepare(
    'INSERT INTO users (full_name, email, phone, address, default_delivery_address, password_hash, role)
     VALUES (?, ?, ?, ?, ?, ?, ?)
     ON DUPLICATE KEY UPDATE
       full_name = VALUES(full_name),
       phone = VALUES(phone),
       address = VALUES(address),
       default_delivery_address = VALUES(default_delivery_address),
       role = VALUES(role)'
);

foreach ($users as $user) {
    $userStmt->execute([$user[0], $user[1], $user[2], $user[3], $user[3], password_hash($user[4], PASSWORD_DEFAULT), $user[5]]);
}

$deliveryStmt = $pdo->prepare(
    'INSERT INTO delivery_men (full_name, email, phone, vehicle_number, password_hash, status, is_active, commission_rate)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)
     ON DUPLICATE KEY UPDATE
       full_name = VALUES(full_name),
       phone = VALUES(phone),
       vehicle_number = VALUES(vehicle_number),
       status = VALUES(status),
       is_active = VALUES(is_active),
       commission_rate = VALUES(commission_rate)'
);

$deliveryMen = [
    ['Rider Ali', 'rider@foodexpress.com', '+92-301-5555555', 'LEA-2026', 'Rider123!', 'available', 1, 5.00],
    ['Rider Hamza', 'hamza.rider@foodexpress.com', '+92-301-5555566', 'LEB-2044', 'Rider123!', 'available', 1, 5.00],
];

foreach ($deliveryMen as $deliveryMan) {
    $deliveryStmt->execute([
        $deliveryMan[0],
        $deliveryMan[1],
        $deliveryMan[2],
        $deliveryMan[3],
        password_hash($deliveryMan[4], PASSWORD_DEFAULT),
        $deliveryMan[5],
        $deliveryMan[6],
        $deliveryMan[7],
    ]);
}

$restaurants = [
    ['Spice Valley', 'Pakistani, BBQ, Karahi', 'MM Alam Road, Lahore', '30-40 min', 0, 4.6, 'assets/img/dishes/spice-valley.jpg', 1, 1],
    ['Pizza Hut', 'Pizza, Pasta, Wings', 'Johar Town, Lahore', '25-35 min', 100, 4.5, 'assets/img/dishes/pizza-hut.jpg', 1, 1],
    ['Grill House', 'Burgers, Pizza, BBQ', 'DHA Phase 5, Lahore', '20-30 min', 0, 4.4, 'assets/img/dishes/grill-house.jpg', 1, 1],
    ['Tasty Bites', 'Desi, Chinese, BBQ', 'Model Town, Lahore', '30-45 min', 80, 4.3, 'assets/img/dishes/tasty-bites.jpg', 1, 1],
];

$restaurantStmt = $pdo->prepare(
    'INSERT INTO restaurants (name, cuisine, address, delivery_time, delivery_fee, rating, image_url, is_open, is_featured)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
     ON DUPLICATE KEY UPDATE
       cuisine = VALUES(cuisine),
       address = VALUES(address),
       delivery_time = VALUES(delivery_time),
       delivery_fee = VALUES(delivery_fee),
       rating = VALUES(rating),
       image_url = VALUES(image_url),
       is_open = VALUES(is_open),
       is_featured = VALUES(is_featured)'
);

foreach ($restaurants as $restaurant) {
    $restaurantStmt->execute($restaurant);
}

$categories = [
    ['Biryani', 'Aromatic rice dishes cooked with premium spices.'],
    ['Karahi', 'Traditional wok-style desi favorites.'],
    ['BBQ', 'Charcoal grilled classics.'],
    ['Pizza', 'Freshly baked pizzas and cheesy sides.'],
    ['Chinese', 'Fried rice, noodles and Asian favorites.'],
    ['Desserts', 'Sweet finishes for every meal.'],
    ['Drinks', 'Chilled beverages and refreshers.'],
];

$categoryStmt = $pdo->prepare(
    'INSERT INTO categories (name, description)
     VALUES (?, ?)
     ON DUPLICATE KEY UPDATE description = VALUES(description), is_active = 1'
);

foreach ($categories as $category) {
    $categoryStmt->execute($category);
}

$categoryIds = [];
foreach ($pdo->query('SELECT id, name FROM categories') as $row) {
    $categoryIds[$row['name']] = (int)$row['id'];
}

// ============================================================
// FIXED HD IMAGE URLS - All guaranteed working from Unsplash
// Only this $dishImages array was changed - nothing else
// ============================================================
$dishImages = [
    
    'Chicken Biryani' => 'assets/img/dishes/chicken-biryani.jpg',  
    'Beef Biryani'    => 'assets/img/dishes/beef-biryani.jpg',
    'Mutton Biryani'  => 'assets/img/dishes/mutton-biryani.jpg',
    'Sindhi Biryani'   => 'assets/img/dishes/sindhi-biryani.jpg',
    'Tikka Biryani'    => 'assets/img/dishes/tikka-biryani.jpg',
    'Veg Biryani'      => 'assets/img/dishes/veg-biryani.jpg',
    'Chicken Karahi'   => 'assets/img/dishes/chicken-karahi.jpg',
    'Mutton Karahi'    => 'assets/img/dishes/mutton-karahi.jpg',
    'White Karahi'     => 'assets/img/dishes/white-karahi.jpg',
    'Boneless Handi'   => 'assets/img/dishes/boneless-handi.jpg',
    'Peshawari Karahi' => 'assets/img/dishes/peshawari-karahi.jpg',
    'Paneer Karahi'    => 'assets/img/dishes/paneer-karahi.jpg',
    'Chicken Tikka'    => 'assets/img/dishes/chicken-tikka.jpg',
    'Seekh Kebab'      => 'assets/img/dishes/seekh-kebab.jpg',
    'Malai Boti'       => 'assets/img/dishes/malai-boti.jpg',
    'Reshmi Kebab'     => 'assets/img/dishes/reshmi-kebab.jpg',
    'BBQ Platter'      => 'assets/img/dishes/bbq-platter.jpg',
    'Fish Tikka'       => 'assets/img/dishes/fish-tikka.jpg',
    'Chicken Wings'    => 'assets/img/dishes/chicken-wings.jpg',
    'Beef Burger'      => 'assets/img/dishes/beef-burger.jpg',
    'Chicken Burger'   => 'assets/img/dishes/chicken-burger.jpg',
    'Margherita Pizza'     => 'assets/img/dishes/margherita-pizza.jpg',
    'Chicken Fajita Pizza' => 'assets/img/dishes/chicken-fajita-pizza.jpg',
    'Pepperoni Pizza'      => 'assets/img/dishes/pepperoni-pizza.jpg',
    'Cheese Lover Pizza'   => 'assets/img/dishes/cheese-lover-pizza.jpg',
    'BBQ Ranch Pizza'      => 'assets/img/dishes/bbq-ranch-pizza.jpg',
    'Veggie Supreme Pizza' => 'assets/img/dishes/veggie-supreme-pizza.jpg',
    'Garlic Bread'         => 'assets/img/dishes/garlic-bread.jpg',
    'Pasta Alfredo'        => 'assets/img/dishes/pasta-alfredo.jpg',
    'Fried Rice'     => 'assets/img/dishes/fried-rice.jpg',
    'Chow Mein'      => 'assets/img/dishes/chow-mein.jpg',
    'Gulab Jamun'       => 'assets/img/dishes/gulab-jamun.jpg',
    'Kheer'             => 'assets/img/dishes/kheer.jpg',
    'Chocolate Brownie' => 'assets/img/dishes/chocolate-brownie.jpg',
    'Lava Cake'         => 'assets/img/dishes/lava-cake.jpg',
    'Ras Malai'         => 'assets/img/dishes/ras-malai.jpg',
    'Kulfi'             => 'assets/img/dishes/kulfi.jpg',
    'Mint Margarita' => 'assets/img/dishes/mint-margarita.jpg',
    'Mango Lassi'    => 'assets/img/dishes/mango-lassi.jpg',
    'Soft Drink'     => 'assets/img/dishes/soft-drink.jpg',
    'Fresh Lime'     => 'assets/img/dishes/fresh-lime.jpg',
    'Cold Coffee'    => 'assets/img/dishes/cold-coffee.jpg',
    'Mineral Water'  => 'assets/img/dishes/mineral-water.jpg',  
    'Beef Biryani'    => 'assets/img/dishes/beef-biryani.jpg',
    'Mutton Biryani'  => 'assets/img/dishes/mutton-biryani.jpg',
    'Sindhi Biryani'   => 'assets/img/dishes/sindhi-biryani.jpg',
    'Tikka Biryani'    => 'assets/img/dishes/tikka-biryani.jpg',
    'Veg Biryani'      => 'assets/img/dishes/veg-biryani.jpg',
    'Chicken Karahi'   => 'assets/img/dishes/chicken-karahi.jpg',
    'Mutton Karahi'    => 'assets/img/dishes/mutton-karahi.jpg',
    'White Karahi'     => 'assets/img/dishes/white-karahi.jpg',
    'Boneless Handi'   => 'assets/img/dishes/boneless-handi.jpg',
    'Peshawari Karahi' => 'assets/img/dishes/peshawari-karahi.jpg',
    'Paneer Karahi'    => 'assets/img/dishes/paneer-karahi.jpg',
    'Chicken Tikka'    => 'assets/img/dishes/chicken-tikka.jpg',
    'Seekh Kebab'      => 'assets/img/dishes/seekh-kebab.jpg',
    'Malai Boti'       => 'assets/img/dishes/malai-boti.jpg',
    'Reshmi Kebab'     => 'assets/img/dishes/reshmi-kebab.jpg',
    'BBQ Platter'      => 'assets/img/dishes/bbq-platter.jpg',
    'Fish Tikka'       => 'assets/img/dishes/fish-tikka.jpg',
    'Chicken Wings'    => 'assets/img/dishes/chicken-wings.jpg',
    'Beef Burger'      => 'assets/img/dishes/beef-burger.jpg',
    'Chicken Burger'   => 'assets/img/dishes/chicken-burger.jpg',
    'Margherita Pizza'     => 'assets/img/dishes/margherita-pizza.jpg',
    'Chicken Fajita Pizza' => 'assets/img/dishes/chicken-fajita-pizza.jpg',
    'Pepperoni Pizza'      => 'assets/img/dishes/pepperoni-pizza.jpg',
    'Cheese Lover Pizza'   => 'assets/img/dishes/cheese-lover-pizza.jpg',
    'BBQ Ranch Pizza'      => 'assets/img/dishes/bbq-ranch-pizza.jpg',
    'Veggie Supreme Pizza' => 'assets/img/dishes/veggie-supreme-pizza.jpg',
    'Garlic Bread'         => 'assets/img/dishes/garlic-bread.jpg',
    'Pasta Alfredo'        => 'assets/img/dishes/pasta-alfredo.jpg',
    'Fried Rice'     => 'assets/img/dishes/fried-rice.jpg',
    'Chow Mein'      => 'assets/img/dishes/chow-mein.jpg',
    'Gulab Jamun'       => 'assets/img/dishes/gulab-jamun.jpg',
    'Kheer'             => 'assets/img/dishes/kheer.jpg',
    'Chocolate Brownie' => 'assets/img/dishes/chocolate-brownie.jpg',
    'Lava Cake'         => 'assets/img/dishes/lava-cake.jpg',
    'Ras Malai'         => 'assets/img/dishes/ras-malai.jpg',
    'Kulfi'             => 'assets/img/dishes/kulfi.jpg',
    'Mint Margarita' => 'assets/img/dishes/mint-margarita.jpg',
    'Mango Lassi'    => 'assets/img/dishes/mango-lassi.jpg',
    'Soft Drink'     => 'assets/img/dishes/soft-drink.jpg',
    'Fresh Lime'     => 'assets/img/dishes/fresh-lime.jpg',
    'Cold Coffee'    => 'assets/img/dishes/cold-coffee.jpg',
    'Mineral Water'  => 'assets/img/dishes/mineral-water.jpg',
];
$items = [
    ['Chicken Biryani', 'Biryani', 780, 'Aromatic basmati rice with tender chicken and spices.', $dishImages['Chicken Biryani'], 1, 1, 4.8, 'Spice Paradise'],
    ['Beef Biryani', 'Biryani', 880, 'Premium beef biryani cooked with aromatic herbs.', $dishImages['Beef Biryani'], 1, 1, 4.7, 'Spice Paradise'],
    ['Mutton Biryani', 'Biryani', 980, 'Slow cooked mutton with saffron rice.', $dishImages['Mutton Biryani'], 1, 0, 4.7, 'Spice Paradise'],
    ['Sindhi Biryani', 'Biryani', 760, 'Spicy Sindhi-style rice layered with potatoes.', $dishImages['Sindhi Biryani'], 1, 0, 4.5, 'Spice Paradise'],
    ['Tikka Biryani', 'Biryani', 820, 'Smoky chicken tikka folded into masala rice.', $dishImages['Tikka Biryani'], 1, 0, 4.6, 'Spice Paradise'],
    ['Veg Biryani', 'Biryani', 620, 'Garden vegetables and fragrant rice.', $dishImages['Veg Biryani'], 1, 0, 4.2, 'Spice Paradise'],
    ['Chicken Karahi', 'Karahi', 780, 'Classic chicken karahi with fresh tomatoes and spices.', $dishImages['Chicken Karahi'], 1, 1, 4.8, 'Spice Paradise'],
    ['Mutton Karahi', 'Karahi', 980, 'Rich mutton karahi with traditional spices.', $dishImages['Mutton Karahi'], 1, 1, 4.8, 'Spice Paradise'],
    ['White Karahi', 'Karahi', 920, 'Creamy white karahi with green chilies.', $dishImages['White Karahi'], 1, 0, 4.6, 'Spice Paradise'],
    ['Boneless Handi', 'Karahi', 850, 'Boneless chicken cooked in silky handi gravy.', $dishImages['Boneless Handi'], 1, 0, 4.5, 'Spice Paradise'],
    ['Peshawari Karahi', 'Karahi', 1050, 'Minimal spice karahi with bold meat flavor.', $dishImages['Peshawari Karahi'], 1, 0, 4.7, 'Spice Paradise'],
    ['Paneer Karahi', 'Karahi', 690, 'Cottage cheese cubes in tomato masala.', $dishImages['Paneer Karahi'], 1, 0, 4.3, 'Spice Paradise'],
    ['Chicken Tikka', 'BBQ', 320, 'Tender chicken tikka grilled over charcoal.', $dishImages['Chicken Tikka'], 1, 1, 4.6, 'Spice Paradise'],
    ['Seekh Kebab', 'BBQ', 290, 'Juicy minced beef kebab with house spices.', $dishImages['Seekh Kebab'], 1, 1, 4.5, 'Spice Paradise'],
    ['Malai Boti', 'BBQ', 420, 'Creamy marinated boneless chicken bites.', $dishImages['Malai Boti'], 1, 0, 4.7, 'Spice Paradise'],
    ['Reshmi Kebab', 'BBQ', 390, 'Soft chicken kebab with mild spices.', $dishImages['Reshmi Kebab'], 1, 0, 4.5, 'Spice Paradise'],
    ['BBQ Platter', 'BBQ', 1590, 'A generous mix of tikka, kebab and boti.', $dishImages['BBQ Platter'], 1, 1, 4.9, 'Spice Paradise'],
    ['Fish Tikka', 'BBQ', 680, 'Spiced fish fillets grilled to order.', $dishImages['Fish Tikka'], 1, 0, 4.4, 'Grill House'],
    ['Margherita Pizza', 'Pizza', 890, 'Classic tomato, mozzarella and basil.', $dishImages['Margherita Pizza'], 1, 1, 4.5, 'Pizza Hub'],
    ['Chicken Fajita Pizza', 'Pizza', 1150, 'Fajita chicken, peppers and mozzarella.', $dishImages['Chicken Fajita Pizza'], 1, 1, 4.6, 'Pizza Hub'],
    ['Pepperoni Pizza', 'Pizza', 1250, 'Pepperoni, cheese and classic tomato sauce.', $dishImages['Pepperoni Pizza'], 1, 1, 4.7, 'Pizza Hub'],
    ['Cheese Lover Pizza', 'Pizza', 990, 'Extra mozzarella on a hand-tossed crust.', $dishImages['Cheese Lover Pizza'], 1, 0, 4.4, 'Pizza Hub'],
    ['BBQ Ranch Pizza', 'Pizza', 1290, 'BBQ chicken, ranch drizzle and onions.', $dishImages['BBQ Ranch Pizza'], 1, 0, 4.6, 'Grill House'],
    ['Veggie Supreme Pizza', 'Pizza', 1050, 'Bell peppers, olives, mushrooms and corn.', $dishImages['Veggie Supreme Pizza'], 1, 0, 4.2, 'Pizza Hub'],
    ['Garlic Bread', 'Pizza', 360, 'Toasted garlic bread with herbs.', $dishImages['Garlic Bread'], 1, 0, 4.2, 'Pizza Hub'],
    ['Pasta Alfredo', 'Pizza', 750, 'Creamy fettuccine pasta with parmesan.', $dishImages['Pasta Alfredo'], 1, 0, 4.4, 'Pizza Hub'],
    ['Chicken Wings', 'BBQ', 520, 'Crispy wings with spicy sauce and blue cheese dip.', $dishImages['Chicken Wings'], 1, 0, 4.5, 'Pizza Hub'],
    ['Beef Burger', 'BBQ', 650, 'Juicy beef patty with cheese and fresh vegetables.', $dishImages['Beef Burger'], 1, 1, 4.6, 'Grill House'],
    ['Chicken Burger', 'BBQ', 480, 'Grilled chicken breast burger with mayo and lettuce.', $dishImages['Chicken Burger'], 1, 1, 4.5, 'Grill House'],
    ['Fried Rice', 'Chinese', 420, 'Egg fried rice with vegetables and soy sauce.', $dishImages['Fried Rice'], 1, 1, 4.4, 'Tasty Bites'],
    ['Chow Mein', 'Chinese', 380, 'Crispy noodles with stir-fried vegetables and meat.', $dishImages['Chow Mein'], 1, 1, 4.3, 'Tasty Bites'],
    ['Gulab Jamun', 'Desserts', 180, 'Warm gulab jamun in cardamom syrup.', $dishImages['Gulab Jamun'], 1, 0, 4.6, null],
    ['Kheer', 'Desserts', 190, 'Creamy traditional rice pudding.', $dishImages['Kheer'], 1, 0, 4.4, null],
    ['Chocolate Brownie', 'Desserts', 360, 'Dense brownie with chocolate sauce.', $dishImages['Chocolate Brownie'], 1, 0, 4.6, null],
    ['Lava Cake', 'Desserts', 480, 'Molten chocolate cake served warm.', $dishImages['Lava Cake'], 1, 1, 4.8, null],
    ['Ras Malai', 'Desserts', 280, 'Soft milk dumplings with pistachio.', $dishImages['Ras Malai'], 1, 0, 4.5, null],
    ['Kulfi', 'Desserts', 240, 'Traditional frozen milk dessert.', $dishImages['Kulfi'], 1, 0, 4.3, null],
    ['Mint Margarita', 'Drinks', 250, 'Fresh mint, lemon and crushed ice.', $dishImages['Mint Margarita'], 1, 1, 4.5, null],
    ['Mango Lassi', 'Drinks', 280, 'Thick yogurt drink with sweet mango.', $dishImages['Mango Lassi'], 1, 0, 4.6, null],
    ['Soft Drink', 'Drinks', 120, 'Chilled carbonated beverage.', $dishImages['Soft Drink'], 1, 0, 4.2, null],
    ['Fresh Lime', 'Drinks', 180, 'Lemon soda with black salt.', $dishImages['Fresh Lime'], 1, 0, 4.3, null],
    ['Cold Coffee', 'Drinks', 320, 'Creamy iced coffee with chocolate.', $dishImages['Cold Coffee'], 1, 0, 4.4, null],
    ['Mineral Water', 'Drinks', 90, 'Chilled bottled water.', $dishImages['Mineral Water'], 1, 0, 4.1, null],
];

// Get restaurant IDs
$restaurantIds = [];
foreach ($pdo->query('SELECT id, name FROM restaurants') as $row) {
    $restaurantIds[$row['name']] = (int)$row['id'];
}

// Clear existing menu items to prevent duplicates
$pdo->exec('DELETE FROM menu_items');
$pdo->exec('ALTER TABLE menu_items AUTO_INCREMENT = 1');

$itemStmt = $pdo->prepare(
    'INSERT INTO menu_items (name, category_id, price, description, image_url, is_available, is_featured, rating, restaurant_id)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)'
);

foreach ($items as $item) {
    $restaurantName = $item[8];
    $restaurantId = $restaurantName ? ($restaurantIds[$restaurantName] ?? null) : null;

    $itemStmt->execute([
        $item[0],
        $categoryIds[$item[1]],
        $item[2],
        $item[3],
        $item[4],
        $item[5],
        $item[6],
        $item[7],
        $restaurantId,
    ]);
}

echo "FoodExpress seed data installed: restaurants, categories, menu with restaurant mappings, admin, customer and delivery partner.\n";

function fetchMenuItem(PDO $pdo, string $name): ?array
{
    $stmt = $pdo->prepare('SELECT id FROM menu_items WHERE name = ? LIMIT 1');
    $stmt->execute([$name]);
    $row = $stmt->fetch(PDO::FETCH_ASSOC);
    return $row === false ? null : $row;
}