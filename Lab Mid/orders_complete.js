/* ========================================
   FOOD EXPRESS - ORDERS MANAGER
   ======================================== */

class OrdersManager {
  constructor(storageManager) {
    this.storage = storageManager;
  }

  // Create a new order
  createOrder(orderData) {
    if (!orderData.userId || !orderData.items || orderData.items.length === 0) {
      return null;
    }

    return this.storage.createOrder(orderData);
  }

  // Get all orders (admin)
  getAllOrders() {
    return this.storage.getOrders();
  }

  // Get user orders
  getUserOrders(userId) {
    if (!userId) return [];
    return this.storage.getUserOrders(userId);
  }

  // Get order by ID
  getOrderById(orderId) {
    return this.storage.getOrderById(orderId);
  }

  // Get order by number
  getOrderByNumber(orderNumber) {
    return this.storage.getOrderByNumber(orderNumber);
  }

  // Update order status
  updateOrderStatus(orderId, newStatus) {
    const validStatuses = ['Pending', 'Preparing', 'Out for Delivery', 'Delivered', 'Cancelled'];
    
    if (!validStatuses.includes(newStatus)) {
      return { success: false, error: 'Invalid status' };
    }

    const updated = this.storage.updateOrderStatus(orderId, newStatus);
    if (updated) {
      return { success: true, order: updated };
    }

    return { success: false, error: 'Order not found' };
  }

  // Get order statistics
  getOrderStats() {
    const orders = this.storage.getOrders();
    
    return {
      total: orders.length,
      pending: orders.filter(o => o.status === 'Pending').length,
      preparing: orders.filter(o => o.status === 'Preparing').length,
      inDelivery: orders.filter(o => o.status === 'Out for Delivery').length,
      delivered: orders.filter(o => o.status === 'Delivered').length,
      cancelled: orders.filter(o => o.status === 'Cancelled').length,
      totalRevenue: orders.reduce((sum, o) => sum + o.total, 0)
    };
  }

  // Get recent orders
  getRecentOrders(limit = 10) {
    return this.storage.getOrders()
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      .slice(0, limit);
  }

  // Search orders
  searchOrders(query) {
    const orders = this.storage.getOrders();
    const lowerQuery = query.toLowerCase();

    return orders.filter(order =>
      order.orderNumber.toLowerCase().includes(lowerQuery) ||
      order.deliveryAddress.toLowerCase().includes(lowerQuery)
    );
  }

  // Get user order count
  getUserOrderCount(userId) {
    return this.storage.getUserOrders(userId).length;
  }

  // Get delivered orders count
  getDeliveredOrdersCount(userId) {
    return this.storage.getUserOrders(userId)
      .filter(o => o.status === 'Delivered')
      .length;
  }
}

// Create global instance
const orders = new OrdersManager(storage);
