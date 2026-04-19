/* ===================================
   FOOD EXPRESS - PAGE ROUTER
   SPA Navigation & Page Loaders
   =================================== */

class PageRouter {
  // ROUTE to page
  static route(page = 'home', params = {}) {
    // Hide all pages
    document.querySelectorAll('[data-page]').forEach(el => {
      el.style.display = 'none';
    });

    // Show requested page
    const pageElement = document.querySelector(`[data-page="${page}"]`);
    if (pageElement) {
      pageElement.style.display = 'block';
      
      // Call page loader
      const loaderMethod = `load${page.charAt(0).toUpperCase() + page.slice(1)}Page`;
      if (this[loaderMethod]) {
        this[loaderMethod](params);
      }
    }

    window.scrollTo(0, 0);
  }

  // ========== HOME PAGE ==========
  static loadHomePage() {
    const page = document.querySelector('[data-page="home"]');
    if (!page) return;

    // Load featured items
    const featured = page.querySelector('[data-section="featured"]');
    if (featured) {
      const menuItems = DatabaseHelper.getData(DatabaseHelper.KEYS.MENU_ITEMS) || [];
      const topItems = menuItems.slice(0, 6);

      featured.innerHTML = `
        <h3>Featured Items</h3>
        <div class="row">
          ${topItems.map(item => `
            <div class="col-md-4 mb-4">
              <div class="card h-100">
                <img src="${item.image}" class="card-img-top" alt="${item.name}">
                <div class="card-body">
                  <h5 class="card-title">${item.name}</h5>
                  <p class="card-text">${item.description}</p>
                  <p class="text-warning"><strong>Rs ${item.price}</strong></p>
                  <button onclick="UIManager.addToCart('${item.id}')" class="btn btn-warning w-100">
                    Add to Cart
                  </button>
                </div>
              </div>
            </div>
          `).join('')}
        </div>
      `;
    }
  }

  // ========== MENU PAGE ==========
  static loadMenuPage(search = '', category = '') {
    const page = document.querySelector('[data-page="menu"]');
    if (!page) return;

    const menuItems = DatabaseHelper.getData(DatabaseHelper.KEYS.MENU_ITEMS) || [];
    const categories = DatabaseHelper.getData(DatabaseHelper.KEYS.CATEGORIES) || [];

    // Filter items
    let filtered = menuItems;

    if (category) {
      filtered = filtered.filter(item => item.category === category);
    }

    if (search) {
      const q = search.toLowerCase();
      filtered = filtered.filter(item => 
        item.name.toLowerCase().includes(q) || 
        item.description.toLowerCase().includes(q)
      );
    }

    // Render categories
    const catSection = page.querySelector('[data-section="categories"]');
    if (catSection) {
      catSection.innerHTML = `
        <div class="mb-3">
          <button class="btn btn-outline-warning me-2" onclick="router.loadMenuPage('')">
            All
          </button>
          ${categories.map(cat => `
            <button class="btn btn-outline-warning me-2" onclick="router.loadMenuPage('', '${cat.id}')">
              ${cat.name}
            </button>
          `).join('')}
        </div>
      `;
    }

    // Render items
    const itemsSection = page.querySelector('[data-section="items"]');
    if (itemsSection) {
      itemsSection.innerHTML = `
        <div class="row">
          ${filtered.map(item => `
            <div class="col-md-4 mb-4">
              <div class="card h-100">
                <img src="${item.image}" class="card-img-top" alt="${item.name}" style="height: 200px; object-fit: cover;">
                <div class="card-body">
                  <h5 class="card-title">${item.name}</h5>
                  <p class="card-text text-muted">${item.description}</p>
                  <p class="text-warning"><strong>Rs ${item.price}</strong></p>
                  <div class="d-flex gap-2">
                    <button onclick="UIManager.addToCart('${item.id}')" class="btn btn-warning flex-grow-1">
                      Add to Cart
                    </button>
                  </div>
                </div>
              </div>
            </div>
          `).join('')}
        </div>
        ${filtered.length === 0 ? '<p class="text-center text-muted">No items found</p>' : ''}
      `;
    }
  }

