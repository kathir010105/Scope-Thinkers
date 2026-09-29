import { Routes, Route } from "react-router-dom";

import Navbar from "./components/Navbar";
import ProtectedRoute from "./routes/ProtectedRoute";

import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import TrainResults from "./pages/TrainResults";
import TrainDetails from "./pages/TrainDetails";
import Passengers from "./pages/Passengers";
import MyBookings from "./pages/MyBookings";
import Profile from "./pages/Profile";
import Settings from "./pages/Settings";
import SearchTrains from "./pages/SearchTrains";

function App() {
  return (
    <>
      <Navbar />

      <Routes>
        {/* PUBLIC */}

        <Route path="/" element={<Home />} />

        <Route path="/search" element={<SearchTrains />} />

        <Route path="/train-results" element={<TrainResults />} />

        <Route path="/train" element={<TrainDetails />} />

        <Route path="/login" element={<Login />} />

        <Route path="/register" element={<Register />} />

        {/* PROTECTED */}

        <Route element={<ProtectedRoute />}>
          <Route path="/passengers" element={<Passengers />} />

          <Route path="/my-bookings" element={<MyBookings />} />

          <Route path="/profile" element={<Profile />} />

          <Route path="/settings" element={<Settings />} />
        </Route>
      </Routes>
    </>
  );
}

export default App;
