/* ===================================
   FOOD EXPRESS - STORAGE SYSTEM
   Complete localStorage Database
   =================================== */

class DatabaseHelper {
  // localStorage Keys
  static KEYS = {
    USERS: 'fe_users',
    CURRENT_USER: 'fe_currentUser',
    MENU_ITEMS: 'fe_menuItems',
    CATEGORIES: 'fe_categories',
    CARTS: 'fe_carts',      // { userId: [...items] }
    ORDERS: 'fe_orders',    // { userId: [...orders] }
    RESERVATIONS: 'fe_reservations'
  };

  // GET data from localStorage
  static getData(key) {
    try {
      const data = localStorage.getItem(key);
      return data ? JSON.parse(data) : null;
    } catch (e) {
      console.error('Error getting data:', e);
      return null;
    }
  }

  // SET data to localStorage
  static setData(key, value) {
    try {
      localStorage.setItem(key, JSON.stringify(value));
      return true;
    } catch (e) {
      console.error('Error setting data:', e);
      return false;
    }
  }

  // UPDATE data in localStorage
  static updateData(key, updateFn) {
    try {
      const data = this.getData(key) || {};
      const updated = updateFn(data);
      this.setData(key, updated);
      return updated;
    } catch (e) {
      console.error('Error updating data:', e);
      return null;
    }
  }

  // DELETE from localStorage
  static deleteData(key) {
    try {
      localStorage.removeItem(key);
      return true;
    } catch (e) {
      console.error('Error deleting data:', e);
      return false;
    }
  }

  // CLEAR all app data
  static clearAllData() {
    try {
      Object.values(this.KEYS).forEach(key => localStorage.removeItem(key));
      return true;
    } catch (e) {
      console.error('Error clearing data:', e);
      return false;
    }
  }

