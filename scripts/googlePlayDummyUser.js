const User = require('../model/userSchema')

const googlePlayDummyUser = async () => {
  try {
    const user = await User.create({
      email: 'googlePlayDummy@mail.com',
      password: '12345678@googlePlayDummy',
      inGameName: 'googlePlayDummy',
      name: 'googlePlayDummy',
      verified: true,
    })
    console.log('googlePlayDummyUser created:', user)
  } catch (error) {
    console.error(error)
  }
}

googlePlayDummyUser()
