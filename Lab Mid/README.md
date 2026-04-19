# Food Express - Premium Food Ordering Website

A complete, advanced, premium-looking food ordering website built with **vanilla HTML5, CSS3, Bootstrap 5.3, and JavaScript** using browser localStorage for local database simulation.

## 🚀 Features

### Authentication & Authorization
- ✅ User Registration with validation
- ✅ Secure Login with "Remember Me" functionality
- ✅ Role-based Access Control (Customer & Admin)
- ✅ Profile Management
- ✅ Password Change
- ✅ Session Management

### Customer Features
- ✅ Browse menu by categories
- ✅ Real-time search functionality
- ✅ Add items to cart
- ✅ Manage shopping cart (add, remove, update quantity)
- ✅ Checkout process
- ✅ Order placement with delivery address
- ✅ View order history
- ✅ Track order status with visual timeline
- ✅ Table reservations
- ✅ View and manage reservations

### Admin Features
- ✅ Admin Dashboard with statistics
- ✅ Category Management (CRUD)
- ✅ Menu Item Management (CRUD)
- ✅ Order Management & Status Updates
- ✅ Reservation Management
- ✅ View all orders and reservations
- ✅ Edit order status

### UI/UX Features
- ✅ Premium, modern design
- ✅ Fully responsive (mobile, tablet, desktop)
- ✅ Smooth animations and transitions
- ✅ Toast notifications
- ✅ Loading states
- ✅ Empty states
- ✅ Back-to-top button
- ✅ Sticky navigation
- ✅ Status badges with color coding

## 📁 Project Structure

```
Food Express/
├── index.html                 # Main HTML file (single-page application)
├── assets/
│   ├── css/
│   │   └── style.css         # Complete CSS styling
│   ├── js/
│   │   ├── app.js            # Main application logic
│   │   ├── router.js         # Page routing and UI logic
│   │   ├── storage.js        # LocalStorage database manager
│   │   ├── auth.js           # Authentication manager
│   │   ├── cart.js           # Shopping cart manager
│   │   ├── orders.js         # Orders manager
│   │   ├── reservations.js   # Reservations manager
│   │   └── admin.js          # Admin manager
│   └── img/                  # Images folder

```
## Screenshots
1.
![1.](./Screenshots/1.png)
2.
![2.](./Screenshots/2.png)
3.
![3.](./Screenshots/3.png)
4.1
![4.1](./Screenshots/4.1.png)
4.2
![4.2](./Screenshots/4.2.png)
5.
![5.](./Screenshots/5.png)
6.
![6.](./Screenshots/6.png)
7.
![7.](./Screenshots/7.png)
8.
![8.](./Screenshots/8.png)
9.
![9.](./Screenshots/9.png)
10.
![10.](./Screenshots/10.png)
11.
![11.](./Screenshots/11.png)
12.
![12.](./Screenshots/12.png)
13.
![13.](./Screenshots/13.png)
14.
![14.](./Screenshots/14.png)
15.
![15.](./Screenshots/15.png)
16.
![16.](./Screenshots/16.png)
17.
![17.](./Screenshots/17.png)
18.
![18.](./Screenshots/18.png)
19.
![19.](./Screenshots/19.png)
20.
![20.](./Screenshots/20.png)
21.
![21.](./Screenshots/21.png)
22.
![22.](./Screenshots/22.png)
23.
![23.](./Screenshots/23.png)
24.
![24.](./Screenshots/24.png)
25.
![26.](./Screenshots/26.png)
27.
![27.](./Screenshots/27.png)

## 🔐 Demo Accounts

### Admin Account
- **Email:** admin@foodexpress.com
- **Password:** Admin123!

### Customer Account
- **Email:** john@example.com
- **Password:** Password123!

## 🎨 Design Features

- **Color Palette:** Modern red, dark blue, and gold
- **Typography:** Clean, professional sans-serif fonts
- **Cards:** Premium card designs with shadows and hover effects
- **Buttons:** Gradient buttons with smooth transitions
- **Forms:** Professional form styling with validation
- **Modals:** Bootstrap modals for confirmations
- **Animations:** Fade-in, slide-in, and smooth scrolling

## 📱 Responsive Design

The website is fully responsive and works perfectly on:
- 📱 Mobile phones (320px - 480px)
- 📱 Large mobile phones (481px - 767px)
- 💻 Tablets (768px - 1024px)
- 🖥️ Laptops (1025px - 1440px)
- 🖥️ Large screens (1441px+)

## 💾 Local Database Features

### Data Stored in localStorage

1. **Users**
   - User accounts with hashed passwords
   - Profile information
   - Roles (customer/admin)

2. **Categories**
   - Menu categories (Biryani, Karahi, BBQ, etc.)
   - Categories with descriptions

3. **Menu Items**
   - Food items with images
   - Prices in Pakistani Rupees
   - Availability status
   - Ratings

4. **Cart**
   - Current user's shopping cart
   - Item quantities
   - Cart calculations

5. **Orders**
   - Order history
   - Order status tracking
   - Order items and totals
   - Delivery information

6. **Reservations**
   - Table reservations
   - Reservation status
   - Guest information

## 🎯 Pages & Functionality

### Home Page
- Hero section with CTA button
- Featured dishes showcase
- Category browsing
- Why choose us section

### Menu Page
- Search bar for real-time filtering
- Category filter buttons
- Premium food card grid
- Add to cart functionality

### Login Page
- Email and password validation
- Remember me option
- Link to registration

