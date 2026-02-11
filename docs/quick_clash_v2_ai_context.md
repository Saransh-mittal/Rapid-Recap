# AI Context: The Theory of Quick Clash V2

**Purpose:** This document provides a deep, theoretical understanding of **Quick Clash V2** within the **Rapid Recap** platform. It is designed to give an AI a comprehensive mental model of the product's mechanics, design philosophy, and user experience flow, stripping away marketing language in favor of functional clarity.

---

## 1. Product Philosophy: The "Cyber-Athlete of Knowledge"
Quick Clash V2 is built on the premise that learning can be structured as a competitive sport. It shifts the user paradigm from "Passive Student" to "Active Competitor."
*   **Core Loop:** High-pressure information intake (Forge) $\to$ Strategic application (Powerups) $\to$ Performance testing (Quiz) $\to$ Reward/Rank (Economy).
*   **Design Pillar:** "High-Fidelity Learning." every interaction—from the UI sounds to the haptic feedback—is designed to induce a "flow state" similar to high-paced video games (MOBA/FPS), applied to reading comprehension.

## 2. Theoretical Framework: Self-Determination Theory (SDT)
The game mechanics are architected to satisfy three psychological needs that traditional studying often ignores:
1.  **Competence (The Forge Phase):**
    *   *Problem:* Traditional quizzes test what you *already* know, leading to frustration if you don't know it.
    *   *Solution:* The Forge Phase provides "Just-in-Time" learning. Users demonstrate competence by mastering *new* material in real-time, creating an immediate feedback loop of "I read this $\to$ I understood this."
2.  **Relatedness (4v4 Team Structure):**
    *   *Problem:* Studying is isolating.
    *   *Solution:* Grouping users into 4-person squads creates social pressure and shared accountability. The team's collective score determines victory, binding the user's success to their peers.
3.  **Autonomy (Powerup System):**
    *   *Problem:* Standard tests are rigid and rules-based.
    *   *Solution:* Powerups give users agency over the game's constraints. They can manipulate time, remove obstacles (wrong answers), or amplify rewards, allowing for varied playstyles (e.g., "The Strategist" vs. "The Speedster").

## 3. Core Systems & Mechanics

### A. The "Spark Engine" (Matchmaking Infrastructure)
*   **Function:** Delivers a "Zero-Friction" entry experience.
*   **Mechanism:**
    *   A hybrid matchmaking system that prioritizes *start time* over *perfect symmetry*.
    *   It aggregates real users into teams of 4.
    *   It utilizes "Session Players" (high-fidelity, simulated entities) to fill empty slots instantly if live users aren't available within the 30-second window.
    *   *Result:* The user perceives a constantly alive, bustling ecosystem, maintaining the illusion of a massive concurrent player base even during off-peak hours.

### B. Phase 1: The Forge (Active Acquisition)
*   **Objective:** Information synthesis under time pressure.
*   **Mechanics:**
    *   **Gated Content:** The material is broken into 5 locked sections.
    *   **The Key:** To unlock a section, the user must answer a preliminary "entry check" question (15s timer).
    *   **The Sprint:** Once unlocked, the user has a strict window (20s) to read and absorb the content.
*   **Theory:** This prevents "skimming without absorbing." The tight timers force hyper-focus while giving enough breathing room for genuine comprehension.

### C. Phase 2: The Quiz (Application & Testing)
*   **Objective:** Recall and precision.
*   **Mechanics:**
    *   10 questions based on the Forge content.
    *   **Global Timer:** A shared 50-second pool for all questions.
    *   **RQM Scoring (Rapid Quiz Mastery):** A composite score algorithm.
        $$SCORE = (Accuracy \times Base) + SpeedBonus + StreakMultiplier$$
    *   This algorithm penalizes hesitation and rewards "instinctive" knowledge.

