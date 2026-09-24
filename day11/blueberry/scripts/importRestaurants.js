import "dotenv/config";
import { createClient } from "@supabase/supabase-js";
import ws from "ws";

// ======================================================
// CONFIGURATION
// ======================================================

const API_BASE_URL = "https://fakerestaurantapi.runasp.net/api";

const RESTAURANTS_PER_CATEGORY = 10;

const STORAGE_BUCKET = "food-images";

// ======================================================
// SUPABASE CLIENT
// ======================================================

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },

    realtime: {
      transport: ws,
    },
  },
);

// ======================================================
// API HELPER
// ======================================================

async function fetchApi(endpoint) {
  console.log(`API → ${endpoint}`);

  const response = await fetch(`${API_BASE_URL}${endpoint}`);

  if (!response.ok) {
    throw new Error(`API Error ${response.status}: ${response.statusText}`);
  }

  return response.json();
}

// ======================================================
// IMAGE UPLOAD
// ======================================================

async function uploadImageToSupabase(
  imageUrl,
  restaurantExternalId,
  itemExternalId,
) {
  if (!imageUrl) {
    console.log("  No image URL available");

    return null;
  }

  try {
    console.log("  Downloading image...");

    // ------------------------------------------
    // Download image from Fake Restaurant API
    // ------------------------------------------

    const response = await fetch(imageUrl);

    if (!response.ok) {
      console.log(`  Image download failed: ${response.status}`);

      // Keep original URL as fallback
      return imageUrl;
    }

    const imageBuffer = await response.arrayBuffer();

    // ------------------------------------------
    // Determine content type
    // ------------------------------------------

    const contentType = response.headers.get("content-type") || "image/jpeg";

    let extension = "jpg";

    if (contentType.includes("png")) {
      extension = "png";
    } else if (contentType.includes("webp")) {
      extension = "webp";
    } else if (contentType.includes("gif")) {
      extension = "gif";
    } else if (contentType.includes("jpeg")) {
      extension = "jpg";
    }

    // ------------------------------------------
    // Storage path
    // ------------------------------------------

    const filePath = `${restaurantExternalId}/${itemExternalId}.${extension}`;

    console.log(`  Uploading image → ${filePath}`);

    // ------------------------------------------
    // Upload to Supabase Storage
    // ------------------------------------------

    const { error: uploadError } = await supabase.storage
      .from(STORAGE_BUCKET)
      .upload(filePath, imageBuffer, {
        contentType,
        upsert: true,
      });

    if (uploadError) {
      console.log(`  Image upload failed: ${uploadError.message}`);

      // Fallback to original API image
      return imageUrl;
    }

    // ------------------------------------------
    // Get public URL
    // ------------------------------------------

    const { data: publicUrlData } = supabase.storage
      .from(STORAGE_BUCKET)
      .getPublicUrl(filePath);

    const publicUrl = publicUrlData.publicUrl;

    console.log(`  Image stored successfully`);

    return publicUrl;
  } catch (error) {
    console.log(`  Image processing failed: ${error.message}`);

    // Fallback to original API image
    return imageUrl;
  }
}

// ======================================================
// MENU CATEGORY CLASSIFICATION
// ======================================================

function detectCategory(item) {
  const text = `
    ${item.itemName || ""}
    ${item.itemDescription || ""}
  `.toLowerCase();

  // ------------------------------------------
  // Desserts
  // ------------------------------------------

  const dessertKeywords = [
    "dessert",
    "sweet",
    "cake",
    "ice cream",
    "icecream",
    "kulfi",
    "gulab jamun",
    "gulabjamun",
    "jalebi",
    "rasmalai",
    "kheer",
    "halwa",
    "ghevar",
    "brownie",
    "pudding",
    "payasam",
    "laddu",
    "ladoo",
    "barfi",
    "burfi",
    "falooda",
    "pastry",
    "mousse",
  ];

  // ------------------------------------------
  // Appetizers
  // ------------------------------------------

  const appetizerKeywords = [
    "starter",
    "appetizer",
    "tikka",
    "kebab",
    "kabab",
    "pakora",
    "samosa",
    "spring roll",
    "wings",
    "chaat",
    "fry",
    "65",
    "cutlet",
    "seekh",
    "manchurian",
  ];

  // ------------------------------------------
  // Sides
  // ------------------------------------------

  const sideKeywords = [
    "salad",
    "raita",
    "pickle",
    "chutney",
    "fries",
    "papad",
    "papadum",
    "bread",
    "naan",
    "roti",
    "paratha",
    "rice",
    "soup",
  ];

  // ------------------------------------------
  // Classification
  // ------------------------------------------

  if (dessertKeywords.some((keyword) => text.includes(keyword))) {
    return "Desserts";
  }

  if (appetizerKeywords.some((keyword) => text.includes(keyword))) {
    return "Appetizers";
  }

  if (sideKeywords.some((keyword) => text.includes(keyword))) {
    return "Sides";
  }

  // Everything else
  return "Mains";
}

