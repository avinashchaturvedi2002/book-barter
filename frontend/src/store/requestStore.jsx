import { create } from "zustand";

const useRequestStore = create((set) => ({
  incomingRequests: [],
  purchaseNotifications: [],
  securityAmount: "0",
  securityOfferSuccess: false,
  error: null,

  fetchRequests: async (token, showLoader, hideLoader) => {
    showLoader("Getting your incoming requests...");
    try {
      const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/user/incoming-requests`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();

      set({
        incomingRequests: data.exchangeRequests,
        purchaseNotifications: data.purchaseRequests,
      });
    } catch (err) {
      set({ error: err?.message || "Failed to load requests" });
    } finally {
      hideLoader();
    }
  },

  updateExchangeStatus: async (id, newStatus, token, showLoader, hideLoader) => {
    showLoader("Updating request status...");
    try {
      const endpoint =
        newStatus === "accepted"
          ? `/api/exchange/accept-exchange/${id}`
          : `/api/exchange/reject-exchange/${id}`;
      const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}${endpoint}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message);

      set((state) => ({
        incomingRequests: state.incomingRequests.map((r) =>
          r._id === id ? { ...r, status: newStatus } : r
        ),
      }));
    } catch (err) {
      set({ error: err?.message || "Error updating exchange status" });
    } finally {
      hideLoader();
    }
  },

  updatePurchaseStatus: async (id, newStatus, token, showLoader, hideLoader) => {
    showLoader("Updating purchase status...");
    try {
      const endpoint =
        newStatus === "accepted"
          ? `/api/purchase/accept-purchase/${id}`
          : `/api/purchase/reject-purchase/${id}`;

      const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}${endpoint}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message);

      set((state) => ({
        purchaseNotifications: state.purchaseNotifications.map((p) =>
          p._id === id ? { ...p, status: newStatus } : p
        ),
      }));
    } catch (err) {
      set({ error: err?.message || "Error updating purchase status" });
    } finally {
      hideLoader();
    }
  },

  setSecurityOfferSuccess: (success, amount = "0") =>
    set({ securityOfferSuccess: success, securityAmount: amount }),

  resetSecurityState: () =>
    set({ securityOfferSuccess: false, securityAmount: "0" }),

  clearError: () => set({ error: null }),

  handleCounterSuccess: (id) =>
    set((state) => ({
      incomingRequests: state.incomingRequests.map((r) =>
        r._id === id ? { ...r, status: "counter_pending" } : r
      ),
    })),
}));

export default useRequestStore;
