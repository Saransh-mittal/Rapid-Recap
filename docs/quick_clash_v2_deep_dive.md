# Quick Clash V2: Deep Dive Documentation

**Quick Clash V2** is a fast-paced, 4v4 team-based competitive learning game designed to test knowledge and speed. Matches take approximately 30 seconds on average to find. The 1v1 mode is currently considered legacy.

## 1. Game Flow & Mechanics

A typical Quick Clash session consists of two main phases: **Forge Phase** (Preparation/Learning) and **Quiz Phase** (Testing).

### A. Forge Phase (Reading & Preparation)
The Forge phase is the "study" portion where players unlock and read content to prepare for the quiz.

*   **Structure**: The content is divided into **5 Sections**.
*   **Mechanics**:
    *   **Progressive Unlock**: Players must answer a question to unlock the reading material for a section.
    *   **Question Timer**: Users have **15 seconds** to answer the unlocking question.
    *   **Reading Timer**: Once unlocked, users have **24 seconds** to read the content before auto-advancing to the next section.
*   **Scoring**:
    *   **Base Score**: Points for correct answers.
    *   **Streak Bonus**: Multiplier for consecutive correct answers.
    *   **Speed Bonus**: Extra points for answering quickly.
*   **Completion**: Successfully completing all 5 sections transitions the user to the Quiz Phase.

### B. Quiz Phase (The Battle)
The Quiz phase is the direct competitive element where knowledge is tested.

*   **Structure**: A set of **10 Questions** (typically) related to the content studied in the Forge Phase.
*   **Mechanics**:
    *   **Global Timer**: There is a **50-second** total timer for the entire quiz interactable via time-extension powerups.
    *   **Submission**: Users submit their answers when finished or when time expires.
*   **Scoring (RQM - Rapid Quiz Mastery)**:
    *   **Accuracy**: Primary score component based on correct answers.
    *   **Speed Bonus**: Higher rewards for faster completion.
    *   **Precision Bonus**: Special bonus for high accuracy (e.g., 100%).

---

## 2. Team Battle & Matchmaking

Quick Clash V2 is fundamentally a **4v4 Team Battle** experience.

### Matchmaking
*   **Format**: 4 vs 4.
*   **Algorithm**: Trophy-based matching. The system tries to find an opposing team with a similar average trophy count within a widening range (starting at ±200).
*   **Wait Time**: Average matchmaking time is around **30 seconds**.
*   **Auto-Formation**:
    *   Players can join as a full 4-person team.
    *   Partial teams (1-3 players) and solo players are automatically merged by the "Spark Engine" into temporary "Auto-Formed" teams to ensure 4v4 matches are possible.
    *   **Legacy**: 1v1 mode is deprecated/legacy.

### Team Structure
*   **Roles**:
    *   **Leader**: The creator of the team, controls the "Ready" status and initiates matchmaking.
    *   **Member**: Joiners who must mark themselves as "Ready".
*   **Trophy Calculation**: Team Average Trophies are used for matchmaking fairness.

---

## 3. Powerups System

Powerups add strategic depth to both phases. They are managed through a **Team Pool** and **Personal Loadout** system.

### The Economy
1.  **Donation**: Players donate powerups from their personal inventory to the **Team Pool** (Max 20 housing worth per player).
2.  **Team Pool**: Holds donated powerups (Max 80 housing).
3.  **Equip**: Players equip powerups from the pool to their **Loadout** (Max 30 housing) for use in the battle.

### Powerup Types
| Powerup | Cost | Type | Phase | Effect |
| :--- | :--- | :--- | :--- | :--- |
| **Time Warp** | 12 | Active | Both | **Forge**: +15s to current timer.<br>**Quiz**: +15s to total quiz timer (Passive effect in Quiz). |
| **Score Surge** | 10 | Active | Both | **Forge**: 2x Points for current question.<br>**Quiz**: 1.1x Multiplier to final RQM Score (Passive). |
| **Oracle's Eye** | 8 | Active | Both | Removes **2 incorrect options** from the current question options. |
| **Streak Shield** | 5 | Passive | Forge | Prevents streak counter from resetting upon an incorrect answer. |
| **Precision Protocol** | 12 | Passive | Quiz | Grants **+50 RQM Score** if the user achieves 100% accuracy. |

*Note: "Active" powerups must be triggered by the user. "Passive" powerups activate automatically when conditions are met.*

---

## 4. Profile & Progression

The User Profile tracks Quick Clash specific competitive stats.

*   **Key Stats**:
    *   **Quick Clash Trophies**: The primary ranking metric (ELO-like).
    *   **Battle History**: Logs of recent matches including W/L, opponents, and score changes.
    *   **Win Rate**: Percentage of matches won.
    *   **Best Streak**: Highest consecutive win streak.
*   **Rewards**:
    *   **Trophy Change**:
        *   **Win**: +Trophies (calculated based on opponent difficulty).
        *   **Loss**: -Trophies.
    *   **Betting**: Users can wager trophies on matches.
        *   **Win**: Net Change = Trophy Gain + Bet Profit.
        *   **Loss**: Net Change = Trophy Loss - Bet Stake.
    *   **Streak Protection**: A feature that can prevent trophy loss under specific conditions (e.g., losing a match but having "protection" active).

---

## 5. Technical Note: Session Players
The system supports "Session Players" (unregistered/guest users) via the `Spark Engine`. These players can participate in teams and matches but have limited persistence compared to full accounts. They are treated as first-class citizens in the matchmaking logic to ensure low wait times.
