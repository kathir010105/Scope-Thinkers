import { create } from "zustand";

const useBookingStore = create((set) => ({
  // =========================
  // JOURNEY SEARCH
  // =========================

  from: null,
  to: null,
  journeyDate: "",
  quota: "GN",

  // =========================
  // TRAIN
  // =========================

  trains: [],
  selectedTrain: null,

  // =========================
  // CLASS / AVAILABILITY
  // =========================

  selectedClass: null,
  availability: [],
  fare: null,
  totalFare: 0,

  // =========================
  // PASSENGERS
  // =========================

  passengers: [],

  // =========================
  // JOURNEY ACTIONS
  // =========================

  setJourney: ({ from, to, journeyDate, quota }) =>
    set({
      from,
      to,
      journeyDate,
      quota,
    }),

  setTrains: (trains) =>
    set({
      trains,
    }),

  setSelectedTrain: (selectedTrain) =>
    set({
      selectedTrain,
    }),

  // =========================
  // CLASS / FARE ACTIONS
  // =========================

  setClassDetails: ({ selectedClass, availability, fare, totalFare }) =>
    set({
      selectedClass,
      availability,
      fare,
      totalFare,
    }),

  // =========================
  // PASSENGER ACTIONS
  // =========================

  setPassengers: (passengers) =>
    set({
      passengers,
    }),

  addPassenger: (passenger) =>
    set((state) => ({
      passengers: [...state.passengers, passenger],
    })),

  removePassenger: (index) =>
    set((state) => ({
      passengers: state.passengers.filter((_, i) => i !== index),
    })),

  // =========================
  // RESET
  // =========================

  resetBooking: () =>
    set({
      from: null,
      to: null,
      journeyDate: "",
      quota: "GN",

      trains: [],
      selectedTrain: null,

      selectedClass: null,
      availability: [],
      fare: null,
      totalFare: 0,

      passengers: [],
    }),
}));

export default useBookingStore;
