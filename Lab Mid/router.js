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
      const orderStats = orders.getStats();
      const recentOrders = orders.getAllOrders().slice(0, 5);
      const recentReservations = reservations.getAllReservations().slice(0, 5);

      container.innerHTML = `
        <div class="row mb-4">
          <div class="col-md-6 mb-3">
            <div class="card text-center p-4">
              <h3 class="text-success">${ui.formatCurrency(orderStats.totalRevenue)}</h3>
              <small>Total Revenue</small>
            </div>
          </div>
          <div class="col-md-6 mb-3">
            <div class="card text-center p-4">
              <h3 class="text-warning">${orderStats.pending}</h3>
              <small>Pending Orders</small>
            </div>
          </div>
        </div>

        <div class="row mb-4">
          <div class="col-md-6">
            <div class="card p-4">
              <h5 class="mb-3">Recent Orders</h5>
              <div class="table-responsive">
                <table class="table table-sm">
                  <thead><tr><th>Order</th><th>Customer</th><th>Amount</th><th>Status</th></tr></thead>
                  <tbody>
                    ${recentOrders.length ? recentOrders.map(o => `
                      <tr>
                        <td><small>${o.orderNumber}</small></td>
                        <td><small>${o.userName}</small></td>
                        <td><small>${ui.formatCurrency(o.total)}</small></td>
                        <td><small><span class="badge bg-info">${o.status}</span></small></td>
                      </tr>
                    `).join("") : "<tr><td colspan='4' class='text-center'>No orders yet</td></tr>"}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
          <div class="col-md-6">
            <div class="card p-4">
              <h5 class="mb-3">Recent Reservations</h5>
              <div class="table-responsive">
                <table class="table table-sm">
                  <thead><tr><th>Reservation</th><th>Customer</th><th>Date</th><th>Time</th></tr></thead>
                  <tbody>
                    ${recentReservations.length ? recentReservations.map(r => `
                      <tr>
                        <td><small>${r.reservationNumber}</small></td>
                        <td><small>${r.userName}</small></td>
                        <td><small>${r.reservationDate}</small></td>
                        <td><small>${r.reservationTime}</small></td>
                      </tr>
                    `).join("") : "<tr><td colspan='4' class='text-center'>No reservations yet</td></tr>"}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      `;
      return;
    }

    if (section === "categories") {
      const categories = storage.getCategories();
      container.innerHTML = `
        <div class="card p-4">
          <div class="d-flex justify-content-between align-items-center mb-3">
            <h4>Categories Management</h4>
            <button class="btn btn-success btn-sm" onclick="showCategoryForm()"><i class="bi bi-plus"></i> Add Category</button>
          </div>

          <div id="category-form-container" style="display:none;" class="mb-4">
            <div class="card p-3 bg-light">
              <h5 id="form-title">Add Category</h5>
              <form id="admin-category-form">
                <div class="mb-3">
                  <label class="form-label">Category Name</label>
                  <input type="text" class="form-control" name="name" required>
                </div>
                <div class="mb-3">
                  <label class="form-label">Description</label>
                  <textarea class="form-control" name="description" rows="2"></textarea>
                </div>
                <div class="d-flex gap-2">
                  <button type="submit" class="btn btn-primary">Save</button>
                  <button type="button" class="btn btn-secondary" onclick="hideCategoryForm()">Cancel</button>
                </div>
              </form>
            </div>
          </div>

          <div class="table-responsive">
            <table class="table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Description</th>
                  <th>Items Count</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                ${categories.map(c => {
                  const itemCount = storage.getMenuItemsByCategory(c.id).length;
                  return `
                    <tr>
                      <td><strong>${c.name}</strong></td>
                      <td>${c.description || "-"}</td>
                      <td><span class="badge bg-info">${itemCount}</span></td>
                      <td>
                        <button class="btn btn-sm btn-warning" onclick="editCategory('${c.id}')"><i class="bi bi-pencil"></i> Edit</button>
                        <button class="btn btn-sm btn-danger" onclick="deleteCategory('${c.id}')"><i class="bi bi-trash"></i> Delete</button>
                      </td>
                    </tr>
                  `;
                }).join("")}
              </tbody>
            </table>
          </div>
        </div>
      `;

      const form = document.getElementById("admin-category-form");
      if (form) {
        form.addEventListener("submit", (e) => {
          e.preventDefault();
          const name = form.querySelector('[name="name"]').value.trim();
          const description = form.querySelector('[name="description"]').value.trim();

          if (!name) {
            ui.showToast("Category name is required.", "warning");
            return;
          }

          const editId = form.dataset.editId;

          if (editId) {
            const updated = storage.updateCategory(editId, { name, description });
            if (updated) {
              ui.showToast("Category updated.", "success");
            } else {
              ui.showToast("Failed to update category.", "danger");
              return;
            }
          } else {
            storage.addCategory({ name, description });
            ui.showToast("Category added.", "success");
          }
          hideCategoryForm();
          setTimeout(() => this.loadAdminSection("categories"), 100);
        });
      }
      return;
    }

    if (section === "menu") {
      const items = storage.getMenuItems();
      const categories = storage.getCategories();

      container.innerHTML = `
        <div class="card p-4">
          <div class="d-flex justify-content-between align-items-center mb-3">
            <h4>Menu Items Management</h4>
            <button class="btn btn-success btn-sm" onclick="showMenuItemForm()"><i class="bi bi-plus"></i> Add Item</button>
          </div>

          <div id="menu-item-form-container" style="display:none;" class="mb-4">
            <div class="card p-3 bg-light">
              <h5 id="item-form-title">Add Menu Item</h5>
              <form id="admin-menu-item-form">
                <div class="row">
                  <div class="col-md-6 mb-3">
                    <label class="form-label">Item Name</label>
                    <input type="text" class="form-control" name="name" required>
                  </div>
                  <div class="col-md-6 mb-3">
                    <label class="form-label">Category</label>
                    <select class="form-select" name="category" required>
                      <option value="">Select Category</option>
                      ${categories.map(c => `<option value="${c.id}">${c.name}</option>`).join("")}
                    </select>
                  </div>
                </div>
                <div class="row">
                  <div class="col-md-6 mb-3">
                    <label class="form-label">Price (Rs)</label>
                    <input type="number" class="form-control" name="price" step="0.01" required>
                  </div>
                  <div class="col-md-6 mb-3">
                    <div class="form-check">
                      <input class="form-check-input" type="checkbox" name="available" id="availableCheck" checked>
                      <label class="form-check-label" for="availableCheck">Available for ordering</label>
                    </div>
                  </div>
                </div>
                <div class="mb-3">
                  <label class="form-label">Description</label>
                  <textarea class="form-control" name="description" rows="2"></textarea>
                </div>
                <div class="mb-3">
                  <label class="form-label">Image URL</label>
                  <input type="text" class="form-control" name="image" placeholder="https://...">
                  <small class="text-muted">Leave blank to use default placeholder</small>
                </div>
                <div class="d-flex gap-2">
                  <button type="submit" class="btn btn-primary">Save</button>
                  <button type="button" class="btn btn-secondary" onclick="hideMenuItemForm()">Cancel</button>
                </div>
              </form>
            </div>
          </div>

          <div class="table-responsive">
            <table class="table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Category</th>
                  <th>Price</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                ${items.map(item => `
                  <tr>
                    <td><strong>${item.name}</strong></td>
                    <td>${storage.getCategoryById(item.category)?.name || "-"}</td>
                    <td>${ui.formatCurrency(item.price)}</td>
                    <td><span class="badge ${item.available ? "bg-success" : "bg-danger"}">${item.available ? "Available" : "Unavailable"}</span></td>
                    <td>
                      <button class="btn btn-sm btn-warning" onclick="editMenuItem('${item.id}')"><i class="bi bi-pencil"></i> Edit</button>
                      <button class="btn btn-sm btn-danger" onclick="deleteMenuItem('${item.id}')"><i class="bi bi-trash"></i> Delete</button>
                    </td>
                  </tr>
                `).join("")}
              </tbody>
            </table>
          </div>
        </div>
      `;

      const form = document.getElementById("admin-menu-item-form");
      if (form) {
        form.addEventListener("submit", (e) => {
          e.preventDefault();

          const name = form.querySelector('[name="name"]').value.trim();
          const categoryId = form.querySelector('[name="category"]').value;
          const priceStr = form.querySelector('[name="price"]').value;

          if (!name) {
            ui.showToast("Item name is required.", "warning");
            return;
          }
          if (!categoryId) {
            ui.showToast("Please select a category.", "warning");
            return;
          }

          const price = Number(priceStr);
          if (!priceStr || isNaN(price) || price <= 0) {
            ui.showToast("Price must be a valid positive number.", "warning");
            return;
          }

          const data = {
            name: name,
            category: categoryId,
            price: price,
            description: form.querySelector('[name="description"]').value.trim(),
            image: form.querySelector('[name="image"]').value.trim(),
            available: form.querySelector('[name="available"]').checked
          };

          const editId = form.dataset.editId;
          if (editId) {
            const updated = storage.updateMenuItem(editId, data);
            if (updated) {
              ui.showToast("Menu item updated.", "success");
            } else {
              ui.showToast("Failed to update menu item.", "danger");
              return;
            }
          } else {
            storage.addMenuItem(data);
            ui.showToast("Menu item added.", "success");
          }
          hideMenuItemForm();
          setTimeout(() => this.loadAdminSection("menu"), 100);
        });
      }
      return;
    }

    if (section === "orders") {
      const allOrders = orders.getAllOrders();
      container.innerHTML = `
        <div class="card p-4">
          <h4 class="mb-3">Orders Management</h4>

          <div class="table-responsive">
            <table class="table">
              <thead>
                <tr>
                  <th>Order #</th>
                  <th>Customer</th>
                  <th>Items</th>
                  <th>Total</th>
                  <th>Status</th>
                  <th>Date</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                ${allOrders.map(order => `
                  <tr>
                    <td><strong>${order.orderNumber}</strong></td>
                    <td>${order.userName}</td>
                    <td>${order.items.length}</td>
                    <td>${ui.formatCurrency(order.total)}</td>
                    <td>
                      <select class="form-select form-select-sm" onchange="updateOrderStatus('${order.id}', this.value)">
                        ${["Pending", "Preparing", "Out for Delivery", "Delivered", "Cancelled"].map(status => `
                          <option value="${status}" ${order.status === status ? "selected" : ""}>${status}</option>
                        `).join("")}
                      </select>
                    </td>
                    <td><small>${ui.formatDate(order.createdAt)}</small></td>
                    <td>
                      <button class="btn btn-sm btn-info" onclick="viewAdminOrderDetails('${order.id}')"><i class="bi bi-eye"></i> View</button>
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
          <h4 class="mb-3">Reservations Management</h4>

          <div class="table-responsive">
            <table class="table">
              <thead>
                <tr>
                  <th>Reservation #</th>
                  <th>Customer</th>
                  <th>Date</th>
                  <th>Time</th>
                  <th>Guests</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                ${allReservations.map(r => `
                  <tr>
                    <td><strong>${r.reservationNumber}</strong></td>
                    <td>${r.userName}</td>
                    <td>${r.reservationDate}</td>
                    <td>${r.reservationTime}</td>
                    <td>${r.numberOfPeople}</td>
                    <td><span class="badge ${r.status === "Cancelled" ? "bg-danger" : "bg-success"}">${r.status}</span></td>
                    <td>
                      ${r.status !== "Cancelled" ? `<button class="btn btn-sm btn-danger" onclick="cancelAdminReservation('${r.id}')"><i class="bi bi-x"></i> Cancel</button>` : `<span class="text-muted">No actions</span>`}
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

    if (section === "users") {
      const users = storage.getUsers();
      container.innerHTML = `
        <div class="card p-4">
          <h4 class="mb-3">Users Management</h4>

          <div class="table-responsive">
            <table class="table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Phone</th>
                  <th>Role</th>
                  <th>Member Since</th>
                  <th>Orders</th>
                </tr>
              </thead>
              <tbody>
                ${users.map(u => {
                  const userOrders = orders.getAllOrders().filter(o => o.userId === u.id).length;
                  return `
                    <tr>
                      <td><strong>${u.fullName}</strong></td>
                      <td>${u.email}</td>
                      <td>${u.phone}</td>
                      <td><span class="badge ${u.role === "admin" ? "bg-danger" : "bg-primary"}">${u.role}</span></td>
                      <td><small>${ui.formatDate(u.createdAt)}</small></td>
                      <td>${userOrders}</td>
                    </tr>
                  `;
                }).join("")}
              </tbody>
            </table>
          </div>
        </div>
      `;
      return;
    }
  }
}

const router = new PageRouter();
