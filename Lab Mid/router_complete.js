/* ========================================
   FOOD EXPRESS - PAGE ROUTER & COMPLETE LOGIC
   ======================================== */

class PageRouter {
  constructor() {
    this.currentPage = 'home';
    this.setup();
  }

  setup() {
    window.addEventListener('popstate', () => this.route());
    window.addEventListener('load', () => this.route());
  }

  route() {
    // Check if admin route needs protection
    const params = new URLSearchParams(window.location.search);
    const page = params.get('page') || 'home';

    if (page === 'admin' && !auth.isAdmin()) {
      window.location.href = '?page=home';
      return;
    }

    // Hide all pages
    document.querySelectorAll('.page-content').forEach(p => p.style.display = 'none');

    // Show requested page
    const pageElement = document.getElementById(`${page}-page`);
    if (pageElement) {
      pageElement.style.display = 'block';
      this.currentPage = page;

      // Call page handler
      const methodName = `load${this.capitalize(page)}Page`;
      const handler = this[methodName];
      if (typeof handler === 'function') {
        handler.call(this);
      }

      // Update UI state
      ui.updateNavigation();
    } else {
      document.getElementById('notfound-page').style.display = 'block';
    }

    window.scrollTo(0, 0);
  }

  capitalize(str) {
    return str.replace(/-(.)/g, (_, c) => c.toUpperCase()).replace(/^./, str[0].toUpperCase());
  }

  // ========== HOME PAGE ==========
  loadhomePage() {
    this.loadFeaturedItems();
    this.loadHomeCategories();
  }

  loadFeaturedItems() {
    const container = document.getElementById('featured-items');
    if (!container) return;

    const items = storage.getMenuItems().sort(() => Math.random() - 0.5).slice(0, 4);

    container.innerHTML = items.map(item => `
      <div class="col-sm-6 col-lg-3 mb-4">
        <div class="card food-card">
          <div class="food-card-image">
            <img src="${item.image}" alt="${item.name}" onerror="this.src='https://via.placeholder.com/300x200?text=${encodeURIComponent(item.name)}'">
            <div class="food-card-overlay">
              <span class="badge ${item.available ? 'bg-success' : 'bg-danger'} mb-2">
                ${item.available ? 'Available' : 'Out of Stock'}
              </span>
            </div>
          </div>
          <div class="card-body">
            <span class="badge bg-primary mb-2">${storage.getCategoryById(item.category)?.name || ''}</span>
            <h6 class="card-title">${item.name}</h6>
            <p class="card-text text-muted small">${item.description.substring(0, 60)}...</p>
            <div class="d-flex justify-content-between align-items-center">
              <h6 class="mb-0 text-primary">${ui.formatCurrency(item.price)}</h6>
              <button class="btn btn-sm btn-primary" onclick="addItemToCart('${item.id}')">
                <i class="bi bi-plus-circle"></i>
              </button>
            </div>
          </div>
        </div>
      </div>
    `).join('');
  }

  loadHomeCategories() {
    const container = document.getElementById('home-categories');
    if (!container) return;

    const categories = storage.getCategories();

    container.innerHTML = categories.map(cat => `
      <div class="col-6 col-md-4 col-lg-2-4 mb-4">
        <a href="?page=menu&category=${cat.id}" class="card text-center category-card text-decoration-none">
          <div class="card-body">
            <h1 class="text-primary mb-2"><i class="bi bi-tags-fill"></i></h1>
            <h6>${cat.name}</h6>
            <small class="text-muted">Browse</small>
          </div>
        </a>
      </div>
    `).join('');
  }

  // ========== MENU PAGE ==========
  loadmenuPage() {
    const params = new URLSearchParams(window.location.search);
    const selectedCategory = params.get('category') || 'all';

    // Load category filter
    const categoryButtons = document.getElementById('category-buttons');
    if (categoryButtons) {
      const categories = storage.getCategories();
      categoryButtons.innerHTML = categories.map(cat => `
        <a href="?page=menu&category=${cat.id}" class="btn btn-outline-primary me-2 category-btn ${selectedCategory === cat.id ? 'active' : ''}">
          ${cat.name}
        </a>
      `).join('');
    }

    // Load menu items
    this.loadMenuItems(selectedCategory);

    // Setup search
    ui.setupSearch((query) => {
      const results = query ? storage.searchMenuItems(query) : storage.getMenuItemsByCategory(selectedCategory);
      this.renderMenuItems(results);
    });
  }

  loadMenuItems(categoryId) {
    const items = storage.getMenuItemsByCategory(categoryId);
    this.renderMenuItems(items);
  }

