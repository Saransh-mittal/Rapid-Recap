// hooks/useDrag.js
import { useRef, useContext } from "react";
import { AppContext } from "../contextAPI/appContext";

const useDrag = () => {
  const startX = useRef(0);
  const isDragging = useRef(false);
  const { state, dispatch, navLinkRefs } = useContext(AppContext);
  const threshold = 50;

  const onDragRight = (nextIndex) => {
    navLinkRefs.current[nextIndex].click();
  };
  const onDragLeft = (nextIndex) => {
    navLinkRefs.current[nextIndex].click();
  };
  const startDrag = (e) => {
    startX.current = e.clientX || e.touches[0].clientX;
    isDragging.current = true;
  };

  const drag = (e) => {
    if (!isDragging.current) return;
    const currentX = e.clientX || e.touches[0].clientX;
    const diff = currentX - startX.current;
    if (Math.abs(diff) > threshold) {
      const nextIndex = (state.focusedNavLink + 1) % navLinkRefs.current.length;
      const prevIndex =
        (state.focusedNavLink - 1 + navLinkRefs.current.length) %
        navLinkRefs.current.length;

      if (!navLinkRefs.current[nextIndex]) return;

      if (diff < 0) {
        dispatch({
          type: "setFocusedNavLink",
          payloadFocusedNavLink: nextIndex,
        });
        onDragRight(nextIndex);
      } else {
        dispatch({
          type: "setFocusedNavLink",
          payloadFocusedNavLink: prevIndex,
        });
        onDragLeft(prevIndex);
      }
      isDragging.current = false;
    }
  };

  const endDrag = () => {
    isDragging.current = false;
  };

  return { startDrag, drag, endDrag };
};

export default useDrag;
