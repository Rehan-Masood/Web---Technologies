class StorageManager {
  constructor() {
    this.KEYS = {
      USERS: "fe_users",
      SESSION: "fe_session",
      CATEGORIES: "fe_categories",
      MENU_ITEMS: "fe_menu_items",
      CARTS: "fe_carts",
      ORDERS: "fe_orders",
      RESERVATIONS: "fe_reservations"
    };
  }

  initialize() {
    if (!this.getUsers().length) this.seedUsers();
    if (!this.getCategories().length) this.setCategories(this.getSeedCategories());
    if (!this.getMenuItems().length) this.setMenuItems(this.getSeedMenuItems());
    if (!this.getOrders().length) this.setOrders([]);
    if (!this.getReservations().length) this.setReservations([]);
    if (!this.getCartsMap()) this.setCartsMap({});
  }

  get(key, fallback) {
    try {
      const value = localStorage.getItem(key);
      return value ? JSON.parse(value) : fallback;
    } catch (error) {
      console.error("Storage read error:", error);
      return fallback;
    }
  }

  set(key, value) {
    localStorage.setItem(key, JSON.stringify(value));
  }

  generateId(prefix) {
    return `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
  }

  hashPassword(password) {
    let hash = 0;
    for (let i = 0; i < password.length; i++) {
      hash = (hash << 5) - hash + password.charCodeAt(i);
      hash |= 0;
    }
    return `hashed_${Math.abs(hash).toString(36)}`;
  }

  verifyPassword(password, hash) {
    return this.hashPassword(password) === hash;
  }

  seedUsers() {
    this.setUsers([
      {
        id: "admin_001",
        fullName: "Admin User",
        email: "admin@foodexpress.com",
        phone: "+92-300-1234567",
        address: "Lahore",
        password: this.hashPassword("Admin123!"),
        role: "admin",
        createdAt: new Date().toISOString()
      },
      {
        id: "cust_001",
        fullName: "John Doe",
        email: "john@example.com",
        phone: "+92-300-9876543",
        address: "Johar Town, Lahore",
        password: this.hashPassword("Password123!"),
        role: "customer",
        createdAt: new Date().toISOString()
      }
    ]);
  }

  getUsers() {
    return this.get(this.KEYS.USERS, []);
  }

  setUsers(users) {
    this.set(this.KEYS.USERS, users);
  }

  addUser(userData) {
    const users = this.getUsers();
    const newUser = {
      id: this.generateId("user"),
      fullName: userData.fullName,
      email: userData.email.toLowerCase(),
      phone: userData.phone || "",
      address: userData.address || "",
      password: this.hashPassword(userData.password),
      role: "customer",
      createdAt: new Date().toISOString()
    };
    users.push(newUser);
    this.setUsers(users);
    return newUser;
  }

  getUserByEmail(email) {
    return this.getUsers().find(u => u.email.toLowerCase() === String(email).toLowerCase());
  }

  getUserById(id) {
    return this.getUsers().find(u => u.id === id);
  }

  updateUser(id, updates) {
    const users = this.getUsers();
    const index = users.findIndex(u => u.id === id);
    if (index === -1) return null;
    users[index] = { ...users[index], ...updates };
    this.setUsers(users);
    return users[index];
  }

  setSession(user, rememberMe = false) {
    const expiresAt = Date.now() + (rememberMe ? 30 : 1) * 24 * 60 * 60 * 1000;
    this.set(this.KEYS.SESSION, {
      userId: user.id,
      expiresAt,
      rememberMe,
      token: this.generateId("token")
    });
  }

  getSession() {
    const session = this.get(this.KEYS.SESSION, null);
    if (!session) return null;
    if (Date.now() > session.expiresAt) {
      this.clearSession();
      return null;
    }
    return session;
  }

  clearSession() {
    localStorage.removeItem(this.KEYS.SESSION);
  }

  getCurrentUser() {
    const session = this.getSession();
    if (!session) return null;
    const user = this.getUserById(session.userId);
    if (!user) {
      this.clearSession();
      return null;
    }
    return user;
  }

  getCategories() {
    return this.get(this.KEYS.CATEGORIES, []);
  }

  setCategories(categories) {
    this.set(this.KEYS.CATEGORIES, categories);
  }

  addCategory(data) {
    const categories = this.getCategories();
    const category = {
      id: this.generateId("cat"),
      name: data.name,
      description: data.description || "",
      createdAt: new Date().toISOString()
    };
    categories.push(category);
    this.setCategories(categories);
    return category;
  }

  getCategoryById(id) {
    return this.getCategories().find(c => c.id === id);
  }

  updateCategory(id, updates) {
    const categories = this.getCategories();
    const index = categories.findIndex(c => c.id === id);
    if (index === -1) return null;
    categories[index] = { ...categories[index], ...updates };
    this.setCategories(categories);
    return categories[index];
  }

  deleteCategory(id) {
    this.setCategories(this.getCategories().filter(c => c.id !== id));
  }

  getMenuItems() {
    return this.get(this.KEYS.MENU_ITEMS, []);
  }

  setMenuItems(items) {
    this.set(this.KEYS.MENU_ITEMS, items);
  }

  addMenuItem(data) {
    const items = this.getMenuItems();
    const item = {
      id: this.generateId("item"),
      name: data.name,
      category: data.category,
      price: Number(data.price),
      description: data.description || "",
      image: data.image || this.createFallbackImage(data.name || "Food Item"),
      available: data.available !== false,
      rating: data.rating || 4.5,
      createdAt: new Date().toISOString()
    };
    items.push(item);
    this.setMenuItems(items);
    return item;
  }

  updateMenuItem(id, updates) {
    const items = this.getMenuItems();
    const index = items.findIndex(item => item.id === id);
    if (index === -1) return null;
    items[index] = { ...items[index], ...updates };
    this.setMenuItems(items);
    return items[index];
  }

  deleteMenuItem(id) {
    this.setMenuItems(this.getMenuItems().filter(item => item.id !== id));
  }

  getMenuItemById(id) {
    return this.getMenuItems().find(item => item.id === id);
  }

  getMenuItemsByCategory(categoryId) {
    if (!categoryId || categoryId === "all") return this.getMenuItems();
    return this.getMenuItems().filter(item => item.category === categoryId);
  }

  searchMenuItems(query, categoryId = "all") {
    const q = String(query || "").trim().toLowerCase();
    return this.getMenuItemsByCategory(categoryId).filter(item =>
      item.name.toLowerCase().includes(q) ||
      item.description.toLowerCase().includes(q)
    );
  }

  getCartsMap() {
    return this.get(this.KEYS.CARTS, {});
  }

  setCartsMap(carts) {
    this.set(this.KEYS.CARTS, carts);
  }

  getCart(userId) {
    const carts = this.getCartsMap();
    return carts[userId] || [];
  }

  setCart(userId, cartItems) {
    const carts = this.getCartsMap();
    carts[userId] = cartItems;
    this.setCartsMap(carts);
  }

  clearCart(userId) {
    this.setCart(userId, []);
  }

  getOrders() {
    return this.get(this.KEYS.ORDERS, []);
  }

  setOrders(orders) {
    this.set(this.KEYS.ORDERS, orders);
  }

  createOrder(orderData) {
    const orders = this.getOrders();
    const order = {
      id: this.generateId("order"),
      orderNumber: `FE-${Date.now()}`,
      ...orderData,
      status: "Pending",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    orders.push(order);
    this.setOrders(orders);
    return order;
  }

  getOrderById(id) {
    return this.getOrders().find(order => order.id === id);
  }

  getUserOrders(userId) {
    return this.getOrders()
      .filter(order => order.userId === userId)
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  }

  updateOrderStatus(orderId, status) {
    const orders = this.getOrders();
    const index = orders.findIndex(order => order.id === orderId);
    if (index === -1) return null;
    orders[index].status = status;
    orders[index].updatedAt = new Date().toISOString();
    this.setOrders(orders);
    return orders[index];
  }

  getReservations() {
    return this.get(this.KEYS.RESERVATIONS, []);
  }

  setReservations(list) {
    this.set(this.KEYS.RESERVATIONS, list);
  }

  createReservation(data) {
    const reservations = this.getReservations();
    const reservation = {
      id: this.generateId("res"),
      reservationNumber: `RES-${Date.now()}`,
      ...data,
      status: "Confirmed",
      createdAt: new Date().toISOString()
    };
    reservations.push(reservation);
    this.setReservations(reservations);
    return reservation;
  }

  getUserReservations(userId) {
    return this.getReservations()
      .filter(r => r.userId === userId)
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  }

  updateReservation(id, updates) {
    const reservations = this.getReservations();
    const index = reservations.findIndex(r => r.id === id);
    if (index === -1) return null;
    reservations[index] = { ...reservations[index], ...updates };
    this.setReservations(reservations);
    return reservations[index];
  }

  deleteReservation(id) {
    this.setReservations(this.getReservations().filter(r => r.id !== id));
  }

  createFallbackImage(title = "Food Item") {
    const label = encodeURIComponent(title);
    return `https://placehold.co/800x600/111111/e0b11e?text=${label}`;
  }

  getSeedCategories() {
    return [
      { id: "cat_1", name: "Biryani", description: "Aromatic rice dishes" },
      { id: "cat_2", name: "Karahi", description: "Traditional karahi dishes" },
      { id: "cat_3", name: "BBQ", description: "Grilled favorites" },
      { id: "cat_4", name: "Desserts", description: "Sweet dishes" },
      { id: "cat_5", name: "Beverages", description: "Drinks" }
    ];
  }

  getSeedMenuItems() {
    return [
      {
        id: "item_1",
        name: "Chicken Biryani",
        category: "cat_1",
        price: 350,
        description: "Fragrant basmati rice with tender chicken and spices.",
        image: "https://images.unsplash.com/photo-1701579231305-d84d8af9a3fd?auto=format&fit=crop&w=900&q=80",
        available: true,
        rating: 4.8
      },
      {
        id: "item_2",
        name: "Beef Biryani",
        category: "cat_1",
        price: 420,
        description: "Premium beef biryani cooked with aromatic herbs.",
        image: "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=900&q=80",
        available: true,
        rating: 4.7
      },
      {
        id: "item_3",
        name: "Chicken Karahi",
        category: "cat_2",
        price: 780,
        description: "Classic chicken karahi with tomatoes and ginger.",
        image: "https://images.unsplash.com/photo-1603894584373-5ac82b2ae398?auto=format&fit=crop&w=900&q=80",
        available: true,
        rating: 4.9
      },
      {
        id: "item_4",
        name: "Mutton Karahi",
        category: "cat_2",
        price: 980,
        description: "Rich mutton karahi with authentic desi flavor.",
        image: "https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=900&q=80",
        available: true,
        rating: 4.8
      },
      {
        id: "item_5",
        name: "Chicken Tikka",
        category: "cat_3",
        price: 320,
        description: "Smoky and spicy grilled chicken tikka.",
        image: "https://images.unsplash.com/photo-1527477396000-e27163b481c2?auto=format&fit=crop&w=900&q=80",
        available: true,
        rating: 4.6
      },
      {
        id: "item_6",
        name: "Seekh Kebab",
        category: "cat_3",
        price: 290,
        description: "Juicy seekh kebab served hot and fresh.",
        image: "https://images.unsplash.com/photo-1555939594-58d7cb561ad1?auto=format&fit=crop&w=900&q=80",
        available: true,
        rating: 4.5
      },
      {
        id: "item_7",
        name: "Gulab Jamun",
        category: "cat_4",
        price: 180,
        description: "Soft gulab jamun in warm sugar syrup.",
        image: "https://images.unsplash.com/photo-1578985545062-69928b1d9587?auto=format&fit=crop&w=900&q=80",
        available: true,
        rating: 4.6
      },
      {
        id: "item_8",
        name: "Kheer",
        category: "cat_4",
        price: 190,
        description: "Creamy traditional rice pudding.",
        image: "https://images.unsplash.com/photo-1551024601-bec78aea704b?auto=format&fit=crop&w=900&q=80",
        available: true,
        rating: 4.4
      },
      {
        id: "item_9",
        name: "Soft Drink",
        category: "cat_5",
        price: 120,
        description: "Chilled soft drink.",
        image: "https://images.unsplash.com/photo-1543253687-c931c8e01820?auto=format&fit=crop&w=900&q=80",
        available: true,
        rating: 4.2
      },
      {
        id: "item_10",
        name: "Mint Margarita",
        category: "cat_5",
        price: 220,
        description: "Refreshing mint margarita.",
        image: "https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?auto=format&fit=crop&w=900&q=80",
        available: true,
        rating: 4.8
      }
    ];
  }
}

const storage = new StorageManager();
storage.initialize();