  // Initialize database with seed data
  static initialize() {
    // Check if already initialized
    if (this.getData(this.KEYS.USERS) && this.getData(this.KEYS.MENU_ITEMS)) {
      return; // Already initialized
    }

    // Create users
    this.setData(this.KEYS.USERS, [
      {
        id: 'admin_001',
        name: 'Admin User',
        email: 'admin@foodexpress.com',
        phone: '+92-300-1111111',
        address: 'Admin Address',
        password: this.hashPassword('Admin123!'),
        role: 'admin',
        createdAt: new Date().toISOString()
      },
      {
        id: 'customer_001',
        name: 'John Doe',
        email: 'john@example.com',
        phone: '+92-300-9876543',
        address: '123 Main Street',
        password: this.hashPassword('Password123!'),
        role: 'customer',
        createdAt: new Date().toISOString()
      }
    ]);

    // Create categories
    this.setData(this.KEYS.CATEGORIES, [
      { id: 'cat_1', name: 'Biryani', icon: '🍚' },
      { id: 'cat_2', name: 'Karahi', icon: '🍳' },
      { id: 'cat_3', name: 'BBQ', icon: '🔥' },
      { id: 'cat_4', name: 'Desserts', icon: '🍰' },
      { id: 'cat_5', name: 'Beverages', icon: '🥤' }
    ]);

    // Create menu items with Vercel-compatible image paths
    this.setData(this.KEYS.MENU_ITEMS, [
      {
        id: 'item_1',
        name: 'Chicken Biryani',
        category: 'cat_1',
        price: 350,
        description: 'Fragrant basmati rice with tender chicken',
        image: 'https://images.unsplash.com/photo-1599043513718-3aa5ca8b3bb0?w=400&h=300&fit=crop',
        available: true,
        rating: 4.8
      },
      {
        id: 'item_2',
        name: 'Beef Biryani',
        category: 'cat_1',
        price: 400,
        description: 'Premium beef biryani with aromatic spices',
        image: 'https://images.unsplash.com/photo-1585617372265-fc5051290885?w=400&h=300&fit=crop',
        available: true,
        rating: 4.9
      },
      {
        id: 'item_3',
        name: 'Chicken Karahi',
        category: 'cat_2',
        price: 320,
        description: 'Succulent chicken in wok with peppers',
        image: 'https://images.unsplash.com/photo-1596994734367-0a2fcf53d4d8?w=400&h=300&fit=crop',
        available: true,
        rating: 4.7
      },
      {
        id: 'item_4',
        name: 'Mutton Karahi',
        category: 'cat_2',
        price: 420,
        description: 'Tender mutton cooked in traditional wok style',
        image: 'https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?w=400&h=300&fit=crop',
        available: true,
        rating: 4.8
      },
      {
        id: 'item_5',
        name: 'Chicken Tikka',
        category: 'cat_3',
        price: 280,
        description: 'Marinated chicken grilled to perfection',
        image: 'https://images.unsplash.com/photo-1599043513714-e0f6887cf663?w=400&h=300&fit=crop',
        available: true,
        rating: 4.6
      },
      {
        id: 'item_6',
        name: 'Seekh Kebab',
        category: 'cat_3',
        price: 250,
        description: 'Minced meat kebabs grilled on skewers',
        image: 'https://images.unsplash.com/photo-1612874742237-415c69f18133?w=400&h=300&fit=crop',
        available: true,
        rating: 4.7
      },
      {
        id: 'item_7',
        name: 'Gulab Jamun',
        category: 'cat_4',
        price: 150,
        description: 'Soft milk solids dipped in sugar syrup',
        image: 'https://images.unsplash.com/photo-1585421514284-efb92195efee?w=400&h=300&fit=crop',
        available: true,
        rating: 4.8
      },
      {
        id: 'item_8',
        name: 'Kheer',
        category: 'cat_4',
        price: 120,
        description: 'Creamy rice pudding with dry fruits',
        image: 'https://images.unsplash.com/photo-1585421514277-dac1f91ff905?w=400&h=300&fit=crop',
        available: true,
        rating: 4.7
      },
      {
        id: 'item_9',
        name: 'Falooda',
        category: 'cat_4',
        price: 180,
        description: 'Ice cream dessert with vermicelli and rose syrup',
        image: 'https://images.unsplash.com/photo-1585421514208-ad7f5c62f4dd?w=400&h=300&fit=crop',
        available: true,
        rating: 4.9
      },
      {
        id: 'item_10',
        name: 'Mango Lassi',
        category: 'cat_5',
        price: 120,
        description: 'Refreshing yogurt-based mango drink',
        image: 'https://images.unsplash.com/photo-1599810694-b3bde6d7c8c5?w=400&h=300&fit=crop',
        available: true,
        rating: 4.8
      },
      {
        id: 'item_11',
        name: 'Mint Lemonade',
        category: 'cat_5',
        price: 100,
        description: 'Fresh lemonade with mint leaves',
        image: 'https://images.unsplash.com/photo-1599599810964-1ed4fa4ca6d0?w=400&h=300&fit=crop',
        available: true,
        rating: 4.7
      },
      {
        id: 'item_12',
        name: 'Soft Drink',
        category: 'cat_5',
        price: 80,
        description: 'Chilled soft drink - Cola, Sprite, or 7UP',
        image: 'https://images.unsplash.com/photo-1554866585-d7620efcd987?w=400&h=300&fit=crop',
        available: true,
        rating: 4.5
      }
    ]);

    // Initialize empty carts, orders, reservations
    this.setData(this.KEYS.CARTS, {});
    this.setData(this.KEYS.ORDERS, {});
    this.setData(this.KEYS.RESERVATIONS, {});
  }

  // Hash password (simple, not cryptographic)
  static hashPassword(password) {
    let hash = 0;
    for (let i = 0; i < password.length; i++) {
      const char = password.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash;
    }
    return 'hash_' + Math.abs(hash).toString(36);
  }

  // Verify password
  static verifyPassword(password, hash) {
    return this.hashPassword(password) === hash;
  }
}

// Initialize on load
DatabaseHelper.initialize();
