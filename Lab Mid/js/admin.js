class AdminManager {
  constructor(storageManager, authManager, ordersManager, reservationsManager) {
    this.storage = storageManager;
    this.auth = authManager;
    this.orders = ordersManager;
    this.reservations = reservationsManager;
  }

  addCategory(data) {
    if (!this.auth.isAdmin()) return { success: false, error: "Unauthorized." };
    if (!data.name || !data.name.trim()) return { success: false, error: "Category name is required." };
    const category = this.storage.addCategory({
      name: data.name.trim(),
      description: (data.description || "").trim()
    });
    return { success: true, category };
  }

  updateCategory(id, updates) {
    if (!this.auth.isAdmin()) return { success: false, error: "Unauthorized." };
    const category = this.storage.updateCategory(id, updates);
    if (!category) return { success: false, error: "Category not found." };
    return { success: true, category };
  }

  deleteCategory(id) {
    if (!this.auth.isAdmin()) return { success: false, error: "Unauthorized." };
    const items = this.storage.getMenuItemsByCategory(id);
    if (items.length) return { success: false, error: "Cannot delete category with menu items." };
    this.storage.deleteCategory(id);
    return { success: true };
  }

  addMenuItem(data) {
    if (!this.auth.isAdmin()) return { success: false, error: "Unauthorized." };
    if (!data.name || !data.category || !data.price) {
      return { success: false, error: "Name, category and price are required." };
    }
    const item = this.storage.addMenuItem({
      name: data.name.trim(),
      category: data.category,
      price: Number(data.price),
      description: (data.description || "").trim(),
      image: (data.image || "").trim(),
      available: data.available !== false,
      rating: 4.5
    });
    return { success: true, item };
  }

  updateMenuItem(id, updates) {
    if (!this.auth.isAdmin()) return { success: false, error: "Unauthorized." };
    const item = this.storage.updateMenuItem(id, updates);
    if (!item) return { success: false, error: "Menu item not found." };
    return { success: true, item };
  }

  deleteMenuItem(id) {
    if (!this.auth.isAdmin()) return { success: false, error: "Unauthorized." };
    this.storage.deleteMenuItem(id);
    return { success: true };
  }

  getDashboardStats() {
    return {
      users: this.storage.getUsers().filter(u => u.role === "customer").length,
      categories: this.storage.getCategories().length,
      menuItems: this.storage.getMenuItems().length,
      orders: this.storage.getOrders().length,
      reservations: this.storage.getReservations().length
    };
  }
}

const admin = new AdminManager(storage, auth, orders, reservations);