  renderMenuItems(items) {
    const container = document.getElementById('menu-items');
    if (!container) return;

    if (items.length === 0) {
      container.innerHTML = `
        <div class="col-12 text-center py-5">
          <div class="empty-state">
            <i class="bi bi-inbox" style="font-size: 3rem; color: var(--text-secondary);"></i>
            <h3 class="mt-3">No items found</h3>
            <p class="text-muted">Try searching or selecting a different category</p>
          </div>
        </div>
      `;
      return;
    }

    container.innerHTML = items.map(item => `
      <div class="col-sm-6 col-lg-4 col-xl-3 mb-4">
        <div class="card food-card h-100">
          <div class="food-card-image">
            <img src="${item.image}" alt="${item.name}" onerror="this.src='https://via.placeholder.com/300x200?text=${encodeURIComponent(item.name)}'">
            <span class="badge ${item.available ? 'bg-success' : 'bg-danger'} position-absolute p-2">
              ${item.available ? 'Available' : 'Out of Stock'}
            </span>
          </div>
          <div class="card-body d-flex flex-column">
            <div class="mb-auto">
              <span class="badge bg-primary mb-2">${storage.getCategoryById(item.category)?.name || ''}</span>
              <h6 class="card-title">${item.name}</h6>
              <p class="card-text text-muted small">${item.description}</p>
              <div class="rating mb-2">
                <i class="bi bi-star-fill text-warning"></i>
                <small class="text-muted">${item.rating || 4.5}</small>
              </div>
            </div>
            <div class="d-flex justify-content-between align-items-center mt-3 pt-3 border-top">
              <h6 class="mb-0 text-primary fw-bold">${ui.formatCurrency(item.price)}</h6>
              <button class="btn btn-sm btn-primary ${!item.available ? 'disabled' : ''}" 
                      onclick="addItemToCart('${item.id}')"
                      ${!item.available ? 'disabled' : ''}>
                <i class="bi bi-cart-plus"></i>
              </button>
            </div>
          </div>
        </div>
      </div>
    `).join('');
  }

  // ========== LOGIN PAGE ==========
  loadloginPage() {
    if (auth.isLoggedIn()) {
      window.location.href = '?page=home';
      return;
    }
    // Form listener already set up in UI Manager
  }

  // ========== REGISTER PAGE ==========
  loadregisterPage() {
    if (auth.isLoggedIn()) {
      window.location.href = '?page=home';
      return;
    }
    // Form listener already set up in UI Manager
  }

  // ========== PROFILE PAGE ==========
  loadprofilePage() {
    if (!auth.isLoggedIn()) {
      window.location.href = '?page=login';
      return;
    }

    const user = auth.getCurrentUser();
    const container = document.getElementById('profile-content');

    if (!container) return;

    container.innerHTML = `
      <div class="row">
        <div class="col-md-6 mb-4">
          <h5>Profile Information</h5>
          <div class="profile-info">
            <div class="info-row">
              <label>Full Name:</label>
              <span>${user.fullName}</span>
            </div>
            <div class="info-row">
              <label>Email:</label>
              <span>${user.email}</span>
            </div>
            <div class="info-row">
              <label>Phone:</label>
              <span>${user.phone}</span>
            </div>
            <div class="info-row">
              <label>Address:</label>
              <span>${user.address || 'Not provided'}</span>
            </div>
            <div class="info-row">
              <label>Role:</label>
              <span><span class="badge bg-info">${user.role.toUpperCase()}</span></span>
            </div>
            <div class="info-row">
              <label>Member Since:</label>
              <span>${ui.formatDate(user.createdAt)}</span>
            </div>
          </div>
        </div>

        <div class="col-md-6">
          <h5>Edit Profile</h5>
          <form id="edit-profile-form">
            <div class="mb-3">
              <label class="form-label">Full Name</label>
              <input type="text" class="form-control" name="fullName" value="${user.fullName}" required>
            </div>
            <div class="mb-3">
              <label class="form-label">Phone</label>
              <input type="tel" class="form-control" name="phone" value="${user.phone}" required>
            </div>
            <div class="mb-3">
              <label class="form-label">Address</label>
              <textarea class="form-control" name="address" rows="3">${user.address || ''}</textarea>
            </div>
            <button type="submit" class="btn btn-primary">Save Changes</button>
          </form>
        </div>
      </div>

      <hr class="my-4">

      <div class="row">
        <div class="col-md-6">
          <h5>Account Statistics</h5>
          <div class="row">
            <div class="col-6 mb-3">
              <div class="card bg-primary bg-opacity-10">
                <div class="card-body text-center">
                  <h3 class="text-primary">${orders.getUserOrders(user.id).length}</h3>
                  <small class="text-muted">Total Orders</small>
                </div>
              </div>
            </div>
            <div class="col-6 mb-3">
              <div class="card bg-success bg-opacity-10">
                <div class="card-body text-center">
                  <h3 class="text-success">${reservations.getUserReservations(user.id).length}</h3>
                  <small class="text-muted">Reservations</small>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    `;

    // Setup edit profile form
    const editForm = document.getElementById('edit-profile-form');
    if (editForm) {
      editForm.addEventListener('submit', (e) => this.handleEditProfile(e, user.id));
    }
  }

