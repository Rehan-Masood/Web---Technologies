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

  // ============================================================
  // FIXED - All images now use local paths from assets/img/dishes/
  // No more Unsplash URLs - all saved locally
  // ============================================================
  getSeedMenuItems() {
    return [
      {
        id: "item_1",
        name: "Chicken Biryani",
        category: "cat_1",
        price: 780,
        description: "Fragrant basmati rice with tender chicken and spices.",
        image: "assets/img/dishes/chicken-biryani.jpg",
        available: true,
        rating: 4.8
      },
      {
        id: "item_2",
        name: "Beef Biryani",
        category: "cat_1",
        price: 880,
        description: "Premium beef biryani cooked with aromatic herbs.",
        image: "assets/img/dishes/beef-biryani.jpg",
        available: true,
        rating: 4.7
      },
      {
        id: "item_3",
        name: "Mutton Biryani",
        category: "cat_1",
        price: 980,
        description: "Slow cooked mutton with saffron rice.",
        image: "assets/img/dishes/mutton-biryani.jpg",
        available: true,
        rating: 4.7
      },
      {
        id: "item_4",
        name: "Sindhi Biryani",
        category: "cat_1",
        price: 760,
        description: "Spicy Sindhi-style rice layered with potatoes.",
        image: "assets/img/dishes/sindhi-biryani.jpg",
        available: true,
        rating: 4.5
      },
      {
        id: "item_5",
        name: "Tikka Biryani",
        category: "cat_1",
        price: 820,
        description: "Smoky chicken tikka folded into masala rice.",
        image: "assets/img/dishes/tikka-biryani.jpg",
        available: true,
        rating: 4.6
      },
      {
        id: "item_6",
        name: "Veg Biryani",
        category: "cat_1",
        price: 620,
        description: "Garden vegetables and fragrant rice.",
        image: "assets/img/dishes/veg-biryani.jpg",
        available: true,
        rating: 4.2
      },
      {
        id: "item_7",
        name: "Chicken Karahi",
        category: "cat_2",
        price: 780,
        description: "Classic chicken karahi with fresh tomatoes and spices.",
        image: "assets/img/dishes/chicken-karahi.jpg",
        available: true,
        rating: 4.8
      },
      {
        id: "item_8",
        name: "Mutton Karahi",
        category: "cat_2",
        price: 980,
        description: "Rich mutton karahi with traditional spices.",
        image: "assets/img/dishes/mutton-karahi.jpg",
        available: true,
        rating: 4.8
      },
      {
        id: "item_9",
        name: "White Karahi",
        category: "cat_2",
        price: 920,
        description: "Creamy white karahi with green chilies.",
        image: "assets/img/dishes/white-karahi.jpg",
        available: true,
        rating: 4.6
      },
      {
        id: "item_10",
        name: "Boneless Handi",
        category: "cat_2",
        price: 850,
        description: "Boneless chicken in silky handi gravy.",
        image: "assets/img/dishes/boneless-handi.jpg",
        available: true,
        rating: 4.5
      },
      {
        id: "item_11",
        name: "Peshawari Karahi",
        category: "cat_2",
        price: 1050,
        description: "Bold meat flavor with minimal spice.",
        image: "assets/img/dishes/peshawari-karahi.jpg",
        available: true,
        rating: 4.7
      },
      {
        id: "item_12",
        name: "Paneer Karahi",
        category: "cat_2",
        price: 690,
        description: "Cottage cheese cubes in tomato masala.",
        image: "assets/img/dishes/paneer-karahi.jpg",
        available: true,
        rating: 4.3
      },
      {
        id: "item_13",
        name: "Chicken Tikka",
        category: "cat_3",
        price: 320,
        description: "Tender chicken tikka grilled over charcoal.",
        image: "assets/img/dishes/chicken-tikka.jpg",
        available: true,
        rating: 4.6
      },
      {
        id: "item_14",
        name: "Seekh Kebab",
        category: "cat_3",
        price: 290,
        description: "Juicy minced beef kebab with house spices.",
        image: "assets/img/dishes/seekh-kebab.jpg",
        available: true,
        rating: 4.5
      },
      {
        id: "item_15",
        name: "Malai Boti",
        category: "cat_3",
        price: 420,
        description: "Creamy marinated boneless chicken bites.",
        image: "assets/img/dishes/malai-boti.jpg",
        available: true,
        rating: 4.7
      },
      {
        id: "item_16",
        name: "Reshmi Kebab",
        category: "cat_3",
        price: 390,
        description: "Soft chicken kebab with mild spices.",
        image: "assets/img/dishes/reshmi-kebab.jpg",
        available: true,
        rating: 4.5
      },
      {
        id: "item_17",
        name: "BBQ Platter",
        category: "cat_3",
        price: 1590,
        description: "A generous mix of tikka, kebab and boti.",
        image: "assets/img/dishes/bbq-platter.jpg",
        available: true,
        rating: 4.9
      },
      {
        id: "item_18",
        name: "Fish Tikka",
        category: "cat_3",
        price: 680,
        description: "Spiced fish fillets grilled to order.",
        image: "assets/img/dishes/fish-tikka.jpg",
        available: true,
        rating: 4.4
      },
      {
        id: "item_19",
        name: "Chicken Wings",
        category: "cat_3",
        price: 520,
        description: "Crispy wings with spicy sauce.",
        image: "assets/img/dishes/chicken-wings.jpg",
        available: true,
        rating: 4.5
      },
      {
        id: "item_20",
        name: "Beef Burger",
        category: "cat_3",
        price: 650,
        description: "Juicy beef patty with cheese and vegetables.",
        image: "assets/img/dishes/beef-burger.jpg",
        available: true,
        rating: 4.6
      },
      {
        id: "item_21",
        name: "Chicken Burger",
        category: "cat_3",
        price: 480,
        description: "Grilled chicken burger with mayo and lettuce.",
        image: "assets/img/dishes/chicken-burger.jpg",
        available: true,
        rating: 4.5
      },
      {
        id: "item_22",
        name: "Gulab Jamun",
        category: "cat_4",
        price: 180,
        description: "Warm gulab jamun in cardamom syrup.",
        image: "assets/img/dishes/gulab-jamun.jpg",
        available: true,
        rating: 4.6
      },
      {
        id: "item_23",
        name: "Kheer",
        category: "cat_4",
        price: 190,
        description: "Creamy traditional rice pudding.",
        image: "assets/img/dishes/kheer.jpg",
        available: true,
        rating: 4.4
      },
      {
        id: "item_24",
        name: "Chocolate Brownie",
        category: "cat_4",
        price: 360,
        description: "Dense brownie with chocolate sauce.",
        image: "assets/img/dishes/chocolate-brownie.jpg",
        available: true,
        rating: 4.6
      },
      {
        id: "item_25",
        name: "Lava Cake",
        category: "cat_4",
        price: 480,
        description: "Molten chocolate cake served warm.",
        image: "assets/img/dishes/lava-cake.jpg",
        available: true,
        rating: 4.8
      },
      {
        id: "item_26",
        name: "Ras Malai",
        category: "cat_4",
        price: 280,
        description: "Soft milk dumplings with pistachio.",
        image: "assets/img/dishes/ras-malai.jpg",
        available: true,
        rating: 4.5
      },
      {
        id: "item_27",
        name: "Kulfi",
        category: "cat_4",
        price: 240,
        description: "Traditional frozen milk dessert.",
        image: "assets/img/dishes/kulfi.jpg",
        available: true,
        rating: 4.3
      },
      {
        id: "item_28",
        name: "Mint Margarita",
        category: "cat_5",
        price: 250,
        description: "Fresh mint, lemon and crushed ice.",
        image: "assets/img/dishes/mint-margarita.jpg",
        available: true,
        rating: 4.5
      },
      {
        id: "item_29",
        name: "Mango Lassi",
        category: "cat_5",
        price: 280,
        description: "Thick yogurt drink with sweet mango.",
        image: "assets/img/dishes/mango-lassi.jpg",
        available: true,
        rating: 4.6
      },
      {
        id: "item_30",
        name: "Soft Drink",
        category: "cat_5",
        price: 120,
        description: "Chilled carbonated beverage.",
        image: "assets/img/dishes/soft-drink.jpg",
        available: true,
        rating: 4.2
      },
      {
        id: "item_31",
        name: "Fresh Lime",
        category: "cat_5",
        price: 180,
        description: "Lemon soda with black salt.",
        image: "assets/img/dishes/fresh-lime.jpg",
        available: true,
        rating: 4.3
      },
      {
        id: "item_32",
        name: "Cold Coffee",
        category: "cat_5",
        price: 320,
        description: "Creamy iced coffee with chocolate.",
        image: "assets/img/dishes/cold-coffee.jpg",
        available: true,
        rating: 4.4
      },
      {
        id: "item_33",
        name: "Mineral Water",
        category: "cat_5",
        price: 90,
        description: "Chilled bottled water.",
        image: "assets/img/dishes/mineral-water.jpg",
        available: true,
        rating: 4.1
      }
    ];
  }
}

const storage = new StorageManager();
storage.initialize();