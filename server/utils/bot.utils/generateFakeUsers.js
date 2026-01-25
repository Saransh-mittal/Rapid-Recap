// generate 1000 fake users
const User = require('../../model/userSchema') // Import User model
const { progressBar } = require('../../utils/progress.utils') // Import progressBar utility function
const { fakerEN_IN, faker } = require('@faker-js/faker')

async function generateFakeUsers() {
  //const biosArray = bios;
  const updateProgress = progressBar(1000)
  const fakeUsers = []
  for (let i = 0; i < 1000; i++) {
    const firstName = fakerEN_IN.person.firstName()
    const lastName = fakerEN_IN.person.lastName()
    let uniqueInGameName = fakerEN_IN.internet
      .userName({
        firstName,
        lastName,
      })
      .slice(0, 16) // Generates a unique username (max 16 chars)
    // Ensure inGameName is unique
    let existingUser = await User.findOne({ inGameName: uniqueInGameName })
    while (existingUser) {
      uniqueInGameName = fakerEN_IN.internet
        .userName({ firstName, lastName })
        .slice(0, 16)
      existingUser = await User.findOne({ inGameName: uniqueInGameName })
    }
    const fakeUser = new User({
      name: `${firstName} ${lastName}`,
      email: `dummy${i}@mail.com`,
      phone: '9876543210',
      password: '12345678',
      verified: true,
      bio: fakerEN_IN.person.bio(),
      inGameName: uniqueInGameName,
    })
    await fakeUser.save()
    fakeUsers.push(fakeUser)
    updateProgress()
  }
  console.log('Fake users generated successfully')
  return
}
generateFakeUsers()
