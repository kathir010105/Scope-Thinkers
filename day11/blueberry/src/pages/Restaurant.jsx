import { useEffect, useMemo, useState } from "react";

import { useNavigate, useParams } from "react-router-dom";

import {
  ArrowLeft,
  MapPin,
  Clock3,
  Star,
  ShoppingCart,
  Plus,
  Minus,
  Loader2,
  Utensils,
} from "lucide-react";

import {
  getRestaurantById,
  getRestaurantMenu,
  getMenuCategories,
} from "../services/restaurantService";

import useCartStore from "../store/cartStore";

function Restaurant() {
  const params = useParams();

  const restaurantId = params.restaurantId || params.id;

  const navigate = useNavigate();

  // -----------------------------------
  // RESTAURANT STATE
  // -----------------------------------

  const [restaurant, setRestaurant] = useState(null);

  const [menu, setMenu] = useState([]);

  const [categories, setCategories] = useState([]);

  const [selectedCategory, setSelectedCategory] = useState("all");

  const [loading, setLoading] = useState(true);

  const [error, setError] = useState("");

  // -----------------------------------
  // CART
  // -----------------------------------

  const {
    items: cartItems,

    restaurantId: cartRestaurantId,

    restaurantName: cartRestaurantName,

    loadCart,

    addItem,

    replaceCart,

    increaseItem,

    decreaseItem,

    getItemQuantity,

    getSubtotal,

    getItemCount,
  } = useCartStore();

  // -----------------------------------
  // LOAD RESTAURANT + MENU
  // -----------------------------------

  useEffect(() => {
    async function loadRestaurantData() {
      try {
        setLoading(true);
        setError("");

        if (!restaurantId) {
          throw new Error("Restaurant ID is missing from the URL.");
        }

        console.log("Loading restaurant ID:", restaurantId);

        const [restaurantData, menuData, categoryData] = await Promise.all([
          getRestaurantById(restaurantId),
          getRestaurantMenu(restaurantId),
          getMenuCategories(restaurantId),
        ]);

        console.log("Restaurant:", restaurantData);

        console.log("Menu:", menuData);

        console.log("Categories:", categoryData);

        setRestaurant(restaurantData);
        setMenu(menuData || []);
        setCategories(categoryData || []);
      } catch (err) {
        console.error("Failed to load restaurant:", err);

        setError(err.message || "Failed to load restaurant.");
      } finally {
        setLoading(false);
      }
    }

    loadRestaurantData();
  }, [restaurantId]);

  // -----------------------------------
  // RESTORE LOCAL CART
  // -----------------------------------

  useEffect(() => {
    loadCart();
  }, [loadCart]);

  // -----------------------------------
  // FILTER MENU
  // -----------------------------------

  const filteredMenu = useMemo(() => {
    if (selectedCategory === "all") {
      return menu;
    }

    return menu.filter((item) => item.menu_categories?.id === selectedCategory);
  }, [menu, selectedCategory]);

  // -----------------------------------
  // GROUP MENU BY CATEGORY
  // -----------------------------------

  const groupedMenu = useMemo(() => {
    if (selectedCategory !== "all") {
      return [
        {
          id: selectedCategory,
          name:
            categories.find((category) => category.id === selectedCategory)
              ?.name || "Menu",
          items: filteredMenu,
        },
      ];
    }

    const groups = [];

    categories.forEach((category) => {
      const categoryItems = menu.filter(
        (item) => item.menu_categories?.id === category.id,
      );

      if (categoryItems.length > 0) {
        groups.push({
          id: category.id,
          name: category.name,
          items: categoryItems,
        });
      }
    });

    // Items without a category
    const uncategorized = menu.filter((item) => !item.menu_categories?.id);

    if (uncategorized.length > 0) {
      groups.push({
        id: "uncategorized",
        name: "Other",
        items: uncategorized,
      });
    }

    return groups;
  }, [menu, categories, filteredMenu, selectedCategory]);

  // -----------------------------------
  // ADD ITEM
  // -----------------------------------

  const handleAddItem = async (item) => {
    if (!restaurant) {
      return;
    }

    const result = await addItem({
      item,
      restaurant,
      quantity: 1,
    });

    // Successfully added
    if (result.success) {
      return;
    }

    // Different restaurant
    if (result.reason === "DIFFERENT_RESTAURANT") {
      const shouldReplace = window.confirm(
        `Your cart contains items from ${cartRestaurantName}.\n\nDo you want to clear your cart and add this item from ${restaurant.name}?`,
      );

      if (shouldReplace) {
        await replaceCart({
          item,
          restaurant,
          quantity: 1,
        });
      }
    }
  };

  // -----------------------------------
  // LOADING
  // -----------------------------------

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600" />

          <p className="text-sm text-gray-500">Loading restaurant...</p>
        </div>
      </div>
    );
  }

  // -----------------------------------
  // ERROR
  // -----------------------------------

  if (error || !restaurant) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center px-6">
        <div className="text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-red-50">
            <Utensils className="h-6 w-6 text-red-500" />
          </div>

          <h2 className="text-xl font-bold text-gray-900">
            Restaurant not found
          </h2>

          <p className="mt-2 text-gray-500">
            {error || "We couldn't find this restaurant."}
          </p>

          <button
            onClick={() => navigate("/explore")}
            className="mt-6 rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-blue-700"
          >
            Back to Explore
          </button>
        </div>
      </div>
    );
  }

  // -----------------------------------
  // CART INFORMATION
  // -----------------------------------

  const cartCount = getItemCount();

  const cartSubtotal = getSubtotal();

  // -----------------------------------
  // RENDER
  // -----------------------------------

  return (
    <div className="min-h-screen bg-gray-50 pb-32">
      {/* -------------------------------- */}
      {/* HEADER */}
      {/* -------------------------------- */}

      <header className="sticky top-0 z-40 border-b border-gray-100 bg-white/95 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
          <button
            onClick={() => navigate("/explore")}
            className="flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-100"
          >
            <ArrowLeft className="h-5 w-5" />
            Back
          </button>

          <button
            onClick={() => navigate("/cart")}
            className="relative flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700"
          >
            <ShoppingCart className="h-5 w-5" />
            Cart
            {cartCount > 0 && (
              <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-white px-1 text-xs font-bold text-blue-600">
                {cartCount}
              </span>
            )}
          </button>
        </div>
      </header>

      {/* -------------------------------- */}
      {/* RESTAURANT HERO */}
      {/* -------------------------------- */}

      <section className="bg-white">
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          <div className="grid overflow-hidden rounded-3xl bg-white shadow-sm ring-1 ring-gray-100 md:grid-cols-[1.2fr_1fr]">
            {/* IMAGE */}

            <div className="h-72 md:h-[360px]">
              {restaurant.cover_image_url ? (
                <img
                  src={restaurant.cover_image_url}
                  alt={restaurant.name}
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center bg-blue-50">
                  <Utensils className="h-16 w-16 text-blue-300" />
                </div>
              )}
            </div>

            {/* DETAILS */}

            <div className="flex flex-col justify-center p-7 md:p-10">
              <div className="mb-3">
                <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-600">
                  {restaurant.cuisine || "Restaurant"}
                </span>
              </div>

              <h1 className="text-3xl font-bold tracking-tight text-gray-900 md:text-4xl">
                {restaurant.name}
              </h1>

              {restaurant.description && (
                <p className="mt-3 max-w-xl text-sm leading-6 text-gray-500">
                  {restaurant.description}
                </p>
              )}

              {/* INFO */}

              <div className="mt-6 flex flex-wrap gap-3">
                <div className="flex items-center gap-2 rounded-xl bg-gray-50 px-3 py-2">
                  <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />

                  <span className="text-sm font-semibold text-gray-800">
                    {restaurant.rating || "4.5"}
                  </span>
                </div>

                <div className="flex items-center gap-2 rounded-xl bg-gray-50 px-3 py-2">
                  <Clock3 className="h-4 w-4 text-blue-600" />

                  <span className="text-sm font-medium text-gray-700">
                    {restaurant.delivery_time_min || 25}-
                    {restaurant.delivery_time_max || 40} min
                  </span>
                </div>

                <div className="flex items-center gap-2 rounded-xl bg-gray-50 px-3 py-2">
                  <MapPin className="h-4 w-4 text-blue-600" />

                  <span className="max-w-xs truncate text-sm font-medium text-gray-700">
                    {restaurant.address ||
                      restaurant.city ||
                      "Location unavailable"}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* -------------------------------- */}
      {/* CATEGORY NAVIGATION */}
      {/* -------------------------------- */}

      <section className="sticky top-[73px] z-30 border-b border-gray-100 bg-white">
        <div className="mx-auto max-w-7xl overflow-x-auto px-4 sm:px-6 lg:px-8">
          <div className="flex min-w-max gap-2 py-4">
            <button
              onClick={() => setSelectedCategory("all")}
              className={`rounded-full px-5 py-2.5 text-sm font-semibold transition ${
                selectedCategory === "all"
                  ? "bg-blue-600 text-white"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              All
            </button>

            {categories.map((category) => (
              <button
                key={category.id}
                onClick={() => setSelectedCategory(category.id)}
                className={`rounded-full px-5 py-2.5 text-sm font-semibold transition ${
                  selectedCategory === category.id
                    ? "bg-blue-600 text-white"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
              >
                {category.name}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* -------------------------------- */}
      {/* MENU */}
      {/* -------------------------------- */}

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {groupedMenu.length === 0 ? (
          <div className="rounded-3xl bg-white p-12 text-center shadow-sm ring-1 ring-gray-100">
            <Utensils className="mx-auto h-10 w-10 text-gray-300" />

            <h3 className="mt-4 text-lg font-semibold text-gray-900">
              No menu items available
            </h3>

            <p className="mt-2 text-sm text-gray-500">
              This restaurant hasn't added items to this category yet.
            </p>
          </div>
        ) : (
          <div className="space-y-10">
            {groupedMenu.map((group) => (
              <section key={group.id}>
                {/* CATEGORY TITLE */}

                <div className="mb-5">
                  <h2 className="text-2xl font-bold text-gray-900">
                    {group.name}
                  </h2>

                  <div className="mt-2 h-1 w-10 rounded-full bg-blue-600" />
                </div>

                {/* ITEMS */}

                <div className="grid gap-5 md:grid-cols-2">
                  {group.items.map((item) => {
                    const quantity = getItemQuantity(item.id);

                    const isVeg = item.dietary_type === "veg";

                    const isNonVeg = item.dietary_type === "non_veg";

                    return (
                      <article
                        key={item.id}
                        className="group flex gap-4 rounded-2xl bg-white p-4 shadow-sm ring-1 ring-gray-100 transition hover:-translate-y-0.5 hover:shadow-md"
                      >
                        {/* FOOD IMAGE */}

                        <div className="h-32 w-32 flex-shrink-0 overflow-hidden rounded-2xl bg-gray-100">
                          {item.image_url ? (
                            <img
                              src={item.image_url}
                              alt={item.name}
                              className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
                            />
                          ) : (
                            <div className="flex h-full w-full items-center justify-center">
                              <Utensils className="h-8 w-8 text-gray-300" />
                            </div>
                          )}
                        </div>

                        {/* DETAILS */}

                        <div className="flex min-w-0 flex-1 flex-col">
                          <div className="flex items-start justify-between gap-3">
                            <div className="min-w-0">
                              {/* DIETARY ICON */}

                              {(isVeg || isNonVeg) && (
                                <div
                                  className={`mb-2 flex h-4 w-4 items-center justify-center rounded-sm border ${
                                    isVeg
                                      ? "border-green-600"
                                      : "border-red-600"
                                  }`}
                                >
                                  <div
                                    className={`h-2 w-2 rounded-full ${
                                      isVeg ? "bg-green-600" : "bg-red-600"
                                    }`}
                                  />
                                </div>
                              )}

                              <h3 className="truncate text-base font-bold text-gray-900">
                                {item.name}
                              </h3>

                              <p className="mt-1 text-sm font-semibold text-gray-800">
                                ₹{Number(item.price).toFixed(0)}
                              </p>
                            </div>
                          </div>

                          {/* DESCRIPTION */}

                          {item.description && (
                            <p className="mt-2 line-clamp-2 text-sm leading-5 text-gray-500">
                              {item.description}
                            </p>
                          )}

                          {/* ADD / QUANTITY */}

                          <div className="mt-auto flex justify-end pt-3">
                            {quantity === 0 ? (
                              <button
                                onClick={() => handleAddItem(item)}
                                className="flex items-center gap-1.5 rounded-xl border border-blue-200 bg-blue-50 px-4 py-2 text-sm font-bold text-blue-600 transition hover:bg-blue-600 hover:text-white"
                              >
                                <Plus className="h-4 w-4" />
                                Add
                              </button>
                            ) : (
                              <div className="flex items-center gap-3 rounded-xl bg-blue-600 px-2 py-1.5 text-white">
                                <button
                                  onClick={() =>
                                    decreaseItem(
                                      cartItems.find(
                                        (cartItem) =>
                                          cartItem.menu_item_id === item.id,
                                      )?.id,
                                    )
                                  }
                                  className="flex h-7 w-7 items-center justify-center rounded-lg transition hover:bg-blue-700"
                                >
                                  <Minus className="h-4 w-4" />
                                </button>

                                <span className="min-w-5 text-center text-sm font-bold">
                                  {quantity}
                                </span>

                                <button
                                  onClick={() => handleAddItem(item)}
                                  className="flex h-7 w-7 items-center justify-center rounded-lg transition hover:bg-blue-700"
                                >
                                  <Plus className="h-4 w-4" />
                                </button>
                              </div>
                            )}
                          </div>
                        </div>
                      </article>
                    );
                  })}
                </div>
              </section>
            ))}
          </div>
        )}
      </main>

      {/* -------------------------------- */}
      {/* FLOATING CART */}
      {/* -------------------------------- */}

      {cartCount > 0 && (
        <div className="fixed bottom-6 left-1/2 z-50 w-[calc(100%-32px)] max-w-xl -translate-x-1/2">
          <button
            onClick={() => navigate("/cart")}
            className="flex w-full items-center justify-between rounded-2xl bg-blue-600 px-5 py-4 text-white shadow-2xl shadow-blue-600/30 transition hover:bg-blue-700"
          >
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/15">
                <ShoppingCart className="h-5 w-5" />
              </div>

              <div className="text-left">
                <p className="text-xs text-blue-100">
                  {cartCount} {cartCount === 1 ? "item" : "items"} from{" "}
                  {restaurant.name}
                </p>

                <p className="text-base font-bold">View Cart</p>
              </div>
            </div>

            <span className="text-lg font-bold">
              ₹{cartSubtotal.toFixed(0)}
            </span>
          </button>
        </div>
      )}
    </div>
  );
}

export default Restaurant;
