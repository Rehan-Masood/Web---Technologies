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
    ui.updateCartBadge();
  } else {
    ui.showToast(result.error, "warning");
  }
}

function updateCartQuantity(cartItemId, quantity) {
  const nextQty = Number(quantity);

  if (nextQty < 1) {
    removeFromCart(cartItemId);
    return;
  }

  const result = cart.updateQuantity(cartItemId, nextQty);
  if (!result.success) {
    ui.showToast(result.error || "Failed to update cart", "danger");
    return;
  }

  ui.updateCartBadge();
  if (typeof router.loadCartPage === "function") {
    router.loadCartPage();
  }
}

function removeFromCart(cartItemId) {
  const result = cart.removeItem(cartItemId);
  if (!result.success) {
    ui.showToast(result.error || "Failed to remove item", "danger");
    return;
  }

  ui.updateCartBadge();
  ui.showToast("Item removed from cart", "info");
  if (typeof router.loadCartPage === "function") {
    router.loadCartPage();
  }
}

function updateOrderStatus(orderId, status) {
  if (!auth.isAdmin()) {
    ui.showToast("Admin access required", "danger");
    return;
  }

  const result = orders.updateOrderStatus(orderId, status);
  if (!result.success) {
    ui.showToast(result.error || "Failed to update order status", "danger");
    return;
  }

  ui.showToast("Order status updated", "success");
  if (typeof router.loadAdminSection === "function") {
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

  if (typeof router.loadAdminSection === "function") {
    setTimeout(() => router.loadAdminSection("menu"), 150);
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

  const availableField = form.querySelector('[name="available"]');
  if (availableField) {
    availableField.checked = !!item.available;
  }

  const title = document.getElementById("item-form-title");
  if (title) {
    title.textContent = "Edit Menu Item";
  }

  const container = document.getElementById("menu-item-form-container");
  if (container) {
    container.style.display = "block";
    container.scrollIntoView({ behavior: "smooth", block: "start" });
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

    const availableField = form.querySelector('[name="available"]');
    if (availableField) {
      availableField.checked = true;
    }
  }

  if (container) {
    container.style.display = "block";
    container.scrollIntoView({ behavior: "smooth", block: "start" });
  }
}

function hideMenuItemForm() {
  const container = document.getElementById("menu-item-form-container");
  const form = document.getElementById("admin-menu-item-form");

  if (form) {
    form.reset();
    delete form.dataset.editId;
  }

  if (container) {
    container.style.display = "none";
  }
}

function deleteCategory(categoryId) {
  if (!auth.isAdmin()) {
    ui.showToast("Admin access required", "danger");
    return;
  }

  const itemsInCategory = storage.getMenuItemsByCategory(categoryId).length;
  if (itemsInCategory > 0) {
    ui.showToast("Cannot delete category with menu items", "warning");
    return;
  }

  if (!confirm("Are you sure you want to delete this category?")) {
    return;
  }

  storage.deleteCategory(categoryId);
  ui.showToast("Category deleted", "success");

  if (typeof router.loadAdminSection === "function") {
    setTimeout(() => router.loadAdminSection("categories"), 150);
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
    container.scrollIntoView({ behavior: "smooth", block: "start" });
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
    container.scrollIntoView({ behavior: "smooth", block: "start" });
  }
}

function hideCategoryForm() {
  const container = document.getElementById("category-form-container");
  const form = document.getElementById("admin-category-form");

  if (form) {
    form.reset();
    delete form.dataset.editId;
  }

  if (container) {
    container.style.display = "none";
  }
}

function cancelAdminReservation(reservationId) {
  if (!auth.isAdmin()) {
    ui.showToast("Admin access required", "danger");
    return;
  }

  if (!confirm("Are you sure you want to cancel this reservation?")) {
    return;
  }

  const updated = storage.updateReservation(reservationId, { status: "Cancelled" });
  if (!updated) {
    ui.showToast("Reservation not found", "danger");
    return;
  }

  ui.showToast("Reservation cancelled", "success");
  if (typeof router.loadAdminSection === "function") {
    setTimeout(() => router.loadAdminSection("reservations"), 150);
  }
}

function viewAdminOrderDetails(orderId) {
  if (!auth.isAdmin()) {
    ui.showToast("Admin access required", "danger");
    return;
  }

  const order = orders.getOrderById(orderId);
  if (!order) {
    ui.showToast("Order not found", "danger");
    return;
  }

  const modal = document.createElement("div");
  modal.className = "modal fade";
  modal.id = "adminOrderModal";
  modal.tabIndex = -1;
  modal.innerHTML = `
    <div class="modal-dialog modal-lg modal-dialog-scrollable">
      <div class="modal-content">
        <div class="modal-header">
          <h5 class="modal-title">Order Details - ${order.orderNumber}</h5>
          <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
        </div>
        <div class="modal-body">
          <div class="row mb-3">
            <div class="col-md-6">
              <strong>Customer Information</strong>
              <p class="mb-1">Name: ${order.userName || "-"}</p>
              <p class="mb-1">Email: ${order.userEmail || "-"}</p>
              <p class="mb-1">Phone: ${order.userPhone || "-"}</p>
            </div>
            <div class="col-md-6">
              <strong>Order Information</strong>
              <p class="mb-1">Order #: ${order.orderNumber}</p>
              <p class="mb-1">Date: ${ui.formatDateTime(order.createdAt)}</p>
              <p class="mb-1">Status: <span class="badge bg-info">${order.status}</span></p>
            </div>
          </div>

          <hr>

          <strong>Delivery Address</strong>
          <p>${order.deliveryAddress || "-"}</p>

          ${order.notes ? `<strong>Special Notes</strong><p>${order.notes}</p>` : ""}

          <hr>

          <strong>Items</strong>
          <div class="table-responsive">
            <table class="table">
              <thead>
                <tr><th>Item</th><th>Qty</th><th>Price</th><th>Subtotal</th></tr>
              </thead>
              <tbody>
                ${(order.items || []).map(item => `
                  <tr>
                    <td>${item.name}</td>
                    <td>${item.quantity}</td>
                    <td>${ui.formatCurrency(item.price)}</td>
                    <td>${ui.formatCurrency(item.price * item.quantity)}</td>
                  </tr>
                `).join("")}
              </tbody>
            </table>
          </div>

          <div class="row">
            <div class="col-6"><strong>Subtotal:</strong></div>
            <div class="col-6 text-end">${ui.formatCurrency(order.subtotal)}</div>
          </div>
          <div class="row">
            <div class="col-6"><strong>Delivery Fee:</strong></div>
            <div class="col-6 text-end">${ui.formatCurrency(order.deliveryFee)}</div>
          </div>
          <div class="row border-top pt-2 mt-2">
            <div class="col-6"><strong>Total:</strong></div>
            <div class="col-6 text-end"><strong>${ui.formatCurrency(order.total)}</strong></div>
          </div>
        </div>
        <div class="modal-footer">
          <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Close</button>
        </div>
      </div>
    </div>
  `;

  document.body.appendChild(modal);
  const bsModal = new bootstrap.Modal(modal);
  bsModal.show();

  modal.addEventListener("hidden.bs.modal", () => {
    modal.remove();
  });
}

window.addItemToCart = addItemToCart;
window.updateCartQuantity = updateCartQuantity;
window.removeFromCart = removeFromCart;
window.updateOrderStatus = updateOrderStatus;
window.deleteMenuItem = deleteMenuItem;
window.editMenuItem = editMenuItem;
window.showMenuItemForm = showMenuItemForm;
window.hideMenuItemForm = hideMenuItemForm;
window.deleteCategory = deleteCategory;
window.editCategory = editCategory;
window.showCategoryForm = showCategoryForm;
window.hideCategoryForm = hideCategoryForm;
window.cancelAdminReservation = cancelAdminReservation;
window.viewAdminOrderDetails = viewAdminOrderDetails;
