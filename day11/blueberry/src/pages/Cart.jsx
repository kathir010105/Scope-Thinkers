import {
  ArrowLeft,
  Minus,
  Plus,
  ShoppingBag,
  Trash2,
  MapPin,
  CreditCard,
} from "lucide-react";

import BlueberryNav from "../components/layout/BlueberryNav";
import { useNavigate } from "react-router-dom";

import useCartStore from "../store/cartStore";

function Cart() {
  const navigate = useNavigate();

  const {
    items,
    restaurantName,

    increaseItem,
    decreaseItem,
    removeItem,

    getSubtotal,
  } = useCartStore();

  // ============================================
  // CALCULATIONS
  // ============================================

  const subtotal = getSubtotal();

  const deliveryFee = items.length > 0 ? 40 : 0;

  const tax = subtotal * 0.05;

  const total = subtotal + deliveryFee + tax;

  // ============================================
  // EMPTY CART
  // ============================================

  if (items.length === 0) {
    return (
      <div className="relative min-h-screen bg-gray-50">
        {/* ====================================== */}
        {/* BLUEBERRY NAV */}
        {/* ====================================== */}

        <BlueberryNav />

        {/* ====================================== */}
        {/* HEADER */}
        {/* ====================================== */}

        <header className="border-b border-gray-100 bg-white pt-[76px]">
          <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4 sm:px-6">
            <button
              type="button"
              onClick={() => navigate("/explore")}
              className="
                flex
                items-center
                gap-2
                rounded-xl
                px-3
                py-2
                text-sm
                font-medium
                text-gray-700
                transition
                hover:bg-gray-100
              "
            >
              <ArrowLeft className="h-5 w-5" />
              Continue browsing
            </button>
          </div>
        </header>

        {/* ====================================== */}
        {/* EMPTY STATE */}
        {/* ====================================== */}

        <main
          className="
            flex
            min-h-[calc(100vh-149px)]
            items-center
            justify-center
            px-6
          "
        >
          <div
            className="
              w-full
              max-w-md
              rounded-3xl
              bg-white
              p-10
              text-center
              shadow-sm
              ring-1
              ring-gray-100
            "
          >
            <div
              className="
                mx-auto
                flex
                h-20
                w-20
                items-center
                justify-center
                rounded-full
                bg-blue-50
              "
            >
              <ShoppingBag className="h-9 w-9 text-blue-600" />
            </div>

            <h1
              className="
                mt-6
                text-2xl
                font-bold
                text-gray-900
              "
            >
              Your cart is empty
            </h1>

            <p
              className="
                mt-2
                text-sm
                leading-6
                text-gray-500
              "
            >
              Looks like you haven't added anything to your cart yet.
            </p>

            <button
              type="button"
              onClick={() => navigate("/explore")}
              className="
                mt-7
                w-full
                rounded-xl
                bg-blue-600
                px-5
                py-3.5
                text-sm
                font-bold
                text-white
                transition
                hover:bg-blue-700
              "
            >
              Explore Restaurants
            </button>
          </div>
        </main>
      </div>
    );
  }

  // ============================================
  // CART
  // ============================================

  return (
    <div className="relative min-h-screen bg-gray-50 pb-12">
      {/* ====================================== */}
      {/* BLUEBERRY NAV */}
      {/* ====================================== */}

      <BlueberryNav />

      {/* ====================================== */}
      {/* HEADER */}
      {/* ====================================== */}

      <header
        className="
          border-b
          border-gray-100
          bg-white
          pt-[76px]
        "
      >
        <div
          className="
            mx-auto
            flex
            max-w-6xl
            items-center
            justify-between
            px-4
            py-4
            sm:px-6
          "
        >
          {/* BACK */}

          <button
            type="button"
            onClick={() => navigate(-1)}
            className="
              flex
              items-center
              gap-2
              rounded-xl
              px-3
              py-2
              text-sm
              font-medium
              text-gray-700
              transition
              hover:bg-gray-100
            "
          >
            <ArrowLeft className="h-5 w-5" />
            Back
          </button>

          {/* TITLE */}

          <div className="text-center">
            <h1
              className="
                text-lg
                font-bold
                text-gray-900
              "
            >
              Your Cart
            </h1>
          </div>

          {/* RIGHT SPACER */}

          <div className="w-20" />
        </div>
      </header>

      {/* ====================================== */}
      {/* CONTENT */}
      {/* ====================================== */}

      <main
        className="
          mx-auto
          max-w-6xl
          px-4
          py-8
          sm:px-6
        "
      >
        <div
          className="
            grid
            gap-6
            lg:grid-cols-[1fr_380px]
          "
        >
          {/* ================================== */}
          {/* LEFT SIDE */}
          {/* ================================== */}

          <section className="space-y-5">
            {/* ================================= */}
            {/* RESTAURANT */}
            {/* ================================= */}

            <div
              className="
                rounded-2xl
                bg-white
                p-5
                shadow-sm
                ring-1
                ring-gray-100
              "
            >
              <div className="flex items-center gap-3">
                <div
                  className="
                    flex
                    h-11
                    w-11
                    items-center
                    justify-center
                    rounded-xl
                    bg-blue-50
                  "
                >
                  <ShoppingBag className="h-5 w-5 text-blue-600" />
                </div>

                <div>
                  <p
                    className="
                      text-xs
                      font-medium
                      uppercase
                      tracking-wide
                      text-gray-400
                    "
                  >
                    Ordering from
                  </p>

                  <h2
                    className="
                      mt-0.5
                      text-lg
                      font-bold
                      text-gray-900
                    "
                  >
                    {restaurantName || "Restaurant"}
                  </h2>
                </div>
              </div>
            </div>

            {/* ================================= */}
            {/* ITEMS */}
            {/* ================================= */}

            <div
              className="
                overflow-hidden
                rounded-2xl
                bg-white
                shadow-sm
                ring-1
                ring-gray-100
              "
            >
              <div
                className="
                  border-b
                  border-gray-100
                  px-5
                  py-4
                "
              >
                <h2 className="font-bold text-gray-900">Your items</h2>
              </div>

              <div className="divide-y divide-gray-100">
                {items.map((item) => {
                  const food = item.menu_items;

                  const itemTotal =
                    Number(item.unit_price) * Number(item.quantity);

                  return (
                    <div
                      key={item.id}
                      className="
                        flex
                        gap-4
                        p-5
                      "
                    >
                      {/* IMAGE */}

                      <div
                        className="
                          h-24
                          w-24
                          flex-shrink-0
                          overflow-hidden
                          rounded-xl
                          bg-gray-100
                        "
                      >
                        {food?.image_url ? (
                          <img
                            src={food.image_url}
                            alt={food.name}
                            className="
                              h-full
                              w-full
                              object-cover
                            "
                          />
                        ) : (
                          <div
                            className="
                              flex
                              h-full
                              w-full
                              items-center
                              justify-center
                            "
                          >
                            <ShoppingBag
                              className="
                                h-7
                                w-7
                                text-gray-300
                              "
                            />
                          </div>
                        )}
                      </div>

                      {/* DETAILS */}

                      <div
                        className="
                          min-w-0
                          flex-1
                        "
                      >
                        <div
                          className="
                            flex
                            items-start
                            justify-between
                            gap-3
                          "
                        >
                          <div>
                            <h3
                              className="
                                font-bold
                                text-gray-900
                              "
                            >
                              {food?.name || "Food item"}
                            </h3>

                            <p
                              className="
                                mt-1
                                text-sm
                                text-gray-500
                              "
                            >
                              ₹{Number(item.unit_price).toFixed(0)} each
                            </p>
                          </div>

                          {/* DELETE */}

                          <button
                            type="button"
                            onClick={() => removeItem(item.id)}
                            className="
                              rounded-lg
                              p-2
                              text-gray-400
                              transition
                              hover:bg-red-50
                              hover:text-red-500
                            "
                            title="Remove item"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>

                        {/* QUANTITY + TOTAL */}

                        <div
                          className="
                            mt-4
                            flex
                            items-center
                            justify-between
                          "
                        >
                          {/* QUANTITY */}

                          <div
                            className="
                              flex
                              items-center
                              gap-3
                              rounded-xl
                              border
                              border-gray-200
                              px-2
                              py-1
                            "
                          >
                            <button
                              type="button"
                              onClick={() => decreaseItem(item.id)}
                              className="
                                flex
                                h-7
                                w-7
                                items-center
                                justify-center
                                rounded-lg
                                text-gray-600
                                transition
                                hover:bg-gray-100
                              "
                            >
                              <Minus className="h-4 w-4" />
                            </button>

                            <span
                              className="
                                min-w-5
                                text-center
                                text-sm
                                font-bold
                                text-gray-900
                              "
                            >
                              {item.quantity}
                            </span>

                            <button
                              type="button"
                              onClick={() => increaseItem(item.id)}
                              className="
                                flex
                                h-7
                                w-7
                                items-center
                                justify-center
                                rounded-lg
                                text-blue-600
                                transition
                                hover:bg-blue-50
                              "
                            >
                              <Plus className="h-4 w-4" />
                            </button>
                          </div>

                          {/* ITEM TOTAL */}

                          <p
                            className="
                              font-bold
                              text-gray-900
                            "
                          >
                            ₹{itemTotal.toFixed(0)}
                          </p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* ================================= */}
            {/* DELIVERY ADDRESS */}
            {/* ================================= */}

            <div
              className="
                rounded-2xl
                bg-white
                p-5
                shadow-sm
                ring-1
                ring-gray-100
              "
            >
              <div className="flex items-start gap-3">
                <div
                  className="
                    flex
                    h-10
                    w-10
                    flex-shrink-0
                    items-center
                    justify-center
                    rounded-xl
                    bg-blue-50
                  "
                >
                  <MapPin className="h-5 w-5 text-blue-600" />
                </div>

                <div>
                  <h3
                    className="
                      font-bold
                      text-gray-900
                    "
                  >
                    Delivery address
                  </h3>

                  <p
                    className="
                      mt-1
                      text-sm
                      text-gray-500
                    "
                  >
                    You'll enter your delivery address during checkout.
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* ================================== */}
          {/* RIGHT SIDE - SUMMARY */}
          {/* ================================== */}

          <aside
            className="
              lg:sticky
              lg:top-24
              lg:h-fit
            "
          >
            <div
              className="
                rounded-2xl
                bg-white
                p-6
                shadow-sm
                ring-1
                ring-gray-100
              "
            >
              <h2
                className="
                  text-lg
                  font-bold
                  text-gray-900
                "
              >
                Bill details
              </h2>

              {/* SUBTOTAL */}

              <div
                className="
                  mt-6
                  space-y-4
                "
              >
                <div
                  className="
                    flex
                    justify-between
                    text-sm
                  "
                >
                  <span className="text-gray-500">Item total</span>

                  <span className="font-medium text-gray-900">
                    ₹{subtotal.toFixed(0)}
                  </span>
                </div>

                <div
                  className="
                    flex
                    justify-between
                    text-sm
                  "
                >
                  <span className="text-gray-500">Delivery fee</span>

                  <span className="font-medium text-gray-900">
                    ₹{deliveryFee.toFixed(0)}
                  </span>
                </div>

                <div
                  className="
                    flex
                    justify-between
                    text-sm
                  "
                >
                  <span className="text-gray-500">Taxes</span>

                  <span className="font-medium text-gray-900">
                    ₹{tax.toFixed(0)}
                  </span>
                </div>
              </div>

              {/* DIVIDER */}

              <div
                className="
                  my-5
                  border-t
                  border-dashed
                  border-gray-200
                "
              />

              {/* TOTAL */}

              <div
                className="
                  flex
                  items-center
                  justify-between
                "
              >
                <span className="font-bold text-gray-900">Total</span>

                <span
                  className="
                    text-xl
                    font-bold
                    text-blue-600
                  "
                >
                  ₹{total.toFixed(0)}
                </span>
              </div>

              {/* CHECKOUT */}

              <button
                type="button"
                onClick={() => navigate("/checkout")}
                className="
                  mt-6
                  flex
                  w-full
                  items-center
                  justify-center
                  gap-2
                  rounded-xl
                  bg-blue-600
                  px-5
                  py-3.5
                  text-sm
                  font-bold
                  text-white
                  transition
                  hover:bg-blue-700
                "
              >
                <CreditCard className="h-5 w-5" />
                Proceed to Checkout
              </button>

              <p
                className="
                  mt-3
                  text-center
                  text-xs
                  leading-5
                  text-gray-400
                "
              >
                You'll be asked to log in or sign up before completing your
                order.
              </p>
            </div>
          </aside>
        </div>
      </main>
    </div>
  );
}

export default Cart;