### D. The Economic Layer (Risk & Reward)
*   **Trophies:** The persistent skill rating (ELO equivalent).
*   **Betting System:**
    *   Users can wager trophies on their own matches.
    *   *Psychology:* This adds "Skin in the game." A match matters more when the user has voluntarily increased their risk.
*   **Streak Protection:** A consumable resource that nullifies trophy loss, encouraging users to play even when they fear "ladder anxiety."

### E. Powerup Ecosystem (Strategic Depth)
Powerups are not just "cheats"; they are resource management choices.
*   **Resource:** "Housing Space" (Capacity).
    *   **Team Pool:** 80 Housing (Shared inventory).
    *   **Loadout:** 30 Housing (Personal equip limit).
*   **Abilities:**
    *   *Oracle's Eye:* Information filtering (removes noise/wrong options).
    *   *Time Warp:* Temporal manipulation (extends resource gathering/answering windows).
    *   *Score Surge:* Reward amplification (high risk/high reward).
    *   *Precision Protocol:* Skill check (bonus for perfection).

### F. Solo Drill Mode (Single-Player Practice)
A dedicated single-player practice mode with its own progression system, independent of the competitive 4v4 ladder.
*   **Function:** Provides a low-pressure environment for users to sharpen skills before entering competitive matches.
*   **Mechanics:**
    *   Users play through Forge + Quiz phases solo, without opponents or team dependencies.
    *   The system tracks **session limits** (to prevent burnout/abuse), **detailed history** (past drill results), and provides **specific result screens** distinct from battle results.
*   **Theory:** This is the "Training Grounds" concept from competitive gaming. It removes the social anxiety of team play and lets users build muscle memory for the timed mechanics at their own pace.

### G. Tutorial & Onboarding System (Guided First Experience)
A robust state machine that tracks user progress through sequential tutorial stages.
*   **Function:** Ensures new users are introduced to every game mechanic in a logical, non-overwhelming order.
*   **Mechanics:**
    *   Tutorial stages include: `squad_intro` (team formation), `battle` (4v4 flow), `solo_drill` (practice mode), and others.
    *   The backend strictly **validates and sanitizes** tutorial steps, preventing users from repeating completed stages, skipping ahead, or getting stuck in loops.
*   **Theory:** Reduces "Day 1 Churn." The system acts as a guided on-ramp, progressively revealing complexity rather than dumping all mechanics at once.

### H. AI-Powered Content Quality Assurance (Forge AI Verifier)
An automated quality gate that audits articles and questions before they reach players.
*   **Function:** Ensures content fairness and coherence.
*   **Checks Performed:**
    *   **Category-Content Alignment:** Does the article actually match the category it's tagged under?
    *   **Visual Asset Validation:** Are any required images or diagrams missing from the content?
    *   **Answerability Verification:** Can every question be answered *solely* from the reading material provided in the Forge phase?
*   **Theory:** This directly addresses the #1 frustration in quiz games: "unfair questions." By programmatically verifying that content is self-contained and answerable, the system preserves the core contract of the Forge phase—if you read it, you can answer it.

## 4. Performance & Architecture Notes
*   **Fire-and-Forget Session Saving:** Heavy database transactions for session state have been replaced with an optimized "fire-and-forget" strategy, reducing server latency and making matches feel more responsive.
*   **Immersive Loading:** The initial app load features a refined splash screen to mask startup times and set the competitive tone.
*   **Reading Timer Calibration:** The Forge reading window was increased from 14s to 20s after user testing revealed the original window was too frantic for genuine comprehension, making the game feel unfair rather than challenging.

---

**Context Summary:**
Quick Clash V2 is a "Gamified Learning Environment" that uses the mechanics of competitive gaming (teams, ranks, economies, special abilities) to solve the engagement crisis in education. It is designed to be felt as a sport, where "Knowledge" is the ammunition and "Reading Speed" is the aim. It now includes a dedicated Solo Drill practice mode, a guided tutorial onboarding flow, AI-powered content quality assurance, and significant backend performance optimizations.
