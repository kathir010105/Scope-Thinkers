import { useLayoutEffect, useRef, useState } from "react";
import { gsap } from "gsap";
import { GoArrowUpRight } from "react-icons/go";

const CardNav = ({
  logo,
  logoAlt = "Logo",
  items = [],
  className = "",
  ease = "power3.out",

  // Blueberry colors
  baseColor = "#ffffff",
  menuColor = "#2563EB",
  buttonBgColor = "#2563EB",
  buttonTextColor = "#ffffff",

  // Custom button
  buttonText = "Login",
  onButtonClick,
}) => {
  const [isHamburgerOpen, setIsHamburgerOpen] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);

  const navRef = useRef(null);
  const cardsRef = useRef([]);
  const tlRef = useRef(null);

  // ============================================
  // CALCULATE HEIGHT
  // ============================================

  const calculateHeight = () => {
    const navEl = navRef.current;

    if (!navEl) return 260;

    const isMobile = window.matchMedia("(max-width: 768px)").matches;

    if (isMobile) {
      const contentEl = navEl.querySelector(".card-nav-content");

      if (contentEl) {
        const wasVisible = contentEl.style.visibility;

        const wasPointerEvents = contentEl.style.pointerEvents;

        const wasPosition = contentEl.style.position;

        const wasHeight = contentEl.style.height;

        contentEl.style.visibility = "visible";
        contentEl.style.pointerEvents = "auto";
        contentEl.style.position = "static";
        contentEl.style.height = "auto";

        contentEl.offsetHeight;

        const topBar = 60;
        const padding = 16;

        const contentHeight = contentEl.scrollHeight;

        contentEl.style.visibility = wasVisible;
        contentEl.style.pointerEvents = wasPointerEvents;
        contentEl.style.position = wasPosition;
        contentEl.style.height = wasHeight;

        return topBar + contentHeight + padding;
      }
    }

    return 260;
  };

  // ============================================
  // CREATE GSAP TIMELINE
  // ============================================

  const createTimeline = () => {
    const navEl = navRef.current;

    if (!navEl) return null;

    // Initial collapsed state
    gsap.set(navEl, {
      height: 60,
      overflow: "hidden",
    });

    // Hide cards
    gsap.set(cardsRef.current, {
      y: 50,
      opacity: 0,
    });

    const tl = gsap.timeline({
      paused: true,
    });

    // Expand navbar
    tl.to(navEl, {
      height: calculateHeight,
      duration: 0.4,
      ease,
    });

    // Animate cards
    tl.to(
      cardsRef.current,
      {
        y: 0,
        opacity: 1,
        duration: 0.4,
        ease,
        stagger: 0.08,
      },
      "-=0.1",
    );

    return tl;
  };

  // ============================================
  // INITIALIZE
  // ============================================

  useLayoutEffect(() => {
    const tl = createTimeline();

    tlRef.current = tl;

    return () => {
      tl?.kill();
      tlRef.current = null;
    };

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ease, items]);

  // ============================================
  // HANDLE RESIZE
  // ============================================

  useLayoutEffect(() => {
    const handleResize = () => {
      if (!tlRef.current) return;

      if (isExpanded) {
        const newHeight = calculateHeight();

        gsap.set(navRef.current, {
          height: newHeight,
        });

        tlRef.current.kill();

        const newTl = createTimeline();

        if (newTl) {
          newTl.progress(1);
          tlRef.current = newTl;
        }
      } else {
        tlRef.current.kill();

        const newTl = createTimeline();

        if (newTl) {
          tlRef.current = newTl;
        }
      }
    };

    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
    };

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isExpanded]);

  // ============================================
  // TOGGLE MENU
  // ============================================

  const toggleMenu = () => {
    const tl = tlRef.current;

    if (!tl) return;

    if (!isExpanded) {
      setIsHamburgerOpen(true);
      setIsExpanded(true);

      tl.play(0);
    } else {
      setIsHamburgerOpen(false);

      tl.eventCallback("onReverseComplete", () => {
        setIsExpanded(false);
      });

      tl.reverse();
    }
  };

  // ============================================
  // CARD REF
  // ============================================

  const setCardRef = (index) => (element) => {
    if (element) {
      cardsRef.current[index] = element;
    }
  };

  // ============================================
  // RENDER
  // ============================================

  return (
    <div
      className={`
        card-nav-container
        absolute
        left-1/2
        top-[1.2em]
        z-[99]
        w-[90%]
        max-w-[800px]
        -translate-x-1/2
        ${className}
      `}
    >
      <nav
        ref={navRef}
        className={`
          card-nav
          relative
          block
          h-[60px]
          overflow-hidden
          rounded-xl
          p-0
          shadow-md
          shadow-blue-900/10
          will-change-[height]
          ${isExpanded ? "open" : ""}
        `}
        style={{
          backgroundColor: baseColor,
        }}
      >
        {/* ====================================== */}
        {/* TOP BAR */}
        {/* ====================================== */}

        <div
          className="
            card-nav-top
            absolute
            inset-x-0
            top-0
            z-[2]
            flex
            h-[60px]
            items-center
            justify-between
            p-2
            pl-[1.1rem]
          "
        >
          {/* ================================== */}
          {/* HAMBURGER */}
          {/* ================================== */}

          <div
            className={`
              hamburger-menu
              group
              order-2
              flex
              h-full
              cursor-pointer
              flex-col
              items-center
              justify-center
              gap-[6px]
              md:order-none
              ${isHamburgerOpen ? "open" : ""}
            `}
            onClick={toggleMenu}
            onKeyDown={(event) => {
              if (event.key === "Enter" || event.key === " ") {
                event.preventDefault();
                toggleMenu();
              }
            }}
            role="button"
            aria-label={isExpanded ? "Close menu" : "Open menu"}
            aria-expanded={isExpanded}
            tabIndex={0}
            style={{
              color: menuColor,
            }}
          >
            {/* First hamburger line */}

            <div
              className={`
                hamburger-line
                h-[2px]
                w-[30px]
                bg-current
                transition-[transform,opacity,margin]
                duration-300
                ease-linear
                [transform-origin:50%_50%]
                ${isHamburgerOpen ? "translate-y-[4px] rotate-45" : ""}
                group-hover:opacity-75
              `}
            />

            {/* Second hamburger line */}

            <div
              className={`
                hamburger-line
                h-[2px]
                w-[30px]
                bg-current
                transition-[transform,opacity,margin]
                duration-300
                ease-linear
                [transform-origin:50%_50%]
                ${isHamburgerOpen ? "-translate-y-[4px] -rotate-45" : ""}
                group-hover:opacity-75
              `}
            />
          </div>

          {/* ================================== */}
          {/* LOGO */}
          {/* ================================== */}

          <div
            className="
              logo-container
              order-1
              flex
              items-center
              md:absolute
              md:left-1/2
              md:top-1/2
              md:-translate-x-1/2
              md:-translate-y-1/2
              md:order-none
            "
          >
            <img
              src={logo}
              alt={logoAlt}
              className="
                logo
                h-[80px]
                w-auto
                object-contain
              "
            />
          </div>

          {/* ================================== */}
          {/* LOGIN / PROFILE BUTTON */}
          {/* ================================== */}

          <button
            type="button"
            onClick={onButtonClick}
            className="
              card-nav-cta-button
              inline-flex
              h-full
              items-center
              rounded-[calc(0.75rem-0.2rem)]
              border-0
              px-4
              font-medium
              cursor-pointer
              transition
              duration-300
              hover:opacity-90
              hover:shadow-md
              active:scale-[0.98]
            "
            style={{
              backgroundColor: buttonBgColor,
              color: buttonTextColor,
            }}
          >
            {buttonText}
          </button>
        </div>

        {/* ====================================== */}
        {/* NAVIGATION CARDS */}
        {/* ====================================== */}

        <div
          className={`
            card-nav-content
            absolute
            bottom-0
            left-0
            right-0
            top-[60px]
            z-[1]
            flex
            flex-col
            items-stretch
            justify-start
            gap-2
            p-2
            ${
              isExpanded
                ? "pointer-events-auto visible"
                : "pointer-events-none invisible"
            }
            md:flex-row
            md:items-end
            md:gap-[12px]
          `}
          aria-hidden={!isExpanded}
        >
          {(items || []).slice(0, 3).map((item, index) => (
            <div
              key={`${item.label}-${index}`}
              className="
                  nav-card
                  relative
                  flex
                  min-h-[60px]
                  min-w-0
                  flex-[1_1_auto]
                  select-none
                  flex-col
                  gap-2
                  rounded-[calc(0.75rem-0.2rem)]
                  p-[12px_16px]
                  md:h-full
                  md:min-h-0
                  md:flex-[1_1_0%]
                "
              ref={setCardRef(index)}
              style={{
                backgroundColor: item.bgColor,
                color: item.textColor,
              }}
            >
              {/* Card title */}

              <div
                className="
                    nav-card-label
                    text-[18px]
                    font-normal
                    tracking-[-0.5px]
                    md:text-[22px]
                  "
              >
                {item.label}
              </div>

              {/* Card links */}

              <div
                className="
                    nav-card-links
                    mt-auto
                    flex
                    flex-col
                    gap-[2px]
                  "
              >
                {item.links?.map((link, linkIndex) => (
                  <a
                    key={`${link.label}-${linkIndex}`}
                    className="
                          nav-card-link
                          inline-flex
                          cursor-pointer
                          items-center
                          gap-[6px]
                          text-[15px]
                          no-underline
                          transition-opacity
                          duration-300
                          hover:opacity-75
                          md:text-[16px]
                        "
                    href={link.href || "#"}
                    aria-label={link.ariaLabel}
                  >
                    <GoArrowUpRight
                      className="
                            nav-card-link-icon
                            shrink-0
                          "
                      aria-hidden="true"
                    />

                    {link.label}
                  </a>
                ))}
              </div>
            </div>
          ))}
        </div>
      </nav>
    </div>
  );
};

export default CardNav;
