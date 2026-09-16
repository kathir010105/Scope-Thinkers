import { create } from "zustand";

const useTripStore = create((set, get) => ({
  favorites: [],
  trip: [],

  toggleFavorite: (attraction) => {
    const favorites = get().favorites;

    const exists = favorites.some((item) => item.xid === attraction.xid);

    if (exists) {
      set({
        favorites: favorites.filter((item) => item.xid !== attraction.xid),
      });
    } else {
      set({
        favorites: [...favorites, attraction],
      });
    }
  },

  addToTrip: (attraction) => {
    const trip = get().trip;

    const exists = trip.some((item) => item.xid === attraction.xid);

    if (!exists) {
      set({
        trip: [...trip, attraction],
      });
    }
  },

  removeFromTrip: (xid) => {
    set({
      trip: get().trip.filter((item) => item.xid !== xid),
    });
  },

  isFavorite: (xid) => {
    return get().favorites.some((item) => item.xid === xid);
  },

  isInTrip: (xid) => {
    return get().trip.some((item) => item.xid === xid);
  },
}));

export default useTripStore;
