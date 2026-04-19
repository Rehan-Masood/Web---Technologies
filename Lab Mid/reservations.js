class ReservationManager {
  constructor(storageManager, authManager) {
    this.storage = storageManager;
    this.auth = authManager;
    this.openingHour = 12;
    this.closingHour = 23;
  }

  createReservation({ numberOfPeople, reservationDate, reservationTime, specialRequests }) {
    const user = this.auth.getCurrentUser();
    if (!user) return { success: false, error: "Please login first." };

    const guests = Number(numberOfPeople);
    if (!guests || guests < 1 || guests > 20) {
      return { success: false, error: "Number of people must be between 1 and 20." };
    }

    if (!reservationDate || !reservationTime) {
      return { success: false, error: "Date and time are required." };
    }

    const selected = new Date(`${reservationDate}T${reservationTime}`);
    if (selected.getTime() <= Date.now()) {
      return { success: false, error: "Please choose a future reservation date/time." };
    }

    const hour = Number(reservationTime.split(":")[0]);
    if (hour < this.openingHour || hour >= this.closingHour) {
      return { success: false, error: "Reservation time must be within operating hours." };
    }

    const reservation = this.storage.createReservation({
      userId: user.id,
      userName: user.fullName,
      userEmail: user.email,
      userPhone: user.phone,
      numberOfPeople: guests,
      reservationDate,
      reservationTime,
      specialRequests: specialRequests || ""
    });

    return { success: true, reservation };
  }

  getUserReservations(userId = null) {
    const currentUser = this.auth.getCurrentUser();
    const resolvedUserId = userId || (currentUser ? currentUser.id : null);
    if (!resolvedUserId) return [];
    return this.storage.getUserReservations(resolvedUserId);
  }

  getAllReservations() {
    if (!this.auth.isAdmin()) return [];
    return this.storage.getReservations().sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  }

  cancelReservation(id) {
    const currentUser = this.auth.getCurrentUser();
    if (!currentUser) return { success: false, error: "Please login first." };

    const reservation = this.storage.getReservations().find(r => r.id === id);
    if (!reservation) return { success: false, error: "Reservation not found." };

    if (reservation.userId !== currentUser.id && !this.auth.isAdmin()) {
      return { success: false, error: "Unauthorized." };
    }

    const updated = this.storage.updateReservation(id, { status: "Cancelled" });
    return { success: true, reservation: updated };
  }
}

const reservations = new ReservationManager(storage, auth);
