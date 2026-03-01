// Utility to calculate confidence score from raw time and telemetry
const calculateConfidenceScore = (timeSpentMs, expectedTimeMs, phase, telemetry) => {
    // Phase can be 'forge' (per-question) or 'quiz' (global pool)
    const timeSpent = timeSpentMs / 1000;
    const maxTime = expectedTimeMs / 1000;

    let baseSpeed = 100;

    if (phase === 'forge') {
      // Forge Phase - Per Question (e.g. 10s max)
      // Relaxed boundaries for a full 100% base score
      if (timeSpent <= maxTime * 0.5) {
        baseSpeed = 100; // Sweet Spot (< 50%)
      } else if (timeSpent <= maxTime * 0.9) {
        // Linearly drop from 100 to 70
        const excess = timeSpent - (maxTime * 0.5);
        const range = (maxTime * 0.9) - (maxTime * 0.5);
        const pct = excess / range;
        baseSpeed = 100 - (pct * 30);
      } else {
        baseSpeed = 70; // The Buzzer Beater (> 90%)
      }
    } else if (phase === 'quiz') {
      // Quiz Phase - Global Timer
      if (timeSpent <= maxTime * 0.7) {
        baseSpeed = 100; // The Sprint (< 70%)
      } else if (timeSpent <= maxTime * 1.5) {
        const excess = timeSpent - (maxTime * 0.7);
        const range = (maxTime * 1.5) - (maxTime * 0.7);
        const pct = excess / range;
        baseSpeed = 100 - (pct * 30); // 100 down to 70
      } else {
        baseSpeed = 70; // The Time Sink (> 150%)
      }
    }

    // 2. Apply Telemetry Deductions (Relaxed Penalties)
    let deductions = 0;

    if (telemetry) {
        // Universal Metrics
        if (telemetry.screenFreezeDuration > 1500) deductions += 10; // Frozen in thought
        if (telemetry.screenFreezeDuration > 3000) deductions += 5; // MAJOR freeze

        if (telemetry.hoverBounces > 0) deductions += (telemetry.hoverBounces * 3); // Desktop doubt (lowered to 3)
        if (telemetry.fidgetTouches > 0) deductions += (telemetry.fidgetTouches * 3); // Mobile doubt (lowered to 3)

        // A standard quick tap is ~80ms. Hesitation window relaxed to 800ms
        if (telemetry.tapDuration > 800) deductions += 10;

        // Swaps
        if (telemetry.swaps === 1) deductions += 15; // The Second Guess
        if (telemetry.swaps >= 2) deductions += 30; // Blind Elimination

        // Perfection Bonus
        if (telemetry.swaps === 0 && telemetry.fidgetTouches === 0 && telemetry.screenFreezeDuration < 500 && telemetry.tapDuration < 300) {
            deductions -= 5;
        }
    }

    let finalConfidence = Math.round(baseSpeed - deductions);

    // Clamp between 0 and 100
    if (finalConfidence > 100) finalConfidence = 100;
    if (finalConfidence < 25) finalConfidence = 25; // Raised floor from 15% to 25%

    return finalConfidence;
};

module.exports = { calculateConfidenceScore };
