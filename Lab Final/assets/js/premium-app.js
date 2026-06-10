const app = {
  root: document.getElementById("app"),
  toastRoot: document.querySelector(".toast-container"),

  state: {
    user: null,
    deliveryMan: null,
    cart: { items: [], subtotal: 0, delivery_fee: 0, total: 0, item_count: 0 },
    categories: [],
    menuItems: [],
    restaurants: [],
    offers: [],
    selectedRestaurantId: null,
    appliedOffer: null,
    stats: { restaurants: 4, menu_items: 35, orders_served: 120, delivery_time: "30-45" }
  },

  async init() {
    await this.syncSession();
    this.bind();
    await this.route();
  },

  bind() {
    document.addEventListener("click", (event) => this.onClick(event));
    document.addEventListener("submit", (event) => this.onSubmit(event));
    window.addEventListener("popstate", () => this.route());
  },

  params() {
    return new URLSearchParams(window.location.search);
  },

  page() {
    return this.params().get("page") || "home";
  },

  view() {
    return this.params().get("view") || "dashboard";
  },

  go(url) {
    window.history.pushState({}, "", url);
    this.route();
  },

  apiBase() {
    const path = window.location.pathname;
    const appRoot = path.includes("/Food%20Express/") || path.includes("/Food Express/")
      ? path.slice(0, path.toLowerCase().indexOf("/food") + "/Food%20Express".length)
      : "/Food%20Express";

    if (window.location.port === "5500") {
      return `${window.location.protocol}//${window.location.hostname === "localhost" ? "localhost" : "localhost"}${appRoot}/backend`;
    }

    return `${appRoot}/backend`;
  },

  async api(file, action = "", options = {}) {
    const params = new URLSearchParams();
    if (action) params.set("action", action);
    if (options.query) {
      new URLSearchParams(options.query).forEach((value, key) => params.set(key, value));
    }
    const query = params.toString();
    const url = `${this.apiBase()}/${file}.php${query ? `?${query}` : ""}`;
    const init = {
      method: options.method || "GET",
      credentials: "include",
      headers: { "Content-Type": "application/json" }
    };
    if (options.body) init.body = JSON.stringify(options.body);
    const response = await fetch(url, init);
    const raw = await response.text();
    let data;
    try {
      data = raw ? JSON.parse(raw) : {};
    } catch (_) {
      const preview = raw.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim().slice(0, 180);
      throw new Error(`Backend did not return JSON (${response.status}) from ${url}. ${preview || "Open through http://localhost/Food%20Express/, not Live Server."}`);
    }
    if (!response.ok || data.success === false) {
      throw new Error(data.error || "Request failed.");
    }
    return data;
  },

  async syncSession() {
    try {
      const data = await this.api("auth", "me");
      this.state.user = data.user || null;
    } catch (_) {
      this.state.user = null;
    }

    try {
      const data = await this.api("delivery", "profile");
      this.state.deliveryMan = data.delivery_man || null;
    } catch (_) {
      this.state.deliveryMan = null;
    }

    if (this.state.user?.role === "customer") {
      await this.syncCart();
    }
  },

  async syncCart() {
    try {
      const data = await this.api("cart", "get");
      this.state.cart = data.cart;
    } catch (_) {
      this.state.cart = { items: [], subtotal: 0, delivery_fee: 0, total: 0, item_count: 0 };
    }
  },

  async loadPublicData() {
    const tasks = [
      this.api("restaurants", "list").catch(() => ({ restaurants: [] })),
      this.api("categories", "list").catch(() => ({ categories: [] })),
      this.api("menu_items", "list", { query: "available=1" }).catch(() => ({ items: [] })),
      this.api("offers", "list").catch(() => ({ offers: [] })),
      this.api("stats").catch(() => ({ stats: this.state.stats }))
    ];
    const [restaurants, categories, items, offers, stats] = await Promise.all(tasks);
    this.state.restaurants = restaurants.restaurants || [];
    this.state.categories = categories.categories || [];
    this.state.menuItems = items.items || [];
    this.state.offers = offers.offers || [];
    this.state.stats = stats.stats || this.state.stats;
  },

  async route() {
    const page = this.page();
    if (page === "admin") return this.renderAdmin();
    if (page === "delivery") return this.renderDelivery();
    await this.loadPublicData();

    const publicPages = {
      home: () => this.renderHome(),
      restaurants: () => this.renderRestaurants(),
      menu: () => this.renderMenu(),
      cart: () => this.renderCart(),
      checkout: () => this.renderCheckout(),
      success: () => this.renderSuccess(),
      orders: () => this.renderOrders(),
      track: () => this.renderTrack(),
      offers: () => this.renderOffers(),
      profile: () => this.renderProfile(),
      login: () => this.renderLogin(),
      register: () => this.renderRegister()
    };

    const renderer = publicPages[page] || publicPages.home;
    this.root.innerHTML = this.customerNav() + renderer();
    this.afterRender(page);
  },

  afterRender(page) {
    this.markActiveNav();
    if (page === "menu") {
      this.renderMenuRows();
      this.setupMenuSearch();
    }
    if (page === "restaurants") this.renderRestaurantRows();
    if (page === "cart") this.renderCartRows();
    if (page === "checkout") this.setupPaymentMethodHandler();
    if (page === "orders") this.loadOrders();
    if (page === "track") this.loadTracking();
    if (page === "profile") this.fillProfile();
  },

  setupMenuSearch() {
    const searchBox = document.querySelector("[data-menu-search]");
    if (searchBox) {
      searchBox.addEventListener("input", () => this.renderMenuRows());
    }
  },

  setupPaymentMethodHandler() {
    const paymentMethod = document.querySelector("[data-payment-method]");
    if (paymentMethod) {
      paymentMethod.addEventListener("change", () => this.updatePaymentMethodFields());
      this.updatePaymentMethodFields();
    }
  },

  updatePaymentMethodFields() {
    const method = document.querySelector("[data-payment-method]")?.value || "cash";
    const detailsForm = document.getElementById("payment-details-form");
    const phoneGroup = document.getElementById("payment-phone-group");
    const refGroup = document.getElementById("payment-reference-group");
    const phoneInput = document.querySelector("[data-payment-phone]");
    const refInput = document.querySelector("[data-payment-reference]");
    
    if (method === "cash" || method === "card") {
      detailsForm.style.display = "none";
      phoneInput.removeAttribute("required");
      refInput.removeAttribute("required");
    } else if (method === "jazzcash" || method === "easypaisa") {
      detailsForm.style.display = "block";
      phoneGroup.style.display = "block";
      refGroup.style.display = "block";
      phoneInput.setAttribute("required", "required");
      refInput.setAttribute("required", "required");
      phoneInput.placeholder = method === "jazzcash" ? "JazzCash Mobile Number" : "Easypaisa Mobile Number";
    } else {
      detailsForm.style.display = "none";
      phoneInput.removeAttribute("required");
      refInput.removeAttribute("required");
    }
  },

  markActiveNav() {
    document.querySelectorAll("[data-nav]").forEach((link) => {
      link.classList.toggle("active", link.dataset.nav === this.page());
    });
  },

  customerNav() {
    const count = this.state.cart?.item_count || 0;
    const userLinks = this.state.user
      ? `<a href="?page=profile" data-link data-nav="profile"><i class="bi bi-person-circle"></i> Profile</a>
         <a href="#" data-logout><i class="bi bi-box-arrow-right"></i> Logout</a>`
      : `<a href="?page=login" data-link data-nav="login"><i class="bi bi-person"></i> Login</a>`;

    return `
      <nav class="premium-nav">
        <div class="nav-inner">
          <a class="brand" href="?page=home" data-link><i class="bi bi-bag-heart"></i> Food<span>Express</span></a>
          <button class="icon-btn mobile-toggle" data-mobile-nav aria-label="Open navigation"><i class="bi bi-list"></i></button>
          <div class="nav-links" data-nav-links>
            <a href="?page=home" data-link data-nav="home">Home</a>
            <a href="?page=restaurants" data-link data-nav="restaurants">Restaurants</a>
            <a href="?page=menu" data-link data-nav="menu">Menu</a>
            <a href="?page=track" data-link data-nav="track">Track Order</a>
            <a href="?page=offers" data-link data-nav="offers">Offers</a>
            <a class="cart-pill" href="?page=cart" data-link data-nav="cart"><i class="bi bi-cart3"></i> Cart ${count ? `<span class="cart-count">${count}</span>` : ""}</a>
            ${userLinks}
          </div>
        </div>
      </nav>`;
  },

  renderHome() {
    const featuredRestaurants = this.state.restaurants.slice(0, 4).map((r) => this.restaurantCard(r)).join("");
    return `
      <main>
        <section class="hero">
          <div class="container-page hero-grid">
            <div>
              <span class="location-chip"><i class="bi bi-geo-alt-fill"></i> Lahore, Pakistan</span>
              <h1>Delicious Food <span>Delivered Fast</span></h1>
              <p>Order from your favorite restaurants and enjoy fast delivery at your door with live tracking and fresh, premium meals.</p>
              <div class="hero-actions">
                <a class="btn-premium" href="?page=menu" data-link>Order Now</a>
                <a class="btn-outline-soft" href="?page=restaurants" data-link>Browse Restaurants</a>
              </div>
              <div class="stats-grid">
                ${this.stat(this.state.stats.restaurants, "Restaurants")}
                ${this.stat(`${this.state.stats.menu_items}+`, "Menu Items")}
                ${this.stat(`${this.state.stats.orders_served}+`, "Orders Served")}
                ${this.stat(this.state.stats.delivery_time, "Min Delivery")}
              </div>
            </div>
            <div class="hero-plate" aria-label="Biryani plate"></div>
          </div>
        </section>
        <section class="section">
          <div class="container-page">
            <div class="section-head">
              <h2 class="section-title">Top Restaurants</h2>
              <a class="ghost-btn" href="?page=restaurants" data-link>View All</a>
            </div>
            <div class="restaurant-grid">${featuredRestaurants}</div>
          </div>
        </section>
      </main>`;
  },

  stat(value, label) {
    return `<div class="stat"><strong>${value}</strong><span>${label}</span></div>`;
  },

  restaurantCard(r) {
    return `
      <article class="restaurant-card" data-select-restaurant="${r.id}">
        <img src="${this.escape(r.image_url || "")}" alt="${this.escape(r.name)}">
        <div class="body">
          <div class="d-flex justify-content-between gap-2 align-items-start">
            <h3 class="h6 mb-1">${this.escape(r.name)}</h3>
            <span class="open-badge">${r.is_open ? "Open" : "Closed"}</span>
          </div>
          <p class="text-muted-soft small mb-2">${this.escape(r.cuisine || "")}</p>
          <div class="meta-row">
            <span><i class="bi bi-star-fill star"></i> ${Number(r.rating || 0).toFixed(1)}</span>
            <span>${this.escape(r.delivery_time || "30-45 min")}</span>
            <span>${Number(r.delivery_fee || 0) ? this.money(r.delivery_fee) : "Free Delivery"}</span>
          </div>
        </div>
      </article>`;
  },

  renderRestaurants() {
    return `
      <main class="section">
        <div class="container-page">
          <div class="section-head">
            <div>
              <h1 class="section-title">All Restaurants</h1>
              <p class="text-muted-soft mb-0">Search partner restaurants and discover what is open now.</p>
            </div>
          </div>
          <div class="toolbar">
            <input class="search-box" data-restaurant-search placeholder="Search restaurants..." />
            <button class="btn-outline-soft" data-open-filter><i class="bi bi-funnel"></i> Open Only</button>
          </div>
          <div class="restaurant-grid" data-restaurant-grid></div>
        </div>
      </main>`;
  },

  renderRestaurantRows(openOnly = false) {
    const q = (document.querySelector("[data-restaurant-search]")?.value || "").toLowerCase();
    const rows = this.state.restaurants.filter((r) => {
      const matches = `${r.name} ${r.cuisine} ${r.address}`.toLowerCase().includes(q);
      return matches && (!openOnly || r.is_open);
    });
    document.querySelector("[data-restaurant-grid]").innerHTML = rows.map((r) => this.restaurantCard(r)).join("") || this.empty("No restaurants found.");
  },

  renderMenu() {
    const selectedRestaurant = this.state.selectedRestaurantId 
      ? this.state.restaurants.find(r => r.id == this.state.selectedRestaurantId)
      : null;
    const chips = [`<button class="chip-btn active" data-category="all">All</button>`]
      .concat(this.state.categories.map((c) => `<button class="chip-btn" data-category="${c.id}">${this.escape(c.name)}</button>`))
      .join("");
    const backButton = selectedRestaurant
      ? `<button class="btn-outline-soft" data-back-to-restaurants><i class="bi bi-arrow-left"></i> Back to Restaurants</button>`
      : "";
    return `
      <main class="section">
        <div class="container-page">
          <div class="section-head">
            ${selectedRestaurant ? `<div><h1 class="section-title">Menu from ${this.escape(selectedRestaurant.name)}</h1><p class="text-muted-soft">Select items to add to your cart</p></div>` : `<h1 class="section-title">Our Menu</h1>`}
            ${backButton}
          </div>
          <div class="toolbar">
            <input class="search-box" data-menu-search placeholder="Search dishes..." />
            ${!selectedRestaurant ? '<div></div>' : ''}
          </div>
          <div class="filter-row mb-3">${chips}</div>
          <div class="menu-grid" data-menu-list></div>
        </div>
      </main>`;
  },

  renderMenuRows() {
    const active = document.querySelector(".chip-btn.active")?.dataset.category || "all";
    const q = (document.querySelector("[data-menu-search]")?.value || "").toLowerCase();
    let rows = this.state.menuItems.filter((item) => {
      const categoryMatch = active === "all" || String(item.category_id) === String(active);
      const textMatch = `${item.name} ${item.description} ${item.category_name}`.toLowerCase().includes(q);
      const restaurantMatch = !this.state.selectedRestaurantId || String(item.restaurant_id) === String(this.state.selectedRestaurantId);
      return categoryMatch && textMatch && restaurantMatch;
    });
    
    // Deduplicate by id (keep only first occurrence)
    const seenIds = new Set();
    rows = rows.filter((item) => {
      if (seenIds.has(item.id)) return false;
      seenIds.add(item.id);
      return true;
    });
    
    const gridHTML = rows.map((item) => `
      <article class="menu-card">
        <div class="menu-card-image">
         <img src="${this.escape(this.getDishImage(item))}" alt="${this.escape(item.name)}" onerror="this.onerror=null;this.src='assets/img/dishes/chicken-biryani.jpg';">
        </div>
        <div class="menu-card-body">
          <h2 class="h6 mb-1">${this.escape(item.name)}</h2>
          <p class="text-muted-soft small mb-2">${this.escape(item.description || "No description")}</p>
          <div class="menu-card-meta">
            <span><i class="bi bi-star-fill star"></i> ${Number(item.rating || 0).toFixed(1)}</span>
            <span>${this.escape(item.category_name || "")}</span>
          </div>
          <div class="menu-card-footer">
            <div class="price">${this.money(item.price)}</div>
            <button class="btn-premium btn-sm" data-add-cart="${item.id}">Add</button>
          </div>
        </div>
      </article>`).join("") || this.empty("No menu items found.");
    
    document.querySelector("[data-menu-list]").innerHTML = gridHTML;
  },

  renderCart() {
    return `
      <main class="section">
        <div class="container-page">
          <div class="section-head">
            <h1 class="section-title">Your Cart</h1>
            <a class="btn-outline-soft" href="?page=menu" data-link>Keep Ordering</a>
          </div>
          <div class="dashboard-grid">
            <div class="cart-list" data-cart-list></div>
            <aside class="panel" data-cart-summary></aside>
          </div>
        </div>
      </main>`;
  },

  renderCartRows() {
    const cart = this.state.cart || {};
    const list = document.querySelector("[data-cart-list]");
    const summary = document.querySelector("[data-cart-summary]");
    if (!cart.items?.length) {
      list.innerHTML = this.empty("Your cart is empty. Add something delicious from the menu.");
      summary.innerHTML = `<a class="btn-premium w-100" href="?page=menu" data-link>Browse Menu</a>`;
      return;
    }
    list.innerHTML = cart.items.map((item) => `
      <article class="cart-row">
        <img src="${this.escape(this.getDishImage(item))}" alt="${this.escape(item.name)}" onerror="this.onerror=null;this.src='assets/img/dishes/chicken-biryani.jpg';">
        <div>
          <h2 class="h6 mb-1">${this.escape(item.name)}</h2>
          <p class="text-muted-soft small mb-0">${this.money(item.price)} each</p>
        </div>
        <div class="d-flex align-items-center justify-content-end gap-3 flex-wrap">
          <div class="qty-box">
            <button data-qty="${item.menu_item_id}" data-value="${item.quantity - 1}"><i class="bi bi-dash"></i></button>
            <strong>${item.quantity}</strong>
            <button data-qty="${item.menu_item_id}" data-value="${item.quantity + 1}"><i class="bi bi-plus"></i></button>
          </div>
          <strong>${this.money(item.line_total)}</strong>
          <button class="round-btn btn-danger-soft" data-remove-cart="${item.menu_item_id}" aria-label="Remove"><i class="bi bi-trash"></i></button>
        </div>
      </article>`).join("");
    summary.innerHTML = `
      <h2 class="h5 mb-3">Order Summary</h2>
      ${this.totalLine("Subtotal", cart.subtotal)}
      ${this.totalLine("Delivery Fee", cart.delivery_fee)}
      <hr class="border-secondary">
      ${this.totalLine("Total", cart.total, true)}
      <a class="btn-premium w-100 mt-3" href="?page=checkout" data-link>Proceed to Checkout</a>`;
  },

  totalLine(label, value, strong = false) {
    return `<div class="d-flex justify-content-between mb-3 ${strong ? "h5" : ""}"><span>${label}</span><strong>${this.money(value)}</strong></div>`;
  },

  renderCheckout() {
    if (!this.state.user) return this.authRequired("customer");
    return `
      <main class="section">
        <div class="container-page">
          <div class="dashboard-grid">
            <form class="panel" data-checkout-form>
              <h1 class="section-title mb-3">Checkout</h1>
              <label class="form-label">Delivery Address</label>
              <textarea class="form-control-dark mb-3" name="address" rows="4" required>${this.escape(this.state.user.default_delivery_address || this.state.user.address || "")}</textarea>
              <label class="form-label">Order Notes</label>
              <textarea class="form-control-dark mb-3" name="notes" rows="3" placeholder="Any special instructions?"></textarea>
              <label class="form-label">Payment Method</label>
              <select class="form-select-dark mb-3" name="payment_method" data-payment-method>
                <option value="cash">Cash on Delivery</option>
                <option value="card">Card Payment</option>
                <option value="easypaisa">Easypaisa</option>
                <option value="jazzcash">JazzCash</option>
              </select>
              <div id="payment-details-form" class="mb-3" style="display:none;">
                <div id="payment-phone-group" class="mb-3" style="display:none;">
                  <label class="form-label">Mobile Number</label>
                  <input class="form-control-dark" name="payment_phone" placeholder="03XXXXXXXXX or +923XXXXXXXXX" data-payment-phone>
                </div>
                <div id="payment-reference-group" class="mb-3" style="display:none;">
                  <label class="form-label">Transaction ID / Reference</label>
                  <input class="form-control-dark" name="payment_reference" placeholder="Enter transaction ID" data-payment-reference>
                </div>
              </div>
              <button class="btn-premium w-100" type="submit">Place Order</button>
            </form>
            <aside class="panel">${this.renderCheckoutSummary()}</aside>
          </div>
        </div>
      </main>`;
  },

  renderCheckoutSummary() {
    const cart = this.state.cart;
    if (!cart.items?.length) return `<p class="text-muted-soft">Your cart is empty.</p><a class="btn-premium" href="?page=menu" data-link>Browse Menu</a>`;
    
    const offer = this.state.appliedOffer;
    let discount = 0;
    if (offer) {
      if (offer.type === 'free_delivery') {
        discount = cart.delivery_fee;
      } else if (offer.type === 'discount_percent') {
        discount = (cart.subtotal * offer.discount_value) / 100;
        if (offer.max_discount && discount > offer.max_discount) {
          discount = offer.max_discount;
        }
      } else if (offer.type === 'discount_fixed') {
        discount = Math.min(offer.discount_value, cart.subtotal + cart.delivery_fee);
      }
    }
    
    const total = cart.subtotal + cart.delivery_fee - discount;
    
    return `
      <h2 class="h5 mb-3">Your Items</h2>
      ${cart.items.map((item) => `<div class="d-flex justify-content-between mb-2"><span>${item.quantity} x ${this.escape(item.name)}</span><strong>${this.money(item.line_total)}</strong></div>`).join("")}
      <hr class="border-secondary">
      ${this.totalLine("Subtotal", cart.subtotal)}
      ${this.totalLine("Delivery Fee", cart.delivery_fee)}
      ${offer ? `
        <div class="d-flex justify-content-between mb-3">
          <span style="color: var(--green)"><i class="bi bi-check-circle"></i> ${this.escape(offer.title)}</span>
          <strong style="color: var(--green)">-${this.money(discount)}</strong>
        </div>
      ` : ''}
      <hr class="border-secondary">
      ${this.totalLine("Total", total, true)}`;
  },

  renderSuccess() {
    const id = sessionStorage.getItem("lastOrderId");
    return `
      <main class="auth-wrap">
        <div class="auth-card text-center" style="max-width:560px">
          <div class="role-icon mx-auto mb-3"><i class="bi bi-check2"></i></div>
          <h1 class="section-title">Order placed successfully</h1>
          <p class="text-muted-soft">Your FoodExpress order is in the kitchen queue.</p>
          <div class="d-flex gap-2 justify-content-center flex-wrap">
            <a class="btn-premium" href="?page=track${id ? `&order_id=${id}` : ""}" data-link>Track Order</a>
            <a class="btn-outline-soft" href="?page=orders" data-link>My Orders</a>
          </div>
        </div>
      </main>`;
  },

  renderOrders() {
    if (!this.state.user) return this.authRequired("customer");
    return `
      <main class="section">
        <div class="container-page">
          <div class="section-head"><h1 class="section-title">My Orders</h1></div>
          <div class="order-list" data-orders></div>
        </div>
      </main>`;
  },

  async loadOrders() {
    const target = document.querySelector("[data-orders]");
    try {
      const data = await this.api("orders", "list");
      target.innerHTML = (data.orders || []).map((o) => this.orderRow(o)).join("") || this.empty("You have not placed any orders yet.");
    } catch (error) {
      target.innerHTML = this.empty(error.message);
    }
  },

  orderRow(o) {
    return `
      <article class="order-row">
        <div class="avatar"><i class="bi bi-receipt"></i></div>
        <div>
          <h2 class="h6 mb-1">${this.escape(o.order_number)}</h2>
          <p class="text-muted-soft small mb-0">${this.date(o.created_at)} · ${this.escape(o.payment_method || "cash")}</p>
        </div>
        <div class="d-flex align-items-center justify-content-end gap-2 flex-wrap">
          <span class="status-badge ${this.escape(o.status)}">${this.status(o.status)}</span>
          <strong>${this.money(o.total_amount)}</strong>
          <a class="btn-outline-soft" href="?page=track&order_id=${o.id}" data-link>Track</a>
        </div>
      </article>`;
  },

  renderTrack() {
    if (!this.state.user) return this.authRequired("customer");
    return `
      <main class="section">
        <div class="container-page">
          <div class="section-head">
            <h1 class="section-title">Track Order</h1>
            <button class="btn-outline-soft" data-refresh-track><i class="bi bi-arrow-clockwise"></i> Refresh</button>
          </div>
          <div data-tracking></div>
        </div>
      </main>`;
  },

  async loadTracking() {
    const target = document.querySelector("[data-tracking]");
    const orderId = this.params().get("order_id");
    try {
      if (orderId) {
        const data = await this.api("orders", "detail", { query: `id=${encodeURIComponent(orderId)}` });
        target.innerHTML = this.trackingPanel(data.order);
      } else {
        const data = await this.api("orders", "current");
        target.innerHTML = (data.orders || []).map((o) => this.orderRow(o)).join("") || this.empty("No live orders right now.");
      }
    } catch (error) {
      target.innerHTML = this.empty(error.message);
    }
  },

  trackingPanel(order) {
    const steps = ["pending", "accepted", "preparing", "assigned_to_delivery_man", "picked_up", "out_for_delivery", "delivered"];
    const currentIndex = Math.max(0, steps.indexOf(order.status));
    return `
      <div class="dashboard-grid">
        <section class="panel">
          <div class="d-flex justify-content-between gap-3 flex-wrap mb-3">
            <div>
              <h2 class="h4 mb-1">${this.escape(order.order_number)}</h2>
              <p class="text-muted-soft mb-0">${this.escape(order.delivery_address || "")}</p>
            </div>
            <span class="status-badge ${this.escape(order.status)}">${this.status(order.status)}</span>
          </div>
          <div class="timeline">
            ${steps.map((step, index) => `<div class="timeline-step ${index <= currentIndex ? "done" : ""}"><span class="timeline-dot"><i class="bi bi-check"></i></span><div><strong>${this.status(step)}</strong><p class="small mb-0">${index <= currentIndex ? "Updated" : "Waiting"}</p></div></div>`).join("")}
          </div>
        </section>
        <aside class="panel">
          <h3 class="h5">Order Details</h3>
          ${(order.items || []).map((i) => `<div class="d-flex justify-content-between mb-2"><span>${i.quantity} x ${this.escape(i.item_name)}</span><strong>${this.money(i.line_total)}</strong></div>`).join("")}
          <hr class="border-secondary">
          ${this.totalLine("Total", order.total_amount, true)}
          ${order.delivery_man_name ? `<p class="text-muted-soft mb-0"><i class="bi bi-scooter"></i> ${this.escape(order.delivery_man_name)} · ${this.escape(order.delivery_man_phone || "")}</p>` : ""}
        </aside>
      </div>`;
  },

  renderOffers() {
    const now = new Date();
    const activeOffers = (this.state.offers || []).filter(o => {
      const start = new Date(o.start_date);
      const end = new Date(o.end_date);
      return o.is_active && start <= now && now <= end;
    });

    const offersHTML = activeOffers.length
      ? activeOffers.map((offer) => `
        <article class="dashboard-card">
          <span class="location-chip"><i class="bi bi-stars"></i> ${offer.type === 'free_delivery' ? 'Free Delivery' : 'Limited Offer'}</span>
          <h2 class="h5 mt-3">${this.escape(offer.title)}</h2>
          <p class="text-muted-soft">${this.escape(offer.description || '')}</p>
          <div class="text-muted-soft small mb-2">
            ${offer.min_order_amount > 0 ? `<p>Min order: ${this.money(offer.min_order_amount)}</p>` : ''}
          </div>
          <a class="btn-premium" href="?page=menu" data-link>Order Now</a>
        </article>`).join("")
      : '<p class="text-muted-soft">No active offers at the moment. Check back soon!</p>';

    return `
      <main class="section">
        <div class="container-page">
          <div class="section-head"><h1 class="section-title">Active Offers</h1></div>
          <div class="cards-grid">${offersHTML}</div>
        </div>
      </main>`;
  },

  renderProfile() {
    if (!this.state.user) return this.authRequired("customer");
    return `
      <main class="section">
        <div class="container-page">
          <form class="panel" data-profile-form style="max-width:720px">
            <h1 class="section-title mb-3">Customer Profile</h1>
            <label class="form-label">Full Name</label>
            <input class="form-control-dark mb-3" name="full_name" value="${this.escape(this.state.user.full_name || "")}" required>
            <label class="form-label">Phone</label>
            <input class="form-control-dark mb-3" name="phone" value="${this.escape(this.state.user.phone || "")}" required>
            <label class="form-label">Address</label>
            <textarea class="form-control-dark mb-3" name="address" rows="3">${this.escape(this.state.user.address || "")}</textarea>
            <button class="btn-premium" type="submit">Save Profile</button>
          </form>
        </div>
      </main>`;
  },

  renderLogin() {
    const role = this.params().get("role") || "customer";
    return `
      <main class="auth-wrap">
        <div class="auth-shell">
          <section class="auth-card">
            <a class="brand mb-4" href="?page=home" data-link><i class="bi bi-bag-heart"></i> Food<span>Express</span></a>
            <h1 class="h3 fw-bold">Welcome to <span style="color:var(--gold)">FoodExpress</span></h1>
            <p class="text-muted-soft">Please select your account type to continue.</p>
            <div class="role-grid">
              ${this.roleCard("customer", "Customer", "Order food, track orders and enjoy delicious meals", "bi-person-fill", role)}
              ${this.roleCard("delivery", "Delivery Partner", "Deliver orders and earn with flexible schedule", "bi-scooter", role)}
              ${this.roleCard("admin", "Administrator", "Manage restaurants, orders, users and platform", "bi-people-fill", role)}
            </div>
          </section>
          <section class="auth-card">${this.loginForm(role)}</section>
        </div>
      </main>`;
  },

  roleCard(key, title, text, icon, active) {
    return `
      <button class="role-card ${key} ${active === key ? "active" : ""}" data-role="${key}">
        <span class="role-icon ${key}"><i class="bi ${icon}"></i></span>
        <span class="text-start"><strong>${title}</strong><small class="d-block text-muted-soft">${text}</small></span>
        <i class="bi bi-chevron-right"></i>
      </button>`;
  },

 loginForm(role) {
    const config = {
      customer: ["Customer Login", "btn-premium btn-gold", "customer@foodexpress.com", "Customer123!"],
      delivery: ["Delivery Partner Login", "btn-premium btn-blue", "rider@foodexpress.com", "Rider123!"],
      admin: ["Administrator Login", "btn-premium btn-purple", "admin@foodexpress.com", "Admin123!"]
    }[role] || ["Customer Login", "btn-premium btn-gold", "customer@foodexpress.com", "Customer123!"];

    return `
      <h2 class="h4 fw-bold">${config[0]}</h2>
      <form data-login-form data-role-form="${role}">
        <label class="form-label">Email</label>
        <input class="form-control-dark mb-3" name="email" type="email" placeholder="${config[2]}" required>
        <label class="form-label">Password</label>
        <div class="password-wrap mb-3">
          <input class="form-control-dark" name="password" type="password" placeholder="${config[3]}" data-password-input required>
          <button type="button" data-toggle-password aria-label="Toggle password visibility"><i class="bi bi-eye-slash"></i></button>
        </div>
        <button class="${config[1]} w-100" type="submit">Login</button>
      </form>
      ${role === "customer" ? `<p class="text-muted-soft text-center mt-3 mb-0">Do not have an account? <a style="color:var(--gold)" href="?page=register" data-link>Register here</a></p>` : `<p class="text-muted-soft small mt-3 mb-0">Admin and delivery accounts are created by administrators.</p>`}`;
  },

  renderRegister() {
    return `
      <main class="auth-wrap">
        <form class="auth-card" data-register-form style="width:min(620px,100%)">
          <a class="brand mb-4" href="?page=home" data-link><i class="bi bi-bag-heart"></i> Food<span>Express</span></a>
          <h1 class="h3 fw-bold">Create Customer Account</h1>
          <div class="row g-3 mt-1">
            <div class="col-md-6"><label class="form-label">Full Name</label><input class="form-control-dark" name="full_name" required></div>
            <div class="col-md-6"><label class="form-label">Phone</label><input class="form-control-dark" name="phone" placeholder="03212345678" required></div>
            <div class="col-12"><label class="form-label">Email</label><input class="form-control-dark" name="email" type="email" required></div>
            <div class="col-12"><label class="form-label">Address</label><textarea class="form-control-dark" name="address" rows="3"></textarea></div>
            <div class="col-md-6">
              <label class="form-label">Password</label>
              <div class="password-wrap">
                <input class="form-control-dark" name="password" type="password" data-password-input required>
                <button type="button" data-toggle-password aria-label="Toggle password visibility"><i class="bi bi-eye-slash"></i></button>
              </div>
            </div>
            <div class="col-md-6">
              <label class="form-label">Confirm Password</label>
              <div class="password-wrap">
                <input class="form-control-dark" name="confirm_password" type="password" data-password-input required>
                <button type="button" data-toggle-password aria-label="Toggle password visibility"><i class="bi bi-eye-slash"></i></button>
              </div>
            </div>
          </div>
          <button class="btn-premium w-100 mt-4" type="submit">Register</button>
          <p class="text-muted-soft text-center mt-3 mb-0">Already registered? <a style="color:var(--gold)" href="?page=login" data-link>Login here</a></p>
        </form>
      </main>`;
  },

  authRequired(role) {
    return `
      <main class="auth-wrap">
        <div class="auth-card text-center" style="max-width:520px">
          <h1 class="h3 fw-bold">Login required</h1>
          <p class="text-muted-soft">Please login as ${role} to continue.</p>
          <a class="btn-premium" href="?page=login&role=${role === "customer" ? "customer" : role}" data-link>Login</a>
        </div>
      </main>`;
  },

  async renderAdmin() {
    if (!this.state.user || this.state.user.role !== "admin") {
      this.root.innerHTML = this.renderLoginRedirect("admin");
      return;
    }
    const view = this.view();
    this.root.innerHTML = this.dashboardShell("admin", view, await this.adminContent(view));
    await this.afterAdminRender(view);
  },

  renderLoginRedirect(role) {
    return `<main class="auth-wrap"><div class="auth-card text-center"><h1 class="h3 fw-bold">Protected Area</h1><p class="text-muted-soft">Please login first.</p><a class="btn-premium ${role === "admin" ? "btn-purple" : "btn-blue"}" href="?page=login&role=${role}" data-link>Login</a></div></main>`;
  },

  dashboardShell(type, active, content) {
    const isDelivery = type === "delivery";
    const links = isDelivery
      ? [["dashboard", "bi-speedometer2", "Dashboard"], ["assigned", "bi-box-seam", "Assigned Orders"], ["history", "bi-clock-history", "History"], ["earnings", "bi-cash-stack", "Earnings"], ["profile", "bi-person", "Profile"]]
      : [["dashboard", "bi-speedometer2", "Dashboard"], ["restaurants", "bi-shop", "Restaurants"], ["categories", "bi-tags", "Categories"], ["menu", "bi-journal-text", "Menu Items"], ["orders", "bi-receipt", "Orders"], ["reservations", "bi-calendar-check", "Reservations"], ["users", "bi-people", "Users"], ["delivery", "bi-scooter", "Delivery Partners"], ["reports", "bi-graph-up", "Reports"], ["settings", "bi-gear", "Settings"]];
    const name = isDelivery ? this.state.deliveryMan?.full_name : this.state.user?.full_name;
    const base = isDelivery ? "?page=delivery" : "?page=admin";
    return `
      <div class="dashboard-layout ${isDelivery ? "delivery-theme" : ""}">
        <aside class="sidebar">
          <a class="brand" href="?page=home" data-link><i class="bi bi-bag-heart"></i> Food<span>Express</span></a>
          <nav class="sidebar-links">
            ${links.map(([key, icon, label]) => `<a class="${active === key ? "active" : ""}" href="${base}&view=${key}" data-link><i class="bi ${icon}"></i>${label}</a>`).join("")}
            <a href="#" data-logout><i class="bi bi-box-arrow-right"></i>Logout</a>
          </nav>
        </aside>
        <main class="dashboard-main">
          <div class="dashboard-top">
            <div><h1 class="h3 fw-bold mb-1">${isDelivery ? "Delivery Partner" : "Admin"} Dashboard</h1><p class="text-muted-soft mb-0">${this.title(active)}</p></div>
            <div class="d-flex align-items-center gap-2"><span class="avatar ${isDelivery ? "blue" : "purple"}">${(name || "U").charAt(0)}</span><div><strong>${this.escape(name || "")}</strong><small class="d-block text-muted-soft">${isDelivery ? "Online Rider" : "Administrator"}</small></div></div>
          </div>
          ${content}
        </main>
      </div>`;
  },

  async adminContent(view) {
    if (view === "dashboard") return this.adminDashboard();
    if (view === "restaurants") return this.crudPanel("restaurants", "Restaurants", ["name", "cuisine", "address", "delivery_time", "delivery_fee", "rating", "image_url"]);
    if (view === "categories") return this.crudPanel("categories", "Categories", ["name", "description"]);
    if (view === "menu") {
      await this.loadPublicData();
      return this.menuCrudPanel();
    }
    if (view === "orders") return `<section class="panel"><div class="section-head"><h2 class="h4">Orders Management</h2></div><div data-admin-orders></div></section>`;
    if (view === "reservations") return `<section class="panel"><div class="section-head"><h2 class="h4">Reservations</h2></div><div data-admin-reservations></div></section>`;
    if (view === "users") return this.userCrudPanel();
    if (view === "delivery") return this.deliveryCrudPanel();
    if (view === "reports") return `<section class="panel"><div class="section-head"><h2 class="h4">Reports</h2></div><div data-admin-reports></div></section>`;
    return `<section class="panel"><h2 class="h4">Settings</h2><p class="text-muted-soft">Platform settings are protected. Update account details from user management.</p></section>`;
  },

  async adminDashboard() {
    try {
      const [dashboard, reports] = await Promise.all([this.api("admin", "dashboard"), this.api("reports", "dashboard").catch(() => ({}))]);
      const stats = dashboard.stats || {};
      const cards = [
        ["Total Orders", stats.total_orders || 0],
        ["Total Revenue", this.money(stats.total_revenue || 0)],
        ["Total Customers", stats.total_users || 0],
        ["Pending Orders", stats.pending_orders || 0]
      ].map(([label, value]) => `<div class="dashboard-card"><span class="text-muted-soft">${label}</span><strong>${value}</strong><small class="text-success">Live database</small></div>`).join("");
      const top = reports.top_selling_items || [];
      return `
        <div class="stat-cards">${cards}</div>
        <div class="dashboard-grid">
          <section class="panel">
            <div class="section-head"><h2 class="h5">Recent Orders</h2><a class="ghost-btn" href="?page=admin&view=orders" data-link>View All</a></div>
            ${this.table(["Order", "Customer", "Total", "Status"], (dashboard.recent_orders || []).map((o) => [o.order_number, o.customer_name, this.money(o.total_amount), this.badge(o.status)]))}
          </section>
          <aside class="panel">
            <h2 class="h5">Sales Overview</h2>
            <div class="chart-bars">${[28, 44, 63, 61, 88, 70, 64, 74, 69, 82].map((h) => `<span class="chart-bar" style="height:${h}%"></span>`).join("")}</div>
            <h2 class="h5 mt-4">Top Selling Items</h2>
            ${(top.length ? top : [{ item_name: "Chicken Biryani", quantity_sold: 45 }, { item_name: "Chicken Karahi", quantity_sold: 38 }, { item_name: "Beef Biryani", quantity_sold: 32 }]).slice(0, 5).map((i) => `<div class="d-flex justify-content-between mb-2"><span>${this.escape(i.item_name)}</span><strong>${i.quantity_sold || 0} orders</strong></div>`).join("")}
          </aside>
        </div>`;
    } catch (error) {
      return `<section class="panel">${this.empty(error.message)}</section>`;
    }
  },

  async afterAdminRender(view) {
    if (["restaurants", "categories"].includes(view)) this.loadCrud(view);
    if (view === "menu") this.loadMenuCrud();
    if (view === "orders") this.loadAdminOrders();
    if (view === "reservations") this.loadAdminReservations();
    if (view === "users") this.loadUsers();
    if (view === "delivery") this.loadDeliveryPartners();
    if (view === "reports") this.loadReports();
  },

  crudPanel(type, title, fields) {
    return `
      <section class="panel">
        <div class="section-head"><h2 class="h4">${title}</h2></div>
        <form class="mini-form mb-4" data-crud-form="${type}">
          <input type="hidden" name="id">
          ${fields.map((f) => `<input class="form-control-dark ${f.includes("address") || f.includes("image") || f === "description" ? "wide" : ""}" name="${f}" placeholder="${this.title(f)}">`).join("")}
          <button class="btn-premium" type="submit">Save</button>
        </form>
        <div data-crud-table="${type}"></div>
      </section>`;
  },

  async loadCrud(type) {
    const data = await this.api(type, "list");
    const rows = data.restaurants || data.categories || [];
    const tableRows = rows.map((row) => {
      const cells = type === "restaurants"
        ? [row.name, row.cuisine, row.delivery_time, this.money(row.delivery_fee), row.rating, row.is_open ? "Open" : "Closed"]
        : [row.name, row.description || "", row.item_count || 0, row.is_active ? "Active" : "Inactive"];
      return cells.concat(`<button class="btn-outline-soft btn-sm" data-edit='${this.attr(row)}'>Edit</button> <button class="btn-danger-soft btn-sm" data-delete-${type}="${row.id}">Delete</button>`);
    });
    document.querySelector(`[data-crud-table="${type}"]`).innerHTML = this.table(type === "restaurants" ? ["Name", "Cuisine", "Time", "Fee", "Rating", "Status", "Actions"] : ["Name", "Description", "Items", "Status", "Actions"], tableRows);
  },

  menuCrudPanel() {
    return `
      <section class="panel">
        <div class="section-head"><h2 class="h4">Menu Items</h2></div>
        <form class="mini-form mb-4" data-menu-form>
          <input type="hidden" name="id">
          <input class="form-control-dark" name="name" placeholder="Name" required>
          <select class="form-select-dark" name="category_id" required>${this.state.categories.map((c) => `<option value="${c.id}">${this.escape(c.name)}</option>`).join("")}</select>
          <input class="form-control-dark" name="price" placeholder="Price" type="number" step="0.01" required>
          <input class="form-control-dark" name="rating" placeholder="Rating" type="number" step="0.1" value="4.5">
          <input class="form-control-dark wide" name="image_url" placeholder="Image URL">
          <textarea class="form-control-dark wide" name="description" placeholder="Description"></textarea>
          <label class="d-flex align-items-center gap-2"><input type="checkbox" name="is_available" checked> Available</label>
          <label class="d-flex align-items-center gap-2"><input type="checkbox" name="is_featured"> Featured</label>
          <button class="btn-premium" type="submit">Save Item</button>
        </form>
        <div data-menu-admin-table></div>
      </section>`;
  },

  async loadMenuCrud() {
    await this.loadPublicData();
    const rows = this.state.menuItems.map((item) => [item.name, item.category_name, this.money(item.price), item.is_available ? "Available" : "Hidden", `<button class="btn-outline-soft btn-sm" data-edit-menu='${this.attr(item)}'>Edit</button> <button class="btn-danger-soft btn-sm" data-delete-menu="${item.id}">Delete</button>`]);
    document.querySelector("[data-menu-admin-table]").innerHTML = this.table(["Item", "Category", "Price", "Status", "Actions"], rows);
  },

  userCrudPanel() {
    return `
      <section class="panel">
        <div class="section-head"><h2 class="h4">Users Management</h2></div>
        <form class="mini-form mb-4" data-user-form>
          <input type="hidden" name="id"><input class="form-control-dark" name="full_name" placeholder="Name" required>
          <input class="form-control-dark" name="email" type="email" placeholder="Email">
          <input class="form-control-dark" name="phone" placeholder="Phone" required>
          <select class="form-select-dark" name="role"><option value="customer">Customer</option><option value="admin">Admin</option></select>
          <input class="form-control-dark wide" name="address" placeholder="Address">
          <input class="form-control-dark" name="password" placeholder="Password" type="password">
          <button class="btn-premium" type="submit">Save User</button>
        </form>
        <div data-users-table></div>
      </section>`;
  },

  async loadUsers() {
    const data = await this.api("users", "list", { query: "role=customer" });
    const admins = await this.api("users", "list", { query: "role=admin" }).catch(() => ({ users: [] }));
    const users = (data.users || []).concat(admins.users || []);
    document.querySelector("[data-users-table]").innerHTML = this.table(["Name", "Email", "Phone", "Role", "Joined", "Actions"], users.map((u) => [u.full_name, u.email, u.phone, u.role, this.date(u.created_at), `<button class="btn-outline-soft btn-sm" data-edit-user='${this.attr(u)}'>Edit</button> <button class="btn-danger-soft btn-sm" data-block-user="${u.id}">${u.is_blocked ? "Unblock" : "Block"}</button>`]));
  },

  deliveryCrudPanel() {
    return `
      <section class="panel">
        <div class="section-head"><h2 class="h4">Delivery Partners</h2></div>
        <form class="mini-form mb-4" data-delivery-form>
          <input type="hidden" name="id"><input class="form-control-dark" name="full_name" placeholder="Name" required>
          <input class="form-control-dark" name="email" type="email" placeholder="Email">
          <input class="form-control-dark" name="phone" placeholder="Phone" required>
          <input class="form-control-dark" name="vehicle_number" placeholder="Vehicle Number" required>
          <input class="form-control-dark" name="commission_rate" placeholder="Commission %" type="number" step="0.01" value="5">
          <input class="form-control-dark" name="password" placeholder="Password" type="password">
          <button class="btn-premium" type="submit">Save Partner</button>
        </form>
        <div data-delivery-table></div>
      </section>`;
  },

  async loadDeliveryPartners() {
    const data = await this.api("delivery", "admin_list");
    const rows = (data.delivery_men || []).map((d) => [d.full_name, d.email, d.phone, d.vehicle_number, d.status, `${d.commission_rate}%`, `<button class="btn-outline-soft btn-sm" data-edit-delivery='${this.attr(d)}'>Edit</button> <button class="btn-danger-soft btn-sm" data-disable-delivery="${d.id}">Deactivate</button>`]);
    document.querySelector("[data-delivery-table]").innerHTML = this.table(["Name", "Email", "Phone", "Vehicle", "Status", "Commission", "Actions"], rows);
  },

  async loadAdminOrders() {
    const [orders, delivery] = await Promise.all([this.api("orders", "admin_list"), this.api("delivery", "admin_list").catch(() => ({ delivery_men: [] }))]);
    const options = (delivery.delivery_men || []).map((d) => `<option value="${d.id}">${this.escape(d.full_name)}</option>`).join("");
    const rows = (orders.orders || []).map((o) => [o.order_number, o.customer_name, this.money(o.total_amount), this.badge(o.status), o.delivery_man_name || "Unassigned", `
      <select class="form-select-dark mb-2" data-status-for="${o.id}"><option value="accepted">Accepted</option><option value="preparing">Preparing</option><option value="ready_for_pickup">Ready</option><option value="delivered">Delivered</option><option value="cancelled">Cancelled</option></select>
      <button class="btn-outline-soft btn-sm" data-admin-status="${o.id}">Update</button>
      <select class="form-select-dark my-2" data-rider-for="${o.id}">${options}</select>
      <button class="btn-premium btn-sm" data-assign="${o.id}">Assign</button>`]);
    document.querySelector("[data-admin-orders]").innerHTML = this.table(["Order", "Customer", "Total", "Status", "Rider", "Actions"], rows);
  },

  async loadAdminReservations() {
    const data = await this.api("reservations", "admin_list");
    const rows = (data.reservations || []).map((r) => [r.reservation_number, r.guest_name, `${r.reservation_date} ${r.reservation_time}`, r.guests, this.badge(r.status), `<button class="btn-outline-soft btn-sm" data-reservation-action="confirm:${r.id}">Confirm</button> <button class="btn-outline-soft btn-sm" data-reservation-action="complete:${r.id}">Complete</button> <button class="btn-danger-soft btn-sm" data-reservation-action="admin_cancel:${r.id}">Cancel</button>`]);
    document.querySelector("[data-admin-reservations]").innerHTML = this.table(["Reservation", "Guest", "Date", "Guests", "Status", "Actions"], rows);
  },

  async loadReports() {
    const data = await this.api("reports", "dashboard");
    document.querySelector("[data-admin-reports]").innerHTML = `
      <div class="stat-cards">
        <div class="dashboard-card"><span class="text-muted-soft">Total Revenue</span><strong>${this.money(data.total_revenue?.revenue || 0)}</strong></div>
        <div class="dashboard-card"><span class="text-muted-soft">Delivered Orders</span><strong>${data.total_revenue?.delivered_orders || 0}</strong></div>
        <div class="dashboard-card"><span class="text-muted-soft">Cancelled</span><strong>${data.cancelled_orders_count?.count || 0}</strong></div>
        <div class="dashboard-card"><span class="text-muted-soft">Today Revenue</span><strong>${this.money(data.daily_sales?.revenue || 0)}</strong></div>
      </div>
      <div class="dashboard-grid">
        <section class="panel"><h3 class="h5">Top Selling Items</h3>${this.table(["Item", "Qty", "Revenue"], (data.top_selling_items || []).map((i) => [i.item_name, i.quantity_sold, this.money(i.revenue)]))}</section>
        <section class="panel"><h3 class="h5">Delivery Performance</h3>${this.table(["Rider", "Done", "Failed"], (data.delivery_man_performance || []).map((d) => [d.full_name, d.completed_deliveries || 0, d.failed_deliveries || 0]))}</section>
      </div>`;
  },

  async renderDelivery() {
    if (!this.state.deliveryMan) {
      this.root.innerHTML = this.renderLoginRedirect("delivery");
      return;
    }
    const view = this.view();
    this.root.innerHTML = this.dashboardShell("delivery", view, await this.deliveryContent(view));
    await this.afterDeliveryRender(view);
  },

  async deliveryContent(view) {
    if (view === "dashboard") {
      const data = await this.api("delivery", "dashboard");
      const s = data.stats || {};
      return `
        <div class="stat-cards">
          <div class="dashboard-card"><span class="text-muted-soft">Assigned Orders</span><strong>${s.pending_pickups || 0}</strong></div>
          <div class="dashboard-card"><span class="text-muted-soft">Completed Orders</span><strong>${s.completed_deliveries || 0}</strong></div>
          <div class="dashboard-card"><span class="text-muted-soft">Earnings</span><strong>${this.money(s.estimated_commission || 0)}</strong></div>
          <div class="dashboard-card"><span class="text-muted-soft">Rating</span><strong>4.8 <span class="star">★</span></strong></div>
        </div>
        <section class="panel"><div class="section-head"><h2 class="h5">Assigned Orders</h2><a class="ghost-btn" href="?page=delivery&view=assigned" data-link>View All</a></div><div data-delivery-assigned></div></section>`;
    }
    if (view === "assigned") return `<section class="panel"><div class="section-head"><h2 class="h4">Assigned Orders</h2></div><div data-delivery-assigned></div></section>`;
    if (view === "history") return `<section class="panel"><div class="section-head"><h2 class="h4">Delivery History</h2></div><div data-delivery-history></div></section>`;
    if (view === "earnings") return `<section class="panel"><div class="section-head"><h2 class="h4">Earnings</h2></div><div data-delivery-earnings></div></section>`;
    return `
      <form class="panel" data-delivery-profile-form style="max-width:680px">
        <h2 class="h4">Delivery Partner Profile</h2>
        <label class="form-label">Name</label><input class="form-control-dark mb-3" value="${this.escape(this.state.deliveryMan.full_name)}" disabled>
        <label class="form-label">Phone</label><input class="form-control-dark mb-3" name="phone" value="${this.escape(this.state.deliveryMan.phone || "")}" required>
        <label class="form-label">Vehicle</label><input class="form-control-dark mb-3" value="${this.escape(this.state.deliveryMan.vehicle_number || "")}" disabled>
        <button class="btn-premium btn-blue" type="submit">Save Profile</button>
      </form>`;
  },

  async afterDeliveryRender(view) {
    if (["dashboard", "assigned"].includes(view)) this.loadAssignedDeliveries();
    if (view === "history") this.loadDeliveryHistory();
    if (view === "earnings") this.loadDeliveryEarnings();
  },

  async loadAssignedDeliveries() {
    const data = await this.api("delivery", "assigned");
    const rows = (data.orders || []).map((o) => [o.order_number, o.customer_name, this.money(o.total_amount), this.status(o.assignment?.status || o.status), `
      ${this.deliveryActionButton(o)}
    `]);
    document.querySelector("[data-delivery-assigned]").innerHTML = this.table(["Order", "Customer", "Total", "Status", "Action"], rows);
  },

  deliveryActionButton(order) {
    const status = order.assignment?.status || "assigned";
    const next = { assigned: ["accepted", "Accept"], accepted: ["picked_up", "Mark Picked Up"], picked_up: ["out_for_delivery", "Out for Delivery"], out_for_delivery: ["delivered", "Mark Delivered"] }[status];
    if (!next) return `<span class="text-muted-soft">No action</span>`;
    return `<button class="btn-premium btn-blue btn-sm" data-delivery-status="${order.id || order.order_id}:${next[0]}">${next[1]}</button>`;
  },

  async loadDeliveryHistory() {
    const data = await this.api("delivery", "history");
    document.querySelector("[data-delivery-history]").innerHTML = this.table(["Order", "Customer", "Total", "Status", "Delivered"], (data.orders || []).map((o) => [o.order_number, o.customer_name, this.money(o.total_amount), this.badge(o.assignment?.status || o.status), this.date(o.updated_at)]));
  },

  async loadDeliveryEarnings() {
    const [dash, history] = await Promise.all([this.api("delivery", "dashboard"), this.api("delivery", "history").catch(() => ({ orders: [] }))]);
    document.querySelector("[data-delivery-earnings]").innerHTML = `
      <div class="stat-cards">
        <div class="dashboard-card"><span class="text-muted-soft">Estimated Commission</span><strong>${this.money(dash.stats?.estimated_commission || 0)}</strong></div>
        <div class="dashboard-card"><span class="text-muted-soft">Completed</span><strong>${dash.stats?.completed_deliveries || 0}</strong></div>
        <div class="dashboard-card"><span class="text-muted-soft">Failed</span><strong>${dash.stats?.failed_deliveries || 0}</strong></div>
        <div class="dashboard-card"><span class="text-muted-soft">Rate</span><strong>${this.state.deliveryMan.commission_rate || 0}%</strong></div>
      </div>
      ${this.table(["Order", "Value", "Status"], (history.orders || []).map((o) => [o.order_number, this.money(o.total_amount), this.badge(o.assignment?.status || o.status)]))}`;
  },

  table(headers, rows) {
    return `<div class="table-responsive"><table class="table-premium"><thead><tr>${headers.map((h) => `<th>${h}</th>`).join("")}</tr></thead><tbody>${rows.length ? rows.map((r) => `<tr>${r.map((c) => `<td>${c}</td>`).join("")}</tr>`).join("") : `<tr><td colspan="${headers.length}">${this.empty("No records found.")}</td></tr>`}</tbody></table></div>`;
  },

  badge(status) {
    return `<span class="status-badge ${this.escape(status || "")}">${this.status(status)}</span>`;
  },

  async onClick(event) {
    const link = event.target.closest("[data-link]");
    if (link) {
      event.preventDefault();
      return this.go(link.getAttribute("href"));
    }

    // Password visibility toggle
    const toggleBtn = event.target.closest("[data-toggle-password]");
    if (toggleBtn) {
      event.preventDefault();
      const input = toggleBtn.closest(".password-wrap").querySelector("[data-password-input]");
      const icon = toggleBtn.querySelector("i");
      if (input.type === "password") {
        input.type = "text";
        icon.classList.remove("bi-eye-slash");
        icon.classList.add("bi-eye");
      } else {
        input.type = "password";
        icon.classList.remove("bi-eye");
        icon.classList.add("bi-eye-slash");
      }
      return;
    }

    if (event.target.closest("[data-mobile-nav]")) {
      document.querySelector("[data-nav-links]")?.classList.toggle("open");
    }

    const role = event.target.closest("[data-role]");
    if (role) return this.go(`?page=login&role=${role.dataset.role}`);

    if (event.target.closest("[data-logout]")) {
      event.preventDefault();
      return this.logout();
    }

    // Restaurant selection
    const selectRestaurant = event.target.closest("[data-select-restaurant]");
    if (selectRestaurant) {
      this.state.selectedRestaurantId = selectRestaurant.dataset.selectRestaurant;
      return this.go("?page=menu");
    }

    // Back to restaurants button
    if (event.target.closest("[data-back-to-restaurants]")) {
      event.preventDefault();
      this.state.selectedRestaurantId = null;
      return this.go("?page=restaurants");
    }

    const category = event.target.closest("[data-category]");
    if (category) {
      document.querySelectorAll("[data-category]").forEach((el) => el.classList.remove("active"));
      category.classList.add("active");
      return this.renderMenuRows();
    }

    if (event.target.closest("[data-open-filter]")) {
      event.target.closest("[data-open-filter]").classList.toggle("active");
      return this.renderRestaurantRows(event.target.closest("[data-open-filter]").classList.contains("active"));
    }

    const add = event.target.closest("[data-add-cart]");
    if (add) return this.addCart(add.dataset.addCart);

    const qty = event.target.closest("[data-qty]");
    if (qty) return this.updateCart(qty.dataset.qty, qty.dataset.value);

    const remove = event.target.closest("[data-remove-cart]");
    if (remove) return this.removeCart(remove.dataset.removeCart);

    if (event.target.closest("[data-refresh-track]")) return this.loadTracking();

    await this.adminClicks(event);
    await this.deliveryClicks(event);
  },

  async adminClicks(event) {
    const edit = event.target.closest("[data-edit]");
    if (edit) return this.fillForm(edit.dataset.edit, "[data-crud-form]");
    const editMenu = event.target.closest("[data-edit-menu]");
    if (editMenu) return this.fillForm(editMenu.dataset.editMenu, "[data-menu-form]");
    const editUser = event.target.closest("[data-edit-user]");
    if (editUser) return this.fillForm(editUser.dataset.editUser, "[data-user-form]");
    const editDelivery = event.target.closest("[data-edit-delivery]");
    if (editDelivery) return this.fillForm(editDelivery.dataset.editDelivery, "[data-delivery-form]");

    for (const type of ["restaurants", "categories"]) {
      const del = event.target.closest(`[data-delete-${type}]`);
      if (del && confirm(`Delete this ${type.slice(0, -1)}?`)) {
        await this.api(type, "delete", { method: "POST", body: { id: del.dataset[`delete${this.camel(type)}`] || del.getAttribute(`data-delete-${type}`) } });
        this.toast("Deleted.");
        return this.loadCrud(type);
      }
    }

    const delMenu = event.target.closest("[data-delete-menu]");
    if (delMenu && confirm("Delete menu item?")) {
      await this.api("menu_items", "delete", { method: "POST", body: { id: delMenu.dataset.deleteMenu } });
      this.toast("Menu item deleted.");
      return this.loadMenuCrud();
    }

    const block = event.target.closest("[data-block-user]");
    if (block) {
      const action = block.textContent.trim() === "Unblock" ? "unblock" : "block";
      await this.api("users", action, { method: "POST", body: { id: block.dataset.blockUser } });
      this.toast("User updated.");
      return this.loadUsers();
    }

    const disable = event.target.closest("[data-disable-delivery]");
    if (disable) {
      await this.api("delivery", "admin_deactivate", { method: "POST", body: { id: disable.dataset.disableDelivery } });
      this.toast("Delivery partner deactivated.");
      return this.loadDeliveryPartners();
    }

    const status = event.target.closest("[data-admin-status]");
    if (status) {
      const id = status.dataset.adminStatus;
      await this.api("orders", "update_status", { method: "POST", body: { order_id: id, status: document.querySelector(`[data-status-for="${id}"]`).value } });
      this.toast("Order status updated.");
      return this.loadAdminOrders();
    }

    const assign = event.target.closest("[data-assign]");
    if (assign) {
      const id = assign.dataset.assign;
      await this.api("orders", "assign", { method: "POST", body: { order_id: id, delivery_man_id: document.querySelector(`[data-rider-for="${id}"]`).value } });
      this.toast("Order assigned.");
      return this.loadAdminOrders();
    }

    const reservation = event.target.closest("[data-reservation-action]");
    if (reservation) {
      const [action, id] = reservation.dataset.reservationAction.split(":");
      await this.api("reservations", action, { method: "POST", body: { id } });
      this.toast("Reservation updated.");
      return this.loadAdminReservations();
    }
  },

  async deliveryClicks(event) {
    const action = event.target.closest("[data-delivery-status]");
    if (!action) return;
    const [orderId, status] = action.dataset.deliveryStatus.split(":");
    await this.api("delivery", "update_status", { method: "POST", body: { order_id: orderId, status } });
    this.toast("Delivery status updated.");
    return this.route();
  },

  async onSubmit(event) {
    const form = event.target;
    if (form.matches("[data-login-form]")) {
      event.preventDefault();
      return this.login(form);
    }
    if (form.matches("[data-register-form]")) {
      event.preventDefault();
      return this.register(form);
    }
    if (form.matches("[data-checkout-form]")) {
      event.preventDefault();
      return this.checkout(form);
    }
    if (form.matches("[data-profile-form]")) {
      event.preventDefault();
      return this.updateProfile(form);
    }
    if (form.matches("[data-crud-form]")) {
      event.preventDefault();
      return this.saveCrud(form);
    }
    if (form.matches("[data-menu-form]")) {
      event.preventDefault();
      return this.saveMenu(form);
    }
    if (form.matches("[data-user-form]")) {
      event.preventDefault();
      return this.saveUser(form);
    }
    if (form.matches("[data-delivery-form]")) {
      event.preventDefault();
      return this.saveDeliveryPartner(form);
    }
    if (form.matches("[data-delivery-profile-form]")) {
      event.preventDefault();
      return this.saveDeliveryProfile(form);
    }
  },

  async login(form) {
    try {
      const role = form.dataset.roleForm;
      const body = this.formData(form);
      if (role === "delivery") {
        const data = await this.api("delivery", "login", { method: "POST", body });
        this.state.deliveryMan = data.delivery_man;
        this.state.user = null;
        this.toast("Delivery login successful.");
        return this.go("?page=delivery");
      }
      const action = role === "admin" ? "admin_login" : "login";
      const data = await this.api("auth", action, { method: "POST", body });
      this.state.user = data.user;
      this.state.deliveryMan = null;
      if (this.state.user.role === "customer") await this.syncCart();
      this.toast("Login successful.");
      return this.go(role === "admin" ? "?page=admin" : "?page=profile");
    } catch (error) {
      this.toast(error.message, "danger");
    }
  },

  async register(form) {
    try {
      const body = this.formData(form);
      // Validate Pakistani phone number
      const phone = String(body.phone || "").replace(/\s|-/g, "");
      const validPkPhone = /^(?:\+92|92|0)3\d{9}$/.test(phone);
      if (!validPkPhone) {
        this.toast("Enter a valid Pakistani phone number, e.g. 03212345678 or +923212345678", "danger");
        return;
      }
      await this.api("auth", "register", { method: "POST", body });
      this.toast("Registration successful. Please login.");
      this.go("?page=login&role=customer");
    } catch (error) {
      this.toast(error.message, "danger");
    }
  },

  async logout() {
    try {
      if (this.state.deliveryMan) await this.api("delivery", "logout", { method: "POST", body: {} });
      if (this.state.user) await this.api("auth", "logout", { method: "POST", body: {} });
    } catch (_) {}
    this.state.user = null;
    this.state.deliveryMan = null;
    this.state.cart = { items: [] };
    this.toast("Logged out successfully.");
    this.go("?page=login");
  },

  async addCart(id) {
    if (!this.state.user || this.state.user.role !== "customer") {
      this.toast("Please login as a customer first.", "warning");
      return this.go("?page=login&role=customer");
    }
    try {
      const data = await this.api("cart", "add", { method: "POST", body: { menu_item_id: id, quantity: 1 } });
      this.state.cart = data.cart;
      this.toast("Added to cart.");
      this.route();
    } catch (error) {
      this.toast(error.message, "danger");
    }
  },

  async updateCart(id, quantity) {
    const data = await this.api("cart", "update", { method: "POST", body: { menu_item_id: id, quantity } });
    this.state.cart = data.cart;
    this.renderCartRows();
  },

  async removeCart(id) {
    const data = await this.api("cart", "remove", { method: "POST", body: { menu_item_id: id } });
    this.state.cart = data.cart;
    this.renderCartRows();
  },

  async checkout(form) {
    try {
      const body = this.formData(form);
      const method = body.payment_method;

      // Validate payment details for online methods
      if (method === "jazzcash" || method === "easypaisa") {
        const phone = body.payment_phone || "";
        const ref = body.payment_reference || "";

        if (!phone || !ref) {
          this.toast("Please provide mobile number and transaction ID.", "danger");
          return;
        }

        // Validate Pakistani mobile number format
        const pkPhoneRegex = /^(\+92|0)3\d{9}$/;
        if (!pkPhoneRegex.test(phone.replace(/\s/g, ""))) {
          this.toast("Please enter a valid Pakistani mobile number (e.g., 03XXXXXXXXX or +923XXXXXXXXX).", "danger");
          return;
        }
      }

      // Find best applicable offer
      this.state.appliedOffer = this.findBestOffer();
      if (this.state.appliedOffer) {
        body.applied_offer_id = this.state.appliedOffer.id;
      }

      const data = await this.api("orders", "checkout", { method: "POST", body });
      sessionStorage.setItem("lastOrderId", data.order.id);
      await this.syncCart();
      this.state.appliedOffer = null;
      this.state.selectedRestaurantId = null;
      this.toast("Order placed successfully.");
      this.go("?page=success");
    } catch (error) {
      this.toast(error.message, "danger");
    }
  },

  findBestOffer() {
    const cart = this.state.cart;
    if (!cart || !cart.items || cart.items.length === 0) return null;

    const now = new Date();
    const eligibleOffers = (this.state.offers || []).filter(o => {
      const start = new Date(o.start_date);
      const end = new Date(o.end_date);
      const isActive = o.is_active && start <= now && now <= end;
      const meetsMinOrder = cart.subtotal >= o.min_order_amount;
      return isActive && meetsMinOrder;
    });

    if (eligibleOffers.length === 0) return null;

    // Sort by discount value (highest first)
    eligibleOffers.sort((a, b) => b.discount_value - a.discount_value);
    return eligibleOffers[0];
  },

  async updateProfile(form) {
    try {
      const data = await this.api("auth", "update_profile", { method: "POST", body: this.formData(form) });
      this.state.user = data.user;
      this.toast("Profile updated.");
    } catch (error) {
      this.toast(error.message, "danger");
    }
  },

  async saveCrud(form) {
    const type = form.dataset.crudForm;
    const body = this.formData(form);
    const action = body.id ? "update" : "create";
    await this.api(type, action, { method: "POST", body });
    form.reset();
    this.toast(`${this.title(type)} saved.`);
    this.loadCrud(type);
  },

  async saveMenu(form) {
    const body = this.formData(form);
    body.is_available = form.is_available.checked;
    body.is_featured = form.is_featured.checked;
    await this.api("menu_items", body.id ? "update" : "create", { method: "POST", body });
    form.reset();
    form.is_available.checked = true;
    this.toast("Menu item saved.");
    this.loadMenuCrud();
  },

  async saveUser(form) {
    const body = this.formData(form);
    await this.api("users", body.id ? "admin_update" : "admin_create", { method: "POST", body });
    form.reset();
    this.toast("User saved.");
    this.loadUsers();
  },

  async saveDeliveryPartner(form) {
    const body = this.formData(form);
    await this.api("delivery", body.id ? "admin_update" : "admin_create", { method: "POST", body });
    form.reset();
    this.toast("Delivery partner saved.");
    this.loadDeliveryPartners();
  },

  async saveDeliveryProfile(form) {
    const data = await this.api("delivery", "update_profile", { method: "POST", body: this.formData(form) });
    this.state.deliveryMan = data.delivery_man;
    this.toast("Profile updated.");
  },

  fillForm(json, selector) {
    const data = JSON.parse(json);
    const form = document.querySelector(selector);
    if (!form) return;
    Object.entries(data).forEach(([key, value]) => {
      if (form.elements[key]) {
        if (form.elements[key].type === "checkbox") form.elements[key].checked = !!value;
        else form.elements[key].value = value ?? "";
      }
    });
    form.scrollIntoView({ behavior: "smooth", block: "center" });
  },

  formData(form) {
    return Object.fromEntries(new FormData(form).entries());
  },

  toast(message, type = "success") {
    const toast = document.createElement("div");
    toast.className = "toast-premium mb-2";
    toast.innerHTML = `<div class="d-flex justify-content-between gap-3"><span>${this.escape(message)}</span><button class="btn-close btn-close-white" aria-label="Close"></button></div>`;
    if (type === "danger") toast.style.borderColor = "rgba(239,68,68,.45)";
    if (type === "warning") toast.style.borderColor = "rgba(245,158,11,.45)";
    toast.querySelector("button").addEventListener("click", () => toast.remove());
    this.toastRoot.appendChild(toast);
    setTimeout(() => toast.remove(), 3500);
  },

  money(value) {
    return `Rs ${Number(value || 0).toLocaleString("en-PK", { maximumFractionDigits: 0 })}`;
  },

  date(value) {
    if (!value) return "";
    return new Date(value.replace(" ", "T")).toLocaleDateString("en-PK", { year: "numeric", month: "short", day: "numeric" });
  },

  status(value = "") {
    return String(value).replaceAll("_", " ").replace(/\b\w/g, (letter) => letter.toUpperCase());
  },

  title(value = "") {
    return this.status(value);
  },

  escape(value = "") {
    return String(value).replace(/[&<>"']/g, (char) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[char]));
  },

  attr(value) {
    return this.escape(JSON.stringify(value));
  },

  camel(value) {
    return String(value).replace(/-([a-z])/g, (_, c) => c.toUpperCase());
  },

  empty(message) {
    return `<div class="panel text-center text-muted-soft">${this.escape(message)}</div>`;
  },

  normalizeDishName(name) {
    return String(name || "")
      .toLowerCase()
      .trim()
      .replace(/\s+/g, " ");
  },

getDishImage(item) {
  // Use database image_url if it exists
  if (item?.image_url && item.image_url.trim() !== "") {
    return item.image_url;
  }
  // Fallback default image only if no image_url in database
  return "assets/img/dishes/chicken-biryani.jpg";
},
  fillProfile() {}
};

document.addEventListener("input", (event) => {
  if (event.target.matches("[data-menu-search]")) app.renderMenuRows();
  if (event.target.matches("[data-restaurant-search]")) app.renderRestaurantRows(document.querySelector("[data-open-filter]")?.classList.contains("active"));
});

app.init();
