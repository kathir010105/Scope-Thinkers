import { create } from "zustand";
import { persist } from "zustand/middleware";

const useCartStore = create(
  persist(
    (set, get) => ({
      // -----------------------------------
      // STATE
      // -----------------------------------

      cartId: null,

      restaurantId: null,
      restaurantName: "",

      items: [],

      loading: false,
      error: null,

      // -----------------------------------
      // LOAD CART
      // -----------------------------------
      // The cart is automatically restored
      // from localStorage by Zustand persist.

      loadCart: async () => {
        return get();
      },

      // -----------------------------------
      // ADD ITEM
      // -----------------------------------

      addItem: async ({ item, restaurant, quantity = 1 }) => {
        try {
          set({
            error: null,
          });

          const state = get();

          // --------------------------------
          // DIFFERENT RESTAURANT CHECK
          // --------------------------------

          if (
            state.restaurantId &&
            state.restaurantId !== restaurant.id &&
            state.items.length > 0
          ) {
            return {
              success: false,
              reason: "DIFFERENT_RESTAURANT",
            };
          }

          // --------------------------------
          // CHECK IF ITEM ALREADY EXISTS
          // --------------------------------

          const existingItem = state.items.find(
            (cartItem) => cartItem.menu_item_id === item.id,
          );

          // --------------------------------
          // UPDATE EXISTING ITEM
          // --------------------------------

          if (existingItem) {
            set({
              items: state.items.map((cartItem) =>
                cartItem.menu_item_id === item.id
                  ? {
                      ...cartItem,
                      quantity: cartItem.quantity + quantity,
                    }
                  : cartItem,
              ),

              restaurantId: restaurant.id,
              restaurantName: restaurant.name,
            });

            return {
              success: true,
            };
          }

          // --------------------------------
          // ADD NEW ITEM
          // --------------------------------

          const newCartItem = {
            id: crypto.randomUUID(),

            menu_item_id: item.id,

            quantity,

            unit_price: Number(item.price),

            special_instructions: null,

            menu_items: {
              id: item.id,
              name: item.name,
              description: item.description || "",
              price: Number(item.price),
              image_url: item.image_url || null,
              dietary_type: item.dietary_type || "unknown",
              restaurant_id: restaurant.id,
            },
          };

          set({
            items: [...state.items, newCartItem],

            restaurantId: restaurant.id,

            restaurantName: restaurant.name,

            error: null,
          });

          return {
            success: true,
          };
        } catch (error) {
          console.error("Failed to add cart item:", error);

          set({
            error: error.message,
          });

          return {
            success: false,
            reason: "ERROR",
          };
        }
      },

      // -----------------------------------
      // INCREASE ITEM
      // -----------------------------------

      increaseItem: async (cartItemId) => {
        const state = get();

        set({
          items: state.items.map((item) =>
            item.id === cartItemId
              ? {
                  ...item,
                  quantity: item.quantity + 1,
                }
              : item,
          ),
        });
      },

      // -----------------------------------
      // DECREASE ITEM
      // -----------------------------------

      decreaseItem: async (cartItemId) => {
        const state = get();

        const currentItem = state.items.find((item) => item.id === cartItemId);

        if (!currentItem) {
          return;
        }

        // Remove item if quantity becomes zero
        if (currentItem.quantity <= 1) {
          const remainingItems = state.items.filter(
            (item) => item.id !== cartItemId,
          );

          set({
            items: remainingItems,

            ...(remainingItems.length === 0
              ? {
                  restaurantId: null,
                  restaurantName: "",
                }
              : {}),
          });

          return;
        }

        // Otherwise decrease quantity
        set({
          items: state.items.map((item) =>
            item.id === cartItemId
              ? {
                  ...item,
                  quantity: item.quantity - 1,
                }
              : item,
          ),
        });
      },

      // -----------------------------------
      // REMOVE ITEM
      // -----------------------------------

      removeItem: async (cartItemId) => {
        const state = get();

        const remainingItems = state.items.filter(
          (item) => item.id !== cartItemId,
        );

        set({
          items: remainingItems,

          ...(remainingItems.length === 0
            ? {
                restaurantId: null,
                restaurantName: "",
              }
            : {}),
        });
      },

      // -----------------------------------
      // REPLACE ENTIRE CART
      // -----------------------------------

      replaceCart: async ({ item, restaurant, quantity = 1 }) => {
        const newCartItem = {
          id: crypto.randomUUID(),

          menu_item_id: item.id,

          quantity,

          unit_price: Number(item.price),

          special_instructions: null,

          menu_items: {
            id: item.id,
            name: item.name,
            description: item.description || "",
            price: Number(item.price),
            image_url: item.image_url || null,
            dietary_type: item.dietary_type || "unknown",
            restaurant_id: restaurant.id,
          },
        };

        set({
          items: [newCartItem],

          restaurantId: restaurant.id,

          restaurantName: restaurant.name,

          error: null,
        });

        return {
          success: true,
        };
      },

      // -----------------------------------
      // EMPTY CART
      // -----------------------------------

      emptyCart: async () => {
        set({
          cartId: null,

          restaurantId: null,

          restaurantName: "",

          items: [],

          error: null,
        });
      },

      // -----------------------------------
      // GET ITEM QUANTITY
      // -----------------------------------

      getItemQuantity: (menuItemId) => {
        const item = get().items.find(
          (cartItem) => cartItem.menu_item_id === menuItemId,
        );

        return item?.quantity || 0;
      },

      // -----------------------------------
      // GET SUBTOTAL
      // -----------------------------------

      getSubtotal: () => {
        return get().items.reduce(
          (total, item) =>
            total + Number(item.unit_price) * Number(item.quantity),
          0,
        );
      },

      // -----------------------------------
      // GET TOTAL ITEM COUNT
      // -----------------------------------

      getItemCount: () => {
        return get().items.reduce(
          (total, item) => total + Number(item.quantity),
          0,
        );
      },

      // -----------------------------------
      // CLEAR ERROR
      // -----------------------------------

      clearError: () => {
        set({
          error: null,
        });
      },
    }),

    {
      // This is the localStorage key
      name: "blueberry-cart",

      // Only persist actual cart information
      partialize: (state) => ({
        cartId: state.cartId,

        restaurantId: state.restaurantId,

        restaurantName: state.restaurantName,

        items: state.items,
      }),
    },
  ),
);

export default useCartStore;