### Register Page
- Full name, email, phone, address fields
- Password strength validation
- Confirm password matching

### Profile Page
- View and edit profile information
- Change password functionality
- Membership date display

### Cart Page
- List all items in cart
- Increase/decrease quantity
- Remove items
- Cart summary with totals
- Proceed to checkout

### Checkout Page
- Delivery address confirmation
- Order notes/special requests
- Order summary
- Place order button

### Order Confirmation Page
- Success message
- Order number display
- Estimated delivery time

### Orders Page
- List all user orders
- Order information (number, date, status, total)
- View order details link

### Order Details Page
- Full order information
- Order items list
- Delivery address
- Order status timeline
- Cancel order option

### Reservations Page
- Create new reservation form
- View user's reservations
- Cancel reservation option

### Admin Dashboard
- Statistics cards (users, items, categories, orders, reservations)
- Recent orders
- Recent reservations
- Admin navigation tabs

### Admin Category Management
- Add new categories
- Edit categories
- Delete categories
- List all categories

### Admin Menu Item Management
- Add new menu items
- Edit menu items
- Delete menu items
- Set availability status
- List all items

### Admin Orders Management
- View all orders
- Update order status
- View customer details

### Admin Reservations Management
- View all reservations
- Delete reservations
- View reservation details

## 🔧 Technologies Used

- **HTML5** - Semantic markup
- **CSS3** - Modern styling with flexbox and grid
- **Bootstrap 5.3** - Responsive framework
- **Vanilla JavaScript** - No frameworks or libraries
- **localStorage** - Browser-based database simulation
- **Bootstrap Icons** - Icon library

## 🚀 Getting Started

1. **Download the project files**
2. **Open index.html in a web browser** (Chrome, Firefox, Safari, Edge)
3. **Start exploring!**

### No installation or server needed - runs entirely in the browser!

## 📋 Features Implemented

### Authentication System
- Email uniqueness validation
- Password strength requirements
- Session management
- Remember me functionality
- Password change feature

### Shopping Cart
- Add items with quantity
- Update quantities
- Remove items
- Clear cart after order
- Cart persistence

### Order System
- Create orders from cart
- Generate unique order numbers
- Track order status
- View order history
- Cancel orders
- Order status timeline

### Reservation System
- Book tables for specific dates/times
- Validate dates (not in past)
- Validate operating hours
- Manage reservations
- Cancel reservations

### Admin System
- Manage food categories
- Manage menu items (CRUD)
- Update order statuses
- View all orders
- Manage reservations
- Dashboard with statistics

## 🎨 Color Scheme

- **Primary Red:** #E74C3C
- **Dark Blue (Secondary):** #2C3E50
- **Gold (Accent):** #F39C12
- **Success Green:** #27AE60
- **Light Background:** #F8F9FA

## 📊 Order Statuses

- 🟡 **Pending** - Order placed
- 🔵 **Preparing** - Kitchen preparing
- 🟣 **Out for Delivery** - On the way
- 🟢 **Delivered** - Completed
- 🔴 **Cancelled** - Order cancelled

## 🍽️ Sample Menu

The application comes with pre-loaded Pakistani cuisine:
- Chicken Biryani - Rs 350
- Beef Biryani - Rs 400
- Chicken Karahi - Rs 320
- Mutton Karahi - Rs 420
- Chicken Tikka - Rs 280
- Seekh Kebab - Rs 250
- Gulab Jamun - Rs 150
- Kheer - Rs 120
- Falooda - Rs 180
- Mango Lassi - Rs 120
- Mint Lemonade - Rs 100
- Soft Drinks - Rs 80
- And more!

## 💡 How It Works

1. **Storage Layer** - localStorage acts as a database
2. **Auth Layer** - Manages user authentication and sessions
3. **Business Logic** - Cart, Orders, Reservations managers
4. **UI Layer** - Router handles page navigation and rendering
5. **Admin Layer** - Manages all admin-related operations

## 📝 Code Quality

- ✅ Clean, well-organized code
- ✅ Modular architecture
- ✅ Comprehensive comments
- ✅ Consistent naming conventions
- ✅ No code duplication
- ✅ Easy to extend and maintain

## 🔒 Security Features

- Password validation and strength checking
- Role-based access control
- Session management
- Input validation
- Protected admin routes
- User data separation

## 🎯 Browser Compatibility

- ✅ Chrome (latest)
- ✅ Firefox (latest)
- ✅ Safari (latest)
- ✅ Edge (latest)
- ✅ Mobile browsers

## 📈 Scalability

The code is structured to easily support:
- Additional drink categories
- Dessert variations
- User preferences
- Order customizations
- Multiple delivery zones
- Special promotions

## 💬 User Experience

- **Fast & Responsive:** Instant updates without page reloads
- **Intuitive Navigation:** Easy to find what you need
- **Clear Feedback:** Toast notifications for all actions
- **Mobile-First:** Optimized for all screen sizes
- **Accessible:** Semantic HTML and ARIA attributes

## 🎓 Learning Resource

This project demonstrates:
- Single-Page Application (SPA) development
- State management with JavaScript
- Responsive web design
- Browser APIs (localStorage)
- Object-oriented JavaScript
- Event handling
- DOM manipulation
- Form validation
- Authentication patterns

## 📄 License

This project is for educational purposes.

## 🙏 Credits

Built with:
- Bootstrap 5.3
- Bootstrap Icons
- Unsplash Images (for demo)

---

**Ready to order? Start with the admin account or create a customer account!** 🚀
