export type DiagnosticSeverity = "error" | "warning" | "info";

export interface CssDiagnostic {
  id: string;
  severity: DiagnosticSeverity;
  title: string;
  description: string;
  evidence: string;
  suggestedFix: string;
}

export interface ElementDetails {
  tagName: string;
  id: string;
  className: string;
  selector: string;
  textContent: string;
  page: string;
  inspectedAt: string;

  dimensions: {
    width: number;
    height: number;
    top: number;
    left: number;
    right: number;
    bottom: number;
  };

  viewport: {
    width: number;
    height: number;
  };

  scroll: {
    scrollWidth: number;
    scrollHeight: number;
    clientWidth: number;
    clientHeight: number;
    hasHorizontalOverflow: boolean;
    hasVerticalOverflow: boolean;
  };

  parent: {
    tagName: string;
    id: string;
    className: string;
    display: string;
    width: number;
    height: number;
  } | null;

  computedStyles: Record<string, string>;
}

export function getCssDiagnostics(element: ElementDetails): CssDiagnostic[] {
  const diagnostics: CssDiagnostic[] = [];

  const { dimensions, viewport, scroll, parent, computedStyles } = element;

  const display = computedStyles.display || "unknown";
  const position = computedStyles.position || "static";
  const boxSizing = computedStyles["box-sizing"] || "unknown";

  const width = computedStyles.width || "auto";
  const height = computedStyles.height || "auto";

  const minWidth = computedStyles["min-width"] || "auto";
  const minHeight = computedStyles["min-height"] || "auto";


  const overflow = computedStyles.overflow || "visible";
  const overflowX = computedStyles["overflow-x"] || overflow;
  const overflowY = computedStyles["overflow-y"] || overflow;

  const zIndex = computedStyles["z-index"] || "auto";

  const paddingLeft = computedStyles["padding-left"] || "0px";
  const paddingRight = computedStyles["padding-right"] || "0px";
  const paddingTop = computedStyles["padding-top"] || "0px";
  const paddingBottom = computedStyles["padding-bottom"] || "0px";

  const borderLeft = computedStyles["border-left-width"] || "0px";
  const borderRight = computedStyles["border-right-width"] || "0px";
  const borderTop = computedStyles["border-top-width"] || "0px";
  const borderBottom = computedStyles["border-bottom-width"] || "0px";

  const flexShrink = computedStyles["flex-shrink"] || "1";
  const flexBasis = computedStyles["flex-basis"] || "auto";

  const gridColumns = computedStyles["grid-template-columns"] || "none";

  function add(diagnostic: CssDiagnostic): void {
    diagnostics.push(diagnostic);
  }

  function parsePx(value: string): number | null {
    if (!value.endsWith("px")) {
      return null;
    }

    const parsed = Number.parseFloat(value);

    return Number.isFinite(parsed) ? parsed : null;
  }

  function isNonZero(value: string): boolean {
    const parsed = Number.parseFloat(value);

    return Number.isFinite(parsed) && parsed > 0;
  }

  const computedWidth = parsePx(width);
  const computedMinWidth = parsePx(minWidth);
  const computedMinHeight = parsePx(minHeight);

  const parentIsFlex =
    parent !== null &&
    (parent.display === "flex" || parent.display === "inline-flex");

  const parentIsGrid =
    parent !== null &&
    (parent.display === "grid" || parent.display === "inline-grid");

  const widerThanParent =
    parent !== null && dimensions.width > parent.width + 1;

  // 1. Horizontal content overflow

  if (scroll.hasHorizontalOverflow) {
    add({
      id: "horizontal-content-overflow",
      severity: "warning",
      title: "Horizontal content overflow",
      description:
        "The element's scrollable content is wider than its available client area. This can cause clipping or horizontal scrolling.",
      evidence:
        `Content width: ${scroll.scrollWidth}px; ` +
        `available width: ${scroll.clientWidth}px; ` +
        `overflow-x: ${overflowX}.`,
      suggestedFix:
        "Inspect overflowing children and long unbreakable text. Consider max-width: 100%, min-width: 0 for flex/grid items, or overflow-x: auto when scrolling is intentional.",
    });
  }

  // 2. Vertical content overflow

  if (scroll.hasVerticalOverflow) {
    add({
      id: "vertical-content-overflow",
      severity: "info",
      title: "Vertical content overflow",
      description:
        "The content extends beyond the element's client height. This is normal for some containers, but may indicate clipping or unexpected scrolling.",
      evidence:
        `Content height: ${scroll.scrollHeight}px; ` +
        `available height: ${scroll.clientHeight}px; ` +
        `overflow-y: ${overflowY}.`,
      suggestedFix:
        "Check fixed heights and overflow-y. Use min-height instead of a restrictive height when appropriate, or overflow-y: auto for a scrollable panel.",
    });
  }

  // 3. Element extends outside the horizontal viewport

  if (dimensions.left < -1 || dimensions.right > viewport.width + 1) {
    add({
      id: "viewport-horizontal-overflow",
      severity: "error",
      title: "Element extends beyond the viewport",
      description:
        "The selected element extends beyond the visible horizontal viewport. Depending on its position and context, it may contribute to unwanted horizontal scrolling.",
      evidence:
        `Left: ${dimensions.left}px; ` +
        `right: ${dimensions.right}px; ` +
        `viewport width: ${viewport.width}px.`,
      suggestedFix:
        "Inspect width, min-width, margins, transforms, and positioning. Consider responsive sizing or max-width: 100% if the element should fit within its container.",
    });
  }

  // 4. Element extends outside the vertical viewport

  if (dimensions.top < -1 || dimensions.bottom > viewport.height + 1) {
    add({
      id: "viewport-vertical-overflow",
      severity: "info",
      title: "Element extends beyond the vertical viewport",
      description:
        "Part of the selected element is outside the currently visible vertical viewport. This is expected for content below the fold and is not necessarily a layout issue.",
      evidence:
        `Top: ${dimensions.top}px; ` +
        `bottom: ${dimensions.bottom}px; ` +
        `viewport height: ${viewport.height}px.`,
      suggestedFix:
        "If this position is unintended, inspect positioning, transforms, and parent layout. Normal page content often extends below the viewport.",
    });
  }

  // 5. Element wider than its parent.
  // Flex and Grid receive their own more specific diagnostic below.

  if (widerThanParent && !parentIsFlex && !parentIsGrid) {
    add({
      id: "element-wider-than-parent",
      severity: "warning",
      title: "Element is wider than its parent",
      description:
        "The selected element's rendered width exceeds its parent's width. This may cause content to spill outside the intended layout.",
      evidence:
        `Element width: ${dimensions.width}px; ` +
        `parent width: ${parent?.width}px.`,
      suggestedFix:
        "Inspect explicit width, min-width, padding, borders, and margins. Consider max-width: 100% or min-width: 0 when appropriate.",
    });
  }

  // 6. Fixed or minimum width larger than the viewport

  const fixedWidthTooLarge =
    computedWidth !== null && computedWidth > viewport.width + 1;

  const minimumWidthTooLarge =
    computedMinWidth !== null && computedMinWidth > viewport.width + 1;

  if (fixedWidthTooLarge || minimumWidthTooLarge) {
    add({
      id: "width-exceeds-viewport",
      severity: "warning",
      title: "Width may break smaller screens",
      description:
        "The computed width or minimum width exceeds the viewport width. This may cause responsive layout problems.",
      evidence:
        `Computed width: ${width}; ` +
        `min-width: ${minWidth}; ` +
        `viewport width: ${viewport.width}px.`,
      suggestedFix:
        "Review fixed width and min-width constraints. Consider width: 100%, max-width: 100%, or clamp() for responsive sizing.",
    });
  }

  // 7. Flexbox child sizing

  if (parentIsFlex && widerThanParent) {
    add({
      id: "flex-child-sizing",
      severity: "warning",
      title: "Potential Flexbox sizing issue",
      description:
        "The selected element is wider than its flex container. Its minimum content size, flex-basis, or flex-shrink behavior may prevent it from fitting.",
      evidence:
        `Parent display: ${parent?.display}; ` +
        `element width: ${dimensions.width}px; ` +
        `parent width: ${parent?.width}px; ` +
        `flex-shrink: ${flexShrink}; ` +
        `flex-basis: ${flexBasis}.`,
      suggestedFix:
        "If the item should shrink, try min-width: 0. Also inspect flex-shrink, flex-basis, gap, and unbreakable content.",
    });
  }

  // 8. Grid child sizing

  if (parentIsGrid && widerThanParent) {
    add({
      id: "grid-child-sizing",
      severity: "warning",
      title: "Potential CSS Grid sizing issue",
      description:
        "The selected element is wider than its grid container. Intrinsic content sizing or grid track definitions may contribute to the overflow.",
      evidence:
        `Parent display: ${parent?.display}; ` +
        `element width: ${dimensions.width}px; ` +
        `parent width: ${parent?.width}px; ` +
        `grid columns: ${gridColumns}.`,
      suggestedFix:
        "Inspect grid-template-columns and long content. Consider minmax(0, 1fr) for flexible grid tracks and min-width: 0 on children when appropriate.",
    });
  }

  // 9. Zero-size element

  if (dimensions.width === 0 || dimensions.height === 0) {
    add({
      id: "zero-size-element",
      severity: "warning",
      title: "Element has zero dimensions",
      description:
        "The element has zero width or height. It may be intentionally collapsed, empty, hidden, or constrained by its parent.",
      evidence:
        `Width: ${dimensions.width}px; ` +
        `height: ${dimensions.height}px; ` +
        `display: ${display}.`,
      suggestedFix:
        "Inspect display, dimensions, padding, content, and parent constraints. If the element should be visible, identify which rule collapses its dimensions.",
    });
  }

  // 10. Content-box sizing

  if (boxSizing === "content-box") {
    const horizontalPadding =
      (parsePx(paddingLeft) ?? 0) + (parsePx(paddingRight) ?? 0);

    const horizontalBorder =
      (parsePx(borderLeft) ?? 0) + (parsePx(borderRight) ?? 0);

    const verticalPadding =
      (parsePx(paddingTop) ?? 0) + (parsePx(paddingBottom) ?? 0);

    const verticalBorder =
      (parsePx(borderTop) ?? 0) + (parsePx(borderBottom) ?? 0);

    add({
      id: "content-box-sizing",
      severity: "info",
      title: "Element uses content-box sizing",
      description:
        "With content-box, declared width and height exclude padding and borders. The total rendered size can therefore be larger than the declared dimensions.",
      evidence:
        `box-sizing: ${boxSizing}; ` +
        `width: ${width}; ` +
        `horizontal padding: ${horizontalPadding}px; ` +
        `horizontal borders: ${horizontalBorder}px; ` +
        `height: ${height}; ` +
        `vertical padding: ${verticalPadding}px; ` +
        `vertical borders: ${verticalBorder}px.`,
      suggestedFix:
        "Consider box-sizing: border-box if declared dimensions should include padding and borders. Check the intended sizing model before changing it.",
    });
  }

  // 11. Minimum width may constrain the element

  if (computedMinWidth !== null && computedMinWidth > dimensions.width + 1) {
    add({
      id: "minimum-width-constraint",
      severity: "warning",
      title: "Minimum width may constrain the layout",
      description:
        "The declared minimum width is larger than the measured rendered width. Check whether the measurement, stylesheet, or responsive constraint is behaving as expected.",
      evidence:
        `min-width: ${minWidth}; ` + `measured width: ${dimensions.width}px.`,
      suggestedFix:
        "Review min-width rules and media queries. For a flex or grid child that should shrink, min-width: 0 may be appropriate.",
    });
  }

  // 12. Minimum height may constrain the element

  if (computedMinHeight !== null && computedMinHeight > dimensions.height + 1) {
    add({
      id: "minimum-height-constraint",
      severity: "info",
      title: "Minimum height exceeds the measured height",
      description:
        "The declared minimum height exceeds the measured element height. Verify the measurement and check whether another layout rule affects the element.",
      evidence:
        `min-height: ${minHeight}; ` +
        `measured height: ${dimensions.height}px.`,
      suggestedFix:
        "Inspect height, min-height, display, and parent constraints. Test the element at different viewport sizes.",
    });
  }

  // 13. Overflow clipping

  const clipsHorizontal =
    (overflowX === "hidden" || overflowX === "clip") &&
    scroll.hasHorizontalOverflow;

  const clipsVertical =
    (overflowY === "hidden" || overflowY === "clip") &&
    scroll.hasVerticalOverflow;

  if (clipsHorizontal || clipsVertical) {
    add({
      id: "possible-overflow-clipping",
      severity: "warning",
      title: "Content may be clipped",
      description:
        "The element has overflowing content and an overflow rule that may hide part of it.",
      evidence:
        `overflow-x: ${overflowX}; ` +
        `overflow-y: ${overflowY}; ` +
        `horizontal overflow: ${scroll.hasHorizontalOverflow}; ` +
        `vertical overflow: ${scroll.hasVerticalOverflow}.`,
      suggestedFix:
        "Verify that clipping is intentional. Consider overflow: auto or adjusting dimensions if users should be able to access all content.",
    });
  }

  // 14. Negative z-index

  const numericZIndex = Number(zIndex);

  if (
    position !== "static" &&
    zIndex !== "auto" &&
    Number.isFinite(numericZIndex) &&
    numericZIndex < 0
  ) {
    add({
      id: "negative-z-index",
      severity: "info",
      title: "Negative z-index",
      description:
        "The element has a negative stacking order. Depending on its stacking context, it may appear behind other content.",
      evidence: `position: ${position}; z-index: ${zIndex}.`,
      suggestedFix:
        "Inspect surrounding stacking contexts and layering. Change z-index only if the current behavior is unintended.",
    });
  }

  // 15. Fixed dimensions with content-box sizing

  const hasHorizontalPadding =
    isNonZero(paddingLeft) || isNonZero(paddingRight);

  const hasHorizontalBorder = isNonZero(borderLeft) || isNonZero(borderRight);

  if (
    boxSizing === "content-box" &&
    computedWidth !== null &&
    computedWidth > 0 &&
    (hasHorizontalPadding || hasHorizontalBorder)
  ) {
    const extraWidth =
      (parsePx(paddingLeft) ?? 0) +
      (parsePx(paddingRight) ?? 0) +
      (parsePx(borderLeft) ?? 0) +
      (parsePx(borderRight) ?? 0);

    add({
      id: "box-model-extra-width",
      severity: "info",
      title: "Padding and borders add to the declared width",
      description:
        "Because this element uses content-box sizing, its horizontal padding and borders are added outside the declared CSS width.",
      evidence:
        `CSS width: ${width}; ` +
        `horizontal padding and borders: ${extraWidth}px; ` +
        `measured width: ${dimensions.width}px.`,
      suggestedFix:
        "If the element must fit within a specific width, consider box-sizing: border-box or reduce its content width to account for padding and borders.",
    });
  }

  // 16. No findings

  if (diagnostics.length === 0) {
    add({
      id: "no-obvious-issues",
      severity: "info",
      title: "No obvious layout issues detected",
      description:
        "The current diagnostic rules did not identify any of the layout conditions they check. This does not guarantee that the page is visually correct.",
      evidence:
        `Display: ${display}; ` +
        `position: ${position}; ` +
        `dimensions: ${dimensions.width} × ${dimensions.height}px; ` +
        `box-sizing: ${boxSizing}.`,
      suggestedFix:
        "Inspect the page visually, test different viewport sizes, and check the element's parent and sibling elements if the layout still looks incorrect.",
    });
  }

  return diagnostics;
}