  // ========== LOGIN PAGE ==========
  static loadLoginPage() {
    const page = document.querySelector('[data-page="login"]');
    if (!page) return;

    const user = AuthManager.getCurrentUser();
    if (user) {
      // Already logged in, redirect to profile
      this.route('profile');
      return;
    }

    page.innerHTML = `
      <div class="container mt-5" style="max-width: 400px;">
        <div class="card">
          <div class="card-body">
            <h3 class="card-title text-center mb-4">Login</h3>
            <form id="login-form">
              <div class="mb-3">
                <label for="login-email" class="form-label">Email</label>
                <input type="email" class="form-control" id="login-email" required>
              </div>
              <div class="mb-3">
                <label for="login-password" class="form-label">Password</label>
                <input type="password" class="form-control" id="login-password" required>
              </div>
              <button type="submit" class="btn btn-warning w-100">Login</button>
            </form>
            <hr>
            <p class="text-center">Don't have account? <a href="#" onclick="router.route('register')">Register here</a></p>
            <div class="mt-3 p-3 bg-light rounded">
              <p class="mb-1"><strong>Demo Accounts:</strong></p>
              <p class="mb-0"><small>Admin: admin@foodexpress.com / Admin123!</small></p>
              <p class="mb-0"><small>Customer: john@example.com / Password123!</small></p>
            </div>
          </div>
        </div>
      </div>
    `;
  }

  // ========== REGISTER PAGE ==========
  static loadRegisterPage() {
    const page = document.querySelector('[data-page="register"]');
    if (!page) return;

    const user = AuthManager.getCurrentUser();
    if (user) {
      this.route('profile');
      return;
    }

    page.innerHTML = `
      <div class="container mt-5" style="max-width: 500px;">
        <div class="card">
          <div class="card-body">
            <h3 class="card-title text-center mb-4">Create Account</h3>
            <form id="register-form">
              <div class="mb-3">
                <label for="register-name" class="form-label">Full Name</label>
                <input type="text" class="form-control" id="register-name" required>
              </div>
              <div class="mb-3">
                <label for="register-email" class="form-label">Email</label>
                <input type="email" class="form-control" id="register-email" required>
              </div>
              <div class="mb-3">
                <label for="register-phone" class="form-label">Phone</label>
                <input type="tel" class="form-control" id="register-phone" required>
              </div>
              <div class="mb-3">
                <label for="register-password" class="form-label">Password</label>
                <input type="password" class="form-control" id="register-password" required>
              </div>
              <div class="mb-3">
                <label for="register-confirm-password" class="form-label">Confirm Password</label>
                <input type="password" class="form-control" id="register-confirm-password" required>
              </div>
              <button type="submit" class="btn btn-warning w-100">Register</button>
            </form>
            <hr>
            <p class="text-center">Already have account? <a href="#" onclick="router.route('login')">Login here</a></p>
          </div>
        </div>
      </div>
    `;
  }

  // ========== PROFILE PAGE ==========
  static loadProfilePage() {
    const user = AuthManager.getCurrentUser();
    if (!user) {
      UIManager.showToast('Please login first', 'error');
      this.route('login');
      return;
    }

    const page = document.querySelector('[data-page="profile"]');
    if (!page) return;

    page.innerHTML = `
      <div class="container mt-5" style="max-width: 600px;">
        <div class="card">
          <div class="card-header bg-dark text-warning">
            <h4>My Profile</h4>
          </div>
          <div class="card-body">
            <form id="profile-form">
              <div class="mb-3">
                <label for="profile-email" class="form-label">Email</label>
                <input type="email" class="form-control" value="${user.email}" disabled>
              </div>
              <div class="mb-3">
                <label for="profile-name" class="form-label">Full Name</label>
                <input type="text" class="form-control" id="profile-name" value="${user.name}" required>
              </div>
              <div class="mb-3">
                <label for="profile-phone" class="form-label">Phone</label>
                <input type="tel" class="form-control" id="profile-phone" value="${user.phone}" required>
              </div>
              <div class="mb-3">
                <label for="profile-address" class="form-label">Address</label>
                <textarea class="form-control" id="profile-address" rows="3" required>${user.address}</textarea>
              </div>
              <button type="submit" class="btn btn-warning">Save Profile</button>
            </form>
          </div>
        </div>
      </div>
    `;
  }

