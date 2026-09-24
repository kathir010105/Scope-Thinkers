import { BrowserRouter, Routes, Route } from "react-router-dom";

import { AuthProvider } from "./context/AuthContext";

import ProtectedRoute from "./components/auth/ProtectedRoute";

import Home from "./pages/Home";
import Explore from "./pages/Explore";
import Restaurant from "./pages/Restaurant";
import Cart from "./pages/Cart";
import Checkout from "./pages/Checkout";
import Orders from "./pages/Orders";
import TrackOrder from "./pages/TrackOrder";

import Login from "./pages/Login";
import Signup from "./pages/Signup";

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          {/* -------------------------------- */}
          {/* PUBLIC ROUTES */}
          {/* -------------------------------- */}

          <Route path="/" element={<Home />} />

          <Route path="/explore" element={<Explore />} />

          <Route path="/restaurant/:restaurantId" element={<Restaurant />} />

          <Route path="/cart" element={<Cart />} />

          <Route path="/login" element={<Login />} />

          <Route path="/signup" element={<Signup />} />

          {/* -------------------------------- */}
          {/* PROTECTED ROUTES */}
          {/* -------------------------------- */}

          <Route
            path="/checkout"
            element={
              <ProtectedRoute>
                <Checkout />
              </ProtectedRoute>
            }
          />

          <Route
            path="/orders"
            element={
              <ProtectedRoute>
                <Orders />
              </ProtectedRoute>
            }
          />

          <Route
            path="/track-order/:orderId"
            element={
              <ProtectedRoute>
                <TrackOrder />
              </ProtectedRoute>
            }
          />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
