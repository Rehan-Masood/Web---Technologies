class AdminManager {
  constructor(storageManager, authManager, ordersManager, reservationsManager) {
    this.storage = storageManager;
    this.auth = authManager;
    this.orders = ordersManager;
    this.reservations = reservationsManager;
  }

  isAuthorized() {
    return this.auth.isAdmin();
  }

  getDashboardStats() {
    if (!this.isAuthorized()) return null;

    return {
      users: this.storage.getUsers().filter(user => user.role === "customer").length,
      categories: this.storage.getCategories().length,
      menuItems: this.storage.getMenuItems().length,
      orders: this.storage.getOrders().length,
      reservations: this.storage.getReservations().length
    };
  }

  getStats() {
    return this.getDashboardStats();
  }

  getCategories() {
    if (!this.isAuthorized()) return [];
    return this.storage.getCategories();
  }

  addCategory(data) {
    if (!this.isAuthorized()) return { success: false, error: "Unauthorized." };

    const name = String(data?.name || "").trim();
    const description = String(data?.description || "").trim();

    if (!name) {
      return { success: false, error: "Category name is required." };
    }

    const exists = this.storage
      .getCategories()
      .some(category => category.name.toLowerCase() === name.toLowerCase());

    if (exists) {
      return { success: false, error: "Category already exists." };
    }

    const category = this.storage.addCategory({ name, description });
    return { success: true, category };
  }

  updateCategory(id, data) {
    if (!this.isAuthorized()) return { success: false, error: "Unauthorized." };

    const name = String(data?.name || "").trim();
    const description = String(data?.description || "").trim();

    if (!name) {
      return { success: false, error: "Category name is required." };
    }

    const exists = this.storage.getCategories().some(category =>
      category.id !== id && category.name.toLowerCase() === name.toLowerCase()
    );

    if (exists) {
      return { success: false, error: "Another category with this name already exists." };
    }

    const updated = this.storage.updateCategory(id, { name, description });
    if (!updated) {
      return { success: false, error: "Category not found." };
    }

    return { success: true, category: updated };
  }

  deleteCategory(id) {
    if (!this.isAuthorized()) return { success: false, error: "Unauthorized." };

    const items = this.storage.getMenuItemsByCategory(id);
    if (items.length > 0) {
      return { success: false, error: "Cannot delete category with menu items." };
    }

    this.storage.deleteCategory(id);
    return { success: true };
  }

  getMenuItems() {
    if (!this.isAuthorized()) return [];
    return this.storage.getMenuItems();
  }

  addMenuItem(data) {
    if (!this.isAuthorized()) return { success: false, error: "Unauthorized." };

    const name = String(data?.name || "").trim();
    const category = String(data?.category || "").trim();
    const description = String(data?.description || "").trim();
    const image = String(data?.image || "").trim();
    const price = Number(data?.price);
    const available = data?.available !== false;

    if (!name || !category || Number.isNaN(price) || price <= 0) {
      return { success: false, error: "Name, category and valid price are required." };
    }

    const item = this.storage.addMenuItem({
      name,
      category,
      price,
      description,
      image,
      available,
      rating: 4.5
    });

    return { success: true, item };
  }

  updateMenuItem(id, data) {
    if (!this.isAuthorized()) return { success: false, error: "Unauthorized." };

    const name = String(data?.name || "").trim();
    const category = String(data?.category || "").trim();
    const description = String(data?.description || "").trim();
    const image = String(data?.image || "").trim();
    const price = Number(data?.price);
    const available = !!data?.available;

    if (!name || !category || Number.isNaN(price) || price <= 0) {
      return { success: false, error: "Name, category and valid price are required." };
    }

    const updated = this.storage.updateMenuItem(id, {
      name,
      category,
      price,
      description,
      image,
      available
    });

    if (!updated) {
      return { success: false, error: "Menu item not found." };
    }

    return { success: true, item: updated };
  }

  deleteMenuItem(id) {
    if (!this.isAuthorized()) return { success: false, error: "Unauthorized." };
    this.storage.deleteMenuItem(id);
    return { success: true };
  }

  getAllOrders() {
    if (!this.isAuthorized()) return [];
    return this.orders.getAllOrders();
  }

  getOrderById(id) {
    if (!this.isAuthorized()) return null;
    return this.orders.getOrderById(id);
  }

  updateOrderStatus(id, status) {
    if (!this.isAuthorized()) return { success: false, error: "Unauthorized." };
    return this.orders.updateOrderStatus(id, status);
  }

  getAllReservations() {
    if (!this.isAuthorized()) return [];
    return this.reservations.getAllReservations();
  }

  cancelReservation(id) {
    if (!this.isAuthorized()) return { success: false, error: "Unauthorized." };
    return this.reservations.cancelReservation(id);
  }

  getUsers() {
    if (!this.isAuthorized()) return [];
    return this.storage.getUsers();
  }
}

const admin = new AdminManager(storage, auth, orders, reservations);