// ======================================================
// DIETARY CLASSIFICATION
// ======================================================

function detectDietaryType(item) {
  const text = `
    ${item.itemName || ""}
    ${item.itemDescription || ""}
  `.toLowerCase();

  // ------------------------------------------
  // Egg-specific keywords
  // ------------------------------------------

  const eggKeywords = [
    "egg",
    "eggs",
    "omelette",
    "omelet",
    "scrambled egg",
    "boiled egg",
    "egg curry",
  ];

  if (eggKeywords.some((keyword) => text.includes(keyword))) {
    return "egg";
  }

  // ------------------------------------------
  // Non-vegetarian keywords
  // ------------------------------------------

  const nonVegKeywords = [
    "chicken",
    "mutton",
    "lamb",
    "beef",
    "pork",
    "fish",
    "prawn",
    "prawns",
    "shrimp",
    "crab",
    "lobster",
    "meat",
    "keema",
    "kebab",
    "kabab",
    "maas",
    "tandoori chicken",
    "biryani chicken",
    "mutton biryani",
    "fish curry",
  ];

  if (nonVegKeywords.some((keyword) => text.includes(keyword))) {
    return "non_veg";
  }

  // ------------------------------------------
  // We deliberately don't assume unknown
  // items are vegetarian.
  // ------------------------------------------

  return "unknown";
}

// ======================================================
// GET OR CREATE MENU CATEGORY
// ======================================================

async function getOrCreateCategory(restaurantId, categoryName, displayOrder) {
  // ------------------------------------------
  // Check whether category already exists
  // ------------------------------------------

  const { data: existingCategory, error: findError } = await supabase
    .from("menu_categories")
    .select("id")
    .eq("restaurant_id", restaurantId)
    .eq("name", categoryName)
    .maybeSingle();

  if (findError) {
    throw findError;
  }

  // ------------------------------------------
  // Already exists
  // ------------------------------------------

  if (existingCategory) {
    return existingCategory.id;
  }

  // ------------------------------------------
  // Create category
  // ------------------------------------------

  const { data: newCategory, error: insertError } = await supabase
    .from("menu_categories")
    .insert({
      restaurant_id: restaurantId,
      name: categoryName,
      display_order: displayOrder,
      is_active: true,
    })
    .select("id")
    .single();

  if (insertError) {
    throw insertError;
  }

  return newCategory.id;
}

// ======================================================
// CREATE BLUEBERRY MENU CATEGORIES
// ======================================================

async function createMenuCategories(restaurantId) {
  const categories = {};

  categories.Appetizers = await getOrCreateCategory(
    restaurantId,
    "Appetizers",
    1,
  );

  categories.Mains = await getOrCreateCategory(restaurantId, "Mains", 2);

  categories.Sides = await getOrCreateCategory(restaurantId, "Sides", 3);

  categories.Desserts = await getOrCreateCategory(restaurantId, "Desserts", 4);

  return categories;
}

// ======================================================
// IMPORT ONE RESTAURANT
// ======================================================

