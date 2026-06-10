# 🍽️ Food Express - Premium Food Ordering & Management System

> **A complete, enterprise-grade food ordering and management platform** combining a modern frontend with a robust PHP/MySQL backend. Supports full functionality for customers, administrators, and delivery personnel with real-time order tracking, inventory management, and comprehensive analytics.

---

## 📋 Table of Contents

- [Project Overview](#project-overview)
- [Key Features](#key-features)
- [Technology Stack](#technology-stack)
- [System Architecture](#system-architecture)
- [Backend Setup & Configuration](#backend-setup--configuration)
- [API Documentation](#api-documentation)
- [Demo Accounts](#demo-accounts)
- [Project Structure](#project-structure)
- [Installation & Deployment](#installation--deployment)

---

## 🎯 Project Overview

Food Express is a **full-stack food ordering system** designed to facilitate seamless ordering, management, and delivery of food items. The system includes:

- **Customer Portal**: Browse menu, place orders, track deliveries, book tables
- **Admin Dashboard**: Manage menu, categories, orders, reservations, and view analytics
- **Delivery System**: Real-time order assignment and delivery status updates
- **Database Backend**: Persistent data storage with MySQL and PHP APIs
- **Responsive Design**: Works perfectly on mobile, tablet, and desktop

---

## ✨ Key Features

### 👥 Customer Features

#### 🛍️ Shopping & Ordering
- **Browse Menu** - View complete menu with item details (name, price, description, ratings, images)
- **Real-time Search** - Search items by name across entire catalog
- **Category Filtering** - Filter menu by food categories
- **Smart Cart System**
  - Add/remove items with ease
  - Adjust quantities dynamically
  - View cart summary with total price
  - Clear entire cart
- **Checkout Process**
  - Enter or select delivery address
  - Add special requests and dietary preferences
  - Review order summary before confirmation
  - Secure payment processing

#### 📦 Order Management
- **Place Orders** - Complete order submission with all details
- **Order Tracking** - Real-time status updates with visual timeline:
  - 🟡 **Pending** - Order received, waiting to be prepared
  - 🔵 **Preparing** - Kitchen is preparing your order
  - 🟣 **Out for Delivery** - Delivery person is on the way
  - 🟢 **Delivered** - Order successfully delivered
- **Order History** - View all past orders with dates, items, and totals
- **Cancel Orders** - Cancel orders (with restrictions for orders already being prepared)

#### 👤 Account Management
- **User Registration** - Create account with:
  - Full name, email, phone number
  - Residential address (for delivery)
  - Password (encrypted storage)
- **Secure Login** - Email/password authentication
- **"Remember Me"** - Session persistence option
- **Profile Management** - Update personal information anytime
- **Account Statistics** - View total orders placed and total spending

#### 📅 Table Reservation System
- **Book Tables** - Reserve a table for specific date and time
  - Operating hours: 12 PM - 11 PM
  - Select number of guests
  - Choose preferred seating time
  - Add special requests/dietary requirements
- **Manage Reservations** - View all upcoming table bookings
- **Cancel Reservations** - Cancel bookings with confirmation
- **Reservation Confirmation** - Instant confirmation with booking reference

---

### 👨‍💼 Admin Features

#### 📊 Dashboard & Analytics
- **Real-time Statistics**
  - Total customer count
  - Total orders placed
  - Total revenue generated
  - Pending orders count
- **Recent Activity Feed**
  - Last 5 orders with customer details
  - Last 5 table reservations
  - Real-time updates
- **Quick Overview** - All key metrics displayed at a glance
- **Performance Reports**
  - Sales analytics
  - Revenue tracking
  - Top-selling menu items
  - Customer acquisition metrics
  - Delivery performance stats

#### 🏷️ Category Management (Full CRUD)
- **Create Categories** - Add new food categories
- **Read Categories** - Browse all categories with item count
- **Update Categories** - Edit category names and descriptions
- **Delete Categories** - Remove categories (with validation)
- **Search Categories** - Filter categories by name
- **Category Organization** - Organize menu structure effectively

#### 🍽️ Menu Item Management (Full CRUD)
- **Create Menu Items** - Add new items with:
  - Item name and description
  - Price and category assignment
  - Product image upload
  - Dietary information
  - Ratings and reviews
- **Read Items** - Browse complete menu with all details
- **Update Items** - Edit any item details (name, price, description, image)
- **Delete Items** - Remove items from menu permanently
- **Availability Toggle** - Mark items as available/unavailable
- **Price Management** - Update prices in real-time
- **Bulk Operations** - Manage multiple items efficiently
- **Real-time Sync** - Customer interface updates instantly

#### 📦 Order Management
- **View All Orders** - Complete order history with filters
- **Order Details** - Access comprehensive order information:
  - Customer details and contact info
  - Complete item list with quantities
  - Order subtotal, taxes, and final total
  - Delivery address and special requests
  - Order date and current status
- **Status Management** - Update order status through workflow:
  - Pending → Preparing → Out for Delivery → Delivered
  - Add notes/comments to orders
- **Cancel Orders** - Cancel orders with confirmation and reason
- **Revenue Tracking** - Monitor total revenue and profit margins
- **Filter & Sort** - View orders by:
  - Status (pending, preparing, out for delivery, delivered)
  - Date range
  - Customer name
  - Order value

#### 👨‍🚚 Delivery Management
- **Assign Orders** - Assign orders to delivery personnel
- **Delivery Person Tracking** - View assigned delivery persons
- **Status Updates** - Monitor real-time delivery status
- **Performance Metrics** - Track delivery efficiency and ratings

#### 📅 Reservation Management
- **View All Bookings** - Complete list of table reservations
- **Reservation Details** - Access:
  - Customer name and contact info
  - Number of guests
  - Reserved date and time
  - Special requests and dietary notes
  - Reservation status
- **Confirm/Cancel Reservations** - Manage bookings
- **Guest Tracking** - Monitor total guests for capacity planning
- **Reservation Calendar** - View bookings by date

---

### 👨‍🚚 Delivery Person Features

- **Secure Login** - Delivery personnel authentication
- **Assigned Orders** - View orders assigned for delivery
- **Order Details** - Access customer address and special instructions
- **Status Updates** - Update delivery status in real-time
- **Delivery Tracking** - Track delivery progress and completion
- **Performance Dashboard** - View delivery statistics and ratings

---

## 🛠️ Technology Stack

### Frontend Technologies

| Technology | Version | Purpose |
|-----------|---------|---------|
| **HTML5** | Latest | Semantic markup and structure |
| **CSS3** | Latest | Styling, animations, and responsive design |
| **Bootstrap** | 5.3.0 | Responsive framework and UI components |
| **Bootstrap Icons** | 1.11.0 | Icon library for UI elements |
| **Vanilla JavaScript** | ES6+ | Application logic and interactivity |
| **localStorage API** | Native | Client-side data persistence |
| **Fetch API** | Native | HTTP requests and API communication |
| **Single Page App (SPA)** | - | Dynamic routing without page reloads |

### Backend Technologies

| Technology | Purpose |
|-----------|---------|
| **PHP 7.4+** | Server-side application logic |
| **MySQL 5.7+** | Relational database management |
| **Apache/XAMPP** | Web server and hosting environment |
| **RESTful API** | API architecture and endpoints |
| **JSON** | Data interchange format |
| **Sessions** | User authentication and state management |
| **Cookies** | Persistent user identification |

### Development Tools & Environments

| Tool | Purpose |
|------|---------|
| **XAMPP** | Local development environment (Apache + MySQL + PHP) |
| **phpMyAdmin** | MySQL database management |
| **VS Code** | Code editor and development environment |
| **Git** | Version control (recommended) |
| **Browser DevTools** | Debugging and testing |

---

## 🏗️ System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    FRONTEND (Browser)                        │
├─────────────────────────────────────────────────────────────┤
│ HTML5 | CSS3 | Bootstrap 5.3 | Vanilla JavaScript (ES6+)   │
│ - Single Page Application (SPA)                             │
│ - Responsive UI (Mobile, Tablet, Desktop)                   │
│ - localStorage Data Persistence                              │
└──────────────────────┬──────────────────────────────────────┘
                       │ HTTP/HTTPS Requests (Fetch API)
                       ▼
┌─────────────────────────────────────────────────────────────┐
│              BACKEND (PHP REST API)                          │
├─────────────────────────────────────────────────────────────┤
│ - auth.php (Authentication & Authorization)                 │
│ - menu_items.php (Menu management)                          │
│ - categories.php (Category management)                      │
│ - cart.php (Shopping cart operations)                       │
│ - orders.php (Order processing & tracking)                  │
│ - delivery.php (Delivery management)                        │
│ - reservations.php (Table bookings)                         │
│ - reports.php (Analytics & reports)                         │
│ - payments.php (Payment processing)                         │
│ - notifications.php (User notifications)                    │
│ - offers.php (Promotional offers)                           │
│ - stats.php (Statistics aggregation)                        │
└──────────────────────┬──────────────────────────────────────┘
                       │ SQL Queries
                       ▼
┌─────────────────────────────────────────────────────────────┐
│              DATABASE (MySQL)                               │
├─────────────────────────────────────────────────────────────┤
│ - users (Customer accounts)                                 │
│ - categories (Food categories)                              │
│ - menu_items (Menu items catalog)                           │
│ - cart_items (Shopping cart)                                │
│ - orders (Order records)                                    │
│ - order_items (Order line items)                            │
│ - reservations (Table bookings)                             │
│ - deliveries (Delivery tracking)                            │
│ - payments (Payment records)                                │
│ - notifications (System notifications)                      │
└─────────────────────────────────────────────────────────────┘
```

---

## 📁 Project Structure

```
Food Express/
├── index.html                    # Main application entry point
├── README.md                     # Project documentation
├── START_HERE.md                 # Quick start guide
├── SETUP_GUIDE.md                # Detailed setup instructions
│
├── assets/                       # Static assets directory
│   ├── css/
│   │   ├── style.css            # Main stylesheet
│   │   ├── style_complete.css   # Complete styling variant
│   │   └── premium.css          # Premium theme styling
│   ├── img/                      # Image assets
│   │   └── (product images, logos, etc.)
│   └── js/                       # JavaScript files
│       ├── app.js               # Main application logic
│       ├── premium-app.js       # Premium app variant
│       ├── auth.js              # Authentication logic
│       ├── router.js            # Client-side routing
│       ├── cart.js              # Shopping cart functionality
│       ├── orders.js            # Order management
│       ├── admin.js             # Admin panel logic
│       ├── reservations.js      # Table reservation logic
│       ├── db.js                # Data layer abstraction
│       ├── storage.js           # localStorage management
│       └── helpers.js           # Utility functions
│
├── backend/                      # Backend API directory
│   ├── README.md                # Backend documentation
│   ├── .htaccess                # Apache configuration
│   ├── auth.php                 # Authentication endpoints
│   ├── menu_items.php           # Menu management API
│   ├── categories.php           # Category management API
│   ├── cart.php                 # Shopping cart API
│   ├── orders.php               # Order processing API
│   ├── order_items.php          # Order items API
│   ├── delivery.php             # Delivery management API
│   ├── reservations.php         # Reservation API
│   ├── payments.php             # Payment processing API
│   ├── notifications.php        # Notifications API
│   ├── offers.php               # Promotional offers API
│   ├── reports.php              # Reporting & analytics API
│   ├── stats.php                # Statistics aggregation API
│   ├── restaurants.php          # Restaurant management API
│   ├── users.php                # User management API
│   │
│   ├── config/
│   │   ├── database.php         # Database configuration
│   │   └── helpers.php          # Backend helper functions
│   │
│   └── database/
│       ├── schema.sql           # Database schema definition
│       └── seed.php             # Database seeding script
│
└── pages/                        # Additional pages
```

---

## ⚙️ Backend Setup & Configuration

### Prerequisites

- **XAMPP** (Apache, MySQL, PHP 7.4+)
- **PHP 7.4 or higher**
- **MySQL 5.7 or higher**
- **Text Editor/IDE** (VS Code recommended)
- **Modern Web Browser** (Chrome, Firefox, Safari, Edge)

### Step 1: Create Database

Access phpMyAdmin and run the SQL schema:

```sql
SOURCE backend/database/schema.sql;
```

Or copy and execute the SQL commands from [backend/database/schema.sql](backend/database/schema.sql)

### Step 2: Configure Database Connection

Edit `backend/config/database.php`:

```php
<?php
// Database Configuration
define('DB_HOST', '127.0.0.1');
define('DB_PORT', 3306);
define('DB_NAME', 'food_express');
define('DB_USER', 'root');
define('DB_PASS', '');
define('APP_ORIGIN', 'http://localhost:3000');
?>
```

Or use environment variables:

```env
DB_HOST=127.0.0.1
DB_PORT=3306
DB_NAME=food_express
DB_USER=root
DB_PASS=
APP_ORIGIN=http://localhost:3000
```

### Step 3: Seed Initial Data

Run the seed script to populate demo data:

```bash
php backend/database/seed.php
```

This creates:
- Demo user accounts
- Initial menu categories
- Sample menu items
- Demo orders and reservations

---

## 🔌 API Documentation

### API Endpoint Pattern

All backend API endpoints use `?action=` parameter with JSON request bodies:

```http
POST /backend/auth.php?action=login
Content-Type: application/json

{"email":"john@example.com","password":"Password123!"}
```

### Authentication Endpoints (`auth.php`)

| Action | Method | Purpose |
|--------|--------|---------|
| `register` | POST | Create new user account |
| `login` | POST | Authenticate user |
| `logout` | POST | End user session |
| `getProfile` | GET | Retrieve user profile |
| `updateProfile` | POST | Update profile information |

### Menu Management Endpoints (`menu_items.php`)

| Action | Method | Purpose |
|--------|--------|---------|
| `getAll` | GET | Retrieve all menu items |
| `getById` | GET | Get specific menu item |
| `getByCategory` | GET | Get items by category |
| `create` | POST | Add new menu item (Admin) |
| `update` | POST | Update menu item (Admin) |
| `delete` | POST | Remove menu item (Admin) |

### Category Endpoints (`categories.php`)

| Action | Method | Purpose |
|--------|--------|---------|
| `getAll` | GET | Get all categories |
| `create` | POST | Create category (Admin) |
| `update` | POST | Update category (Admin) |
| `delete` | POST | Delete category (Admin) |

### Cart Endpoints (`cart.php`)

| Action | Method | Purpose |
|--------|--------|---------|
| `getCart` | GET | Retrieve cart contents |
| `addItem` | POST | Add item to cart |
| `updateItem` | POST | Update cart item quantity |
| `removeItem` | POST | Remove item from cart |
| `clearCart` | POST | Empty entire cart |

### Order Endpoints (`orders.php`)

| Action | Method | Purpose |
|--------|--------|---------|
| `create` | POST | Place new order |
| `getAll` | GET | Get all orders (Admin) |
| `getById` | GET | Get order details |
| `getMyOrders` | GET | Get customer's orders |
| `updateStatus` | POST | Update order status (Admin) |
| `cancel` | POST | Cancel order |
| `track` | GET | Track order status |

### Reservation Endpoints (`reservations.php`)

| Action | Method | Purpose |
|--------|--------|---------|
| `create` | POST | Create table reservation |
| `getAll` | GET | Get all reservations (Admin) |
| `getMyReservations` | GET | Get customer's reservations |
| `cancel` | POST | Cancel reservation |
| `updateStatus` | POST | Update reservation (Admin) |

### Delivery Endpoints (`delivery.php`)

| Action | Method | Purpose |
|--------|--------|---------|
| `login` | POST | Delivery person login |
| `getAssignedOrders` | GET | Get orders for delivery |
| `updateStatus` | POST | Update delivery status |

### Reports Endpoints (`reports.php`)

| Action | Method | Purpose |
|--------|--------|---------|
| `getSalesReport` | GET | Sales statistics |
| `getRevenueReport` | GET | Revenue analysis |
| `getTopItems` | GET | Top-selling items |
| `getCustomerStats` | GET | Customer statistics |
| `getDeliveryStats` | GET | Delivery performance |

---

## 👤 Demo Accounts

### Admin Account
```
Email:    admin@foodexpress.com
Password: Admin123!
```
**Access**: Full admin dashboard with all management features

### Customer Account
```
Email:    john@example.com
Password: Password123!
```
**Access**: Browse menu, place orders, make reservations

### Delivery Account
```
Email:    rider@foodexpress.com
Password: Rider123!
```
**Access**: View assigned orders and update delivery status

---

## 🚀 Installation & Deployment

### Local Development

1. **Start XAMPP**
   - Start Apache
   - Start MySQL

2. **Place Project in XAMPP**
   ```
   Copy entire folder to: C:\xampp\htdocs\
   ```

3. **Access Application**
   ```
   http://localhost/Food Express/index.html
   ```

4. **API Base URL**
   ```
   http://localhost/Food Express/backend/
   ```

### Production Deployment

1. Upload project to web server
2. Configure database connection for production server
3. Set environment variables for security
4. Enable HTTPS for secure data transmission
5. Configure CORS headers in backend
6. Set up regular database backups
7. Monitor API performance and error logs

---

## 📊 Database Schema

### Core Tables

- **users** - Customer and admin accounts
- **categories** - Food categories
- **menu_items** - Menu items catalog
- **cart_items** - Shopping cart contents
- **orders** - Customer orders
- **order_items** - Order line items
- **reservations** - Table bookings
- **deliveries** - Delivery tracking
- **payments** - Payment records
- **notifications** - System notifications

---

## 🔒 Security Features

- **Password Encryption** - Bcrypt hashing for password storage
- **Session Management** - Secure session handling with cookies
- **Input Validation** - Server-side validation of all inputs
- **SQL Injection Prevention** - Parameterized queries
- **CORS Protection** - Cross-origin request validation
- **User Authentication** - Email/password authentication
- **Role-based Access** - Customer, Admin, Delivery roles
- **Data Sanitization** - Sanitize all user inputs

---

## 📝 Additional Documentation

- [START_HERE.md](../START_HERE.md) - Quick start guide for first-time users
- [SETUP_GUIDE.md](../SETUP_GUIDE.md) - Detailed setup and installation instructions
- [FEATURES_COMPLETED.md](../FEATURES_COMPLETED.md) - Complete list of implemented features
- [IMPLEMENTATION_SUMMARY.md](../IMPLEMENTATION_SUMMARY.md) - Implementation details and notes

---

## 🤝 Support & Contributing

For issues, questions, or feature requests, please refer to:
- [TESTING_GUIDE.md](../TESTING_GUIDE.md) - Testing procedures
- [QUICK_START_TESTING.md](../QUICK_START_TESTING.md) - Quick testing reference

---

## 📄 License

This project is provided as-is for educational and commercial use.

---

**Last Updated**: May 17, 2026  
**Version**: 1.0.0 - Production Ready
