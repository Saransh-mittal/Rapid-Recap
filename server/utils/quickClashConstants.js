// utils/quickClashConstants.js
/**
 * Quick Clash Constants for Win Probability System
 *
 * These constants control the win probability calculations.
 * Values are based on statistical analysis and game balance.
 */

module.exports = {
  // ==========================================
  // WIN PROBABILITY CONSTANTS
  // ==========================================

  /**
   * Baseline RQM Score
   * This is the "average" player's RQM score
   *
   * ⚠️ IMPORTANT: Replace 63 with YOUR actual value from the diagnostic script
   * Run: node scripts/determineBaselineRQM.js
   *
   * Why it matters:
   * - Players scoring above this get positive performance modifier
   * - Players scoring below this get negative performance modifier
   * - Used as default for players with no history
   */
  BASELINE_RQM: 31, // ⚠️ REPLACE WITH YOUR ACTUAL VALUE

  /**
   * Performance Multiplier
   * Controls how much RQM difference affects rating
   *
   * Formula: (avgRQM - baseline) * multiplier
   * Example: (70 - 63) * 5 = +35 rating points
   *
   * Why 5?
   * - Strong enough to matter (7 RQM diff = 35 rating)
   * - Not too extreme (20 RQM diff = 100 rating, which is capped)
   * - Balanced with trophy weight
   */
  PERFORMANCE_MULTIPLIER: 5,

  /**
   * Performance Cap
   * Maximum performance modifier (positive or negative)
   *
   * Why cap at 100?
   * - Prevents one hot/cold streak from dominating
   * - Keeps trophies as primary factor
   * - 100 points = ~10% trophy difference in impact
   */
  PERFORMANCE_CAP: 100,

  /**
   * Consistency Thresholds
   * Standard deviation boundaries for consistency bonus/penalty
   *
   * Low threshold: Very consistent player (get bonus)
   * High threshold: Very erratic player (get penalty)
   *
   * Why these values?
   * - Typical RQM std dev is 10-20 points
   * - <10 = remarkably consistent (top 25%)
   * - >15 = notably inconsistent (bottom 25%)
   */
  CONSISTENCY_LOW_THRESHOLD: 10, // Consistent player boundary
  CONSISTENCY_HIGH_THRESHOLD: 15, // Erratic player boundary

  /**
   * Consistency Bonus/Penalty
   * Rating adjustment for consistent/erratic play
   *
   * Why 50 points?
   * - Meaningful but not overwhelming
   * - Rewards reliability without overpowering skill
   * - Roughly equivalent to 50 trophy difference
   */
  CONSISTENCY_BONUS: 50,
  CONSISTENCY_PENALTY: -50,

  /**
   * Minimum Win Probability
   * Lowest probability ever shown
   *
   * Why 5%?
   * - Hope is important for engagement
   * - Upsets DO happen (roughly 5% of the time)
   * - Prevents "guaranteed loss" messaging
   * - Backed by research on competitive games
   */
  MIN_WIN_PROBABILITY: 0.05, // 5%

  /**
   * Maximum Win Probability
   * Highest probability ever shown
   *
   * Why 95%?
   * - Prevents complacency ("it's not over till it's over")
   * - Accounts for unexpected events (disconnects, mistakes)
   * - Mirror of minimum for consistency
   * - Standard in betting odds systems
   */
  MAX_WIN_PROBABILITY: 0.95, // 95%

  /**
   * ELO Rating Divisor
   * Controls the steepness of the probability curve
   *
   * Why 400?
   * - Standard ELO formula value
   * - Means: 400 rating diff = 10x odds (91% vs 9%)
   * - Proven in chess, esports, competitive games
   * - Mathematical sweet spot for human competition
   *
   * Effect on probability:
   * - 0 rating diff   = 50% vs 50%
   * - 100 rating diff = 64% vs 36%
   * - 200 rating diff = 76% vs 24%
   * - 400 rating diff = 91% vs 9%
   */
  ELO_RATING_DIVISOR: 400,

  // ==========================================
  // TEAM MODE SPECIFIC CONSTANTS
  // ==========================================

  /**
   * Team Performance Multiplier
   * Lower than solo because team averages are more stable
   *
   * Why 4 instead of 5?
   * - Team RQM is averaged across 4 players (less volatile)
   * - Individual hot streaks matter less in teams
   * - Keeps trophies as primary factor (60% weight)
   */
  TEAM_PERFORMANCE_MULTIPLIER: 4,

  /**
   * Team Synergy Bonus Cap
   * Maximum synergy modifier for established teams
   *
   * Why 50?
   * - Significant but not dominant
   * - Rewards teamwork without breaking balance
   * - Roughly 50 trophy equivalent
   */
  TEAM_SYNERGY_CAP: 50,

  /**
   * Established Team Threshold
   * Battles needed to be considered "established"
   *
   * Why 3?
   * - Enough to show consistent teamwork
   * - Not so high that few teams qualify
   * - Allows synergy bonus to activate quickly
   */
  ESTABLISHED_TEAM_BATTLES: 3,

  /**
   * Live Update Sensitivity
   * How much each completed challenge affects probability
   *
   * Higher = more reactive to each result
   * Lower = more stable, slow adjustments
   *
   * Current formula uses raw RQM differentials,
   * so no explicit sensitivity constant needed.
   * But you could add one for fine-tuning.
   */
  // LIVE_UPDATE_SENSITIVITY: 1.0, // Optional for future tuning

  // ==========================================
  // DATA QUALITY THRESHOLDS
  // ==========================================

  /**
   * Minimum matches for quality ratings
   *
   * <5 matches   = Low quality (trophy-based only)
   * 5-9 matches  = Medium quality (performance modifier added)
   * 10+ matches  = High quality (full formula with consistency)
   *
   * Why these tiers?
   * - 5 matches: Minimum for meaningful average
   * - 10 matches: Statistical significance for std dev
   * - Standard in competitive rating systems
   */
  MIN_MATCHES_FOR_MEDIUM_QUALITY: 5,
  MIN_MATCHES_FOR_HIGH_QUALITY: 10,

  // ==========================================
  // CACHING CONFIGURATION
  // ==========================================

  /**
   * Cache duration for user effective ratings
   *
   * Why 1 hour?
   * - Balance between performance and accuracy
   * - Most users don't complete 10 challenges in 1 hour
   * - Prevents stale data while reducing DB queries
   */
  USER_RATING_CACHE_DURATION: 60 * 60 * 1000, // 1 hour in milliseconds

  /**
   * Cache duration for team effective ratings
   *
   * Why 30 minutes?
   * - Teams change composition less frequently
   * - Synergy calculations are more expensive
   * - Slightly longer than user cache
   */
  TEAM_RATING_CACHE_DURATION: 30 * 60 * 1000, // 30 minutes in milliseconds
}

/**
 * LEARNING NOTE: Why separate constants file?
 *
 * 1. **Single Source of Truth**: All magic numbers in one place
 * 2. **Easy Tuning**: Change values without touching business logic
 * 3. **Documentation**: Constants explain themselves with comments
 * 4. **Testing**: Can override constants for different test scenarios
 * 5. **Consistency**: Same values used across all modules
 *
 * This is a best practice in game development and competitive systems
 * where balance is crucial and frequent tuning is expected.
 */
