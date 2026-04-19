class OrdersManager {
  constructor(storageManager, authManager, cartManager) {
    this.storage = storageManager;
    this.auth = authManager;
    this.cart = cartManager;
  }

  createOrder({ deliveryAddress, notes }) {
    const user = this.auth.getCurrentUser();
    if (!user) return { success: false, error: "Please login first." };

    const cartTotals = this.cart.getCartTotals();
    if (!cartTotals.items.length) return { success: false, error: "Cart is empty." };

    const order = this.storage.createOrder({
      userId: user.id,
      userName: user.fullName,
      userEmail: user.email,
      userPhone: user.phone,
      deliveryAddress,
      notes: notes || "",
      items: cartTotals.items,
      subtotal: cartTotals.subtotal,
      deliveryFee: cartTotals.deliveryFee,
      total: cartTotals.total,
      estimatedDeliveryTime: new Date(Date.now() + 45 * 60 * 1000).toISOString()
    });

    this.cart.clearCart();
    return { success: true, order };
  }

  getUserOrders(userId = null) {
    const currentUser = this.auth.getCurrentUser();
    const resolvedUserId = userId || (currentUser ? currentUser.id : null);
    if (!resolvedUserId) return [];
    return this.storage.getUserOrders(resolvedUserId);
  }

  getOrderById(orderId) {
    return this.storage.getOrderById(orderId);
  }

  getAllOrders() {
    if (!this.auth.isAdmin()) return [];
    return this.storage.getOrders().sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  }

  updateOrderStatus(orderId, status) {
    if (!this.auth.isAdmin()) return { success: false, error: "Unauthorized." };
    const valid = ["Pending", "Preparing", "Out for Delivery", "Delivered", "Cancelled"];
    if (!valid.includes(status)) return { success: false, error: "Invalid status." };

    const updated = this.storage.updateOrderStatus(orderId, status);
    if (!updated) return { success: false, error: "Order not found." };

    return { success: true, order: updated };
  }

  getStats() {
    const all = this.storage.getOrders();
    return {
      total: all.length,
      pending: all.filter(o => o.status === "Pending").length,
      preparing: all.filter(o => o.status === "Preparing").length,
      inDelivery: all.filter(o => o.status === "Out for Delivery").length,
      delivered: all.filter(o => o.status === "Delivered").length,
      cancelled: all.filter(o => o.status === "Cancelled").length,
      totalRevenue: all.reduce((sum, o) => sum + o.total, 0)
    };
  }
}

const orders = new OrdersManager(storage, auth, cart);
