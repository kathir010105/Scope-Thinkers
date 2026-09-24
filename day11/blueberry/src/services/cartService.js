import { supabase } from "../lib/supabase";

// =====================================================
// GET CURRENT USER
// =====================================================

async function getCurrentUser() {
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error) {
    throw error;
  }

  return user;
}

// =====================================================
// GET OR CREATE CART
// =====================================================

export async function getOrCreateCart(restaurantId) {
  const user = await getCurrentUser();

  if (!user) {
    throw new Error("You must be logged in to use the cart.");
  }

  // -----------------------------------------------
  // Check for existing cart
  // -----------------------------------------------

  const { data: existingCart, error } = await supabase
    .from("carts")
    .select("*")
    .eq("user_id", user.id)
    .maybeSingle();

  if (error) {
    throw error;
  }

  // -----------------------------------------------
  // Existing cart
  // -----------------------------------------------

  if (existingCart) {
    // If cart belongs to another restaurant,
    // caller must handle replacement.
    return existingCart;
  }

  // -----------------------------------------------
  // Create new cart
  // -----------------------------------------------

  const { data: newCart, error: createError } = await supabase
    .from("carts")
    .insert({
      user_id: user.id,
      restaurant_id: restaurantId,
    })
    .select("*")
    .single();

  if (createError) {
    throw createError;
  }

  return newCart;
}

// =====================================================
// GET CART WITH ITEMS
// =====================================================

export async function getCart() {
  const user = await getCurrentUser();

  if (!user) {
    return null;
  }

  const { data: cart, error: cartError } = await supabase
    .from("carts")
    .select("*")
    .eq("user_id", user.id)
    .maybeSingle();

  if (cartError) {
    throw cartError;
  }

  if (!cart) {
    return null;
  }

  const { data: cartItems, error: itemsError } = await supabase
    .from("cart_items")
    .select(
      `
      *,
      menu_items (
        id,
        name,
        description,
        price,
        image_url,
        dietary_type,
        restaurant_id
      )
    `,
    )
    .eq("cart_id", cart.id)
    .order("created_at", {
      ascending: true,
    });

  if (itemsError) {
    throw itemsError;
  }

  return {
    ...cart,
    items: cartItems || [],
  };
}

// =====================================================
// ADD ITEM TO CART
// =====================================================

export async function addCartItem({
  cartId,
  menuItemId,
  quantity,
  unitPrice,
  specialInstructions = null,
}) {
  const { data: existingItem, error: findError } = await supabase
    .from("cart_items")
    .select("*")
    .eq("cart_id", cartId)
    .eq("menu_item_id", menuItemId)
    .maybeSingle();

  if (findError) {
    throw findError;
  }

  // -----------------------------------------------
  // Item already exists
  // -----------------------------------------------

  if (existingItem) {
    const { data, error } = await supabase
      .from("cart_items")
      .update({
        quantity: existingItem.quantity + quantity,

        unit_price: unitPrice,

        special_instructions: specialInstructions,
      })
      .eq("id", existingItem.id)
      .select()
      .single();

    if (error) {
      throw error;
    }

    return data;
  }

  // -----------------------------------------------
  // New item
  // -----------------------------------------------

  const { data, error } = await supabase
    .from("cart_items")
    .insert({
      cart_id: cartId,
      menu_item_id: menuItemId,
      quantity,
      unit_price: unitPrice,
      special_instructions: specialInstructions,
    })
    .select()
    .single();

  if (error) {
    throw error;
  }

  return data;
}

// =====================================================
// UPDATE CART ITEM QUANTITY
// =====================================================

export async function updateCartItemQuantity(cartItemId, quantity) {
  if (quantity <= 0) {
    return removeCartItem(cartItemId);
  }

  const { data, error } = await supabase
    .from("cart_items")
    .update({
      quantity,
    })
    .eq("id", cartItemId)
    .select()
    .single();

  if (error) {
    throw error;
  }

  return data;
}

// =====================================================
// REMOVE CART ITEM
// =====================================================

export async function removeCartItem(cartItemId) {
  const { error } = await supabase
    .from("cart_items")
    .delete()
    .eq("id", cartItemId);

  if (error) {
    throw error;
  }
}

// =====================================================
// CLEAR CART
// =====================================================

export async function clearCart(cartId) {
  const { error } = await supabase
    .from("cart_items")
    .delete()
    .eq("cart_id", cartId);

  if (error) {
    throw error;
  }
}
