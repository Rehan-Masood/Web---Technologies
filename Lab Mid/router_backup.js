class PageRouter {
  constructor() {
    window.addEventListener("load", () => {
      ui.init();
      this.route();
    });

    window.addEventListener("popstate", () => this.route());

    document.addEventListener("click", (e) => {
      const link = e.target.closest('a[href^="?page="]');
      if (!link) return;
      e.preventDefault();
      history.pushState({}, "", link.getAttribute("href"));
      this.route();
    });
  }

  getPage() {
    const params = new URLSearchParams(window.location.search);
    return params.get("page") || "home";
  }

  route() {
    const page = this.getPage();

    document.querySelectorAll(".page-content").forEach(el => {
      el.style.display = "none";
    });

    const target = document.getElementById(`${page}-page`);
    if (!target) {
      const notFound = document.getElementById("notfound-page");
      if (notFound) notFound.style.display = "block";
      return;
    }

    if (["profile", "cart", "checkout", "orders", "order-details", "reservations"].includes(page)) {
      if (!auth.requireLogin()) return;
    }

    if (page === "admin") {
      if (!auth.requireAdmin()) return;
    }

    target.style.display = "block";

    const loaders = {
      home: () => this.loadHomePage(),
      menu: () => this.loadMenuPage(),
      login: () => this.loadLoginPage(),
      register: () => this.loadRegisterPage(),
      profile: () => this.loadProfilePage(),
      cart: () => this.loadCartPage(),
      checkout: () => this.loadCheckoutPage(),
      "order-confirmation": () => this.loadOrderConfirmationPage(),
      orders: () => this.loadOrdersPage(),
      "order-details": () => this.loadOrderDetailsPage(),
      reservations: () => this.loadReservationsPage(),
      admin: () => this.loadAdminPage()
    };

    if (loaders[page]) loaders[page]();

    document.querySelectorAll(".navbar .nav-link").forEach(link => {
      link.classList.remove("active");
      const href = link.getAttribute("href") || "";
      if (href === `?page=${page}`) {
        link.classList.add("active");
      }
    });

    window.scrollTo(0, 0);
  }

  safeImage(src, title = "Food Item") {
    return `
      <img
        src="${src}"
        alt="${title}"
        loading="lazy"
        onerror="this.onerror=null;this.src='https://placehold.co/800x600/111111/e0b11e?text=${encodeURIComponent(title)}';"
      >
    `;
  }

  loadHomePage() {
    const featured = document.getElementById("featured-items");
    const categories = document.getElementById("home-categories");

    if (featured) {
      const items = storage.getMenuItems().slice(0, 4);
      featured.innerHTML = items.map(item => `
        <div class="col-sm-6 col-lg-3 mb-4">
          <div class="card food-card">
            <div class="food-card-image">
              ${this.safeImage(item.image, item.name)}
            </div>
            <div class="card-body">
              <span class="category-pill">${storage.getCategoryById(item.category)?.name || ""}</span>
              <h5 class="card-title">${item.name}</h5>
              <p class="card-text">${item.description}</p>
              <div class="price-row">
                <div class="price">${ui.formatCurrency(item.price)}</div>
                <button class="btn btn-primary btn-sm" onclick="addItemToCart('${item.id}')">Add</button>
              </div>
            </div>
          </div>
        </div>
      `).join("");
    }

    if (categories) {
      categories.innerHTML = storage.getCategories().map(cat => `
        <div class="col-sm-6 col-md-4 col-lg-3 mb-4">
          <a href="?page=menu&category=${cat.id}" class="card text-decoration-none h-100">
            <div class="card-body text-center">
              <h5 class="mb-2">${cat.name}</h5>
              <small class="text-muted">${cat.description || ""}</small>
            </div>
          </a>
        </div>
      `).join("");
    }
  }

  loadMenuPage() {
    const params = new URLSearchParams(window.location.search);
    const selectedCategory = params.get("category") || "all";
    const searchInput = document.querySelector('[data-search]');
    const categoryButtons = document.getElementById("category-buttons");
    const container = document.getElementById("menu-items");

    if (categoryButtons) {
      const categories = [{ id: "all", name: "All" }, ...storage.getCategories()];
      categoryButtons.innerHTML = categories.map(cat => `
        <a href="?page=menu&category=${cat.id}"
           class="btn ${selectedCategory === cat.id ? "btn-primary" : "btn-outline-primary"}">
          ${cat.name}
        </a>
      `).join("");
    }

    const renderItems = () => {
      const query = searchInput ? searchInput.value.trim() : "";
      const items = query
        ? storage.searchMenuItems(query, selectedCategory)
        : storage.getMenuItemsByCategory(selectedCategory);

      if (!container) return;

      if (!items.length) {
        container.innerHTML = `
          <div class="col-12">
            <div class="card text-center p-5">
              <h4>No menu items found</h4>
              <p class="text-muted mb-0">Try another category or search term.</p>
            </div>
          </div>
        `;
        return;
      }

      container.innerHTML = items.map(item => `
        <div class="col-sm-6 col-lg-4 col-xl-3 mb-4">
          <div class="card food-card h-100">
            <div class="food-card-image">
              ${this.safeImage(item.image, item.name)}
              <span class="badge ${item.available ? "bg-success" : "bg-danger"} position-absolute top-0 end-0 m-3">
                ${item.available ? "Available" : "Unavailable"}
              </span>
            </div>

            <div class="card-body">
              <span class="category-pill">${storage.getCategoryById(item.category)?.name || ""}</span>
              <h5 class="card-title">${item.name}</h5>
              <p class="card-text">${item.description}</p>

              <div class="price-row">
                <div class="price">${ui.formatCurrency(item.price)}</div>
                <button
                  class="btn btn-warning btn-sm"
                  onclick="addItemToCart('${item.id}')"
                  ${!item.available ? "disabled" : ""}>
                  ${item.available ? "Add to Cart" : "Unavailable"}
                </button>
              </div>
            </div>
          </div>
        </div>
      `).join("");
    };

    if (searchInput) {
      searchInput.value = "";
      searchInput.oninput = renderItems;
    }

    renderItems();
  }

  loadLoginPage() {
    if (auth.isLoggedIn()) {
      history.replaceState({}, "", "?page=profile");
      this.route();
    }
  }

  loadRegisterPage() {
    if (auth.isLoggedIn()) {
      history.replaceState({}, "", "?page=profile");
      this.route();
    }
  }

  loadProfilePage() {
    const user = auth.getCurrentUser();
    const content = document.getElementById("profile-content");
    if (!user || !content) return;

    const userOrders = orders.getUserOrders(user.id);
    const userReservations = reservations.getUserReservations(user.id);

    content.innerHTML = `
      <div class="row">
        <div class="col-md-6 mb-4">
          <h5>Profile Information</h5>
          <div class="mb-2"><strong>Name:</strong> ${user.fullName}</div>
          <div class="mb-2"><strong>Email:</strong> ${user.email}</div>
          <div class="mb-2"><strong>Phone:</strong> ${user.phone}</div>
          <div class="mb-2"><strong>Address:</strong> ${user.address || "Not provided"}</div>
          <div class="mb-2"><strong>Role:</strong> <span class="badge bg-info">${user.role}</span></div>
          <div class="mb-2"><strong>Member Since:</strong> ${ui.formatDate(user.createdAt)}</div>
        </div>

        <div class="col-md-6 mb-4">
          <h5>Update Profile</h5>
          <form id="profile-edit-form">
            <div class="mb-3">
              <label class="form-label">Full Name</label>
              <input type="text" class="form-control" name="fullName" value="${user.fullName}" required>
            </div>
            <div class="mb-3">
              <label class="form-label">Phone</label>
              <input type="text" class="form-control" name="phone" value="${user.phone}" required>
            </div>
            <div class="mb-3">
              <label class="form-label">Address</label>
              <textarea class="form-control" name="address" rows="3">${user.address || ""}</textarea>
            </div>
            <button class="btn btn-primary" type="submit">Save Changes</button>
          </form>
        </div>
      </div>

      <hr class="my-4">

      <div class="row">
        <div class="col-md-4 mb-3">
          <div class="card p-3 text-center">
            <h3>${userOrders.length}</h3>
            <small>Total Orders</small>
          </div>
        </div>
        <div class="col-md-4 mb-3">
          <div class="card p-3 text-center">
            <h3>${userReservations.length}</h3>
            <small>Reservations</small>
          </div>
        </div>
        <div class="col-md-4 mb-3">
          <div class="card p-3 text-center">
            <h3>${ui.formatCurrency(userOrders.reduce((sum, o) => sum + o.total, 0))}</h3>
            <small>Total Spending</small>
          </div>
        </div>
      </div>
    `;

    const form = document.getElementById("profile-edit-form");
    if (form) {
      form.addEventListener("submit", (e) => {
        e.preventDefault();
        const result = auth.updateProfile({
          fullName: form.fullName.value.trim(),
          phone: form.phone.value.trim(),
          address: form.address.value.trim()
        });

        if (!result.success) {
          ui.showToast(result.error, "danger");
          return;
        }

        ui.showToast("Profile updated successfully.", "success");
        ui.updateNavigation();
        this.loadProfilePage();
      });
    }
  }

  loadCartPage() {
    const items = cart.getCart();
    const container = document.getElementById("cart-items");
    if (!container) return;

    if (!items.length) {
      container.innerHTML = `
        <div class="card-body text-center py-5">
          <h4>Your cart is empty</h4>
          <a href="?page=menu" class="btn btn-primary mt-3">Browse Menu</a>
        </div>
      `;
    } else {
      container.innerHTML = `
        <div class="card-body">
          <div class="table-responsive">
            <table class="table">
              <thead>
                <tr>
                  <th>Item</th>
                  <th>Price</th>
                  <th>Qty</th>
                  <th>Subtotal</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                ${items.map(item => `
                  <tr>
                    <td>
                      <div class="d-flex align-items-center gap-2">
                        <img
                          src="${item.image}"
                          alt="${item.name}"
                          width="56"
                          height="56"
                          style="object-fit:cover;border-radius:8px"
                          onerror="this.onerror=null;this.src='https://placehold.co/56x56/111111/e0b11e?text=Food';"
                        >
                        <div>${item.name}</div>
                      </div>
                    </td>
                    <td>${ui.formatCurrency(item.price)}</td>
                    <td>
                      <div class="d-flex align-items-center gap-2">
                        <button class="btn btn-sm btn-outline-primary" onclick="updateCartQuantity('${item.id}', ${item.quantity - 1})">-</button>
                        <span>${item.quantity}</span>
                        <button class="btn btn-sm btn-outline-primary" onclick="updateCartQuantity('${item.id}', ${item.quantity + 1})">+</button>
                      </div>
                    </td>
                    <td>${ui.formatCurrency(item.price * item.quantity)}</td>
                    <td><button class="btn btn-sm btn-danger" onclick="removeFromCart('${item.id}')">Remove</button></td>
                  </tr>
                `).join("")}
              </tbody>
            </table>
          </div>
        </div>
      `;
    }

    const totals = cart.getCartTotals();
    document.getElementById("cart-subtotal").textContent = ui.formatCurrency(totals.subtotal);
    document.getElementById("cart-delivery").textContent = ui.formatCurrency(totals.deliveryFee);
    document.getElementById("cart-total").textContent = ui.formatCurrency(totals.total);

    const checkoutBtn = document.getElementById("checkout-btn");
    if (checkoutBtn) {
      checkoutBtn.onclick = () => {
        if (cart.isEmpty()) {
          ui.showToast("Cart is empty.", "warning");
          return;
        }
        history.pushState({}, "", "?page=checkout");
        this.route();
      };
    }
  }

  loadCheckoutPage() {
    const user = auth.getCurrentUser();
    const form = document.getElementById("checkout-form");
    if (!form || !user) return;

    form.deliveryAddress.value = user.address || "";

    const itemsBody = document.getElementById("checkout-items");
    const totals = cart.getCartTotals();

    itemsBody.innerHTML = totals.items.map(item => `
      <tr>
        <td>${item.name}</td>
        <td>${ui.formatCurrency(item.price)}</td>
        <td>${item.quantity}</td>
        <td>${ui.formatCurrency(item.price * item.quantity)}</td>
      </tr>
    `).join("");

    document.getElementById("checkout-subtotal").textContent = ui.formatCurrency(totals.subtotal);
    document.getElementById("checkout-total").textContent = ui.formatCurrency(totals.total);
  }

  loadOrderConfirmationPage() {
    const orderId = sessionStorage.getItem("lastOrderId");
    if (!orderId) return;

    const order = orders.getOrderById(orderId);
    if (!order) return;

    document.getElementById("confirmation-message").innerHTML =
      `Your order <strong>#${order.orderNumber}</strong> has been placed successfully.`;

    document.getElementById("delivery-info").innerHTML =
      `Estimated delivery time: <strong>${ui.formatDateTime(order.estimatedDeliveryTime)}</strong>`;

    sessionStorage.removeItem("lastOrderId");
  }

  loadOrdersPage() {
    const user = auth.getCurrentUser();
    const list = document.getElementById("orders-list");
    if (!user || !list) return;

    const userOrders = orders.getUserOrders(user.id);

    if (!userOrders.length) {
      list.innerHTML = `<div class="card p-5 text-center"><h4>No orders yet</h4></div>`;
      return;
    }

    list.innerHTML = userOrders.map(order => `
      <div class="card mb-3">
        <div class="card-body">
          <div class="row align-items-center">
            <div class="col-md-3">
              <strong>${order.orderNumber}</strong><br>
              <small>${ui.formatDateTime(order.createdAt)}</small>
            </div>
            <div class="col-md-3">${order.items.length} items</div>
            <div class="col-md-3">${ui.formatCurrency(order.total)}</div>
            <div class="col-md-3 text-md-end">
              <a href="?page=order-details&id=${order.id}" class="btn btn-sm btn-outline-primary">View Details</a>
            </div>
          </div>
        </div>
      </div>
    `).join("");
  }

  loadOrderDetailsPage() {
    const params = new URLSearchParams(window.location.search);
    const orderId = params.get("id");
    const order = orders.getOrderById(orderId);

    if (!order) {
      history.replaceState({}, "", "?page=orders");
      this.route();
      return;
    }

    const detail = document.getElementById("order-detail-content");
    const sidebar = document.getElementById("order-tracking-sidebar");

    detail.innerHTML = `
      <div class="card-header"><h5 class="mb-0">Order ${order.orderNumber}</h5></div>
      <div class="card-body">
        <p><strong>Order Date:</strong> ${ui.formatDateTime(order.createdAt)}</p>
        <p><strong>Address:</strong> ${order.deliveryAddress}</p>
        ${order.notes ? `<p><strong>Notes:</strong> ${order.notes}</p>` : ""}
        <hr>
        ${order.items.map(item => `
          <div class="d-flex justify-content-between border-bottom py-2">
            <div>${item.name} x ${item.quantity}</div>
            <div>${ui.formatCurrency(item.price * item.quantity)}</div>
          </div>
        `).join("")}
        <div class="d-flex justify-content-between mt-3"><strong>Subtotal</strong><strong>${ui.formatCurrency(order.subtotal)}</strong></div>
        <div class="d-flex justify-content-between"><strong>Delivery</strong><strong>${ui.formatCurrency(order.deliveryFee)}</strong></div>
        <div class="d-flex justify-content-between"><strong>Total</strong><strong>${ui.formatCurrency(order.total)}</strong></div>
      </div>
    `;

    sidebar.innerHTML = `
      <div class="card">
        <div class="card-header"><h6 class="mb-0">Tracking</h6></div>
        <div class="card-body">
          <p><strong>Status:</strong> ${order.status}</p>
          <ul class="list-group">
            ${["Pending", "Preparing", "Out for Delivery", "Delivered"].map(step => `
              <li class="list-group-item ${step === order.status ? "active" : ""}">${step}</li>
            `).join("")}
          </ul>
        </div>
      </div>
    `;
  }

  loadReservationsPage() {
    const user = auth.getCurrentUser();
    if (!user) return;

    const input = document.querySelector('#reservation-form [name="reservationDate"]');
    if (input) input.min = new Date().toISOString().split("T")[0];

    const container = document.getElementById("my-reservations");
    const list = reservations.getUserReservations(user.id);

    if (!container) return;

    if (!list.length) {
      container.innerHTML = `<p class="text-muted text-center">No reservations yet.</p>`;
      return;
    }

    container.innerHTML = list.map(r => `
      <div class="card mb-3 p-3">
        <div class="d-flex justify-content-between">
          <div>
            <strong>${r.reservationNumber}</strong><br>
            <small>${r.reservationDate} ${r.reservationTime} · ${r.numberOfPeople} people</small>
          </div>
          <div>
            <span class="badge bg-success">${r.status}</span>
          </div>
        </div>
        ${r.specialRequests ? `<small class="d-block mt-2 text-muted">Notes: ${r.specialRequests}</small>` : ""}
      </div>
    `).join("");
  }

  loadAdminPage() {
    const stats = admin.getDashboardStats();
    const statsContainer = document.getElementById("admin-stats");

    if (statsContainer) {
      statsContainer.innerHTML = `
        <div class="col-md-3 mb-3"><div class="card p-3 text-center"><h3>${stats.users}</h3><small>Customers</small></div></div>
        <div class="col-md-3 mb-3"><div class="card p-3 text-center"><h3>${stats.categories}</h3><small>Categories</small></div></div>
        <div class="col-md-3 mb-3"><div class="card p-3 text-center"><h3>${stats.menuItems}</h3><small>Menu Items</small></div></div>
        <div class="col-md-3 mb-3"><div class="card p-3 text-center"><h3>${stats.orders}</h3><small>Orders</small></div></div>
      `;
    }

    document.querySelectorAll(".admin-nav-btn").forEach(btn => {
      btn.onclick = () => this.loadAdminSection(btn.dataset.section);
    });

    this.loadAdminSection("dashboard");
  }

  loadAdminSection(section) {
    const container = document.getElementById("admin-content");
    if (!container) return;

    if (section === "dashboard") {
      container.innerHTML = `<div class="card p-4"><h4>Welcome, Admin</h4><p>Use the buttons above to manage the website.</p></div>`;
      return;
    }

    if (section === "categories") {
      const categories = storage.getCategories();
      container.innerHTML = `
        <div class="card p-4">
          <h4>Categories</h4>
          <ul class="list-group">
            ${categories.map(c => `<li class="list-group-item">${c.name}</li>`).join("")}
          </ul>
        </div>
      `;
      return;
    }

    if (section === "menu") {
      const items = storage.getMenuItems();
      container.innerHTML = `
        <div class="card p-4">
          <h4>Menu Items</h4>
          <div class="table-responsive">
            <table class="table">
              <thead><tr><th>Name</th><th>Category</th><th>Price</th><th>Status</th></tr></thead>
              <tbody>
                ${items.map(item => `
                  <tr>
                    <td>${item.name}</td>
                    <td>${storage.getCategoryById(item.category)?.name || ""}</td>
                    <td>${ui.formatCurrency(item.price)}</td>
                    <td>${item.available ? "Available" : "Unavailable"}</td>
                  </tr>
                `).join("")}
              </tbody>
            </table>
          </div>
        </div>
      `;
      return;
    }

    if (section === "orders") {
      const allOrders = orders.getAllOrders();
      container.innerHTML = `
        <div class="card p-4">
          <h4>All Orders</h4>
          <div class="table-responsive">
            <table class="table">
              <thead><tr><th>Order</th><th>User</th><th>Total</th><th>Status</th></tr></thead>
              <tbody>
                ${allOrders.map(order => `
                  <tr>
                    <td>${order.orderNumber}</td>
                    <td>${order.userName}</td>
                    <td>${ui.formatCurrency(order.total)}</td>
                    <td>
                      <select class="form-select form-select-sm" onchange="updateOrderStatus('${order.id}', this.value)">
                        ${["Pending","Preparing","Out for Delivery","Delivered","Cancelled"].map(status => `
                          <option value="${status}" ${order.status === status ? "selected" : ""}>${status}</option>
                        `).join("")}
                      </select>
                    </td>
                  </tr>
                `).join("")}
              </tbody>
            </table>
          </div>
        </div>
      `;
      return;
    }

    if (section === "reservations") {
      const allReservations = reservations.getAllReservations();
      container.innerHTML = `
        <div class="card p-4">
          <h4>All Reservations</h4>
          <div class="table-responsive">
            <table class="table">
              <thead><tr><th>No.</th><th>User</th><th>Date</th><th>Time</th><th>Guests</th></tr></thead>
              <tbody>
                ${allReservations.map(r => `
                  <tr>
                    <td>${r.reservationNumber}</td>
                    <td>${r.userName}</td>
                    <td>${r.reservationDate}</td>
                    <td>${r.reservationTime}</td>
                    <td>${r.numberOfPeople}</td>
                  </tr>
                `).join("")}
              </tbody>
            </table>
          </div>
        </div>
      `;
    }
  }
}

const router = new PageRouter();
