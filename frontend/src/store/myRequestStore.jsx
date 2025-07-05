// store/myRequestStore.js
import { create } from "zustand";

const useMyRequestStore = create((set, get) => ({
  /* ─────── State ─────── */
  exchange: [],            // array of exchange requests
  purchase: [],            // array of purchase requests
  loading: false,
  error: null,

  /* ─────── Helpers ─────── */
  setLoading: (bool) => set({ loading: bool }),
  setError: (err) => set({ error: err }),

  /* ─────── Selectors ─────── */
  pendingCount: () => {
    const ex = get().exchange.filter((r) => r.status === "pending").length;
    const pu = get().purchase.filter((p) => p.status === "pending").length;
    return ex + pu;
  },

  /* ─────── Actions ─────── */
  fetchMyRequests: async (token, showLoader, hideLoader) => {
    const { setLoading, setError } = get();
    setLoading(true);
    showLoader?.("Getting your request status…");
    try {
      const res = await fetch(
        `${import.meta.env.VITE_BACKEND_URL}/api/user/get-my-request`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);

      set({
        exchange: (data.exchangeRequests || []).filter((r) =>
          ["pending", "accepted", "counter_pending", "counter_offer", "rejected", "security_pending", "security_paid"].includes(
            r.status?.toLowerCase()
          )
        ),
        purchase: data.purchaseRequests || [],
      });
    } catch (err) {
      setError(err.message || "Failed to load requests");
    } finally {
      setLoading(false);
      hideLoader?.();
    }
  },

  updateExchangeStatus: (id, status) =>
    set((state) => ({
      exchange: state.exchange.map((r) =>
        r._id === id ? { ...r, status } : r
      ),
    })),

  removeExchange: (id) =>
    set((state) => ({
      exchange: state.exchange.filter((r) => r._id !== id),
    })),

  updatePurchaseStatus: (id, status) =>
    set((state) => ({
      purchase: state.purchase.map((p) =>
        p._id === id ? { ...p, status } : p
      ),
    })),

  removePurchase: (id) =>
    set((state) => ({
      purchase: state.purchase.filter((p) => p._id !== id),
    })),
}));

export default useMyRequestStore;
