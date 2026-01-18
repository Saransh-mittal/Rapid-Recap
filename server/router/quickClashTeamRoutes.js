// routes/quickClashTeamRoutes.js
const express = require('express')
const { Authenticate } = require('../middleware/authenticate')
// NOTE: flexAuth routes (join/leave matchmaking) are now in parent quickClashRoutes.js
const {
  createNewTeam,
  getTeam,
  getTeamByCodeController,
  joinTeam,
  inviteUserToTeam,
  respondToTeamInvitation,
  // NOTE: leaveTeamController is now handled in parent quickClashRoutes.js with flexAuth
  updateTeamMemberStatus,
  getMyTeams,
  removeMemberFromTeam,
  transferLeadershipController,
  joinTeamMatchmakingController,
  leaveTeamMatchmakingController,
  getTeamMatchmakingStatusController,
  selectCategoryForBattle,
  getMyTeamBattles,
  getTeamBattle,
  getTeamMatchmakingInfo,
  getTeamMatchmakingStatusDetailed,
  deselectCategoryForBattle,
  beginChallengeForBattle,
  acceptTeamInvitationController,
  rejectTeamInvitationController,
  getPendingInvitationsController,
  getTeamBattleProbability,
  getTeamBattleProbabilityHistory,
} = require('../controllers/quickClashTeamController')

const router = express.Router()

// Team management routes
router.post('/team', createNewTeam)
router.get('/team/:teamId', getTeam)
router.get('/team/code/:teamCode', getTeamByCodeController)
router.post('/team/join', joinTeam)
router.post('/team/:teamId/invite', inviteUserToTeam)
router.post('/team/:teamId/respond', respondToTeamInvitation)
// NOTE: /team/:teamId/leave is now handled in parent quickClashRoutes.js with flexAuth (session-compatible)
router.post('/team/:teamId/status', updateTeamMemberStatus)
router.get('/teams', getMyTeams)
router.post('/team/:teamId/remove', removeMemberFromTeam)
router.post('/team/:teamId/transfer-leadership', transferLeadershipController)

// Team matchmaking routes
// NOTE: join/leave routes are handled in parent quickClashRoutes.js with flexAuth (before Authenticate)
// This allows both authenticated users AND session players to use those routes
router.get(
  '/team/:teamId/matchmaking/status',
  getTeamMatchmakingStatusController,
)
router.get('/team/:teamId/matchmaking-info', getTeamMatchmakingInfo)

// Team battle routes
router.post('/team-battle/:battleId/select-category', selectCategoryForBattle)
router.post(
  '/team-battle/:battleId/deselect-category',
  deselectCategoryForBattle,
)
// Win probability for team battles
router.get('/team-battle/:battleId/win-probability', getTeamBattleProbability)
router.get(
  '/team-battle/:battleId/win-probability/history',
  getTeamBattleProbabilityHistory,
)
router.post('/team-battle/:battleId/begin-challenge', beginChallengeForBattle)
router.get('/team-battles', getMyTeamBattles)
router.get('/team-battle/:battleId', getTeamBattle)
router.get(
  '/team/:teamId/matchmaking-status-detailed',
  getTeamMatchmakingStatusDetailed,
)

router.post(
  '/team/invitation/:invitationId/accept',
  acceptTeamInvitationController,
)
router.post(
  '/team/invitation/:invitationId/reject',
  rejectTeamInvitationController,
)
router.get('/team/invitations/pending', getPendingInvitationsController)

const {
  donatePowerupController,
  equipPowerupController,
  unequipPowerupController,
  getPowerupDefinitions,
  getUserInventory,
  claimRewardController,
  getUnclaimedBattlesController,
  markBattleViewedController,
} = require('../controllers/quickClashPowerupController')

// Powerup Routes
router.post('/team-battle/:battleId/powerup/donate', donatePowerupController)
router.post('/team-battle/:battleId/powerup/equip', equipPowerupController)
router.post('/team-battle/:battleId/powerup/unequip', unequipPowerupController)
router.get('/powerups/definitions', getPowerupDefinitions)
router.get('/powerups/inventory', getUserInventory)

// Powerup Reward Routes
router.post('/powerup/claim-reward', claimRewardController)
router.get('/powerup/unclaimed-battles', getUnclaimedBattlesController)
router.post('/powerup/mark-viewed', markBattleViewedController)

module.exports = router
