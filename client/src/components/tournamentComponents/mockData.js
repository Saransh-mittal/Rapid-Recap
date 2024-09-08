// mockData.js
export const mockTournamentData = {
  registration: {
    status: 'registration',
    startDate: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // 1 day from now
    endDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(), // 3 days from now
    participants: [],
    registeredCount: 42,
  },
  upcoming: {
    status: 'upcoming',
    startDate: new Date(Date.now() + 1 * 60 * 60 * 1000).toISOString(), // 1 hour from now
    endDate: new Date(Date.now() + 49 * 60 * 60 * 1000).toISOString(), // 49 hours from now
    participants: [],
    registeredCount: 42,
  },
  ongoing: {
    status: 'ongoing',
    startDate: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(), // 1 hour ago
    endDate: new Date(Date.now() + 47 * 60 * 60 * 1000).toISOString(), // 47 hours from now
    participants: [],
  },
  completed: {
    status: 'completed',
    startDate: new Date(Date.now() - 49 * 60 * 60 * 1000).toISOString(), // 49 hours ago
    endDate: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(), // 1 hour ago
    participants: [
      { name: 'Alice', score: 1000 },
      { name: 'Bob', score: 950 },
      { name: 'Charlie', score: 900 },
      { name: 'David', score: 850 },
      { name: 'Eve', score: 800 },
    ],
  },
}

export const mockPreviousTournamentData = {
  status: 'completed',
  startDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days ago
  endDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(), // 5 days ago
  participants: [
    { name: 'Frank', score: 1200, rank: 1 },
    { name: 'Grace', score: 1150, rank: 2 },
    { name: 'Henry', score: 1100, rank: 3 },
    { name: 'Ivy', score: 1050, rank: 4 },
    { name: 'Jack', score: 1000, rank: 5 },
  ],
}
