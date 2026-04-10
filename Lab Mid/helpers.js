<!-- Food Express Helpers and Global Functions -->
<script>
// ========== Global Helper Functions ==========

// Add to cart helper
function addItemToCart(itemId) {
  if (!auth.isLoggedIn()) {
    ui.showToast('Please login to add items to cart', 'warning');
    window.location.href = '?page=login';
    return;
  }

  const item = storage.getMenuItemById(itemId);
  if (!item) {
    ui.showToast('Item not found', 'danger');
    return;
  }

  const result = cart.addItem(item, 1);
  if (result.success) {
    ui.showToast(result.message, 'success');
  } else {
    ui.showToast(result.error, 'warning');
  }
}

// Update cart quantity helper
function updateCartQuantity(cartItemId, quantity) {
  if (quantity < 1) {
    removeFromCart(cartItemId);
    return;
  }
  cart.updateQuantity(cartItemId, quantity);
  router.loadcartPage();
}

// Remove from cart helper
function removeFromCart(cartItemId) {
  cart.removeItem(cartItemId);
  ui.showToast('Item removed from cart', 'info');
  router.loadcartPage();
}

// Update order status (admin)
function updateOrderStatus(orderId, status) {
  if (!auth.isAdmin()) {
    ui.showToast('Admin access required', 'danger');
    return;
  }

  const order = orders.getOrderById(orderId);
  if (order && order.status !== status) {
    const updated = storage.updateOrderStatus(orderId, status);
    if (updated) {
      ui.showToast('Order status updated', 'success');
      router.loadAdminSection('orders');
    }
  }
}

// Delete menu item (admin)
function deleteMenuItem(itemId) {
  if (!auth.isAdmin()) {
    ui.showToast('Admin access required', 'danger');
    return;
  }

  if (confirm('Are you sure you want to delete this menu item?')) {
    storage.deleteMenuItem(itemId);
    ui.showToast('Menu item deleted', 'success');
    setTimeout(() => router.loadAdminSection('menu'), 500);
  }
}

// Edit menu item (admin)
function editMenuItem(itemId) {
  if (!auth.isAdmin()) {
    ui.showToast('Admin access required', 'danger');
    return;
  }

  const item = storage.getMenuItemById(itemId);
  if (!item) {
    ui.showToast('Item not found', 'danger');
    return;
  }

  const form = document.getElementById('admin-menu-item-form');
  if (form) {
    form.dataset.editId = itemId;
    form.querySelector('[name="name"]').value = item.name;
    form.querySelector('[name="category"]').value = item.category;
    form.querySelector('[name="price"]').value = item.price;
    form.querySelector('[name="available"]').value = item.available ? 'true' : 'false';
    form.querySelector('[name="description"]').value = item.description;
    form.querySelector('[name="image"]').value = item.image;

    document.getElementById('item-form-title').textContent = 'Edit Menu Item';
    document.getElementById('menu-item-form-container').style.display = 'block';
  }
}

// Show menu item form
function showMenuItemForm() {
  const container = document.getElementById('menu-item-form-container');
  if (container) {
    container.style.display = 'block';
    document.getElementById('item-form-title').textContent = 'Add Menu Item';
    const form = document.getElementById('admin-menu-item-form');
    if (form) {
      form.reset();
      delete form.dataset.editId;
    }
  }
}

// Hide menu item form
function hideMenuItemForm() {
  const container = document. getElementById('menu-item-form-container');
  if (container) {
    container.style.display = 'none';
  }
}

// Delete category (admin)
function deleteCategory(categoryId) {
  if (!auth.isAdmin()) {
    ui.showToast('Admin access required', 'danger');
    return;
  }

  const itemsInCategory = storage.getMenuItems().filter(i => i.category === categoryId).length;
  if (itemsInCategory > 0) {
    ui.showToast('Cannot delete category with menu items', 'warning');
    return;
  }

  if (confirm('Are you sure you want to delete this category?')) {
    storage.deleteCategory(categoryId);
    ui.showToast('Category deleted', 'success');
    setTimeout(() => router.loadAdminSection('categories'), 500);
  }
}

// Edit category (admin)
function editCategory(categoryId) {
  if (!auth.isAdmin()) {
    ui.showToast('Admin access required', 'danger');
    return;
  }

  const category = storage.getCategoryById(categoryId);
  if (!category) {
    ui.showToast('Category not found', 'danger');
    return;
  }

  const form = document.getElementById('admin-category-form');
  if (form) {
    form.dataset.editId = categoryId;
    form.querySelector('[name="name"]').value = category.name;
    form.querySelector('[name="description"]').value = category.description;

    document.getElementById('form-title').textContent = 'Edit Category';
    document.getElementById('category-form-container').style.display = 'block';
  }
}

