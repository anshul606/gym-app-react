export const trapFocus = (container) => {
  if (!container) {
    return () => {};
  }

  const focusableElements = container.querySelectorAll(
    'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
  );
  const firstElement = focusableElements[0];
  const lastElement = focusableElements[focusableElements.length - 1];

  const handleTabKey = (e) => {
    if (e.key !== "Tab") return;

    if (e.shiftKey) {

      if (document.activeElement === firstElement) {
        lastElement?.focus();
        e.preventDefault();
      }
    } else {

      if (document.activeElement === lastElement) {
        firstElement?.focus();
        e.preventDefault();
      }
    }
  };

  container.addEventListener("keydown", handleTabKey);

  return () => {
    container.removeEventListener("keydown", handleTabKey);
  };
};

export const getFocusableElements = (container) => {
  if (!container) return [];
  return container.querySelectorAll(
    'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
  );
};

export const announceToScreenReader = (message, priority = "polite") => {
  const announcement = document.createElement("div");
  announcement.setAttribute("role", "status");
  announcement.setAttribute("aria-live", priority);
  announcement.setAttribute("aria-atomic", "true");
  announcement.className = "sr-only";
  announcement.textContent = message;

  document.body.appendChild(announcement);

  setTimeout(() => {
    document.body.removeChild(announcement);
  }, 1000);
};

export const isElementFocusable = (element) => {
  if (!element) return false;

  const style = window.getComputedStyle(element);
  return (
    element.offsetWidth > 0 &&
    element.offsetHeight > 0 &&
    style.visibility !== "hidden" &&
    style.display !== "none" &&
    !element.disabled
  );
};

export const focusFirstElement = (container) => {
  if (!container) return;
  const focusableElements = getFocusableElements(container);
  if (focusableElements.length > 0) {
    focusableElements[0].focus();
  }
};

export const handleListKeyboardNavigation = (
  e,
  items,
  currentIndex,
  onSelect
) => {
  const { key } = e;

  switch (key) {
    case "ArrowDown":
      e.preventDefault();
      if (currentIndex < items.length - 1) {
        return currentIndex + 1;
      }
      return 0;
    case "ArrowUp":
      e.preventDefault();
      if (currentIndex > 0) {
        return currentIndex - 1;
      }
      return items.length - 1;
    case "Home":
      e.preventDefault();
      return 0;
    case "End":
      e.preventDefault();
      return items.length - 1;
    case "Enter":
    case " ":
      e.preventDefault();
      if (onSelect && items[currentIndex]) {
        onSelect(items[currentIndex]);
      }
      break;
    default:
      break;
  }
  return currentIndex;
};

let idCounter = 0;
export const generateId = (prefix = "a11y") => {
  idCounter += 1;
  return `${prefix}-${idCounter}`;
};
