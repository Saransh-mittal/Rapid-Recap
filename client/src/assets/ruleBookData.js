// src/data/ruleBookData.js

export const ruleBookPages = [
  {
    id: 'quiz-system',
    title: 'Quiz System',
    content: {
      'How Quizzes Work': [
        {
          text: 'Reading Time: 2-4 minutes per article',
          explanation:
            'Our reading time is carefully calibrated for optimal information absorption. 2-4 minutes provides enough time to grasp key concepts while maintaining engagement. This duration has been proven to maximize retention and quiz performance.',
          hasDetails: true,
        },
        {
          text: 'Quiz Time: 50 seconds for optimal performance',
          explanation:
            'The 50-second time limit is based on cognitive science research. This duration creates the perfect balance between pressure and performance, keeping you engaged while allowing sufficient time for thoughtful answers. This timing has been shown to improve both accuracy and learning retention.',
          hasDetails: true,
        },
        {
          text: 'Questions: 5 questions per quiz',
          explanation:
            'Each quiz contains 5 carefully crafted questions that test your understanding of key concepts. This number is optimized for quick engagement while providing comprehensive coverage of the article content.',
          hasDetails: false,
        },
      ],
      'Theme Options': [
        {
          text: 'Space Theme',
          explanation:
            'Transform your quiz experience into an interstellar journey. Questions are rewritten with cosmic analogies and space-themed contexts while maintaining the original information.',
          hasDetails: true,
        },
        {
          text: 'Indian Mythology',
          explanation:
            'Experience questions through the lens of Indian mythology. Complex concepts are explained using analogies from ancient Indian epics and legends.',
          hasDetails: true,
        },
        {
          text: 'Greek Mythology',
          explanation:
            'Questions are reimagined through classical Greek mythology, where modern concepts meet ancient wisdom and legendary tales.',
          hasDetails: true,
        },
        {
          text: 'Sci-Fi',
          explanation:
            'Enter a futuristic realm where questions are presented in a science fiction context, making learning feel like an adventure.',
          hasDetails: true,
        },
      ],
    },
  },
  {
    id: 'rqm-score',
    title: 'RQM Score',
    content: {
      Accuracy: [
        {
          text: 'Correct answers',
          explanation:
            'Each correct answer contributes to your base RQM score. The system uses advanced algorithms to weight questions based on difficulty, ensuring fair scoring across different quiz types.',
          hasDetails: true,
        },
        {
          text: 'Perfect score bonus (20%)',
          explanation:
            'Achieve a perfect score to earn a 20% boost to your RQM. This significant bonus rewards mastery and encourages thorough understanding of the material. This multiplier is applied after all other calculations.',
          hasDetails: true,
        },
        {
          text: 'Near-perfect bonus (10%)',
          explanation:
            'Missing just one question still earns you a 10% bonus, encouraging consistency and rewarding strong performance. This helps maintain motivation even when perfection is just out of reach.',
          hasDetails: true,
        },
      ],
      Speed: [
        {
          text: 'Base time: 15 seconds per question',
          explanation:
            'The 15-second baseline for each question is carefully calculated to allow for reading, processing, and answering. This timing is based on extensive user testing and cognitive research.',
          hasDetails: true,
        },
        {
          text: 'Speed bonus up to 2x',
          explanation:
            'Quick answers can earn up to double points! The speed multiplier scales smoothly from 1x to 2x based on your response time. The sweet spot is balancing speed with accuracy - rushing and making mistakes will cost more points than answering correctly but slower.',
          hasDetails: true,
        },
      ],
    },
  },
  {
    id: 'iq-system',
    title: 'IQ System',
    content: {
      'Score Range': [
        {
          text: 'Average: 100',
          explanation:
            'The system is centered around 100 as the average score, following standard IQ distribution patterns. This provides a familiar and well-understood baseline for measuring performance.',
          hasDetails: false,
        },
        {
          text: 'Standard Deviation: 15',
          explanation:
            'A standard deviation of 15 points means that about 68% of users fall within 85-115, 95% within 70-130, and 99.7% within 55-145. This creates a balanced and fair distribution of scores.',
          hasDetails: true,
        },
      ],
      'Society Ranks': [
        {
          text: 'Titans Society: 150+',
          explanation:
            'The legendary Titans Society represents the pinnacle of achievement. Members consistently demonstrate exceptional understanding and quick thinking. Exclusive features and recognition await those who reach this prestigious level.',
          hasDetails: true,
        },
        {
          text: 'Mavericks Society: 130-150',
          explanation:
            'Mavericks are elite performers who regularly showcase outstanding comprehension and rapid information processing. This society offers special privileges and unique challenges.',
          hasDetails: true,
        },
        {
          text: 'Elites Society: 110-130',
          explanation:
            'The Elites demonstrate above-average performance and consistent growth. Members gain access to advanced features and special community events.',
          hasDetails: true,
        },
        {
          text: 'Strivers Society: 90-110',
          explanation:
            'Strivers represent the core of our community, showing steady progress and reliable performance. Special tools and support help members continue their growth.',
          hasDetails: true,
        },
        {
          text: 'Explorers Society: Below 90',
          explanation:
            'Everyone begins as an Explorer, equipped with tools and guidance to learn and improve. This society focuses on growth and development.',
          hasDetails: true,
        },
      ],
    },
  },
  {
    id: 'boosters',
    title: 'Boosters & Multipliers',
    content: {
      'Quin Boost': [
        {
          text: 'Trigger: Complete 5 consecutive quizzes',
          explanation:
            'The Quin Boost activates after completing 5 quizzes in sequence, rewarding sustained engagement. Each quiz must be completed within the same day to maintain the sequence.',
          hasDetails: true,
        },
        {
          text: 'Reward: 1.5x RQM multiplier on 6th quiz',
          explanation:
            'Your 6th quiz receives a powerful 1.5x multiplier to your RQM score. This boost can be combined with other multipliers for maximum impact. Strategic timing of this boost can significantly accelerate your progress.',
          hasDetails: true,
        },
      ],
      'Streak Surge': [
        {
          text: 'Trigger: Maintain 7-day streak',
          explanation:
            'A week of consistent daily activity unlocks the Streak Surge. Each day of the streak must include at least one completed quiz. Missing a day resets the counter.',
          hasDetails: true,
        },
        {
          text: 'Reward: 1.5x RQM for the entire day',
          explanation:
            'Enjoy a 1.5x multiplier on all quizzes for a full day! This powerful boost applies to every quiz you take, making it perfect for maximizing gains.',
          hasDetails: true,
        },
        {
          text: 'Stacks with other boosts',
          explanation:
            'Combine with other multipliers for maximum effect. Strategic use of multiple boosts can result in extraordinary score improvements.',
          hasDetails: true,
        },
      ],
      'Maximum Power': [
        {
          text: 'Combined maximum multiplier: 2x',
          explanation:
            'The system caps total multipliers at 2x to maintain balance. This can be achieved by combining Quin Boost, Streak Surge, and Category boosts strategically.',
          hasDetails: true,
        },
        {
          text: 'Requires active Quin Boost + Streak Surge + Category boost',
          explanation:
            'Achieving maximum multiplication requires careful timing and activation of multiple boost types. Plan your quiz schedule to align these powerful multipliers.',
          hasDetails: true,
        },
        {
          text: 'Applied per quiz attempt',
          explanation:
            'Each quiz calculates its multiplier independently, allowing for strategic boost usage across multiple attempts.',
          hasDetails: false,
        },
      ],
    },
  },
  {
    id: 'tournament',
    title: 'Tournament System',
    content: {
      Schedule: [
        {
          text: 'Registration: Monday-Friday',
          explanation:
            'Five-day registration period allows players to prepare and strategize. Sign up early to access pre-tournament practice sessions and special preparation resources.',
          hasDetails: true,
        },
        {
          text: 'Competition: Saturday-Sunday',
          explanation:
            'Intense weekend competition tests your knowledge and speed. The two-day format allows for strategic timing of attempts and recovery periods.',
          hasDetails: true,
        },
      ],
      'February Championship': [
        {
          text: 'Duration: Full month of February',
          explanation:
            'A month-long championship that tests consistency and endurance. Strategic planning and regular participation are key to success.',
          hasDetails: true,
        },
        {
          text: 'Top 5 players receive monetary rewards',
          explanation:
            'Substantial rewards await the highest performers. The prize pool is distributed among the top 5 players based on their final rankings.',
          hasDetails: true,
        },
        {
          text: 'Based on global leaderboard position',
          explanation:
            'Your rank is determined by your position on the worldwide leaderboard. Real-time updates let you track your standing throughout the competition.',
          hasDetails: false,
        },
        {
          text: 'All active players eligible',
          explanation:
            'No minimum requirements - just stay active and participate! Every player has a chance to compete and win.',
          hasDetails: false,
        },
      ],
    },
  },
]
