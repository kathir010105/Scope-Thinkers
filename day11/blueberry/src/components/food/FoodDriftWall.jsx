import DriftWall from "../ui/DriftWall";

const foodItems = [
  {
    image:
      "https://images.unsplash.com/photo-1574071318508-1cdbab80d002?auto=format&fit=crop&w=800&q=85",
    title: "Pizza",
    href: "/restaurant/1",
  },
  {
    image:
      "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=800&q=85",
    title: "Burger",
    href: "/restaurant/2",
  },
  {
    image:
      "https://images.unsplash.com/photo-1579871494447-9811cf80d66c?auto=format&fit=crop&w=800&q=85",
    title: "Sushi",
    href: "/restaurant/3",
  },
  {
    image:
      "https://images.unsplash.com/photo-1473093295043-cdd812d0e601?auto=format&fit=crop&w=800&q=85",
    title: "Pasta",
    href: "/restaurant/4",
  },
  {
    image:
      "https://images.unsplash.com/photo-1589302168068-964664d93dc0?auto=format&fit=crop&w=800&q=85",
    title: "Biryani",
    href: "/restaurant/5",
  },
  {
    image:
      "https://images.unsplash.com/photo-1547592180-85f173990554?auto=format&fit=crop&w=800&q=85",
    title: "Healthy Bowl",
    href: "/restaurant/6",
  },
  {
    image:
      "https://images.unsplash.com/photo-1551024506-0bccd828d307?auto=format&fit=crop&w=800&q=85",
    title: "Dessert",
    href: "/restaurant/7",
  },
  {
    image:
      "https://images.unsplash.com/photo-1630383249896-424e482df921?auto=format&fit=crop&w=800&q=85",
    title: "South Indian",
    href: "/restaurant/8",
  },
  {
    image:
      "https://images.unsplash.com/photo-1547592180-85f173990554?auto=format&fit=crop&w=800&q=85",
    title: "Asian Food",
    href: "/restaurant/9",
  },
  {
    image:
      "https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&w=800&q=85",
    title: "Late Night",
    href: "/restaurant/10",
  },
];

function FoodDriftWall() {
  return (
    <section className="bg-white px-4 py-24 md:px-8">
      {/* Section heading */}

      <div className="mx-auto mb-10 max-w-7xl text-center">
        <p className="text-sm font-semibold uppercase tracking-[0.25em] text-blue-600">
          Discover your next craving
        </p>

        <h2 className="mt-3 text-3xl font-bold tracking-tight text-gray-950 md:text-5xl">
          Something delicious is
          <span className="text-blue-600"> waiting.</span>
        </h2>

        <p className="mx-auto mt-4 max-w-2xl text-gray-500">
          Explore dishes from restaurants around you. Hover over something that
          catches your eye.
        </p>
      </div>

      {/* Drift Wall */}

      <div
        className="
          mx-auto
          h-[560px]
          w-full
          max-w-[1200px]
          overflow-hidden
          rounded-[32px]
          border
          border-blue-100
          bg-blue-50
          shadow-xl
          shadow-blue-100/40
        "
      >
        <DriftWall
          items={foodItems}
          columns={5}
          tileWidth={190}
          tileHeight={135}
          gap={16}
          radius={18}
          tilt={10}
          turn={-8}
          roll={0}
          perspective={1400}
          depth={100}
          speed={22}
          direction="up"
          variance={0.35}
          parallax={0.35}
          pauseOnHover={true}
          lift={45}
          fade={0.45}
          dim={0.4}
          grayscale={false}
          overlayColor=""
        />
      </div>
    </section>
  );
}

export default FoodDriftWall;