// Show category form
function showCategoryForm() {
  const container = document.getElementById('category-form-container');
  if (container) {
    container.style.display = 'block';
    document.getElementById('form-title').textContent = 'Add Category';
    const form = document.getElementById('admin-category-form');
    if (form) {
      form.reset();
      delete form.dataset.editId;
    }
  }
}

// Hide category form
function hideCategoryForm() {
  const container = document.getElementById('category-form-container');
  if (container) {
    container.style.display = 'none';
  }
}

// Cancel reservation
function cancelReservation(reservationId) {
  if (confirm('Are you sure you want to cancel this reservation?')) {
    storage.deleteReservation(reservationId);
    ui.showToast('Reservation cancelled', 'success');
    const user = auth.getCurrentUser();
    setTimeout(() => router.loadUserReservations(user.id), 500);
  }
}

// Initialize page after DOM loads
function initializeApp() {
  // Storage initialization
  storage.initialize();

  // Restore session
  if (auth.isLoggedIn()) {
    ui.updateUserNavigation();
  }

  // Setup all event listeners
  setupPageEventListeners();

  // Route to correct page
  if (typeof router !== 'undefined') {
    router.route();
  }

  ui.updateCartBadge();
}

// Setup all page event listeners
function setupPageEventListeners() {
  // Login form
  const loginForm = document.getElementById('login-form');
  if (loginForm) {
    loginForm.addEventListener('submit', function(e) {
      e.preventDefault();
      ui.handleLogin(e);
    });
  }

  // Register form
  const registerForm = document.getElementById('register-form');
  if (registerForm) {
    registerForm.addEventListener('submit', function(e) {
      e.preventDefault();
      ui.handleRegister(e);
    });
  }

  // Reservation form
  const reservationForm = document.getElementById('reservation-form');
  if (reservationForm) {
    const today = new Date().toISOString().split('T')[0];
    const dateInput = reservationForm.querySelector('[name="reservationDate"]');
    if (dateInput) {
      dateInput.min = today;
    }

    reservationForm.addEventListener('submit', function(e) {
      const currentUser = auth.getCurrentUser();
      if (currentUser) {
        router.handleReservation(e, currentUser.id);
      }
    });
  }

  // Checkout form
  const checkoutForm = document.getElementById('checkout-form');
  if (checkoutForm) {
    checkoutForm.addEventListener('submit', function(e) {
      router.handleCheckout(e);
    });
  }

  // Cart checkout button
  const checkoutBtn = document.getElementById('checkout-btn');
  if (checkoutBtn) {
    checkoutBtn.addEventListener('click', function() {
      if (cart.isEmpty()) {
        ui.showToast('Your cart is empty', 'warning');
        return;
      }
      window.location.href = '?page=checkout';
    });
  }

  // Back to top button
  const backToTopBtn = document.querySelector('.back-to-top');
  if (backToTopBtn) {
    window.addEventListener('scroll', function() {
      if (window.scrollY > 300) {
        backToTopBtn.classList.add('show');
      } else {
        backToTopBtn.classList.remove('show');
      }
    });

    backToTopBtn.addEventListener('click', function() {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

  // Category filter on menu page
  const categoryBtns = document.querySelectorAll('.category-btn');
  categoryBtns.forEach(btn => {
    btn.addEventListener('click', function(e) {
      e.preventDefault();
      const categoryId = this.dataset.category;
      window.location.href = `?page=menu&category=${categoryId}`;
    });
  });

  // Search functionality
  const searchInput = document.querySelector('[data-search]');
  if (searchInput) {
    let searchTimeout;
    searchInput.addEventListener('input', function() {
      clearTimeout(searchTimeout);
      const query = this.value;

      searchTimeout = setTimeout(function() {
        if (query.trim() === '') {
          const params = new URLSearchParams(window.location.search);
          const categoryId = params.get('category') || 'all';
          router.loadMenuItems(categoryId);
        } else {
          const results = storage.searchMenuItems(query);
          router.renderMenuItems(results);
        }
      }, 300);
    });
  }
}

// Initialize on document ready
document.addEventListener('DOMContentLoaded', function() {
  initializeApp();
});

// Handle page visibility changes (restore session)
document.addEventListener('visibilitychange', function() {
  if (!document.hidden && !auth.isLoggedIn()) {
    if (auth.restoreSession()) {
      ui.updateUserNavigation();
      ui.updateCartBadge();
    }
  }
});
</script>
