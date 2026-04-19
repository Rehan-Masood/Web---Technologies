// Food Express Helpers and Global Functions

function addItemToCart(itemId) {
  if (!auth.isLoggedIn()) {
    ui.showToast("Please login to add items to cart", "warning");
    window.location.href = "?page=login";
    return;
  }

  const item = storage.getMenuItemById(itemId);
  if (!item) {
    ui.showToast("Item not found", "danger");
    return;
  }

  const result = cart.addItem(itemId, 1);
  if (result.success) {
    ui.showToast(result.message, "success");
    if (typeof ui.updateCartBadge === "function") {
      ui.updateCartBadge();
    }
  } else {
    ui.showToast(result.error || "Could not add item to cart", "warning");
  }
}

function updateCartQuantity(cartItemId, quantity) {
  const nextQty = Number(quantity);

  if (nextQty < 1) {
    removeFromCart(cartItemId);
    return;
  }

  const result = cart.updateQuantity(cartItemId, nextQty);
  if (!result || result.success === false) {
    ui.showToast((result && result.error) || "Failed to update cart", "danger");
    return;
  }

  if (typeof ui.updateCartBadge === "function") {
    ui.updateCartBadge();
  }

  if (typeof router !== "undefined" && typeof router.loadCartPage === "function") {
    router.loadCartPage();
  }
}

function removeFromCart(cartItemId) {
  const result = cart.removeItem(cartItemId);

  if (!result || result.success === false) {
    ui.showToast((result && result.error) || "Failed to remove item", "danger");
    return;
  }

  ui.showToast("Item removed from cart", "info");

  if (typeof ui.updateCartBadge === "function") {
    ui.updateCartBadge();
  }

  if (typeof router !== "undefined" && typeof router.loadCartPage === "function") {
    router.loadCartPage();
  }
}

function updateOrderStatus(orderId, status) {
  if (!auth.isAdmin()) {
    ui.showToast("Admin access required", "danger");
    return;
  }

  const result = orders.updateOrderStatus(orderId, status);
  if (!result || result.success === false) {
    ui.showToast((result && result.error) || "Failed to update order status", "danger");
    return;
  }

  ui.showToast("Order status updated", "success");

  if (typeof router !== "undefined" && typeof router.loadAdminSection === "function") {
    router.loadAdminSection("orders");
  }
}

function deleteMenuItem(itemId) {
  if (!auth.isAdmin()) {
    ui.showToast("Admin access required", "danger");
    return;
  }

  if (!confirm("Are you sure you want to delete this menu item?")) {
    return;
  }

  storage.deleteMenuItem(itemId);
  ui.showToast("Menu item deleted", "success");

  if (typeof router !== "undefined" && typeof router.loadAdminSection === "function") {
    setTimeout(() => router.loadAdminSection("menu"), 300);
  }
}

function editMenuItem(itemId) {
  if (!auth.isAdmin()) {
    ui.showToast("Admin access required", "danger");
    return;
  }

  const item = storage.getMenuItemById(itemId);
  if (!item) {
    ui.showToast("Item not found", "danger");
    return;
  }

  const form = document.getElementById("admin-menu-item-form");
  if (!form) {
    ui.showToast("Menu item form not found", "danger");
    return;
  }

  form.dataset.editId = itemId;
  form.querySelector('[name="name"]').value = item.name || "";
  form.querySelector('[name="category"]').value = item.category || "";
  form.querySelector('[name="price"]').value = item.price ?? "";
  form.querySelector('[name="description"]').value = item.description || "";
  form.querySelector('[name="image"]').value = item.image || "";

  const availableInput = form.querySelector('[name="available"]');
  if (availableInput) {
    if (availableInput.type === "checkbox") {
      availableInput.checked = !!item.available;
    } else {
      availableInput.value = item.available ? "true" : "false";
    }
  }

  const title = document.getElementById("item-form-title");
  if (title) {
    title.textContent = "Edit Menu Item";
  }

  const container = document.getElementById("menu-item-form-container");
  if (container) {
    container.style.display = "block";
  }
}

