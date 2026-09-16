import { BrowserRouter, Routes, Route } from "react-router-dom";
import Navbar from "./components/NavBar";
import Explore from "./pages/Explore";
import DestinationDetails from "./pages/DestinationDetails";
import MyTrip from "./pages/MyTrip";


function App() {
  return (
    <BrowserRouter>

      <Navbar />

      <Routes>
        <Route path="/" element={<Explore />} />

        <Route
          path="/destination/:code"
          element={<DestinationDetails />}
        />

        <Route
          path="/my-trip"
          element={<MyTrip />}
        />
      </Routes>

    </BrowserRouter>
  );
}

export default App;