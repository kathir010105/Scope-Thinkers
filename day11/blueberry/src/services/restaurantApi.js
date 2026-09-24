const API_BASE_URL = "https://fakerestaurantapi.runasp.net/api";

async function apiGet(endpoint) {
  const response = await fetch(`${API_BASE_URL}${endpoint}`);

  if (!response.ok) {
    throw new Error(
      `API request failed: ${response.status} ${response.statusText}`,
    );
  }

  return response.json();
}

// Get all restaurants
export async function getRestaurants() {
  return apiGet("/Restaurant");
}

// Get restaurants by category/type
export async function getRestaurantsByCategory(category) {
  return apiGet(`/Restaurant?category=${encodeURIComponent(category)}`);
}

// Get one restaurant
export async function getRestaurant(id) {
  return apiGet(`/Restaurant/${id}`);
}

// Get restaurant menu
export async function getRestaurantMenu(id) {
  return apiGet(`/Restaurant/${id}/menu`);
}

// Get all menu items
export async function getAllItems() {
  return apiGet("/Restaurant/items");
}

// Search menu items
export async function searchItems(name) {
  return apiGet(`/Restaurant/items?ItemName=${encodeURIComponent(name)}`);
}