function showMenuItemForm() {
  const container = document.getElementById("menu-item-form-container");
  const form = document.getElementById("admin-menu-item-form");
  const title = document.getElementById("item-form-title");

  if (title) {
    title.textContent = "Add Menu Item";
  }

  if (form) {
    form.reset();
    delete form.dataset.editId;

    const availableInput = form.querySelector('[name="available"]');
    if (availableInput && availableInput.type === "checkbox") {
      availableInput.checked = true;
    }
  }

  if (container) {
    container.style.display = "block";
  }
}

function hideMenuItemForm() {
  const container = document.getElementById("menu-item-form-container");
  if (container) {
    container.style.display = "none";
  }
}

function deleteCategory(categoryId) {
  if (!auth.isAdmin()) {
    ui.showToast("Admin access required", "danger");
    return;
  }

  const itemsInCategory = storage.getMenuItems().filter(item => item.category === categoryId).length;
  if (itemsInCategory > 0) {
    ui.showToast("Cannot delete category with menu items", "warning");
    return;
  }

  if (!confirm("Are you sure you want to delete this category?")) {
    return;
  }

  storage.deleteCategory(categoryId);
  ui.showToast("Category deleted", "success");

  if (typeof router !== "undefined" && typeof router.loadAdminSection === "function") {
    setTimeout(() => router.loadAdminSection("categories"), 300);
  }
}

function editCategory(categoryId) {
  if (!auth.isAdmin()) {
    ui.showToast("Admin access required", "danger");
    return;
  }

  const category = storage.getCategoryById(categoryId);
  if (!category) {
    ui.showToast("Category not found", "danger");
    return;
  }

  const form = document.getElementById("admin-category-form");
  if (!form) {
    ui.showToast("Category form not found", "danger");
    return;
  }

  form.dataset.editId = categoryId;
  form.querySelector('[name="name"]').value = category.name || "";
  form.querySelector('[name="description"]').value = category.description || "";

  const title = document.getElementById("form-title");
  if (title) {
    title.textContent = "Edit Category";
  }

  const container = document.getElementById("category-form-container");
  if (container) {
    container.style.display = "block";
  }
}

function showCategoryForm() {
  const container = document.getElementById("category-form-container");
  const form = document.getElementById("admin-category-form");
  const title = document.getElementById("form-title");

  if (title) {
    title.textContent = "Add Category";
  }

  if (form) {
    form.reset();
    delete form.dataset.editId;
  }

  if (container) {
    container.style.display = "block";
  }
}

function hideCategoryForm() {
  const container = document.getElementById("category-form-container");
  if (container) {
    container.style.display = "none";
  }
}

function cancelReservation(reservationId) {
  if (!confirm("Are you sure you want to cancel this reservation?")) {
    return;
  }

  const currentUser = auth.getCurrentUser();
  if (!currentUser) {
    ui.showToast("Please login first", "warning");
    window.location.href = "?page=login";
    return;
  }

  let result;

  if (typeof reservations !== "undefined" && typeof reservations.cancelReservation === "function") {
    result = reservations.cancelReservation(reservationId);
  } else {
    const reservation = storage.getReservations().find(r => r.id === reservationId);
    if (!reservation) {
      result = { success: false, error: "Reservation not found" };
    } else {
      const updated = storage.updateReservation(reservationId, { status: "Cancelled" });
      result = updated
        ? { success: true, reservation: updated }
        : { success: false, error: "Failed to cancel reservation" };
    }
  }

  if (!result || result.success === false) {
    ui.showToast((result && result.error) || "Failed to cancel reservation", "danger");
    return;
  }

  ui.showToast("Reservation cancelled", "success");

  if (typeof router !== "undefined" && typeof router.loadReservationsPage === "function") {
    setTimeout(() => router.loadReservationsPage(), 300);
  } else if (typeof router !== "undefined" && typeof router.route === "function") {
    setTimeout(() => router.route(), 300);
  }
}

function initializeApp() {
  if (typeof storage !== "undefined" && typeof storage.initialize === "function") {
    storage.initialize();
  }

  if (typeof auth !== "undefined" && auth.isLoggedIn()) {
    if (typeof ui.updateNavigation === "function") {
      ui.updateNavigation();
    } else if (typeof ui.updateUserNavigation === "function") {
      ui.updateUserNavigation();
    }
  }

  setupPageEventListeners();

  if (typeof router !== "undefined" && typeof router.route === "function") {
    router.route();
  }

  if (typeof ui.updateCartBadge === "function") {
    ui.updateCartBadge();
  }
}

