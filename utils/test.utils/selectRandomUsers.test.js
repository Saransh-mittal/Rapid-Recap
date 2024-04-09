// Function to select 60 random users

function selectRandomUsers(users, count = 10) {
  const shuffledUsers = users.sort(() => 0.5 - Math.random());
  return shuffledUsers.slice(0, count);
}

module.exports = selectRandomUsers;
