import { Link } from "react-router-dom";
import { Map, Heart } from "lucide-react";

function Navbar() {
  return (
    <nav className="border-b bg-white">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
        
        <Link to="/" className="flex items-center gap-2">
          <Map className="h-7 w-7" />
          <span className="text-xl font-bold">
            Travel Planner
          </span>
        </Link>

        <div className="flex items-center gap-6">
          <Link
            to="/"
            className="text-sm font-medium hover:underline"
          >
            Explore
          </Link>

          <Link
            to="/my-trip"
            className="flex items-center gap-1 text-sm font-medium hover:underline"
          >
            <Heart className="h-4 w-4" />
            My Trip
          </Link>
        </div>

      </div>
    </nav>
  );
}

export default Navbar;