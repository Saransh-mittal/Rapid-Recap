const i18n = require('i18next') // Import i18n for translations

// Function to get the localized CircleAndSocietyData
async function getCircleAndSocietyData(user) {
  const localizedI18n = i18n.cloneInstance({ initImmediate: false })

  // Switch to user's language
  await localizedI18n.changeLanguage(
    user?.userLanguage ? user.userLanguage : 'en',
  )

  // Translation function for specific namespace

  const t = (key, options) =>
    localizedI18n.t(key, { ns: 'CircleAndSocietyData', ...options })

  // Define CircleAndSocietyData array
  const CircleAndSocietyData = [
    {
      society: 'Titans Society',
      circle: null,
      IQ_Lower: 150,
      IQ_Upper: null,
      boxShadow: '0 0 10px 5px rgba(255, 215, 0, 0.8)',
      textColor: 'goldenrod',
      xp: 900,
      upgradeMsg: t('titansUpgrade'),
    },
    {
      society: 'Mavericks Society',
      circle: 'Visionaries Circle',
      IQ_Lower: 140,
      IQ_Upper: 150,
      boxShadow: '0 0 10px 5px rgba(255, 100, 0, 0.7)',
      textColor: 'darkorange',
      xp: 320,
      upgradeMsg: t('visionariesUpgrade'),
    },
    {
      society: 'Mavericks Society',
      circle: 'Pioneers Circle',
      IQ_Lower: 130,
      IQ_Upper: 140,
      boxShadow: '0 0 10px 5px rgba(255, 150, 0, 0.5)',
      textColor: 'darkorange',
      xp: 240,
      upgradeMsg: t('pioneersUpgrade'),
    },
    {
      society: 'Elites Society',
      circle: 'Scholars Circle',
      IQ_Lower: 120,
      IQ_Upper: 130,
      boxShadow: '0 0 10px 5px rgba(0, 255, 100, 0.5)',
      textColor: 'lightgreen',
      xp: 180,
      upgradeMsg: t('scholarsUpgrade'),
    },
    {
      society: 'Elites Society',
      circle: 'Masters Circle',
      IQ_Lower: 110,
      IQ_Upper: 120,
      boxShadow: '0 0 10px 5px rgba(0, 255, 100, 0.5)',
      textColor: 'lightgreen',
      xp: 120,
      upgradeMsg: t('mastersUpgrade'),
    },
    {
      society: 'Strivers Society',
      circle: 'Enthusiasts Circle',
      IQ_Lower: 104,
      IQ_Upper: 110,
      boxShadow: null,
      textColor: 'cornflowerblue',
      xp: 60,
      upgradeMsg: t('enthusiastsUpgrade'),
    },
    {
      society: 'Strivers Society',
      circle: 'Achievers Circle',
      IQ_Lower: 97,
      IQ_Upper: 104,
      boxShadow: null,
      textColor: 'cornflowerblue',
      xp: 40,
      upgradeMsg: t('achieversUpgrade'),
    },
    {
      society: 'Strivers Society',
      circle: 'Progressors Circle',
      IQ_Lower: 90,
      IQ_Upper: 97,
      boxShadow: null,
      textColor: 'cornflowerblue',
      xp: 20,
      upgradeMsg: t('progressorsUpgrade'),
    },
    {
      society: 'Explorers Society',
      circle: null,
      IQ_Lower: 0,
      IQ_Upper: 90,
      boxShadow: null,
      textColor: 'white',
      xp: 0,
      upgradeMsg: t('explorersUpgrade'),
    },
  ]

  return CircleAndSocietyData
}

module.exports = getCircleAndSocietyData
