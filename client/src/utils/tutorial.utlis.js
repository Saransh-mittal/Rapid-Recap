import axios from "axios";

export const isTutorialTakenCheck = async ({ page, tour }) => {
  try {
    const response = await axios.get(`/api/user/isTutorialTakenCheck/${page}`);
    if (response.data.status) tour.start();
  } catch (err) {
    console.error(err);
  }
};

export function manageOverlay({
  element,
  overlayClassName = "custom-overlay-nav",
  overlay = false,
}) {
  if (!element) {
    console.error("Element is not provided or invalid");
    return;
  }
  // Check for existing overlay
  let existingOverlay = element.querySelector("." + overlayClassName);

  while (existingOverlay) {
    existingOverlay.remove();
    existingOverlay = element.querySelector("." + overlayClassName);
    // If overlay exists, remove it
  }

  // Add the overlay if the condition is true
  if (overlay) {
    const newOverlay = document.createElement("div");
    newOverlay.classList.add(overlayClassName);
    element.appendChild(newOverlay);
  }
}

export function toggleClass({ element, className, addClass }) {
  if (element) {
    if (addClass && !element.classList.contains(className)) {
      element.classList.add(className);
    } else if (!addClass && element.classList.contains(className)) {
      while (element.classList.contains(className))
        element.classList.remove(className);
    }
  }
}
