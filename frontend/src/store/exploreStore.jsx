
import { create } from "zustand";

const useExploreStore = create((set) => ({
  books: [],
  allAuthors: [],
  allCategories: [],
  allCities: [],
  searchTerm: "",
  filterType: "",
  filterAuthor: "",
  filterCategory: "",
  filterCity: "",
  radius: "",
  userLocation: null,
  selectedBook: null,
  showToast: false,
  requestedBookIds: [],
  showPurchaseConfirmation: false,
  showLoginPrompt: false,
  error: null,
  hasSubmitted: false,

  // Setters
  setBooks: (books) => set({ books }),
  setAllAuthors: (allAuthors) => set({ allAuthors }),
  setAllCategories: (allCategories) => set({ allCategories }),
  setAllCities: (allCities) => set({ allCities }),

  setSearchTerm: (searchTerm) => set({ searchTerm }),
  setFilterType: (filterType) => set({ filterType }),
  setFilterAuthor: (filterAuthor) => set({ filterAuthor }),
  setFilterCategory: (filterCategory) => set({ filterCategory }),
  setFilterCity: (filterCity) => set({ filterCity }),
  setRadius: (radius) => set({ radius }),
  setUserLocation: (userLocation) => set({ userLocation }),

  setSelectedBook: (book) => set({ selectedBook: book }),
  setShowToast: (showToast) => set({ showToast }),
  setRequestedBookIds: (ids) => set({ requestedBookIds: ids }),
  setShowPurchaseConfirmation: (val) => set({ showPurchaseConfirmation: val }),
  setShowLoginPrompt: (val) => set({ showLoginPrompt: val }),
  setError: (err) => set({ error: err }),
  setHasSubmitted: (val) => set({ hasSubmitted: val }),
}));

export default useExploreStore;