async function importRestaurant(restaurant) {
  console.log("\n========================================");

  console.log(`Importing: ${restaurant.restaurantName}`);

  console.log(`Type: ${restaurant.type}`);

  console.log(`Restaurant ID: ${restaurant.restaurantID}`);

  console.log("========================================");

  // ====================================================
  // 1. SAVE RESTAURANT
  // ====================================================

  const restaurantPayload = {
    external_restaurant_id: restaurant.restaurantID,

    name: restaurant.restaurantName,

    description: `${restaurant.type || "Food"} restaurant`,

    cuisine: restaurant.type || "Other",

    address: restaurant.address || null,

    city: restaurant.address ? restaurant.address.split(",")[0].trim() : null,

    is_active: true,
  };

  const { data: savedRestaurant, error: restaurantError } = await supabase
    .from("restaurants")
    .upsert(restaurantPayload, {
      onConflict: "external_restaurant_id",
    })
    .select("id, name")
    .single();

  if (restaurantError) {
    throw restaurantError;
  }

  console.log(`Restaurant saved: ${savedRestaurant.name}`);

  // ====================================================
  // 2. CREATE MENU CATEGORIES
  // ====================================================

  const categories = await createMenuCategories(savedRestaurant.id);

  console.log("Menu categories ready:");

  console.log("  ✓ Appetizers");

  console.log("  ✓ Mains");

  console.log("  ✓ Sides");

  console.log("  ✓ Desserts");

  // ====================================================
  // 3. GET RESTAURANT MENU
  // ====================================================

  const menu = await fetchApi(`/Restaurant/${restaurant.restaurantID}/menu`);

  console.log(`Found ${menu.length} menu items`);

  // ====================================================
  // SET RESTAURANT COVER IMAGE
  // ====================================================

  let restaurantCoverImage = null;

  if (menu.length > 0) {
    const firstImageItem = menu.find((item) => item.imageUrl);

    if (firstImageItem) {
      restaurantCoverImage = await uploadImageToSupabase(
        firstImageItem.imageUrl,
        restaurant.restaurantID,
        `cover`,
      );
    }
  }

  if (restaurantCoverImage) {
    const { error: coverError } = await supabase
      .from("restaurants")
      .update({
        cover_image_url: restaurantCoverImage,
      })
      .eq("id", savedRestaurant.id);

    if (coverError) {
      throw coverError;
    }

    console.log("Restaurant cover image saved");
  }

  // ====================================================
  // 4. IMPORT MENU ITEMS
  // ====================================================

  for (const item of menu) {
    try {
      console.log(`\n  Processing: ${item.itemName}`);

      // ------------------------------------------
      // Determine Blueberry category
      // ------------------------------------------

      const categoryName = detectCategory(item);

      const categoryId = categories[categoryName];

      // ------------------------------------------
      // Determine dietary type
      // ------------------------------------------

      const dietaryType = detectDietaryType(item);

      // ------------------------------------------
      // Upload image
      // ------------------------------------------

      const storedImageUrl = await uploadImageToSupabase(
        item.imageUrl,
        restaurant.restaurantID,
        item.itemID,
      );

      // ------------------------------------------
      // Prepare menu item
      // ------------------------------------------

      const menuItemPayload = {
        external_item_id: item.itemID,

        restaurant_id: savedRestaurant.id,

        category_id: categoryId,

        name: item.itemName,

        description: item.itemDescription || null,

        price: item.itemPrice,

        image_url: storedImageUrl,

        dietary_type: dietaryType,

        is_available: true,

        is_bestseller: false,
      };

      // ------------------------------------------
      // Insert/update menu item
      // ------------------------------------------

      const { error: itemError } = await supabase
        .from("menu_items")
        .upsert(menuItemPayload, {
          onConflict: "external_item_id",
        });

      if (itemError) {
        throw itemError;
      }

      console.log(`  ✓ ${item.itemName}`);

      console.log(`    Category: ${categoryName}`);

      console.log(`    Dietary: ${dietaryType}`);

      console.log(`    Price: ₹${item.itemPrice}`);

      console.log(`    Image: Supabase Storage`);
    } catch (error) {
      console.error(`  ✗ Failed: ${item.itemName}`);

      console.error(`    ${error.message}`);
    }
  }
}

// ======================================================
// MAIN IMPORT FUNCTION
// ======================================================

async function importRestaurants() {
  try {
    console.log("\n========================================");

    console.log("       BLUEBERRY RESTAURANT IMPORTER");

    console.log("========================================\n");

    // ==================================================
    // GET ALL RESTAURANTS FROM API
    // ==================================================

    const restaurants = await fetchApi("/Restaurant");

    console.log(`\nAPI returned ${restaurants.length} restaurants.`);

    // ==================================================
    // GROUP BY RESTAURANT TYPE
    // ==================================================

    const grouped = {};

    for (const restaurant of restaurants) {
      const type = restaurant.type || "Other";

      if (!grouped[type]) {
        grouped[type] = [];
      }

      grouped[type].push(restaurant);
    }

    // ==================================================
    // DISPLAY CATEGORY COUNTS
    // ==================================================

    console.log("\n========== RESTAURANT TYPES ==========\n");

    for (const [type, restaurantList] of Object.entries(grouped)) {
      console.log(`${type}: ${restaurantList.length} restaurants`);
    }

    // ==================================================
    // SELECT RESTAURANTS
    // ==================================================

    const selectedRestaurants = Object.values(grouped).flatMap(
      (restaurantList) => restaurantList.slice(0, RESTAURANTS_PER_CATEGORY),
    );

    console.log(
      `\nSelected ${selectedRestaurants.length} restaurants for import.`,
    );

    // ==================================================
    // IMPORT EACH RESTAURANT
    // ==================================================

    let successfulRestaurants = 0;
    let failedRestaurants = 0;

    for (const restaurant of selectedRestaurants) {
      try {
        await importRestaurant(restaurant);

        successfulRestaurants++;
      } catch (error) {
        failedRestaurants++;

        console.error(`\nFAILED RESTAURANT: ${restaurant.restaurantName}`);

        console.error(error.message);
      }
    }

    // ==================================================
    // FINAL SUMMARY
    // ==================================================

    console.log("\n========================================");

    console.log("           IMPORT COMPLETE");

    console.log("========================================");

    console.log(`Restaurants successful: ${successfulRestaurants}`);

    console.log(`Restaurants failed: ${failedRestaurants}`);

    console.log(`Restaurant types: ${Object.keys(grouped).length}`);

    console.log(`Storage bucket: ${STORAGE_BUCKET}`);

    console.log("========================================\n");
  } catch (error) {
    console.error("\n========================================");

    console.error("         FATAL IMPORT ERROR");

    console.error("========================================");

    console.error(error);

    process.exit(1);
  }
}

// ======================================================
// START IMPORT
// ======================================================

importRestaurants();
