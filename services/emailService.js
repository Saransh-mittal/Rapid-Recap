const {
  scheduleEmail,
  cancelScheduledEmails,
  scheduleDayEndEmail,
} = require('../scheduler/mail')
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
  } else if (quizzesToday % 7 === 5) {
    cancelScheduledEmails(user._id.toString())
    scheduleEmail({
      userId: user._id.toString(),
      userEmail: user.email,
      delayMinutes: 30,
      mailHtml: MailTemplates.onQuinBoost.html1({
        name: user.name.split(' ')[0],
        noOfQuiz: quizzesToday,
        QuinQuizNumber: quizzesToday + 1,
        articlesForMail,
      }),
      subject: MailTemplates.onQuinBoost.subject,
    })
    scheduleEmail({
      userId: user._id.toString(),
      userEmail: user.email,
      delayMinutes: 120,
      mailHtml: MailTemplates.onQuinBoost.html1({
        name: user.name.split(' ')[0],
        noOfQuiz: quizzesToday,
        QuinQuizNumber: quizzesToday + 1,
        articlesForMail,
      }),
      subject: `Reminder: ${MailTemplates.onQuinBoost.subject}`,
    })
    scheduleDayEndEmail({
      userId: user._id.toString(),
      userEmail: user.email,
      beforeMin: 60,
      mailHtml: MailTemplates.onQuinBoost.html2({
        name: user.name.split(' ')[0],
        QuinQuizNumber: quizzesToday + 1,
        articlesForMail,
      }),
      subject: 'Hurry Up 1 hour Left! Your Quin Boost is Active! 🌟',
    })
  } else if (quizzesToday % 7 === 6) {
    cancelScheduledEmails(user._id.toString())
    scheduleEmail({
      userId: user._id.toString(),
      userEmail: user.email,
      delayMinutes: 30,
      mailHtml: MailTemplates.postQuinBoost.html({
        name: user.name.split(' ')[0],
        noOfQuiz: quizzesToday,
        articlesForMail,
      }),
      subject: MailTemplates.postQuinBoost.subject,
    })
  }
}

module.exports = { scheduleQuizEmails }
