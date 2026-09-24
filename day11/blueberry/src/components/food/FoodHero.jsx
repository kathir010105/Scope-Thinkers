import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";

const foodItems = [
  {
    image:
      "https://images.unsplash.com/photo-1574071318508-1cdbab80d002?auto=format&fit=crop&w=600&q=80",
    alt: "Pizza",
    position: "left-[-50px] top-[110px] md:left-[7%] md:top-[130px]",
    initial: {
      x: -350,
      y: -250,
      rotate: -30,
    },
    rotate: -8,
  },

  {
    image:
      "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=600&q=80",
    alt: "Burger",
    position: "right-[-50px] top-[110px] md:right-[7%] md:top-[130px]",
    initial: {
      x: 350,
      y: -250,
      rotate: 30,
    },
    rotate: 8,
  },

  {
    image:
      "https://images.unsplash.com/photo-1579871494447-9811cf80d66c?auto=format&fit=crop&w=600&q=80",
    alt: "Sushi",
    position: "left-[-40px] bottom-[70px] md:left-[10%] md:bottom-[70px]",
    initial: {
      x: -350,
      y: 280,
      rotate: 30,
    },
    rotate: 10,
  },

  {
    image:
      "https://images.unsplash.com/photo-1473093295043-cdd812d0e601?auto=format&fit=crop&w=600&q=80",
    alt: "Pasta",
    position: "right-[-40px] bottom-[70px] md:right-[10%] md:bottom-[70px]",
    initial: {
      x: 350,
      y: 280,
      rotate: -30,
    },
    rotate: -10,
  },
];

function FoodHero() {
  return (
    <section className="relative min-h-screen overflow-hidden bg-white">
      {/* ================= BACKGROUND ================= */}

      <div className="pointer-events-none absolute left-1/2 top-1/2 h-[420px] w-[420px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-blue-50 blur-3xl md:h-[600px] md:w-[600px]" />

      {/* ================= FOOD IMAGES ================= */}

      {foodItems.map((food, index) => (
        <motion.div
          key={food.alt}
          className={`absolute z-10 ${food.position} hidden sm:block`}
          initial={{
            ...food.initial,
            opacity: 0,
            scale: 0.5,
          }}
          animate={{
            x: 0,
            y: 0,
            rotate: food.rotate,
            opacity: 1,
            scale: 1,
          }}
          transition={{
            duration: 1.15,
            delay: 0.15 + index * 0.15,
            ease: [0.22, 1, 0.36, 1],
          }}
        >
          <div className="relative">
            <div className="absolute inset-0 translate-y-4 rounded-[32px] bg-blue-200/30 blur-2xl" />

            <img
              src={food.image}
              alt={food.alt}
              className="
                relative
                h-32
                w-32
                rounded-[28px]
                object-cover
                shadow-2xl
                ring-4
                ring-white
                md:h-48
                md:w-48
                lg:h-56
                lg:w-56
              "
            />
          </div>
        </motion.div>
      ))}

      {/* ================= CENTER CONTENT ================= */}

      <div className="relative z-20 flex min-h-screen items-center justify-center px-6">
        <div className="flex max-w-3xl flex-col items-center text-center">
          {/* Brand badge */}

          <motion.div
            initial={{
              opacity: 0,
              y: 20,
            }}
            animate={{
              opacity: 1,
              y: 0,
            }}
            transition={{
              duration: 0.7,
              delay: 0.6,
            }}
            className="
              mb-6
              rounded-full
              border
              border-blue-100
              bg-blue-50
              px-5
              py-2
              text-sm
              font-medium
              text-blue-700
            "
          >
            Your food. Your way.
          </motion.div>

          {/* Heading */}

          <motion.h1
            initial={{
              opacity: 0,
              y: 35,
            }}
            animate={{
              opacity: 1,
              y: 0,
            }}
            transition={{
              duration: 0.8,
              delay: 0.75,
            }}
            className="
              text-6xl
              font-bold
              leading-[0.95]
              tracking-[-0.05em]
              text-gray-950
              sm:text-7xl
              md:text-8xl
            "
          >
            Crave it.
            <br />
            <span className="text-blue-600">Blueberry it.</span>
          </motion.h1>

          {/* Description */}

          <motion.p
            initial={{
              opacity: 0,
              y: 25,
            }}
            animate={{
              opacity: 1,
              y: 0,
            }}
            transition={{
              duration: 0.7,
              delay: 0.95,
            }}
            className="
              mt-7
              max-w-xl
              text-base
              leading-7
              text-gray-500
              sm:text-lg
            "
          >
            Discover delicious food, explore amazing restaurants, and get
            everything you love delivered to your doorstep.
          </motion.p>

          {/* Explore button */}

          <motion.div
            initial={{
              opacity: 0,
              y: 25,
            }}
            animate={{
              opacity: 1,
              y: 0,
            }}
            transition={{
              duration: 0.7,
              delay: 1.1,
            }}
            className="mt-9"
          >
            <Link
              to="/explore"
              className="
                group
                flex
                items-center
                gap-3
                rounded-full
                bg-blue-600
                px-7
                py-3.5
                font-semibold
                text-white
                shadow-lg
                shadow-blue-200
                transition-all
                duration-300
                hover:-translate-y-1
                hover:bg-blue-700
                hover:shadow-xl
              "
            >
              Explore
              <ArrowRight
                size={18}
                className="
                  transition-transform
                  duration-300
                  group-hover:translate-x-1
                "
              />
            </Link>
          </motion.div>
        </div>
      </div>

      {/* Bottom fade */}

      <div
        className="
          pointer-events-none
          absolute
          bottom-0
          left-0
          right-0
          h-32
          bg-gradient-to-t
          from-white
          to-transparent
        "
      />
    </section>
  );
}

export default FoodHero;
