const i18n = require('i18next')
const Backend = require('i18next-fs-backend')
const middleware = require('i18next-http-middleware')
const path = require('path')
const { scheduler } = require('timers/promises')

const namespaces = {
  controllers: [
    'chatController',
    'friendsController',
    'messageControllers',
    'notification',
  ],
  utils: ['activity.utils', 'dailyUserIQCalc.utils', 'mail.utils'],
  data: ['CircleAndSocietyData'],
  scheduler: ['tournamentManagement'],
}

i18n
  .use(Backend)
  .use(middleware.LanguageDetector)
  .init({
    backend: {
      loadPath: (lngs, ns) => {
        const lng = Array.isArray(lngs) ? lngs[0] : lngs
        const namespace = Array.isArray(ns) ? ns[0] : ns
        const category = Object.keys(namespaces).find(key =>
          namespaces[key].includes(namespace),
        )

        switch (category) {
          case 'controllers':
            return path.join(
              __dirname,
              `./locales/${lng}/controllers/${namespace}.json`,
            )
          case 'utils':
            return path.join(
              __dirname,
              `./locales/${lng}/utils/${namespace}.json`,
            )
          case 'data':
            return path.join(
              __dirname,
              `./locales/${lng}/data/${namespace}.json`,
            )
          case 'scheduler':
            return path.join(
              __dirname,
              `./locales/${lng}/scheduler/${namespace}.json`,
            )
          default:
            return path.join(__dirname, `./locales/${lng}/${namespace}.json`) // fallback
        }
      },
    },
    fallbackLng: 'en',
    supportedLngs: ['en', 'hi'],
    ns: Object.values(namespaces).flat(),
    defaultNS: 'activity.utils',
    interpolation: {
      escapeValue: false, // React already does escaping
    },
    detection: {
      order: ['querystring', 'cookie', 'header'],
      lookupQuerystring: 'lng',
      lookupCookie: 'i18next',
      caches: ['cookie'],
    },
  })

module.exports = i18n