function setupPageEventListeners() {
  const loginForm = document.getElementById("login-form");
  if (loginForm && !loginForm.dataset.bound) {
    loginForm.addEventListener("submit", function (e) {
      if (typeof ui.handleLogin === "function") {
        e.preventDefault();
        ui.handleLogin(e);
      }
    });
    loginForm.dataset.bound = "true";
  }

  const registerForm = document.getElementById("register-form");
  if (registerForm && !registerForm.dataset.bound) {
    registerForm.addEventListener("submit", function (e) {
      if (typeof ui.handleRegister === "function") {
        e.preventDefault();
        ui.handleRegister(e);
      }
    });
    registerForm.dataset.bound = "true";
  }

  const reservationForm = document.getElementById("reservation-form");
  if (reservationForm && !reservationForm.dataset.bound) {
    const today = new Date().toISOString().split("T")[0];
    const dateInput = reservationForm.querySelector('[name="reservationDate"]');
    if (dateInput) {
      dateInput.min = today;
    }

    reservationForm.addEventListener("submit", function (e) {
      if (typeof router.handleReservation === "function") {
        e.preventDefault();
        const currentUser = auth.getCurrentUser();
        if (currentUser) {
          router.handleReservation(e, currentUser.id);
        }
      }
    });
    reservationForm.dataset.bound = "true";
  }

  const checkoutForm = document.getElementById("checkout-form");
  if (checkoutForm && !checkoutForm.dataset.bound) {
    checkoutForm.addEventListener("submit", function (e) {
      if (typeof router.handleCheckout === "function") {
        e.preventDefault();
        router.handleCheckout(e);
      }
    });
    checkoutForm.dataset.bound = "true";
  }

  const checkoutBtn = document.getElementById("checkout-btn");
  if (checkoutBtn && !checkoutBtn.dataset.bound) {
    checkoutBtn.addEventListener("click", function () {
      if (typeof cart.isEmpty === "function" && cart.isEmpty()) {
        ui.showToast("Your cart is empty", "warning");
        return;
      }
      window.location.href = "?page=checkout";
    });
    checkoutBtn.dataset.bound = "true";
  }

  const backToTopBtn = document.querySelector(".back-to-top");
  if (backToTopBtn && !backToTopBtn.dataset.bound) {
    window.addEventListener("scroll", function () {
      if (window.scrollY > 300) {
        backToTopBtn.classList.add("show");
      } else {
        backToTopBtn.classList.remove("show");
      }
    });

    backToTopBtn.addEventListener("click", function () {
      window.scrollTo({ top: 0, behavior: "smooth" });
    });

    backToTopBtn.dataset.bound = "true";
  }

  const searchInput = document.querySelector("[data-search]");
  if (searchInput && !searchInput.dataset.bound) {
    let searchTimeout;

    searchInput.addEventListener("input", function () {
      clearTimeout(searchTimeout);
      const query = this.value;

      searchTimeout = setTimeout(function () {
        if (query.trim() === "") {
          const params = new URLSearchParams(window.location.search);
          const categoryId = params.get("category") || "all";

          if (typeof router.loadMenuItems === "function") {
            router.loadMenuItems(categoryId);
          } else if (typeof router.loadMenuPage === "function") {
            router.loadMenuPage();
          }
        } else {
          const results = storage.searchMenuItems(query);
          if (typeof router.renderMenuItems === "function") {
            router.renderMenuItems(results);
          }
        }
      }, 300);
    });

    searchInput.dataset.bound = "true";
  }
}

document.addEventListener("DOMContentLoaded", function () {
  initializeApp();
});

document.addEventListener("visibilitychange", function () {
  if (!document.hidden && typeof auth.restoreSession === "function" && !auth.isLoggedIn()) {
    if (auth.restoreSession()) {
      if (typeof ui.updateNavigation === "function") {
        ui.updateNavigation();
      } else if (typeof ui.updateUserNavigation === "function") {
        ui.updateUserNavigation();
      }

      if (typeof ui.updateCartBadge === "function") {
        ui.updateCartBadge();
      }
    }
  }
});