  handleEditProfile(e, userId) {
    e.preventDefault();
    const form = e.target;
    const updates = {
      fullName: form.fullName.value,
      phone: form.phone.value,
      address: form.address.value
    };

    const result = auth.updateProfile(userId, updates);
    if (result.success) {
      ui.showToast('Profile updated successfully!', 'success');
      ui.updateUserNavigation();
      setTimeout(() => this.loadprofilePage(), 500);
    } else {
      ui.showToast(result.error, 'danger');
    }
  }

  // ========== CART PAGE ==========
  loadcartPage() {
    if (!auth.isLoggedIn()) {
      window.location.href = '?page=login';
      return;
    }

    const cartItems = cart.getCart();
    const cartContainer = document.getElementById('cart-items');

    if (!cartContainer) return;

    if (cartItems.length === 0) {
      cartContainer.innerHTML = `
        <div class="card">
          <div class="card-body text-center py-5">
            <i class="bi bi-cart-x" style="font-size: 3rem; color: var(--text-secondary);"></i>
            <h3 class="mt-3">Your cart is empty</h3>
            <p class="text-muted mb-3">Start adding delicious items from our menu!</p>
            <a href="?page=menu" class="btn btn-primary">Continue Shopping</a>
          </div>
        </div>
      `;
    } else {
      cartContainer.innerHTML = `
        <div class="card-body">
          <table class="table">
            <thead>
              <tr>
                <th>Item</th>
                <th>Price</th>
                <th>Quantity</th>
                <th>Subtotal</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              ${cartItems.map(item => `
                <tr>
                  <td>
                    <div class="d-flex align-items-center">
                      <img src="${item.image}" alt="${item.name}" style="width: 50px; height: 50px; object-fit: cover; border-radius: 4px; margin-right: 10px;" onerror="this.src='https://via.placeholder.com/50?text=${encodeURIComponent(item.name)}'">
                      <div>
                        <h6 class="mb-0">${item.name}</h6>
                        <small class="text-muted">${storage.getCategoryById(item.category)?.name || ''}</small>
                      </div>
                    </div>
                  </td>
                  <td>${ui.formatCurrency(item.price)}</td>
                  <td>
                    <div class="input-group" style="width: 100px;">
                      <button class="btn btn-sm btn-outline-secondary" onclick="updateCartQuantity('${item.cartItemId}', ${item.quantity - 1})">-</button>
                      <input type="text" class="form-control text-center" value="${item.quantity}" readonly style="padding: 0.25rem;">
                      <button class="btn btn-sm btn-outline-secondary" onclick="updateCartQuantity('${item.cartItemId}', ${item.quantity + 1})">+</button>
                    </div>
                  </td>
                  <td>${ui.formatCurrency(item.price * item.quantity)}</td>
                  <td>
                    <button class="btn btn-sm btn-danger" onclick="removeFromCart('${item.cartItemId}')">
                      <i class="bi bi-trash"></i>
                    </button>
                  </td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      `;
    }

    // Update summary
    const totals = cart.getCartTotals();
    document.getElementById('cart-subtotal').textContent = ui.formatCurrency(totals.subtotal);
    document.getElementById('cart-total').textContent = ui.formatCurrency(totals.total);

    // Setup checkout button
    const checkoutBtn = document.getElementById('checkout-btn');
    if (checkoutBtn) {
      checkoutBtn.addEventListener('click', () => {
        if (cart.isEmpty()) {
          ui.showToast('Cart is empty', 'warning');
          return;
        }
        window.location.href = '?page=checkout';
      });
    }
  }

  // ========== CHECKOUT PAGE ==========
  loadcheckoutPage() {
    if (!auth.isLoggedIn()) {
      window.location.href = '?page=login';
      return;
    }

    if (cart.isEmpty()) {
      window.location.href = '?page=cart';
      return;
    }

    const user = auth.getCurrentUser();
    const checkoutForm = document.getElementById('checkout-form');

    // Populate delivery address from profile
    const addressField = checkoutForm?.querySelector('[name="deliveryAddress"]');
    if (addressField) {
      addressField.value = user.address || '';
    }

    // Update cart items display
    const checkoutItemsContainer = document.getElementById('checkout-items');
    if (checkoutItemsContainer) {
      const cartItems = cart.getCart();
      checkoutItemsContainer.innerHTML = cartItems.map(item => `
        <tr>
          <td>${item.name}</td>
          <td>${ui.formatCurrency(item.price)}</td>
          <td>${item.quantity}</td>
          <td>${ui.formatCurrency(item.price * item.quantity)}</td>
        </tr>
      `).join('');
    }

    // Update totals
    const totals = cart.getCartTotals();
    document.getElementById('checkout-subtotal').textContent = ui.formatCurrency(totals.subtotal);
    document.getElementById('checkout-total').textContent = ui.formatCurrency(totals.total);

    // Setup form submission
    if (checkoutForm) {
      checkoutForm.addEventListener('submit', (e) => this.handleCheckout(e));
    }
  }

  handleCheckout(e) {
    e.preventDefault();
    const form = e.target;

    const orderData = {
      userId: auth.getCurrentUser().id,
      items: cart.getCart(),
      deliveryAddress: form.deliveryAddress.value,
      notes: form.notes.value,
      ...cart.getCartTotals()
    };

    const order = orders.createOrder(orderData);
    cart.clearCart();
    ui.updateCartBadge();
    ui.showToast('Order placed successfully!', 'success');

    // Store confirmation data and redirect
    sessionStorage.setItem('lastOrder', JSON.stringify(order));
    setTimeout(() => {
      window.location.href = '?page=order-confirmation';
    }, 500);
  }

  // ========== ORDER CONFIRMATION PAGE ==========
  loadorderConfirmationPage() {
    const lastOrder = sessionStorage.getItem('lastOrder');

    if (!lastOrder) {
      window.location.href = '?page=orders';
      return;
    }

    const order = JSON.parse(lastOrder);
    const confirmationMsg = document.getElementById('confirmation-message');
    const deliveryInfo = document.getElementById('delivery-info');

    if (confirmationMsg) {
      confirmationMsg.innerHTML = `
        Your order <strong>#${order.orderNumber}</strong> has been placed successfully!<br>
        We'll start preparing your delicious food right away.
      `;
    }

    if (deliveryInfo) {
      const deliveryTime = new Date(new Date(order.createdAt).getTime() + 45 * 60000);
      deliveryInfo.innerHTML = `
        <strong>Order Details:</strong><br>
        Order Number: <strong>${order.orderNumber}</strong><br>
        Order Total: <strong>${ui.formatCurrency(order.total)}</strong><br>
        Estimated Delivery: <strong>${ui.formatTime(deliveryTime.toTimeString().substring(0, 5))}</strong><br>
        <small class="text-muted">You can track your order in the Orders section</small>
      `;
    }

    sessionStorage.removeItem('lastOrder');
  }

  // ========== ORDERS PAGE ==========
  loadordersPage() {
    if (!auth.isLoggedIn()) {
      window.location.href = '?page=login';
      return;
    }

    const user = auth.getCurrentUser();
    const userOrders = orders.getUserOrders(user.id);
    const ordersList = document.getElementById('orders-list');

    if (!ordersList) return;

    if (userOrders.length === 0) {
      ordersList.innerHTML = `
        <div class="card">
          <div class="card-body text-center py-5">
            <i class="bi bi-bag" style="font-size: 3rem; color: var(--text-secondary);"></i>
            <h3 class="mt-3">No orders yet</h3>
            <p class="text-muted mb-3">Start ordering from our delicious menu!</p>
            <a href="?page=menu" class="btn btn-primary">View Menu</a>
          </div>
        </div>
      `;
      return;
    }

    ordersList.innerHTML = userOrders.map(order => `
      <div class="card mb-3">
        <div class="card-body">
          <div class="row align-items-center">
            <div class="col-md-3">
              <h6 class="mb-1">Order #${order.orderNumber}</h6>
              <small class="text-muted">${ui.formatDateTime(order.createdAt)}</small>
            </div>
            <div class="col-md-3">
              <h6 class="mb-1">${ui.formatCurrency(order.total)}</h6>
              <small class="text-muted">${order.items.length} items</small>
            </div>
            <div class="col-md-3">
              <span class="badge bg-${this.getStatusBadgeColor(order.status)}">${order.status}</span>
            </div>
            <div class="col-md-3 text-md-end">
              <a href="?page=order-details&id=${order.id}" class="btn btn-sm btn-outline-primary">View Details</a>
            </div>
          </div>
        </div>
      </div>
    `).join('');
  }

  getStatusBadgeColor(status) {
    const colors = {
      'Pending': 'warning',
      'Preparing': 'info',
      'Out for Delivery': 'primary',
      'Delivered': 'success',
      'Cancelled': 'danger'
    };
    return colors[status] || 'secondary';
  }

  // ========== ORDER DETAILS PAGE ==========
  loadorderDetailsPage() {
    if (!auth.isLoggedIn()) {
      window.location.href = '?page=login';
      return;
    }

    const params = new URLSearchParams(window.location.search);
    const orderId = params.get('id');

    if (!orderId) {
      window.location.href = '?page=orders';
      return;
    }

    const order = orders.getOrderById(orderId);
    if (!order) {
      ui.showToast('Order not found', 'danger');
      window.location.href = '?page=orders';
      return;
    }

    const detailContainer = document.getElementById('order-detail-content');
    const trackingContainer = document.getElementById('order-tracking-sidebar');

    if (detailContainer) {
      detailContainer.innerHTML = `
        <div class="card-header">
          <h5 class="mb-0">Order #${order.orderNumber}</h5>
        </div>
        <div class="card-body">
          <div class="row mb-4">
            <div class="col-md-6">
              <h6 class="mb-3">Order Items</h6>
              <div class="order-items">
                ${order.items.map(item => `
                  <div class="d-flex justify-content-between mb-2 pb-2 border-bottom">
                    <div>
                      <h6 class="mb-1">${item.name}</h6>
                      <small class="text-muted">Qty: ${item.quantity}</small>
                    </div>
                    <div class="text-end">
                      <h6 class="mb-0">${ui.formatCurrency(item.price * item.quantity)}</h6>
                      <small class="text-muted">${ui.formatCurrency(item.price)} each</small>
                    </div>
                  </div>
                `).join('')}
              </div>
            </div>

            <div class="col-md-6">
              <h6 class="mb-3">Delivery Details</h6>
              <div class="mb-3">
                <strong class="d-block mb-1">Address</strong>
                <p class="text-muted">${order.deliveryAddress}</p>
              </div>
              ${order.notes ? `
                <div>
                  <strong class="d-block mb-1">Special Notes</strong>
                  <p class="text-muted">${order.notes}</p>
                </div>
              ` : ''}
            </div>
          </div>

          <div class="row">
            <div class="col-md-6">
              <h6>Order Summary</h6>
              <div class="d-flex justify-content-between mb-2">
                <span>Subtotal:</span>
                <strong>${ui.formatCurrency(order.subtotal)}</strong>
              </div>
              <div class="d-flex justify-content-between mb-2">
                <span>Delivery Fee:</span>
                <strong>${ui.formatCurrency(order.deliveryFee)}</strong>
              </div>
              <div class="d-flex justify-content-between pt-2 border-top">
                <strong>Total:</strong>
                <strong class="text-primary">${ui.formatCurrency(order.total)}</strong>
              </div>
            </div>

            <div class="col-md-6">
              <h6>Order Info</h6>
              <div class="mb-2">
                <strong>Order Date:</strong>
                <p>${ui.formatDateTime(order.createdAt)}</p>
              </div>
              <div>
                <strong>Status:</strong>
                <p><span class="badge bg-${this.getStatusBadgeColor(order.status)}">${order.status}</span></p>
              </div>
            </div>
          </div>
        </div>
      `;
    }

    if (trackingContainer) {
      const statuses = ['Pending', 'Preparing', 'Out for Delivery', 'Delivered'];
      const currentIndex = statuses.indexOf(order.status);

      trackingContainer.innerHTML = `
        <div class="card">
          <div class="card-header">
            <h6 class="mb-0">Order Status</h6>
          </div>
          <div class="card-body">
            <div class="order-timeline">
              ${statuses.map((status, index) => `
                <div class="timeline-item ${index <= currentIndex ? 'completed' : ''}">
                  <div class="timeline-marker">
                    <i class="bi ${index <= currentIndex ? 'bi-check-circle-fill' : 'bi-circle'}"></i>
                  </div>
                  <div class="timeline-content">
                    <h6>${status}</h6>
                  </div>
                </div>
              `).join('')}
            </div>
          </div>
        </div>
      `;
    }
  }

  // ========== RESERVATIONS PAGE ==========
  loadreservationsPage() {
    if (!auth.isLoggedIn()) {
      window.location.href = '?page=login';
      return;
    }

    const user = auth.getCurrentUser();
    const resForm = document.getElementById('reservation-form');

    if (resForm) {
      // Set minimum date to today
      const today = new Date().toISOString().split('T')[0];
      resForm.querySelector('[name="reservationDate"]').min = today;

      resForm.addEventListener('submit', (e) => this.handleReservation(e, user.id));
    }

    // Load user reservations
    this.loadUserReservations(user.id);
  }

  handleReservation(e, userId) {
    e.preventDefault();
    const form = e.target;

    // Validation
    const reservationDate = new Date(form.reservationDate.value);
    if (reservationDate < new Date()) {
      ui.showToast('Please select a future date', 'warning');
      return;
    }

    const resData = {
      userId: userId,
      numberOfPeople: parseInt(form.numberOfPeople.value),
      reservationDate: form.reservationDate.value,
      reservationTime: form.reservationTime.value,
      specialRequests: form.specialRequests.value
    };

    const reservation = reservations.createReservation(resData);
    ui.showToast('Reservation confirmed!', 'success');
    form.reset();
    this.loadUserReservations(userId);
  }

  loadUserReservations(userId) {
    const container = document.getElementById('my-reservations');
    if (!container) return;

    const userReservations = reservations.getUserReservations(userId);

    if (userReservations.length === 0) {
      container.innerHTML = `
        <p class="text-muted text-center py-4">No reservations yet. Book a table above!</p>
      `;
      return;
    }

    container.innerHTML = userReservations.map(res => `
      <div class="reservation-card mb-3">
        <div class="d-flex justify-content-between align-items-center">
          <div>
            <h6 class="mb-1">Reservation #${res.reservationNumber}</h6>
            <small class="text-muted">
              ${ui.formatDate(res.reservationDate)} at ${ui.formatTime(res.reservationTime)} for ${res.numberOfPeople} people
            </small>
          </div>
          <div>
            <span class="badge bg-success">${res.status}</span>
          </div>
        </div>
        ${res.specialRequests ? `<small class="text-muted d-block mt-2">Notes: ${res.specialRequests}</small>` : ''}
      </div>
    `).join('');
  }

  // ========== ADMIN PAGE ==========
  loadadminPage() {
    if (!auth.isAdmin()) {
      window.location.href = '?page=home';
      return;
    }

    this.loadAdminStats();
    this.loadAdminDashboard();

    // Setup admin nav buttons
    const navBtns = document.querySelectorAll('.admin-nav-btn');
    navBtns.forEach(btn => {
      btn.addEventListener('click', (e) => this.loadAdminSection(e.target.dataset.section));
    });
  }

  loadAdminStats() {
    const statsContainer = document.getElementById('admin-stats');
    if (!statsContainer) return;

    const stats = {
      users: storage.getUsers().filter(u => u.role === 'customer').length,
      categories: storage.getCategories().length,
      items: storage.getMenuItems().length,
      orders: orders.getAllOrders().length,
      reservations: reservations.getAllReservations().length
    };

    statsContainer.innerHTML = `
      <div class="col-md-6 col-lg-2-4 mb-4">
        <div class="card stat-card">
          <div class="card-body">
            <h3 class="text-primary">${stats.users}</h3>
            <p class="text-muted">Customers</p>
          </div>
        </div>
      </div>
      <div class="col-md-6 col-lg-2-4 mb-4">
        <div class="card stat-card">
          <div class="card-body">
            <h3 class="text-info">${stats.categories}</h3>
            <p class="text-muted">Categories</p>
          </div>
        </div>
      </div>
      <div class="col-md-6 col-lg-2-4 mb-4">
        <div class="card stat-card">
          <div class="card-body">
            <h3 class="text-warning">${stats.items}</h3>
            <p class="text-muted">Menu Items</p>
          </div>
        </div>
      </div>
      <div class="col-md-6 col-lg-2-4 mb-4">
        <div class="card stat-card">
          <div class="card-body">
            <h3 class="text-success">${stats.orders}</h3>
            <p class="text-muted">Orders</p>
          </div>
        </div>
      </div>
      <div class="col-md-6 col-lg-2-4 mb-4">
        <div class="card stat-card">
          <div class="card-body">
            <h3 class="text-danger">${stats.reservations}</h3>
            <p class="text-muted">Reservations</p>
          </div>
        </div>
      </div>
    `;
  }

  loadAdminDashboard() {
    const firstBtn = document.querySelector('.admin-nav-btn');
    if (firstBtn) {
      firstBtn.click();
    }
  }

  loadAdminSection(section) {
    const contentArea = document.getElementById('admin-content');
    if (!contentArea) return;

    // Update active button
    document.querySelectorAll('.admin-nav-btn').forEach(btn => {
      btn.classList.remove('active');
      if (btn.dataset.section === section) {
        btn.classList.add('active');
      }
    });

    switch(section) {
      case 'categories':
        this.loadAdminCategories(contentArea);
        break;
      case 'menu':
        this.loadAdminMenuItems(contentArea);
        break;
      case 'orders':
        this.loadAdminOrders(contentArea);
        break;
      case 'reservations':
        this.loadAdminReservations(contentArea);
        break;
      default:
        this.loadAdminDashboardView(contentArea);
    }
  }

  loadAdminDashboardView(container) {
    const recentOrders = orders.getAllOrders().slice().reverse().slice(0, 5);
    const recentReservations = reservations.getAllReservations().slice().reverse().slice(0, 5);

    container.innerHTML = `
      <div class="row mb-4">
        <div class="col-lg-6">
          <div class="card">
            <div class="card-header">
              <h6 class="mb-0">Recent Orders</h6>
            </div>
            <div class="card-body">
              ${recentOrders.length === 0 ? '<p class="text-muted">No orders yet</p>' : `
                <div class="table-responsive">
                  <table class="table table-sm">
                    <thead>
                      <tr>
                        <th>Order #</th>
                        <th>Total</th>
                        <th>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      ${recentOrders.map(o => `
                        <tr>
                          <td><strong>${o.orderNumber}</strong></td>
                          <td>${ui.formatCurrency(o.total)}</td>
                          <td><span class="badge bg-${this.getStatusBadgeColor(o.status)}">${o.status}</span></td>
                        </tr>
                      `).join('')}
                    </tbody>
                  </table>
                </div>
              `}
            </div>
          </div>
        </div>

        <div class="col-lg-6">
          <div class="card">
            <div class="card-header">
              <h6 class="mb-0">Recent Reservations</h6>
            </div>
            <div class="card-body">
              ${recentReservations.length === 0 ? '<p class="text-muted">No reservations yet</p>' : `
                <div class="table-responsive">
                  <table class="table table-sm">
                    <thead>
                      <tr>
                        <th>Date</th>
                        <th>People</th>
                        <th>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      ${recentReservations.map(r => `
                        <tr>
                          <td>${ui.formatDate(r.reservationDate)}</td>
                          <td>${r.numberOfPeople}</td>
                          <td><span class="badge bg-success">${r.status}</span></td>
                        </tr>
                      `).join('')}
                    </tbody>
                  </table>
                </div>
              `}
            </div>
          </div>
        </div>
      </div>
    `;
  }

  loadAdminCategories(container) {
    const categories = storage.getCategories();

    container.innerHTML = `
      <div class="card">
        <div class="card-header d-flex justify-content-between align-items-center">
          <h6 class="mb-0">Categories</h6>
          <button class="btn btn-sm btn-primary" onclick="showCategoryForm()">+ Add Category</button>
        </div>
        <div class="card-body">
          ${categories.length === 0 ? '<p class="text-muted">No categories yet</p>' : `
            <div class="table-responsive">
              <table class="table">
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Description</th>
                    <th>Items</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  ${categories.map(cat => `
                    <tr>
                      <td><strong>${cat.name}</strong></td>
                      <td>${cat.description}</td>
                      <td>${storage.getMenuItems().filter(i => i.category === cat.id).length}</td>
                      <td>
                        <button class="btn btn-sm btn-primary" onclick="editCategory('${cat.id}')">Edit</button>
                        <button class="btn btn-sm btn-danger" onclick="deleteCategory('${cat.id}')">Delete</button>
                      </td>
                    </tr>
                  `).join('')}
                </tbody>
              </table>
            </div>
          `}
        </div>
      </div>

      <div id="category-form-container" style="display: none; margin-top: 20px;">
        <div class="card">
          <div class="card-header">
            <h6 class="mb-0" id="form-title">Add Category</h6>
          </div>
          <div class="card-body">
            <form id="admin-category-form">
              <div class="mb-3">
                <label class="form-label">Category Name</label>
                <input type="text" class="form-control" name="name" required>
              </div>
              <div class="mb-3">
                <label class="form-label">Description</label>
                <textarea class="form-control" name="description" rows="2" required></textarea>
              </div>
              <button type="submit" class="btn btn-primary">Save</button>
              <button type="button" class="btn btn-secondary" onclick="hideCategoryForm()">Cancel</button>
            </form>
          </div>
        </div>
      </div>
    `;

    const form = document.getElementById('admin-category-form');
    if (form) {
      form.addEventListener('submit', (e) => this.handleCategorySubmit(e));
    }
  }

  handleCategorySubmit(e) {
    e.preventDefault();
    const form = e.target;
    const name = form.name.value;
    const description = form.description.value;
    const editId = form.dataset.editId;

    if (editId) {
      storage.updateCategory(editId, { name, description });
      ui.showToast('Category updated!', 'success');
    } else {
      storage.addCategory({ name, description });
      ui.showToast('Category added!', 'success');
    }

    setTimeout(() => this.loadAdminSection('categories'), 500);
  }

  loadAdminMenuItems(container) {
    const items = storage.getMenuItems();
    const categories = storage.getCategories();

    container.innerHTML = `
      <div class="card">
        <div class="card-header d-flex justify-content-between align-items-center">
          <h6 class="mb-0">Menu Items</h6>
          <button class="btn btn-sm btn-primary" onclick="showMenuItemForm()">+ Add Item</button>
        </div>
        <div class="card-body">
          ${items.length === 0 ? '<p class="text-muted">No menu items yet</p>' : `
            <div class="table-responsive">
              <table class="table">
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Category</th>
                    <th>Price</th>
                    <th>Available</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  ${items.map(item => `
                    <tr>
                      <td><strong>${item.name}</strong></td>
                      <td>${categories.find(c => c.id === item.category)?.name || 'Unknown'}</td>
                      <td>${ui.formatCurrency(item.price)}</td>
                      <td>
                        <span class="badge ${item.available ? 'bg-success' : 'bg-danger'}">
                          ${item.available ? 'Available' : 'Out of Stock'}
                        </span>
                      </td>
                      <td>
                        <button class="btn btn-sm btn-primary" onclick="editMenuItem('${item.id}')">Edit</button>
                        <button class="btn btn-sm btn-danger" onclick="deleteMenuItem('${item.id}')">Delete</button>
                      </td>
                    </tr>
                  `).join('')}
                </tbody>
              </table>
            </div>
          `}
        </div>
      </div>

      <div id="menu-item-form-container" style="display: none; margin-top: 20px;">
        <div class="card">
          <div class="card-header">
            <h6 class="mb-0" id="item-form-title">Add Menu Item</h6>
          </div>
          <div class="card-body">
            <form id="admin-menu-item-form">
              <div class="row">
                <div class="col-md-6 mb-3">
                  <label class="form-label">Item Name</label>
                  <input type="text" class="form-control" name="name" required>
                </div>
                <div class="col-md-6 mb-3">
                  <label class="form-label">Category</label>
                  <select class="form-control" name="category" required>
                    <option value="">Select Category</option>
                    ${categories.map(cat => `<option value="${cat.id}">${cat.name}</option>`).join('')}
                  </select>
                </div>
              </div>

              <div class="row">
                <div class="col-md-6 mb-3">
                  <label class="form-label">Price (Rs)</label>
                  <input type="number" class="form-control" name="price" min="0" step="10" required>
                </div>
                <div class="col-md-6 mb-3">
                  <label class="form-label">Availability</label>
                  <select class="form-control" name="available" required>
                    <option value="true">Available</option>
                    <option value="false">Out of Stock</option>
                  </select>
                </div>
              </div>

              <div class="mb-3">
                <label class="form-label">Description</label>
                <textarea class="form-control" name="description" rows="2" required></textarea>
              </div>

              <div class="mb-3">
                <label class="form-label">Image URL</label>
                <input type="url" class="form-control" name="image" placeholder="https://..." value="https://via.placeholder.com/300x200?text=Food Item">
              </div>

              <button type="submit" class="btn btn-primary">Save</button>
              <button type="button" class="btn btn-secondary" onclick="hideMenuItemForm()">Cancel</button>
            </form>
          </div>
        </div>
      </div>
    `;

    const form = document.getElementById('admin-menu-item-form');
    if (form) {
      form.addEventListener('submit', (e) => this.handleMenuItemSubmit(e));
    }
  }

  handleMenuItemSubmit(e) {
    e.preventDefault();
    const form = e.target;
    const itemData = {
      name: form.name.value,
      category: form.category.value,
      price: parseInt(form.price.value),
      available: form.available.value === 'true',
      description: form.description.value,
      image: form.image.value,
      rating: 4.5
    };

    const editId = form.dataset.editId;

    if (editId) {
      storage.updateMenuItem(editId, itemData);
      ui.showToast('Item updated!', 'success');
    } else {
      storage.addMenuItem(itemData);
      ui.showToast('Item added!', 'success');
    }

    setTimeout(() => this.loadAdminSection('menu'), 500);
  }

  loadAdminOrders(container) {
    const allOrders = orders.getAllOrders();

    container.innerHTML = `
      <div class="card">
        <div class="card-header">
          <h6 class="mb-0">All Orders</h6>
        </div>
        <div class="card-body">
          ${allOrders.length === 0 ? '<p class="text-muted">No orders yet</p>' : `
            <div class="table-responsive">
              <table class="table">
                <thead>
                  <tr>
                    <th>Order #</th>
                    <th>Total</th>
                    <th>Status</th>
                    <th>Date</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  ${allOrders.map(o => `
                    <tr>
                      <td><strong>${o.orderNumber}</strong></td>
                      <td>${ui.formatCurrency(o.total)}</td>
                      <td>
                        <select class="form-select form-select-sm" onchange="updateOrderStatus('${o.id}', this.value)">
                          <option ${o.status === 'Pending' ? 'selected' : ''}>Pending</option>
                          <option ${o.status === 'Preparing' ? 'selected' : ''}>Preparing</option>
                          <option ${o.status === 'Out for Delivery' ? 'selected' : ''}>Out for Delivery</option>
                          <option ${o.status === 'Delivered' ? 'selected' : ''}>Delivered</option>
                          <option ${o.status === 'Cancelled' ? 'selected' : ''}>Cancelled</option>
                        </select>
                      </td>
                      <td>${ui.formatDate(o.createdAt)}</td>
                      <td>
                        <a href="?page=order-details&id=${o.id}" class="btn btn-sm btn-primary">View</a>
                      </td>
                    </tr>
                  `).join('')}
                </tbody>
              </table>
            </div>
          `}
        </div>
      </div>
    `;
  }

  loadAdminReservations(container) {
    const allReservations = reservations.getAllReservations();

    container.innerHTML = `
      <div class="card">
        <div class="card-header">
          <h6 class="mb-0">All Reservations</h6>
        </div>
        <div class="card-body">
          ${allReservations.length === 0 ? '<p class="text-muted">No reservations yet</p>' : `
            <div class="table-responsive">
              <table class="table">
                <thead>
                  <tr>
                    <th>Reservation #</th>
                    <th>Date & Time</th>
                    <th>People</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  ${allReservations.map(r => `
                    <tr>
                      <td><strong>${r.reservationNumber}</strong></td>
                      <td>${ui.formatDate(r.reservationDate)} at ${ui.formatTime(r.reservationTime)}</td>
                      <td>${r.numberOfPeople}</td>
                      <td><span class="badge bg-success">${r.status}</span></td>
                      <td>
                        <button class="btn btn-sm btn-danger" onclick="cancelReservation('${r.id}')">Cancel</button>
                      </td>
                    </tr>
                  `).join('')}
                </tbody>
              </table>
            </div>
          `}
        </div>
      </div>
    `;
  }
}

// Create global router instance  
const router = new PageRouter();
