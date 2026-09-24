import { supabase } from "../lib/supabase";

// Get all active restaurants
export async function getRestaurants() {
  const { data, error } = await supabase
    .from("restaurants")
    .select("*")
    .eq("is_active", true)
    .order("name", {
      ascending: true,
    });

  if (error) {
    console.error("Error fetching restaurants:", error);

    throw error;
  }

  return data || [];
}

// Search restaurants
export async function searchRestaurants(searchTerm) {
  const term = searchTerm.trim();

  if (!term) {
    return getRestaurants();
  }

  const { data, error } = await supabase
    .from("restaurants")
    .select("*")
    .eq("is_active", true)
    .or(`name.ilike.%${term}%,cuisine.ilike.%${term}%`)
    .order("name", {
      ascending: true,
    });

  if (error) {
    console.error("Error searching restaurants:", error);

    throw error;
  }

  return data || [];
}

// Get restaurants by cuisine/type
export async function getRestaurantsByCuisine(cuisine) {
  const { data, error } = await supabase
    .from("restaurants")
    .select("*")
    .eq("is_active", true)
    .eq("cuisine", cuisine)
    .order("name", {
      ascending: true,
    });

  if (error) {
    console.error("Error fetching cuisine:", error);

    throw error;
  }

  return data || [];
}

// Get one restaurant
export async function getRestaurantById(restaurantId) {
  const { data, error } = await supabase
    .from("restaurants")
    .select("*")
    .eq("id", restaurantId)
    .single();

  if (error) {
    console.error("Error fetching restaurant:", error);

    throw error;
  }

  return data;
}

// Get menu for a restaurant
export async function getRestaurantMenu(restaurantId) {
  const { data, error } = await supabase
    .from("menu_items")
    .select(
      `
      *,
      menu_categories (
        id,
        name,
        display_order
      )
    `,
    )
    .eq("restaurant_id", restaurantId)
    .eq("is_available", true)
    .order("name", {
      ascending: true,
    });

  if (error) {
    console.error("Error fetching restaurant menu:", error);

    throw error;
  }

  return data || [];
}

// Get menu categories
export async function getMenuCategories(restaurantId) {
  const { data, error } = await supabase
    .from("menu_categories")
    .select("*")
    .eq("restaurant_id", restaurantId)
    .eq("is_active", true)
    .order("display_order", {
      ascending: true,
    });

  if (error) {
    console.error("Error fetching menu categories:", error);

    throw error;
  }

  return data || [];
}