  // ========== CART PAGE ==========
  static loadCartPage() {
    const user = AuthManager.getCurrentUser();
    if (!user) {
      UIManager.showToast('Please login first', 'error');
      this.route('login');
      return;
    }

    const page = document.querySelector('[data-page="cart"]');
    if (!page) return;

    const cart = CartManager.getCart();
    const totals = CartManager.getCartTotals();

    page.innerHTML = `
      <div class="container mt-5">
        <h2>Shopping Cart</h2>
        ${cart.length === 0 ? `
          <div class="alert alert-info">Your cart is empty. <a href="#" onclick="router.route('menu')">Continue shopping</a></div>
        ` : `
          <div class="row">
            <div class="col-md-8">
              <div class="table-responsive">
                <table class="table">
                  <thead>
                    <tr>
                      <th>Item</th>
                      <th>Price</th>
                      <th>Quantity</th>
                      <th>Total</th>
                      <th></th>
                    </tr>
                  </thead>
                  <tbody>
                    ${cart.map(item => `
                      <tr>
                        <td>
                          <div class="d-flex align-items-center">
                            <img src="${item.image}" alt="${item.name}" style="width: 50px; height: 50px; object-fit: cover; margin-right: 10px;">
                            ${item.name}
                          </div>
                        </td>
                        <td>Rs ${item.price}</td>
                        <td>
                          <input type="number" min="1" value="${item.quantity}" onchange="CartManager.updateQuantity('${item.id}', this.value); router.loadCartPage();" style="width: 60px;">
                        </td>
                        <td>Rs ${item.price * item.quantity}</td>
                        <td>
                          <button onclick="CartManager.removeItem('${item.id}'); router.loadCartPage();" class="btn btn-sm btn-danger">Remove</button>
                        </td>
                      </tr>
                    `).join('')}
                  </tbody>
                </table>
              </div>
            </div>
            <div class="col-md-4">
              <div class="card">
                <div class="card-body">
                  <h5 class="card-title">Order Summary</h5>
                  <hr>
                  <div class="d-flex justify-content-between mb-2">
                    <span>Subtotal:</span>
                    <span>Rs ${totals.subtotal}</span>
                  </div>
                  <div class="d-flex justify-content-between mb-2">
                    <span>Tax (10%):</span>
                    <span>Rs ${totals.tax}</span>
                  </div>
                  <div class="d-flex justify-content-between mb-3">
                    <span>Delivery:</span>
                    <span>Rs ${totals.deliveryFee}</span>
                  </div>
                  <hr>
                  <div class="d-flex justify-content-between mb-3">
                    <strong>Total:</strong>
                    <strong class="text-warning">Rs ${totals.total}</strong>
                  </div>
                  <button onclick="router.route('checkout')" class="btn btn-warning w-100">Proceed to Checkout</button>
                </div>
              </div>
            </div>
          </div>
        `}
      </div>
    `;
  }

