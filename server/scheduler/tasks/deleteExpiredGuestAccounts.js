const {
  deleteExpiredGuestAccounts,
} = require('../../controllers/guestController')

const deleteExpiredGuestAccountsTask = async () => {
  try {
    await deleteExpiredGuestAccounts()
  } catch (error) {
    console.log(error)
  }
}

module.exports = deleteExpiredGuestAccountsTask
