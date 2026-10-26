(() => {
  // Prevent duplicate event listeners if the script is injected again.
  if (window.__cssDetectiveInstalled) {
    return;
  }

  window.__cssDetectiveInstalled = true;

  let isPicking = false;
  let hoveredElement = null;
  let previousOutline = "";
  let previousOutlineOffset = "";

  const STORAGE_KEY = "cssDetectiveSelection";

  const highlightStyle = {
    outline: "2px solid #6366f1",
    outlineOffset: "2px",
  };

  function isOurOverlay(element) {
    return (
      element instanceof Element &&
      element.closest("[data-css-detective-overlay]") !== null
    );
  }

  function highlightElement(element) {
    if (!(element instanceof HTMLElement)) return;

    if (hoveredElement && hoveredElement !== element) {
      restoreHighlight();
    }

    if (hoveredElement === element) return;

    hoveredElement = element;
    previousOutline = element.style.outline;
    previousOutlineOffset = element.style.outlineOffset;

    Object.assign(element.style, highlightStyle);
  }

  function restoreHighlight() {
    if (!hoveredElement) return;

    hoveredElement.style.outline = previousOutline;
    hoveredElement.style.outlineOffset = previousOutlineOffset;

    hoveredElement = null;
  }

  function getElementDetails(element) {
    const styles = window.getComputedStyle(element);
    const rect = element.getBoundingClientRect();

    const cssProperties = [
      "display",
      "position",
      "box-sizing",
      "width",
      "height",
      "min-width",
      "max-width",
      "min-height",
      "max-height",
      "margin-top",
      "margin-right",
      "margin-bottom",
      "margin-left",
      "padding-top",
      "padding-right",
      "padding-bottom",
      "padding-left",
      "border-top-width",
      "border-right-width",
      "border-bottom-width",
      "border-left-width",
      "overflow",
      "overflow-x",
      "overflow-y",
      "flex-direction",
      "flex-wrap",
      "justify-content",
      "align-items",
      "align-content",
      "gap",
      "grid-template-columns",
      "grid-template-rows",
      "font-size",
      "line-height",
      "color",
      "background-color",
      "transform",
      "z-index",
    ];

    const computedStyles = {};

    for (const property of cssProperties) {
      computedStyles[property] = styles.getPropertyValue(property);
    }

    const parent = element.parentElement;
    const parentStyles = parent ? window.getComputedStyle(parent) : null;

    const parentRect = parent ? parent.getBoundingClientRect() : null;

    const attributes = {};

    for (const attribute of element.attributes) {
      if (attribute.name !== "style" && attribute.name !== "value") {
        attributes[attribute.name] = attribute.value;
      }
    }

    const classNames =
      typeof element.className === "string" ? element.className : "";

    return {
      tagName: element.tagName.toLowerCase(),
      id: element.id,
      className: classNames,
      attributes,

      selector: getSelector(element),

      textContent: (element.innerText || element.textContent || "")
        .trim()
        .slice(0, 200),

      dimensions: {
        width: Math.round(rect.width * 100) / 100,
        height: Math.round(rect.height * 100) / 100,
        top: Math.round(rect.top * 100) / 100,
        left: Math.round(rect.left * 100) / 100,
        right: Math.round(rect.right * 100) / 100,
        bottom: Math.round(rect.bottom * 100) / 100,
      },
      viewport: {
        width: window.innerWidth,
        height: window.innerHeight,
      },

      scroll: {
        scrollWidth: element.scrollWidth,
        scrollHeight: element.scrollHeight,
        clientWidth: element.clientWidth,
        clientHeight: element.clientHeight,
        hasHorizontalOverflow: element.scrollWidth > element.clientWidth,
        hasVerticalOverflow: element.scrollHeight > element.clientHeight,
      },

      parent: parent
        ? {
            tagName: parent.tagName.toLowerCase(),
            id: parent.id,
            className:
              typeof parent.className === "string" ? parent.className : "",
            display: parentStyles.display,
            width: Math.round(parentRect.width * 100) / 100,
            height: Math.round(parentRect.height * 100) / 100,
          }
        : null,

      computedStyles,
      page: window.location.href,
      inspectedAt: new Date().toISOString(),
    };
  }

  function getSelector(element) {
    if (element.id) {
      return `#${CSS.escape(element.id)}`;
    }

    const parts = [];
    let current = element;

    while (
      current &&
      current instanceof HTMLElement &&
      current !== document.documentElement
    ) {
      let part = current.tagName.toLowerCase();

      if (current.id) {
        part += `#${CSS.escape(current.id)}`;
        parts.unshift(part);
        break;
      }

      if (current.classList.length > 0) {
        part +=
          "." +
          Array.from(current.classList)
            .slice(0, 2)
            .map((name) => CSS.escape(name))
            .join(".");
      }

      const parent = current.parentElement;

      if (parent) {
        const siblings = Array.from(parent.children).filter(
          (sibling) => sibling.tagName === current.tagName,
        );

        if (siblings.length > 1) {
          part += `:nth-of-type(${siblings.indexOf(current) + 1})`;
        }
      }

      parts.unshift(part);
      current = parent;
    }

    return parts.join(" > ");
  }

  function handleMouseMove(event) {
    if (!isPicking) return;

    const target = event.target;

    if (!(target instanceof HTMLElement) || isOurOverlay(target)) {
      return;
    }

    highlightElement(target);
  }

  async function handleClick(event) {
    if (!isPicking) return;

    const target = event.target;

    if (!(target instanceof HTMLElement) || isOurOverlay(target)) {
      return;
    }

    event.preventDefault();
    event.stopPropagation();
    event.stopImmediatePropagation();

    const details = getElementDetails(target);

    stopPicking();

    try {
      await chrome.storage.local.set({
        [STORAGE_KEY]: details,
      });
    } catch (error) {
      console.error("CSS Detective could not save the inspection:", error);
    }
  }

  function handleKeyDown(event) {
    if (event.key === "Escape" && isPicking) {
      event.preventDefault();
      stopPicking();
    }
  }

  function startPicking() {
    if (isPicking) return;

    isPicking = true;

    document.addEventListener("mousemove", handleMouseMove, true);

    document.addEventListener("click", handleClick, true);

    document.addEventListener("keydown", handleKeyDown, true);

    document.documentElement.style.cursor = "crosshair";
  }

  function stopPicking() {
    isPicking = false;

    restoreHighlight();

    document.removeEventListener("mousemove", handleMouseMove, true);

    document.removeEventListener("click", handleClick, true);

    document.removeEventListener("keydown", handleKeyDown, true);

    document.documentElement.style.cursor = "";
  }

  chrome.runtime.onMessage.addListener((message) => {
    if (message?.type === "CSS_DETECTIVE_START_PICKING") {
      startPicking();
    }

    if (message?.type === "CSS_DETECTIVE_STOP_PICKING") {
      stopPicking();
    }
  });
})();
