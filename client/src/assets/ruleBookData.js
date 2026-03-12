// src/assets/ruleBookData.js
// Quick Clash V2 Manual Content — sourced from quick_clash_v2_deep_dive.md

export const getRuleBookPages = () => [
  {
    id: 'quick-clash-v2-overview',
    title: 'Quick Clash V2 Overview',
    content: {
      'The Core Experience': [
        {
          text: 'What is Quick Clash?',
          explanation: 'Quick Clash V2 is a fast-paced, 4v4 team-based competitive learning game. Matches take approximately 30 seconds to find. It tests knowledge and reading speed in a high-stakes, sports-like format.',
          hasDetails: true,
          relatedTopics: ['matchmaking-teams', 'profile-progression'],
        },
        {
          text: 'How do the Two-Phase Battles work?',
          explanation: 'Every match consists of the Forge Phase (reading & preparation) followed immediately by the Quiz Phase (the competitive battle). Together they form the core gameplay loop.',
          hasDetails: true,
          relatedTopics: ['forge-phase', 'quiz-phase'],
        },
      ],
      'Winning the Game': [
        {
          text: 'How does RQM scoring work in Quick Clash?',
          explanation: 'Scores are determined by the Rapid Quiz Mastery (RQM) metric — a balance of accuracy, speed bonus, and a precision bonus. Higher accuracy and faster completion yield maximum RQM.',
          hasDetails: true,
          relatedTopics: ['quiz-phase'],
        },
        {
          text: 'What are Trophies and Rankings?',
          explanation: 'Winning matches awards trophies which act as an ELO-like ranking system. Losses cost trophies. Your trophy count determines your matchmaking bracket and your global leaderboard position.',
          hasDetails: true,
          relatedTopics: ['profile-progression'],
        },
      ],
    },
  },
  {
    id: 'forge-phase',
    title: 'The Forge Phase',
    content: {
      'Structure & Mechanics': [
        {
          text: 'What is the Progressive Unlock System?',
          explanation: 'The Forge Phase is the study portion, divided into 5 locked sections. Players must successfully answer a preliminary question to unlock each section\'s reading material, proving their baseline knowledge first.',
          hasDetails: true,
        },
        {
          text: 'How long is the Question Timer?',
          explanation: 'You have exactly 15 seconds to answer each unlocking question. Answering correctly grants access to that specific section\'s reading content.',
          hasDetails: true,
        },
        {
          text: 'How long is the Reading Timer?',
          explanation: 'Once a section is unlocked, you have a strict 20-second window to read and absorb the content before auto-advancing to the next question. This tight window prevents skimming and forces hyper-focus.',
          hasDetails: true,
        },
      ],
      'Scoring in Forge': [
        {
          text: 'How are Base Scores and Speed Bonuses calculated?',
          explanation: 'Points are awarded for correct answers, with extra bonus points granted for answering quickly. The faster you unlock a section, the higher your Forge score will be.',
          hasDetails: true,
        },
        {
          text: 'What is the Streak Bonus?',
          explanation: 'Consecutive correct answers in the Forge Phase trigger a streak multiplier. Keeping your accuracy high maximizes your Forge Phase score heading into the final Quiz Phase.',
          hasDetails: true,
          relatedTopics: ['powerups'],
        },
      ],
    },
  },
  {
    id: 'quiz-phase',
    title: 'The Quiz Phase',
    content: {
      'Battle Mechanics': [
        {
          text: 'How many questions are in the Quiz Phase?',
          explanation: 'The Quiz Phase presents 10 final questions directly related to the content you just studied in the Forge Phase. A global 50-second timer governs the entire quiz.',
          hasDetails: true,
        },
        {
          text: 'How do you extend the Quiz timer?',
          explanation: 'The global 50-second timer can be interacted with via Time Warp powerups. Equipping these gives your team extra crucial seconds to answer remaining questions.',
          hasDetails: true,
          relatedTopics: ['powerups'],
        },
      ],
      'RQM Scoring Details': [
        {
          text: 'Why is Accuracy the primary scoring metric?',
          explanation: 'Correct answers form the base of your RQM score. Accuracy is crucial because a wrong answer contributes absolutely zero points for that question, heavily penalizing guesswork.',
          hasDetails: true,
        },
        {
          text: 'How does the Speed Bonus work in the Quiz?',
          explanation: 'Faster quiz completion earns a higher speed bonus multiplier. While you shouldn\'t rush accuracy for speed, submitting quickly once confident yields the highest possible score.',
          hasDetails: true,
        },
        {
          text: 'What is the Precision Bonus?',
          explanation: 'Achieving a perfect 100% accuracy on all 10 quiz questions grants a massive special Precision Bonus (+50 RQM). This provides a significant competitive edge over opponents who make mistakes.',
          hasDetails: true,
          relatedTopics: ['powerups'],
        },
      ],
    },
  },
  {
    id: 'powerups',
    title: 'Powerups & Strategy',
    content: {
      'The Powerup Economy': [
        {
          text: 'How does the Team Pool and Loadout system work?',
          explanation: 'Players donate single-use powerups from their personal inventory to a shared Team Pool (max 80 housing limit). Before the battle, each player strategically equips powerups from that pool into their personal Loadout (max 30 housing).',
          hasDetails: true,
        },
        {
          text: 'What are Housing Costs?',
          explanation: 'Each powerup has a dedicated housing cost ranging from 5 to 12. Because your personal loadout has a strict 30 housing capacity limit, you must choose powerups strategically.',
          hasDetails: true,
        },
      ],
      'Powerup Types': [
        {
          text: 'What does the Time Warp powerup do?',
          explanation: 'Time Warp costs 12 housing. When activated in the Forge Phase, it adds +15 seconds to the current unlock timer. In the Quiz Phase, it acts passively to add an extra +15 seconds to the total team quiz timer.',
          hasDetails: true,
        },
        {
          text: 'What does the Score Surge powerup do?',
          explanation: 'Score Surge costs 10 housing. In the Forge Phase, it instantly doubles points for the current question. In the Quiz Phase, it passively applies a 1.1x multiplier to your final RQM score.',
          hasDetails: true,
        },
        {
          text: 'What does the Oracle\'s Eye powerup do?',
          explanation: 'Oracle\'s Eye costs 8 housing. When used during either phase, it automatically removes 2 incorrect options from the current question, guaranteeing a 50/50 choice.',
          hasDetails: true,
        },
        {
          text: 'What does the Streak Shield do?',
          explanation: 'Streak Shield costs 5 housing and is passive in the Forge Phase only. It acts as an insurance policy, preventing your streak counter from resetting when you answer a question incorrectly.',
          hasDetails: true,
          relatedTopics: ['forge-phase'],
        },
        {
          text: 'What is the Precision Protocol?',
          explanation: 'Precision Protocol costs 12 housing and is passive in the Quiz Phase only. It is high risk, high reward: it grants a massive +50 RQM score bonus, but only if you achieve 100% full quiz accuracy.',
          hasDetails: true,
          relatedTopics: ['quiz-phase'],
        },
      ],
    },
  },
  {
    id: 'matchmaking-teams',
    title: 'Teams & Matchmaking',
    content: {
      'Matchmaking': [
        {
          text: 'What is the 4v4 format?',
          explanation: 'Quick Clash V2 is exclusively built as a 4v4 team battle experience (the legacy 1v1 mode is deprecated). Finding an opposing team takes approximately 30 seconds on average.',
          hasDetails: true,
        },
        {
          text: 'How does Trophy-Based Matchmaking work?',
          explanation: 'The backend algorithm finds opposing teams offering a very similar average trophy count. It starts searching within a narrow ±200 trophy range and slowly widens until a perfectly balanced match is found.',
          hasDetails: true,
          relatedTopics: ['profile-progression'],
        },
        {
          text: 'What is the Spark Engine Auto-Formation?',
          explanation: 'The Spark Engine ensures nobody waits in queues. Solo players and partial teams (1 to 3 players) are instantly integrated into temporary "Auto-Formed" teams, ensuring 4v4 matches happen immediately.',
          hasDetails: true,
        },
      ],
      'Team Structure': [
        {
          text: 'What are the Leader and Member roles?',
          explanation: 'The Party Leader creates the team, actively controls the "Ready" status, and initiates the matchmaking search. Standard members simply join via code and must mark themselves as ready before the battle hunt begins.',
          hasDetails: true,
        },
        {
          text: 'How are Team Average Trophies calculated?',
          explanation: 'The system takes the combined average of all 4 members\' trophies to determine the team\'s bracket level. A heavily unbalanced team composition might face completely unpredictable opposition.',
          hasDetails: true,
        },
      ],
    },
  },
  {
    id: 'profile-progression',
    title: 'Profile & Progression',
    content: {
      'Key Stats': [
        {
          text: 'What are Quick Clash Trophies?',
          explanation: 'Trophies are the primary ELO-like skill rating metric on the Rapid Recap platform. You win matches to actively gain trophies, and lose matches to heavily drop in rank. It dictates your global leaderboard standing.',
          hasDetails: true,
        },
        {
          text: 'What does Battle History track?',
          explanation: 'Your user profile tracks a deep history of recent matches including win/loss results, opposing teams faced, exact point fluctuations, overall win rate percentages, and your best consecutive win streaks.',
          hasDetails: true,
        },
      ],
      'Rewards & Betting': [
        {
          text: 'How are Trophy Gains and Losses calculated?',
          explanation: 'If you win, your trophy gain is mathematically scaled based on the difficulty of the opponent. Facing higher-ranked opponents rewards drastically more trophies for a win, while losses against weaker foes penalize heavily.',
          hasDetails: true,
        },
        {
          text: 'How does Trophy Betting work?',
          explanation: 'Players can voluntarily wager their own trophies directly on their match outcome. If you win, your net change equals the base trophy gain plus the bet profit. If you lose, you lose the base drop minus your bet stake.',
          hasDetails: true,
        },
        {
          text: 'What is Streak Protection?',
          explanation: 'Streak Protection is a consumable resource feature that acts as a secure safety net. If active, it entirely prevents any negative trophy loss under specific conditions (e.g., losing a match).',
          hasDetails: true,
        },
      ],
    },
  },
  {
    id: 'solo-custom-drills',
    title: 'Solo & Custom Drills',
    content: {
      'Single-Player Practice': [
        {
          text: 'What is the Standard Solo Drill?',
          explanation: 'The Standard Solo Drill lets you play through entire Forge and Quiz phases strictly solo using developer-curated categories. It acts as a low-pressure environment with dedicated session limits to practice offline before engaging in competitive team matches.',
          hasDetails: true,
        },
        {
          text: 'What are Custom Drills (Bring Your Own Content)?',
          explanation: 'Custom Drills allow users to directly upload up to 2,500 characters of their own personal study material (like a textbook excerpt). The AI then dynamically generates a fully structured, playable Forge article and Quiz session based strictly on your exact text.',
          hasDetails: true,
        },
      ],
      'AI-Powered Quality Assurance': [
        {
          text: 'What is the Forge AI Verifier?',
          explanation: 'The Forge AI Verifier is an automated backend quality gate ensuring all content is strictly fair. Before matches occur, it programmatically verifies category alignment and ensures that every single quiz question can be accurately answered using solely the information presented in the reading material.',
          hasDetails: true,
          relatedTopics: ['forge-phase'],
        },
      ],
    },
  },
]

export const ruleBookPages = () => {
  return getRuleBookPages()
}

export const getAllSections = () => {
  const pages = getRuleBookPages()
  return pages.reduce((acc, page) => {
    return [...acc, { title: page.title, id: page.id }]
  }, [])
}