  // ========== CHECKOUT PAGE ==========
  static loadCheckoutPage() {
    const user = AuthManager.getCurrentUser();
    if (!user) {
      UIManager.showToast('Please login first', 'error');
      this.route('login');
      return;
    }

    const cart = CartManager.getCart();
    if (cart.length === 0) {
      UIManager.showToast('Cart is empty', 'error');
      this.route('cart');
      return;
    }

    const page = document.querySelector('[data-page="checkout"]');
    if (!page) return;

    const totals = CartManager.getCartTotals();

    page.innerHTML = `
      <div class="container mt-5" style="max-width: 800px;">
        <h2>Checkout</h2>
        <div class="row">
          <div class="col-md-6">
            <div class="card mb-4">
              <div class="card-header">Delivery Details</div>
              <div class="card-body">
                <form id="checkout-form">
                  <div class="mb-3">
                    <label for="checkout-address" class="form-label">Delivery Address</label>
                    <textarea class="form-control" id="checkout-address" rows="3" required>${user.address}</textarea>
                  </div>
                  <div class="mb-3">
                    <label for="checkout-phone" class="form-label">Phone</label>
                    <input type="tel" class="form-control" id="checkout-phone" value="${user.phone}" required>
                  </div>
                  <div class="mb-3">
                    <label for="checkout-payment" class="form-label">Payment Method</label>
                    <select class="form-control" id="checkout-payment" required>
                      <option value="">Select payment method</option>
                      <option value="cash">Cash on Delivery</option>
                      <option value="card">Credit/Debit Card</option>
                      <option value="bank">Bank Transfer</option>
                    </select>
                  </div>
                  <button type="button" onclick="UIManager.handleCheckout()" class="btn btn-warning w-100">Place Order</button>
                </form>
              </div>
            </div>
          </div>
          <div class="col-md-6">
            <div class="card">
              <div class="card-header">Order Summary</div>
              <div class="card-body">
                ${cart.map(item => `
                  <div class="d-flex justify-content-between mb-2">
                    <span>${item.name} x${item.quantity}</span>
                    <span>Rs ${item.price * item.quantity}</span>
                  </div>
                `).join('')}
                <hr>
                <div class="d-flex justify-content-between mb-2">
                  <span>Subtotal:</span>
                  <span>Rs ${totals.subtotal}</span>
                </div>
                <div class="d-flex justify-content-between mb-2">
                  <span>Tax:</span>
                  <span>Rs ${totals.tax}</span>
                </div>
                <div class="d-flex justify-content-between mb-3">
                  <span>Delivery:</span>
                  <span>Rs ${totals.deliveryFee}</span>
                </div>
                <hr>
                <div class="d-flex justify-content-between">
                  <strong>Total Amount:</strong>
                  <strong class="text-warning">Rs ${totals.total}</strong>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    `;
  }

  // ========== ORDERS PAGE ==========
  static loadOrdersPage() {
    const user = AuthManager.getCurrentUser();
    if (!user) {
      UIManager.showToast('Please login first', 'error');
      this.route('login');
      return;
    }

    const page = document.querySelector('[data-page="orders"]');
    if (!page) return;

    const orders = OrdersManager.getUserOrders();

    page.innerHTML = `
      <div class="container mt-5">
        <h2>My Orders</h2>
        ${orders.length === 0 ? `
          <div class="alert alert-info">No orders yet. <a href="#" onclick="router.route('menu')">Start ordering</a></div>
        ` : `
          <div class="row">
            ${orders.map(order => `
              <div class="col-md-6 mb-4">
                <div class="card">
                  <div class="card-header bg-dark text-warning d-flex justify-content-between">
                    <span>Order #${order.id.substr(0, 8)}</span>
                    <span class="badge bg-${order.status === 'Delivered' ? 'success' : order.status === 'Pending' ? 'warning' : 'info'}">${order.status}</span>
                  </div>
                  <div class="card-body">
                    <p><small class="text-muted">${new Date(order.createdAt).toLocaleDateString()}</small></p>
                    <p><strong>Items:</strong> ${order.items.length}</p>
                    <p><strong>Total:</strong> <span class="text-warning">Rs ${order.total}</span></p>
                    <p><strong>Delivery:</strong> ${order.deliveryAddress}</p>
                    <button onclick="router.loadOrderDetailsPage('${order.id}')" class="btn btn-sm btn-warning">View Details</button>
                  </div>
                </div>
              </div>
            `).join('')}
          </div>
        `}
      </div>
    `;
  }

