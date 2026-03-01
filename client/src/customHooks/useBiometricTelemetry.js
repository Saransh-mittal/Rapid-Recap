import { useState, useEffect, useRef, useCallback } from 'react';

const useBiometricTelemetry = (isQuizPhase = false) => {
  // Trackers
  const tapDuration = useRef(0);
  const lastMousePos = useRef(null);
  const totalDistance = useRef(0);
  const startTime = useRef(Date.now());
  const hoveredOptions = useRef(new Set());
  const mouseStoppedAt = useRef(null);
  const longestFreeze = useRef(0);

  const touchStartAt = useRef(null);
  const nonTargetTouchStartPos = useRef(null);
  const nonTargetTouches = useRef(0);

  const swapCount = useRef(0);

  // Timer for mouse freeze detection
  useEffect(() => {
    const checkFreeze = setInterval(() => {
        if (mouseStoppedAt.current) {
            const freezeDuration = Date.now() - mouseStoppedAt.current;
            if (freezeDuration > longestFreeze.current) {
                longestFreeze.current = freezeDuration;
            }
        }
    }, 100);

    return () => clearInterval(checkFreeze);
  }, []);

  const handleMouseMove = useCallback((e) => {
    // Reset freeze timer
    mouseStoppedAt.current = Date.now();

    // Path calculation
    if (lastMousePos.current) {
      const dx = e.clientX - lastMousePos.current.x;
      const dy = e.clientY - lastMousePos.current.y;
      totalDistance.current += Math.sqrt(dx * dx + dy * dy);
    }
    lastMousePos.current = { x: e.clientX, y: e.clientY };
  }, []);

  const handleOptionHover = useCallback((optionId) => {
      hoveredOptions.current.add(optionId);
  }, []);

  // Pointer tracking (Touch & Mouse)
  const handlePointerDown = useCallback((e, isTarget) => {
      mouseStoppedAt.current = Date.now(); // Reset freeze timer on touch down

      if (isTarget) {
          e.stopPropagation();
          touchStartAt.current = Date.now();
      } else {
          // Record start position to determine if it turns into a scroll
          if (e.touches && e.touches.length > 0) {
              nonTargetTouchStartPos.current = {
                  x: e.touches[0].clientX,
                  y: e.touches[0].clientY
              };
          } else if (e.clientX !== undefined) {
              nonTargetTouchStartPos.current = {
                  x: e.clientX,
                  y: e.clientY
              };
          }
      }
  }, []);

  const handlePointerMove = useCallback((e) => {
      mouseStoppedAt.current = Date.now(); // Reset freeze timer on touch move

      // Check if they moved enough for it to be considered a scroll
      if (nonTargetTouchStartPos.current) {
          let cx, cy;
          if (e.touches && e.touches.length > 0) {
              cx = e.touches[0].clientX;
              cy = e.touches[0].clientY;
          } else if (e.clientX !== undefined) {
              cx = e.clientX;
              cy = e.clientY;
          }

          if (cx !== undefined && cy !== undefined) {
              const dx = cx - nonTargetTouchStartPos.current.x;
              const dy = cy - nonTargetTouchStartPos.current.y;
              const distance = Math.sqrt(dx * dx + dy * dy);

              if (distance > 10) { // 10px threshold for scrolling
                  nonTargetTouchStartPos.current = null; // Cancel the fidget tap
              }
          }
      }
  }, []);

  const handlePointerUp = useCallback((e, isTarget) => {
      if (isTarget) {
          e.stopPropagation();
          if (touchStartAt.current) {
              // Correctly recording the longest tap duration across all touches on options
              const duration = Date.now() - touchStartAt.current;
              tapDuration.current = Math.max(tapDuration.current, duration);
              touchStartAt.current = null;
          }
      } else if (!isTarget && nonTargetTouchStartPos.current) {
          // If they lifted the finger and didn't move much (not a scroll)
          nonTargetTouches.current += 1;
          nonTargetTouchStartPos.current = null;
      }
  }, []);

  const handlePointerCancel = useCallback((e, isTarget) => {
      if (isTarget) {
          e.stopPropagation();
          if (touchStartAt.current) {
              const duration = Date.now() - touchStartAt.current;
              tapDuration.current = Math.max(tapDuration.current, duration);
              touchStartAt.current = null;
          }
      } else {
          nonTargetTouchStartPos.current = null;
      }
  }, []);

  const recordSwap = useCallback(() => {
      swapCount.current += 1;
  }, []);

  const getTelemetryData = useCallback(() => {
      // Calculate final path efficiency
      const data = {
          hoverBounces: hoveredOptions.current.size > 1 ? hoveredOptions.current.size : 0,
          pathEfficiency: 100, // Leaving as 100 for now due to layout complexity
          tapDuration: tapDuration.current,
          swaps: swapCount.current,
          fidgetTouches: nonTargetTouches.current,
          screenFreezeDuration: longestFreeze.current
      };
      return data;
  }, []);

  const resetTelemetry = useCallback(() => {
      tapDuration.current = 0;
      lastMousePos.current = null;
      totalDistance.current = 0;
      startTime.current = Date.now();
      hoveredOptions.current = new Set();
      mouseStoppedAt.current = null; // Clear freeze timer reference between questions!
      longestFreeze.current = 0;
      touchStartAt.current = null;
      nonTargetTouchStartPos.current = null;
      nonTargetTouches.current = 0;
      swapCount.current = 0;
  }, []);

  return {
    handleMouseMove,
    handleOptionHover,
    handlePointerDown,
    handlePointerMove,
    handlePointerUp,
    handlePointerCancel,
    recordSwap,
    getTelemetryData,
    resetTelemetry
  };
};

export default useBiometricTelemetry;
