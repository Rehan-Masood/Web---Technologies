class UIManager {
  constructor() {
    this.toastContainer = document.querySelector(".toast-container");
  }

  init() {
    this.bindGlobalEvents();
    this.updateNavigation();
    this.updateCartBadge();
    this.setupBackToTop();
  }

  bindGlobalEvents() {
    document.addEventListener("submit", (e) => {
      if (e.target.id === "login-form") this.handleLogin(e);
      if (e.target.id === "admin-login-form") this.handleAdminLogin(e);
      if (e.target.id === "register-form") this.handleRegister(e);
      if (e.target.id === "checkout-form") this.handleCheckout(e);
      if (e.target.id === "reservation-form") this.handleReservation(e);
    });

    document.addEventListener("click", (e) => {
      if (e.target.closest("[data-logout]")) {
        e.preventDefault();
        this.handleLogout();
      }
    });
  }

  showToast(message, type = "success") {
    if (!this.toastContainer) return alert(message);

    const bgClass =
      type === "success" ? "bg-success" :
      type === "danger" ? "bg-danger" :
      type === "warning" ? "bg-warning" : "bg-info";

    const toast = document.createElement("div");
    toast.className = "toast align-items-center text-white border-0 show";
    toast.innerHTML = `
      <div class="d-flex ${bgClass}">
        <div class="toast-body">${message}</div>
        <button type="button" class="btn-close btn-close-white me-2 m-auto"></button>
      </div>
    `;

    toast.querySelector(".btn-close").addEventListener("click", () => toast.remove());
    this.toastContainer.appendChild(toast);
    setTimeout(() => toast.remove(), 3000);
  }

  formatCurrency(amount) {
    return `Rs ${Number(amount || 0).toLocaleString("en-PK")}`;
  }

  formatDate(date) {
    return new Date(date).toLocaleDateString("en-PK");
  }

  formatDateTime(date) {
    return new Date(date).toLocaleString("en-PK");
  }

  updateNavigation() {
    const user = auth.getCurrentUser();
    const authNav = document.querySelector("[data-auth-nav]");
    const adminNav = document.querySelector("[data-admin-nav]");
    if (!authNav || !adminNav) return;

    adminNav.innerHTML = "";
    authNav.innerHTML = "";

    if (!user) {
      authNav.innerHTML = `
        <a class="nav-link" href="?page=login"><i class="bi bi-box-arrow-in-right"></i> Login</a>
        <a class="nav-link" href="?page=register"><i class="bi bi-person-plus"></i> Register</a>
      `;
      return;
    }

    if (user.role === "admin") {
      adminNav.innerHTML = `
        <a class="nav-link" href="?page=admin"><i class="bi bi-speedometer2"></i> Admin</a>
      `;
    }

    authNav.innerHTML = `
      <a class="nav-link" href="?page=profile"><i class="bi bi-person-circle"></i> ${user.fullName}</a>
      <a class="nav-link" href="?page=orders"><i class="bi bi-bag"></i> Orders</a>
      <a class="nav-link" href="#" data-logout><i class="bi bi-box-arrow-right"></i> Logout</a>
    `;
  }

  updateCartBadge() {
    const badge = document.querySelector(".cart-badge");
    if (!badge) return;
    const count = cart.getCartTotals().itemCount;
    badge.textContent = count;
    badge.style.display = count > 0 ? "inline-block" : "none";
  }

  handleLogin(e) {
    e.preventDefault();
    const form = e.target;
    const email = form.email.value.trim();
    const password = form.password.value;
    const rememberMe = !!form.rememberMe.checked;

    const result = auth.login(email, password, rememberMe);
    if (!result.success) {
      this.showToast(result.error, "danger");
      return;
    }

    this.showToast("Login successful.", "success");
    this.updateNavigation();
    this.updateCartBadge();
    setTimeout(() => {
      window.location.href = "?page=profile";
    }, 300);
  }

  handleAdminLogin(e) {
    e.preventDefault();
    const form = e.target;
    const email = form.email.value.trim();
    const password = form.password.value;
    const rememberMe = !!form.rememberMe.checked;

    const result = auth.adminLogin(email, password, rememberMe);
    if (!result.success) {
      this.showToast(result.error, "danger");
      return;
    }

    this.showToast("Admin login successful.", "success");
    this.updateNavigation();
    this.updateCartBadge();
    setTimeout(() => {
      window.location.href = "?page=admin";
    }, 300);
  }

  handleRegister(e) {
    e.preventDefault();
    const form = e.target;

    const result = auth.register({
      fullName: form.fullName.value.trim(),
      email: form.email.value.trim(),
      phone: form.phone.value.trim(),
      address: form.address.value.trim(),
      password: form.password.value,
      confirmPassword: form.confirmPassword.value
    });

    if (!result.success) {
      this.showToast(result.error, "danger");
      return;
    }

    this.showToast("Registration successful. Please login.", "success");
    setTimeout(() => {
      window.location.href = "?page=login";
    }, 300);
  }

  handleLogout() {
    auth.logout();
    this.updateNavigation();
    this.updateCartBadge();
    this.showToast("Logged out successfully.", "success");
    setTimeout(() => {
      window.location.href = "?page=login";
    }, 300);
  }

  handleCheckout(e) {
    e.preventDefault();
    const form = e.target;

    const result = orders.createOrder({
      deliveryAddress: form.deliveryAddress.value.trim(),
      notes: form.notes.value.trim()
    });

    if (!result.success) {
      this.showToast(result.error, "danger");
      return;
    }

    sessionStorage.setItem("lastOrderId", result.order.id);
    this.updateCartBadge();
    this.showToast("Order placed successfully.", "success");
    setTimeout(() => {
      window.location.href = "?page=order-confirmation";
    }, 300);
  }

  handleReservation(e) {
    e.preventDefault();
    const form = e.target;

    const result = reservations.createReservation({
      numberOfPeople: form.numberOfPeople.value,
      reservationDate: form.reservationDate.value,
      reservationTime: form.reservationTime.value,
      specialRequests: form.specialRequests.value.trim()
    });

    if (!result.success) {
      this.showToast(result.error, "danger");
      return;
    }

    this.showToast("Reservation created successfully.", "success");
    form.reset();
    router.loadReservationsPage();
  }

  setupBackToTop() {
    const btn = document.querySelector(".back-to-top");
    if (!btn) return;
    window.addEventListener("scroll", () => {
      btn.style.display = window.scrollY > 300 ? "block" : "none";
    });
    btn.addEventListener("click", () => window.scrollTo({ top: 0, behavior: "smooth" }));
  }
}

const ui = new UIManager();

window.addItemToCart = function (itemId) {
  const result = cart.addItem(itemId, 1);
  if (!result.success) {
    ui.showToast(result.error, "warning");
    if (result.error.toLowerCase().includes("login")) {
      setTimeout(() => {
        window.location.href = "?page=login";
      }, 300);
    }
    return;
  }
  ui.updateCartBadge();
  ui.showToast(result.message, "success");
};

window.updateCartQuantity = function (itemId, quantity) {
  cart.updateQuantity(itemId, Number(quantity));
  ui.updateCartBadge();
  router.loadCartPage();
};

window.removeFromCart = function (itemId) {
  cart.removeItem(itemId);
  ui.updateCartBadge();
  ui.showToast("Item removed from cart.", "info");
  router.loadCartPage();
};

window.updateOrderStatus = function (orderId, status) {
  const result = orders.updateOrderStatus(orderId, status);
  if (!result.success) {
    ui.showToast(result.error, "danger");
    return;
  }
  ui.showToast("Order status updated.", "success");
  router.loadAdminSection("orders");
};