  // ========== RESERVATIONS PAGE ==========
  static loadReservationsPage() {
    const user = AuthManager.getCurrentUser();
    if (!user) {
      UIManager.showToast('Please login first', 'error');
      this.route('login');
      return;
    }

    const page = document.querySelector('[data-page="reservations"]');
    if (!page) return;

    const reservations = ReservationManager.getUserReservations();

    page.innerHTML = `
      <div class="container mt-5">
        <h2>My Reservations</h2>
        <button onclick="router.loadNewReservationPage()" class="btn btn-warning mb-4">New Reservation</button>
        
        ${reservations.length === 0 ? `
          <div class="alert alert-info">No reservations yet.</div>
        ` : `
          <div class="row">
            ${reservations.map(res => `
              <div class="col-md-6 mb-4">
                <div class="card">
                  <div class="card-header bg-dark text-warning d-flex justify-content-between">
                    <span>Reservation for ${res.guests} guests</span>
                    <span class="badge bg-success">${res.status}</span>
                  </div>
                  <div class="card-body">
                    <p><strong>Date:</strong> ${res.date}</p>
                    <p><strong>Time:</strong> ${res.time}</p>
                    <p><strong>Guests:</strong> ${res.guests}</p>
                    <p><strong>Special Requests:</strong> ${res.notes || 'None'}</p>
                    <button onclick="ReservationManager.cancelReservation('${res.id}'); router.loadReservationsPage();" class="btn btn-sm btn-danger">Cancel</button>
                  </div>
                </div>
              </div>
            `).join('')}
          </div>
        `}
      </div>
    `;
  }

  // ========== NEW RESERVATION PAGE ==========
  static loadNewReservationPage() {
    const user = AuthManager.getCurrentUser();
    if (!user) return;

    const page = document.querySelector('[data-page="reservations"]');
    if (!page) return;

    page.innerHTML = `
      <div class="container mt-5" style="max-width: 600px;">
        <div class="card">
          <div class="card-header bg-dark text-warning">
            <h4>New Reservation</h4>
          </div>
          <div class="card-body">
            <form id="reservation-form">
              <div class="mb-3">
                <label for="res-date" class="form-label">Date</label>
                <input type="date" class="form-control" id="res-date" required>
              </div>
              <div class="mb-3">
                <label for="res-time" class="form-label">Time</label>
                <input type="time" class="form-control" id="res-time" required>
              </div>
              <div class="mb-3">
                <label for="res-guests" class="form-label">Number of Guests</label>
                <input type="number" class="form-control" id="res-guests" min="1" max="20" required>
              </div>
              <div class="mb-3">
                <label for="res-notes" class="form-label">Special Requests</label>
                <textarea class="form-control" id="res-notes" rows="3"></textarea>
              </div>
              <button type="button" onclick="
                const date = document.getElementById('res-date').value;
                const time = document.getElementById('res-time').value;
                const guests = document.getElementById('res-guests').value;
                const notes = document.getElementById('res-notes').value;
                const user = AuthManager.getCurrentUser();
                if (!date || !time || !guests) {
                  UIManager.showToast('Please fill all fields', 'error');
                  return;
                }
                const result = ReservationManager.createReservation(date, time, guests, user.name, user.phone, user.email, notes);
                if (result.success) {
                  UIManager.showToast('Reservation created!', 'success');
                  setTimeout(() => router.loadReservationsPage(), 1000);
                } else {
                  UIManager.showToast(result.error, 'error');
                }
              " class="btn btn-warning w-100">Create Reservation</button>
            </form>
          </div>
        </div>
      </div>
    `;
  }
}
