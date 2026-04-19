class AuthManager {
  constructor(storageManager) {
    this.storage = storageManager;
  }

  register({ fullName, email, phone, address, password, confirmPassword }) {
    const cleanFullName = String(fullName || "").trim();
    const cleanEmail = String(email || "").trim().toLowerCase();
    const cleanPhone = String(phone || "").trim();
    const cleanAddress = String(address || "").trim();
    const cleanPassword = String(password || "");
    const cleanConfirmPassword = String(confirmPassword || "");

    if (!cleanFullName || !cleanEmail || !cleanPhone || !cleanPassword || !cleanConfirmPassword) {
      return { success: false, error: "Please fill all required fields." };
    }

    if (cleanPassword !== cleanConfirmPassword) {
      return { success: false, error: "Passwords do not match." };
    }

    const strongPassword = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z\d]).{8,}$/;
    if (!strongPassword.test(cleanPassword)) {
      return {
        success: false,
        error: "Password must be at least 8 characters and include uppercase, lowercase, number, and special character."
      };
    }

    if (this.storage.getUserByEmail(cleanEmail)) {
      return { success: false, error: "Email is already registered." };
    }

    const user = this.storage.addUser({
      fullName: cleanFullName,
      email: cleanEmail,
      phone: cleanPhone,
      address: cleanAddress,
      password: cleanPassword
    });

    return { success: true, user };
  }

  login(email, password, rememberMe = false) {
    const cleanEmail = String(email || "").trim().toLowerCase();
    const cleanPassword = String(password || "");

    const user = this.storage.getUserByEmail(cleanEmail);
    if (!user) {
      return { success: false, error: "Email not found." };
    }

    if (!this.storage.verifyPassword(cleanPassword, user.password)) {
      return { success: false, error: "Invalid password." };
    }

    this.storage.setSession(user, rememberMe);
    return { success: true, user: this.getCurrentUser() };
  }

  adminLogin(email, password, rememberMe = false) {
    const cleanEmail = String(email || "").trim().toLowerCase();
    const cleanPassword = String(password || "");

    const user = this.storage.getUserByEmail(cleanEmail);
    if (!user) {
      return { success: false, error: "Admin account not found." };
    }

    if (!this.storage.verifyPassword(cleanPassword, user.password)) {
      return { success: false, error: "Invalid password." };
    }

    if (user.role !== "admin") {
      return {
        success: false,
        error: "This account does not have admin access. Only admin users can login here."
      };
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
    if (!currentUser) {
      return { success: false, error: "Not logged in." };
    }

    const updated = this.storage.updateUser(currentUser.id, {
      fullName: String(updates.fullName || "").trim(),
      phone: String(updates.phone || "").trim(),
      address: String(updates.address || "").trim()
    });

    if (!updated) {
      return { success: false, error: "Failed to update profile." };
    }

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
