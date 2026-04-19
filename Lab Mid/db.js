/* ===================================
   FOOD EXPRESS - DATABASE COMPATIBILITY LAYER
   Synced with storage.js
   =================================== */

class DatabaseHelper {
  static KEYS = {
    USERS: "fe_users",
    CURRENT_USER: "fe_currentUser",
    MENU_ITEMS: "fe_menu_items",
    CATEGORIES: "fe_categories",
    CARTS: "fe_carts",
    ORDERS: "fe_orders",
    RESERVATIONS: "fe_reservations"
  };

  static getData(key) {
    try {
      const data = localStorage.getItem(key);
      return data ? JSON.parse(data) : null;
    } catch (e) {
      console.error("Error getting data:", e);
      return null;
    }
  }

  static setData(key, value) {
    try {
      localStorage.setItem(key, JSON.stringify(value));
      return true;
    } catch (e) {
      console.error("Error setting data:", e);
      return false;
    }
  }

  static updateData(key, updateFn) {
    try {
      const current = this.getData(key);
      const base = current ?? (key === this.KEYS.ORDERS || key === this.KEYS.RESERVATIONS ? [] : {});
      const updated = updateFn(base);
      this.setData(key, updated);
      return updated;
    } catch (e) {
      console.error("Error updating data:", e);
      return null;
    }
  }

  static deleteData(key) {
    try {
      localStorage.removeItem(key);
      return true;
    } catch (e) {
      console.error("Error deleting data:", e);
      return false;
    }
  }

  static clearAllData() {
    try {
      Object.values(this.KEYS).forEach(key => localStorage.removeItem(key));
      return true;
    } catch (e) {
      console.error("Error clearing data:", e);
      return false;
    }
  }

  // SAME hashing logic as storage.js
  static hashPassword(password) {
    let hash = 0;
    for (let i = 0; i < password.length; i++) {
      hash = (hash << 5) - hash + password.charCodeAt(i);
      hash |= 0;
    }
    return `hashed_${Math.abs(hash).toString(36)}`;
  }

  static verifyPassword(password, hash) {
    return this.hashPassword(password) === hash;
  }

  static initialize() {
    const users = this.getData(this.KEYS.USERS);
    const categories = this.getData(this.KEYS.CATEGORIES);
    const menuItems = this.getData(this.KEYS.MENU_ITEMS);
    const carts = this.getData(this.KEYS.CARTS);
    const orders = this.getData(this.KEYS.ORDERS);
    const reservations = this.getData(this.KEYS.RESERVATIONS);

    if (!users || !Array.isArray(users) || users.length === 0) {
      this.setData(this.KEYS.USERS, [
        {
          id: "admin_001",
          fullName: "Admin User",
          name: "Admin User",
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
          name: "John Doe",
          email: "john@example.com",
          phone: "+92-300-9876543",
          address: "Johar Town, Lahore",
          password: this.hashPassword("Password123!"),
          role: "customer",
          createdAt: new Date().toISOString()
        }
      ]);
    }

    if (!categories || !Array.isArray(categories) || categories.length === 0) {
      this.setData(this.KEYS.CATEGORIES, [
        { id: "cat_1", name: "Biryani", description: "Aromatic rice dishes", icon: "🍚" },
        { id: "cat_2", name: "Karahi", description: "Traditional karahi dishes", icon: "🍳" },
        { id: "cat_3", name: "BBQ", description: "Grilled favorites", icon: "🔥" },
        { id: "cat_4", name: "Desserts", description: "Sweet dishes", icon: "🍰" },
        { id: "cat_5", name: "Beverages", description: "Drinks", icon: "🥤" }
      ]);
    }

    if (!menuItems || !Array.isArray(menuItems) || menuItems.length === 0) {
      this.setData(this.KEYS.MENU_ITEMS, [
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
      ]);
    }

    if (!carts || typeof carts !== "object" || Array.isArray(carts)) {
      this.setData(this.KEYS.CARTS, {});
    }

    if (!orders || !Array.isArray(orders)) {
      this.setData(this.KEYS.ORDERS, []);
    }

    if (!reservations || !Array.isArray(reservations)) {
      this.setData(this.KEYS.RESERVATIONS, []);
    }
  }
}

DatabaseHelper.initialize();
