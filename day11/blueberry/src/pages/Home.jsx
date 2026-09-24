import BlueberryNav from "../components/layout/BlueberryNav";
import FoodHero from "../components/food/FoodHero";
import FoodDriftWall from "../components/food/FoodDriftWall";

function Home() {
  return (
    <div className="min-h-screen bg-white">
      <BlueberryNav />

      <FoodHero />

      <FoodDriftWall />
    </div>
  );
}

export default Home;
