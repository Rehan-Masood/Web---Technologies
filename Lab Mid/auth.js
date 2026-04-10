class AuthManager {
  constructor(storageManager) {
    this.storage = storageManager;
  }

  register({ fullName, email, phone, address, password, confirmPassword }) {
    if (!fullName || !email || !phone || !password || !confirmPassword) {
      return { success: false, error: "Please fill all required fields." };
    }

    if (password !== confirmPassword) {
      return { success: false, error: "Passwords do not match." };
    }

    const strongPassword = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z\d]).{8,}$/;
    if (!strongPassword.test(password)) {
      return {
        success: false,
        error: "Password must be at least 8 characters and include uppercase, lowercase, number, and special character."
      };
    }

    if (this.storage.getUserByEmail(email)) {
      return { success: false, error: "Email is already registered." };
    }

    const user = this.storage.addUser({
      fullName,
      email,
      phone,
      address,
      password
    });

    return { success: true, user };
  }

  login(email, password, rememberMe = false) {
    const user = this.storage.getUserByEmail(email);
    if (!user) return { success: false, error: "Email not found." };
    if (!this.storage.verifyPassword(password, user.password)) {
      return { success: false, error: "Invalid password." };
    }

    this.storage.setSession(user, rememberMe);
    return { success: true, user: this.getCurrentUser() };
  }

  logout() {
    this.storage.clearSession();
    return { success: true };
  }

  getCurrentUser() {
    return this.storage.getCurrentUser();
  }

  isLoggedIn() {
    return !!this.getCurrentUser();
  }

  isAdmin() {
    const user = this.getCurrentUser();
    return !!user && user.role === "admin";
  }

  updateProfile(updates) {
    const currentUser = this.getCurrentUser();
    if (!currentUser) return { success: false, error: "Not logged in." };

    const updated = this.storage.updateUser(currentUser.id, {
      fullName: updates.fullName,
      phone: updates.phone,
      address: updates.address
    });

    if (!updated) return { success: false, error: "Failed to update profile." };

    this.storage.setSession(updated, true);
    return { success: true, user: updated };
  }

  requireLogin() {
    if (!this.isLoggedIn()) {
      window.location.href = "?page=login";
      return false;
    }
    return true;
  }

  requireAdmin() {
    if (!this.isAdmin()) {
      window.location.href = "?page=home";
      return false;
    }
    return true;
  }
}

const auth = new AuthManager(storage);