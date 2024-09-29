const User = require('../../model/userSchema')

const userBadgeUpdate = async () => {
  try {
    console.log('Updating user badge...')
    // const user = await User.findOne({ inGameName: 'saransh_1234' })
    // user.displayedBadge = {
    //   tournamentNumber: 1,
    //   rank: 1,
    //   participantCnt: 20,
    //   badgeName: 'RANK_1',
    //   text: '',
    // }
    // // user.badges.push({
    // //   tournamentNumber: 1,
    // //   badgeName: 'RANK_1',
    // //   text: '',
    // //   participantCnt: 20,
    // //   rank: 1,
    // // })
    // user.badges.push({
    //   tournamentNumber: 1,
    //   badgeName: 'RANK_2',
    //   text: '',
    //   participantCnt: 20,
    //   rank: 2,
    // })
    // user.badges.push({
    //   tournamentNumber: 1,
    //   badgeName: 'RANK_3',
    //   text: '',
    //   participantCnt: 20,
    //   rank: 3,
    // })
    // user.badges.push({
    //   tournamentNumber: 1,
    //   badgeName: 'ACE',
    //   text: '',
    //   participantCnt: 20,
    //   rank: 26,
    // })
    // user.badges.push({
    //   tournamentNumber: 2,
    //   badgeName: 'RANK_1',
    //   text: '',
    //   participantCnt: 20,
    //   rank: 1,
    // })
    // await user.save()

    // empty user saransh_1234 badges
    const user = await User.findOne({ inGameName: 'saransh_1234' })
    user.badges = []
    user.displayedBadge = null
    user.tournamentPerformance = []
    await user.save()
    const u = await User.findOne({ inGameName: 'smash_deV' })
    u.badges = []
    u.displayedBadge = null
    u.tournamentPerformance = []
    await u.save()
    console.log('User badge updated successfully')
  } catch (error) {
    console.log(error)
  }
}

userBadgeUpdate()
