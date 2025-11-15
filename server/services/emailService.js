const {
  scheduleEmail,
  cancelScheduledEmails,
  scheduleDayEndEmail,
} = require('../scheduler/legacy/mail')
const MailTemplates = require('../data/MailTemplates')
const { getTopThreeRecommendedArticles } = require('../utils/article.utils')

const scheduleQuizEmails = async (user, quizzesToday) => {
  const articlesForMail = await getTopThreeRecommendedArticles(
    user._id.toString(),
  )

  if (quizzesToday % 7 === 4) {
    cancelScheduledEmails(user._id.toString())
    scheduleEmail({
      userId: user._id.toString(),
      userEmail: user.email,
      delayMinutes: 30,
      mailHtml: MailTemplates.preQuinBoost.html({
        name: user.name.split(' ')[0],
        noOfQuiz: quizzesToday,
        QuinQuizNumber: quizzesToday + 2,
        articlesForMail,
      }),
      subject: MailTemplates.preQuinBoost.subject,
    })
    scheduleEmail({
      userId: user._id.toString(),
      userEmail: user.email,
      delayMinutes: 120,
      mailHtml: MailTemplates.preQuinBoost.html({
        name: user.name.split(' ')[0],
        noOfQuiz: quizzesToday,
        QuinQuizNumber: quizzesToday + 2,
        articlesForMail,
      }),
      subject: `Reminder: ${MailTemplates.preQuinBoost.subject}`,
    })
  }
}

module.exports = { scheduleQuizEmails }
