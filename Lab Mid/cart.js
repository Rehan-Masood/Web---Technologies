class CartManager {
  constructor(storageManager, authManager) {
    this.storage = storageManager;
    this.auth = authManager;
  }

  getUserId() {
    const user = this.auth.getCurrentUser();
    return user ? user.id : null;
  }

  getCart() {
    const userId = this.getUserId();
    if (!userId) return [];
    return this.storage.getCart(userId);
  }

  addItem(itemId, quantity = 1) {
    const user = this.auth.getCurrentUser();
    if (!user) return { success: false, error: "Please login first." };

    const item = this.storage.getMenuItemById(itemId);
    if (!item) return { success: false, error: "Menu item not found." };
    if (!item.available) return { success: false, error: "This item is unavailable." };

    const cart = this.storage.getCart(user.id);
    const existing = cart.find(cartItem => cartItem.id === itemId);

    if (existing) {
      existing.quantity += quantity;
    } else {
      cart.push({
        id: item.id,
        name: item.name,
        price: item.price,
        image: item.image,
        category: item.category,
        quantity
      });
    }

    this.storage.setCart(user.id, cart);
    return { success: true, message: `${item.name} added to cart.` };
  }

  updateQuantity(itemId, quantity) {
    const user = this.auth.getCurrentUser();
    if (!user) return { success: false, error: "Please login first." };

    const cart = this.storage.getCart(user.id);
    const item = cart.find(cartItem => cartItem.id === itemId);
    if (!item) return { success: false, error: "Cart item not found." };

    if (quantity <= 0) {
      return this.removeItem(itemId);
    }

    item.quantity = quantity;
    this.storage.setCart(user.id, cart);
    return { success: true };
  }

  removeItem(itemId) {
    const user = this.auth.getCurrentUser();
    if (!user) return { success: false, error: "Please login first." };

    const cart = this.storage.getCart(user.id).filter(item => item.id !== itemId);
    this.storage.setCart(user.id, cart);
    return { success: true };
  }

  clearCart() {
    const user = this.auth.getCurrentUser();
    if (!user) return { success: false };
    this.storage.clearCart(user.id);
    return { success: true };
  }

  getCartTotals() {
    const items = this.getCart();
    const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
    const deliveryFee = items.length ? 199 : 0;
    const total = subtotal + deliveryFee;
    const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);

    return { items, subtotal, deliveryFee, total, itemCount };
  }

  isEmpty() {
    return this.getCart().length === 0;
  }
}

const cart = new CartManager(storage, auth);