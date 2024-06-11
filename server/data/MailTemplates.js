const MailTemplates = {
  OTP: {
    from: "rapidrecap2k23@gmail.com",
    subject: "OTP for verification",
    text: `Your OTP for verification`,
    html: (
      code
    ) => `<div style="font-family: Helvetica,Arial,sans-serif;min-width:1000px;overflow:auto;line-height:2">
    <div style="margin:50px auto;width:70%;padding:20px 0">
      <div style="border-bottom:1px solid #eee">
        <a href="" style="font-size:1.4em;color: #00466a;text-decoration:none;font-weight:600">Rapid Recap</a>
      </div>
      <p style="font-size:1.1em">Hi,</p>
      <p>Thank you for choosing Rapid Recap. Use the following OTP to complete your Sign Up procedures. OTP is valid for 5 minutes</p>
      <h2 style="background: #00466a;margin: 0 auto;width: max-content;padding: 0 10px;color: #fff;border-radius: 4px;">${code}</h2>
      <p style="font-size:0.9em;">Regards,<br />Rapid Recap</p>
      <hr style="border:none;border-top:1px solid #eee" />
      <div style="float:right;padding:8px 0;color:#aaa;font-size:0.8em;line-height:1;font-weight:300">
        <p>Rapid Recap Inc</p>
        <p>Jaipur</p>
        <p>India</p>
      </div>
    </div>
  </div>`,
  },
  NotifySubscribe: {
    from: "rapidrecap2k23@gmail.com",
    subject: "📢 Stay Updated with Rapid Recap Notifications! 📰",
    html: ({
      name,
    }) => `<div style="font-family: Helvetica,Arial,sans-serif; min-width:1000px; overflow:auto; line-height:2">
  <div style="margin:50px auto; width:70%; padding:20px 0">
    <div style="border-bottom:1px solid #eee">
      <a href="" style="font-size:1.4em; color:#00466a; text-decoration:none; font-weight:600">Rapid Recap</a>
    </div>
    <p style="font-size:1.1em">Hello ${name},</p>
    <p>We're excited to introduce you to our latest feature: browser notifications! With Rapid Recap's new notification system, you'll never miss out on the latest articles, breaking news, and exclusive content.</p>
    <p>To subscribe to browser notifications and stay informed, simply click the button below:</p>
    <a href="https://www.rapidrecap.co.in/" style="display:inline-block; background-color:#00466a; color:#fff; text-decoration:none; padding:10px 20px; border-radius:5px;">Subscribe Now</a>
    
    <p>Best regards,<br />Rapid Recap Team</p>
    <hr style="border:none; border-top:1px solid #eee" />
    <div style="float:right; padding:8px 0; color:#aaa; font-size:0.8em; line-height:1; font-weight:300">
      <p>Rapid Recap Inc</p>
      <p>Jaipur</p>
      <p>India</p>
    </div>
    <p style="font-size:0.9em;"><strong>P.S.:</strong> Don't forget to stay updated with our latest news and articles by subscribing to browser notifications! If you have any questions or need assistance with subscribing to notifications, feel free to reach out to our support team at <a href="mailto:rapidrecap2k2023@gmail.com" style="color:#00466a; text-decoration:none;">rapidrecap2k2023@gmail.com</a>. We're here to help!</p>
  </div>
</div>
`,
  },
  AppUpdates: {
    from: "rapidrecap2k23@gmail.com",
    subject: "Application Update",
    html: ({
      title,
      mainText,
      name,
      img,
    }) => `<div style="font-family: Helvetica,Arial,sans-serif; min-width:1000px; overflow:auto; line-height:2">
  <div style="margin:50px auto; width:70%; padding:20px 0">
    <div style="border-bottom:1px solid #eee">
      <a href="" style="font-size:1.4em; color:#00466a; text-decoration:none; font-weight:600">Rapid Recap</a>
    </div>
    <p style="font-size:1.1em">Hello ${name},</p>
    <h4>${title}</h4>
    ${
      img
        ? `<div style="text-align: center; margin: 20px 0;"><img src="${img}" alt="Image" style="max-width:100%; height:auto;"></div>`
        : ""
    }
    <p>${mainText.replace(/\n\n/g, "<br><br>")}</p>
    <a href="https://www.rapidrecap.co.in/" style="display:inline-block; background-color:#00466a; color:#fff; text-decoration:none; padding:10px 20px; border-radius:5px;">View</a>
    
    <p>Best regards,<br />Rapid Recap Team</p>
    <hr style="border:none; border-top:1px solid #eee" />
    <div style="float:right; padding:8px 0; color:#aaa; font-size:0.8em; line-height:1; font-weight:300">
      <p>Rapid Recap Inc</p>
      <p>Jaipur</p>
      <p>India</p>
    </div>
    <p style="font-size:0.9em;"><strong>P.S.:</strong> Don't forget to stay updated with our latest news and articles by subscribing to browser notifications! If you have any questions or need assistance with subscribing to notifications, feel free to reach out to our support team at <a href="mailto:rapidrecap2k2023@gmail.com" style="color:#00466a; text-decoration:none;">rapidrecap2k2023@gmail.com</a>. We're here to help!</p>
  </div>`,
  },

  StreakJustBroken: {
    from: "rapidrecap2k23@gmail.com",
    subject: "Let's Get Back on Track! 🔄",
    html: ({
      name,
    }) => `<div style="font-family: Helvetica, Arial, sans-serif; background-color: #f9f9f9; padding: 20px;">
  <div style="margin: 20px auto; max-width: 600px; background-color: #fff; border-radius: 8px; box-shadow: 0 0 10px rgba(0,0,0,0.1); padding: 20px;">
    <div style="border-bottom: 2px solid #00466a; margin-bottom: 20px;">
      <a href="" style="color: #00466a; font-weight: 600; font-size: 1.5em; text-decoration: none;">Rapid Recap</a>
    </div>
    <p style="font-size: 1.2em;">Hello ${name} 👋,</p>
    <p>We noticed that your Rapid Recap streak of daily quizzes was broken, but don't worry – setbacks happen! Let's get you back on track and continue your journey towards mastering knowledge.</p>
    <p>Daily quizzes are a great way to stay sharp and engaged. <a href="https://www.rapidrecap.co.in/" style="background-color: #00466a; color: #fff; text-decoration: none; padding: 8px 16px; border-radius: 4px; font-weight: 600; display: inline-block; margin-top: 5px; margin-bottom: 5px;">Log in now</a> and resume your streak by taking today's quiz. Remember, consistency is key to progress!</p>
    <p style="margin-top: 20px;">Best regards,<br /><strong>Rapid Recap Team</strong></p>
    <hr style="border: none; border-top: 1px solid #eee; margin-top: 20px; margin-bottom: 10px;" />
    <div style="color: #aaa; font-size: 0.9em;">
      <p>Rapid Recap Inc<br />India</p>
    </div>
    <p style="font-size: 0.9em;"><strong>📧 P.S.:</strong> Need assistance or have any questions? Feel free to reach out to our support team at <a href="mailto:rapidrecap2k23@gmail.com" style="color: #00466a; text-decoration: none;">rapidrecap2k23@gmail.com</a>.</p>
  </div>
</div>

`,
  },
  StreakSevenPeriodic: {
    from: "rapidrecap2k23@gmail.com",

    subject: "🚀 Restart Your Rapid Recap Quiz Streak Today! 🌟",
    html: ({
      name,
      streak_days,
    }) => `<div style="font-family: Helvetica, Arial, sans-serif; background-color: #f9f9f9; padding: 20px;">
  <div style="margin: 20px auto; max-width: 600px; background-color: #fff; border-radius: 8px; box-shadow: 0 0 10px rgba(0,0,0,0.1); padding: 20px;">
    <div style="border-bottom: 2px solid #00466a; margin-bottom: 20px;">
      <a href="" style="color: #00466a; font-weight: 600; font-size: 1.5em; text-decoration: none;">Rapid Recap</a>
    </div>
    <p style="font-size: 1.2em;">Hello ${name} 👋,</p>
    <p>We hope this message finds you well.</p>
    <p>We regret to inform you that your Daily Quiz Streak on Rapid Recap has been interrupted for ${streak_days} days. We understand that life can get busy, and it's easy to lose track of routines.</p>
    <p>However, we miss having you engage with our daily quizzes and would love to see you back on track!</p>
    <p>Take this opportunity to restart your learning journey. Click below to resume:</p>
    <a href="https://www.rapidrecap.co.in/" style="background-color: #00466a; color: #fff; text-decoration: none; padding: 10px 20px; border-radius: 5px; display: inline-block; margin-top: 10px;">Get Back on Track</a>
    <p style="margin-top: 20px;">Best regards,<br /><strong>Rapid Recap Team</strong></p>
    <hr style="border: none; border-top: 1px solid #eee; margin-top: 20px; margin-bottom: 10px;" />
    <div style="color: #aaa; font-size: 0.9em;">
      <p>Rapid Recap Inc<br />India</p>
    </div>
    <p style="font-size: 0.9em;"><strong>📧 P.S.:</strong> Need assistance or have any questions? Feel free to reach out to our support team at <a href="mailto:rapidrecap2k23@gmail.com" style="color: #00466a; text-decoration: none;">rapidrecap2k23@gmail.com</a>.</p>
  </div>
</div>
`,
  },
  preQuinBoost: {
    from: "rapidrecap2k23@gmail.com",
    subject: "Almost There! One More Quiz to Unlock Your Power-Up! 🚀",
    html: ({ name, noOfQuiz, QuinQuizNumber }) =>
      `<div style="font-family: Helvetica, Arial, sans-serif; background-color: #f9f9f9; padding: 20px;">
  <div style="margin: 20px auto; max-width: 600px; background-color: #fff; border-radius: 8px; box-shadow: 0 0 10px rgba(0,0,0,0.1); padding: 20px;">
    <div style="border-bottom: 2px solid #00466a; margin-bottom: 20px;">
      <a href="" style="color: #00466a; font-weight: 600; font-size: 1.5em; text-decoration: none;">Rapid Recap</a>
    </div>
    <p style="font-size: 1.2em;">Hello ${name} 👋,</p>
    <p>Congratulations on completing your ${noOfQuiz}th quiz! 🎉</p>
    <p>You're just one step away from unlocking an exciting power-up. Complete your next quiz to activate the Quin Boost, which will enhance your performance on your ${QuinQuizNumber}th quiz.</p>
    <p>We can't wait to see you achieve great results with this boost! 🚀</p>
    <a href="https://www.rapidrecap.co.in/" style="background-color: #00466a; color: #fff; text-decoration: none; padding: 15px 25px; border-radius: 5px; display: inline-block; font-size: 1.1em; margin-top: 20px;">Complete Your 5th Quiz</a>
    <p style="margin-top: 20px;">Best regards,<br /><strong>Rapid Recap Team</strong></p>
    <hr style="border: none; border-top: 1px solid #eee; margin-top: 20px; margin-bottom: 10px;" />
    <div style="color: #aaa; font-size: 0.9em;">
      <p>Rapid Recap Inc<br />India</p>
    </div>
    <p style="font-size: 0.9em;"><strong>📧 P.S.:</strong> Need assistance or have any questions? Feel free to reach out to our support team at <a href="mailto:rapidrecap2k23@gmail.com" style="color: #00466a; text-decoration: none;">rapidrecap2k23@gmail.com</a>.</p>
  </div>
</div>`,
  },
  onQuinBoost: {
    from: "rapidrecap2k23@gmail.com",

    subject: "Congrats! Your Quin Boost is Now Active! 🌟",
    html1: ({
      name,
      noOfQuiz,
      QuinQuizNumber,
    }) => `<div style="font-family: Helvetica, Arial, sans-serif; background-color: #f9f9f9; padding: 20px;">
  <div style="margin: 20px auto; max-width: 600px; background-color: #fff; border-radius: 8px; box-shadow: 0 0 10px rgba(0,0,0,0.1); padding: 20px;">
    <div style="border-bottom: 2px solid #00466a; margin-bottom: 20px;">
      <a href="" style="color: #00466a; font-weight: 600; font-size: 1.5em; text-decoration: none;">Rapid Recap</a>
    </div>
    <p style="font-size: 1.2em;">Hello ${name} 👋,</p>
    <p>Great job on completing your ${noOfQuiz}th quiz! 🏅</p>
    <p>You have now unlocked the Quin Boost! 🎉 This special power-up will amplify your RQM Score by 1.5 times on your next (${QuinQuizNumber}th) quiz. Look out for the special badge indicating your Quin Boost is active.</p>
    <p>Make sure to take full advantage of this boost and achieve an outstanding score! 🌟</p>
    <a href="https://www.rapidrecap.co.in/" style="background-color: #00466a; color: #fff; text-decoration: none; padding: 15px 25px; border-radius: 5px; display: inline-block; font-size: 1.1em; margin-top: 20px;">Take Your 6th Quiz Now</a>
    <p style="margin-top: 20px;">Best regards,<br /><strong>Rapid Recap Team</strong></p>
    <hr style="border: none; border-top: 1px solid #eee; margin-top: 20px; margin-bottom: 10px;" />
    <div style="color: #aaa; font-size: 0.9em;">
      <p>Rapid Recap Inc<br />India</p>
    </div>
    <p style="font-size: 0.9em;"><strong>📧 P.S.:</strong> Need assistance or have any questions? Feel free to reach out to our support team at <a href="mailto:rapidrecap2k23@gmail.com" style="color: #00466a; text-decoration: none;">rapidrecap2k23@gmail.com</a>.</p>
  </div>
</div>`,
    html2: ({
      name,
      QuinQuizNumber,
    }) => `<div style="font-family: Helvetica, Arial, sans-serif; background-color: #f9f9f9; padding: 20px;">
        <div style="margin: 20px auto; max-width: 600px; background-color: #fff; border-radius: 8px; box-shadow: 0 0 10px rgba(0,0,0,0.1); padding: 20px;">
          <div style="border-bottom: 2px solid #00466a; margin-bottom: 20px;">
            <a href="https://www.rapidrecap.co.in/" style="color: #00466a; font-weight: 600; font-size: 1.5em; text-decoration: none;">Rapid Recap</a>
          </div>
          <p style="font-size: 1.2em;">Hello ${name} 👋,</p>
          <p>Quick reminder: your Quin Boost will expire in just 1 hour! ⏳</p>
          <p>Don't miss out on this opportunity to amplify your RQM Score by 1.5 times on your next quiz. Take your ${QuinQuizNumber}th quiz now and make the most of this special power-up! 🌟</p>
          <a href="https://www.rapidrecap.co.in/" style="background-color: #00466a; color: #fff; text-decoration: none; padding: 15px 25px; border-radius: 5px; display: inline-block; font-size: 1.1em; margin-top: 20px;">Take Your 6th Quiz Now</a>
          <p style="margin-top: 20px;">Best regards,<br /><strong>Rapid Recap Team</strong></p>
          <hr style="border: none; border-top: 1px solid #eee; margin-top: 20px; margin-bottom: 10px;" />
          <div style="color: #aaa; font-size: 0.9em;">
            <p>Rapid Recap Inc<br />India</p>
          </div>
          <p style="font-size: 0.9em;"><strong>📧 P.S.:</strong> Need assistance or have any questions? Feel free to reach out to our support team at <a href="mailto:rapidrecap2k23@gmail.com" style="color: #00466a; text-decoration: none;">rapidrecap2k23@gmail.com</a>.</p>
        </div>
      </div>`,
  },
  postQuinBoost: {
    from: "rapidrecap2k23@gmail.com",
    subject: "Well Done! Quin Boost Utilized! 🎉 Keep Going for More Boosts!",
    html: ({
      name,
      noOfQuiz,
    }) => `<div style="font-family: Helvetica, Arial, sans-serif; background-color: #f9f9f9; padding: 20px;">
  <div style="margin: 20px auto; max-width: 600px; background-color: #fff; border-radius: 8px; box-shadow: 0 0 10px rgba(0,0,0,0.1); padding: 20px;">
    <div style="border-bottom: 2px solid #00466a; margin-bottom: 20px;">
      <a href="" style="color: #00466a; font-weight: 600; font-size: 1.5em; text-decoration: none;">Rapid Recap</a>
    </div>
    <p style="font-size: 1.2em;">Hello ${name} 👋,</p>
    <p>Congratulations on completing your ${noOfQuiz}th quiz with the Quin Boost! 🎉</p>
    <p>We hope you enjoyed the enhanced experience and made the most of the 1.5x RQM Score multiplier. Your boosted performance has been truly impressive! 🌟</p>
    <p>Even though the Quin Boost was temporary, there's good news! The Quin Boost will reactivate after you complete the next five quizzes. Keep up the great work and continue your learning journey with us. We have many more quizzes waiting for you. 📚</p>
    <a href="https://www.rapidrecap.co.in/" style="background-color: #00466a; color: #fff; text-decoration: none; padding: 15px 25px; border-radius: 5px; display: inline-block; font-size: 1.1em; margin-top: 20px;">Continue Learning</a>
    <p style="margin-top: 20px;">Best regards,<br /><strong>Rapid Recap Team</strong></p>
    <hr style="border: none; border-top: 1px solid #eee; margin-top: 20px; margin-bottom: 10px;" />
    <div style="color: #aaa; font-size: 0.9em;">
      <p>Rapid Recap Inc<br />India</p>
    </div>
    <p style="font-size: 0.9em;"><strong>📧 P.S.:</strong> Need assistance or have any questions? Feel free to reach out to our support team at <a href="mailto:rapidrecap2k23@gmail.com" style="color: #00466a; text-decoration: none;">rapidrecap2k23@gmail.com</a>.</p>
  </div>
</div>`,
  },
  noLoginFor2Days: {
    from: "rapidrecap2k23@gmail.com",
    subject: `🌟 We Miss You at Rapid Recap! 📚 Resume Your Quiz Journey Today 🚀`,
    html: ({
      name,
    }) => `<div style="font-family: Helvetica, Arial, sans-serif; background-color: #f9f9f9; padding: 20px;">
  <div style="margin: 20px auto; max-width: 600px; background-color: #fff; border-radius: 8px; box-shadow: 0 0 10px rgba(0,0,0,0.1); padding: 20px;">
    <div style="border-bottom: 2px solid #00466a; margin-bottom: 20px;">
      <a href="" style="color: #00466a; font-weight: 600; font-size: 1.5em; text-decoration: none;">Rapid Recap</a>
    </div>
    <p style="font-size: 1.2em;">Hello ${name} 👋,</p>
    <p>We hope this message finds you well.</p>
    <p>We noticed that you haven't logged into Rapid Recap for the past 2 days. We understand that life can get busy, and it's easy to lose track of routines.</p>
    <p>We miss having you engage with our daily quizzes and would love to see you back on track!</p>
    <p>Take this opportunity to restart your learning journey. Click below to resume:</p>
    <a href="https://www.rapidrecap.co.in/" style="background-color: #00466a; color: #fff; text-decoration: none; padding: 10px 20px; border-radius: 5px; display: inline-block; margin-top: 10px;">Get Back on Track</a>
    <p style="margin-top: 20px;">Best regards,<br /><strong>Rapid Recap Team</strong></p>
    <hr style="border: none; border-top: 1px solid #eee; margin-top: 20px; margin-bottom: 10px;" />
    <div style="color: #aaa; font-size: 0.9em;">
      <p>Rapid Recap Inc<br />India</p>
    </div>
    <p style="font-size: 0.9em;"><strong>📧 P.S.:</strong> Need assistance or have any questions? Feel free to reach out to our support team at <a href="mailto:rapidrecap2k23@gmail.com" style="color: #00466a; text-decoration: none;">rapidrecap2k23@gmail.com</a>.</p>
  </div>
</div>
`,
  },
  noLoginForSevenPeriodic: {
    from: "rapidrecap2k23@gmail.com",
    subject: `🌟 We Miss You at Rapid Recap! 📚 Restart Your Learning Journey Today 🚀`,
    html: ({
      name,
      inactive_days,
    }) => `<div style="font-family: Helvetica, Arial, sans-serif; background-color: #f9f9f9; padding: 20px;">
  <div style="margin: 20px auto; max-width: 600px; background-color: #fff; border-radius: 8px; box-shadow: 0 0 10px rgba(0,0,0,0.1); padding: 20px;">
    <div style="border-bottom: 2px solid #00466a; margin-bottom: 20px;">
      <a href="" style="color: #00466a; font-weight: 600; font-size: 1.5em; text-decoration: none;">Rapid Recap</a>
    </div>
    <p style="font-size: 1.2em;">Hello ${name} 👋,</p>
    <p>We hope this message finds you well.</p>
    <p>It's been ${inactive_days} days since you last logged into Rapid Recap. We understand that routines can change, but we really miss your participation in our quizzes and content.</p>
    <p>There's a lot of new and exciting content waiting for you! We'd love to see you back to continue your learning journey with us.</p>
    <p>Click below to resume:</p>
    <a href="https://www.rapidrecap.co.in/" style="background-color: #00466a; color: #fff; text-decoration: none; padding: 10px 20px; border-radius: 5px; display: inline-block; margin-top: 10px;">Get Back on Track</a>
    <p style="margin-top: 20px;">We look forward to your return,<br /><strong>Rapid Recap Team</strong></p>
    <hr style="border: none; border-top: 1px solid #eee; margin-top: 20px; margin-bottom: 10px;" />
    <div style="color: #aaa; font-size: 0.9em;">
      <p>Rapid Recap Inc<br />India</p>
    </div>
    <p style="font-size: 0.9em;"><strong>📧 P.S.:</strong> Need assistance or have any questions? Feel free to reach out to our support team at <a href="mailto:rapidrecap2k23@gmail.com" style="color: #00466a; text-decoration: none;">rapidrecap2k23@gmail.com</a>.</p>
  </div>
</div>`,
  },
  streakMaintainReminder1: {
    from: "rapidrecap2k23@gmail.com",
    subject: `Keep Your Streak Alive! 🌟`,
    html: ({
      name,
    }) => `<div style="font-family: Helvetica, Arial, sans-serif; background-color: #f9f9f9; padding: 20px;">
  <div style="margin: 20px auto; max-width: 600px; background-color: #fff; border-radius: 8px; box-shadow: 0 0 10px rgba(0,0,0,0.1); padding: 20px;">
    <div style="border-bottom: 2px solid #00466a; margin-bottom: 20px;">
      <a href="" style="color: #00466a; font-weight: 600; font-size: 1.5em; text-decoration: none;">Rapid Recap</a>
    </div>
    <p style="font-size: 1.2em;">Hello ${name} 👋,</p>
    <p>We hope this message finds you well.</p>
    <p>Don't forget to take today's quiz and keep your Rapid Recap streak going strong. Your daily dose of knowledge awaits! Log in now and maintain that winning streak!</p>
    <a href="https://www.rapidrecap.co.in/" style="background-color: #00466a; color: #fff; text-decoration: none; padding: 10px 20px; border-radius: 5px; display: inline-block; margin-top: 10px;">Log in now</a>
    <p style="margin-top: 20px;">Best regards,<br /><strong>Rapid Recap Team</strong></p>
    <hr style="border: none; border-top: 1px solid #eee; margin-top: 20px; margin-bottom: 10px;" />
    <div style="color: #aaa; font-size: 0.9em;">
      <p>Rapid Recap Inc<br />India</p>
    </div>
    <p style="font-size: 0.9em;"><strong>📧 P.S.:</strong> Need assistance or have any questions? Feel free to reach out to our support team at <a href="mailto:rapidrecap2k23@gmail.com" style="color: #00466a; text-decoration: none;">rapidrecap2k23@gmail.com</a>.</p>
  </div>
</div>`,
  },
  streakMaintainReminder2: {
    from: "rapidrecap2k23@gmail.com",
    subject: `Last Chance to Maintain Your Streak! ⏰`,
    html: ({
      name,
    }) => `<div style="font-family: Helvetica, Arial, sans-serif; background-color: #f9f9f9; padding: 20px;">
  <div style="margin: 20px auto; max-width: 600px; background-color: #fff; border-radius: 8px; box-shadow: 0 0 10px rgba(0,0,0,0.1); padding: 20px;">
    <div style="border-bottom: 2px solid #00466a; margin-bottom: 20px;">
      <a href="" style="color: #00466a; font-weight: 600; font-size: 1.5em; text-decoration: none;">Rapid Recap</a>
    </div>
    <p style="font-size: 1.2em;">Hello ${name} 👋,</p>
    <p>We hope this message finds you well.</p>
    <p>The day is almost over, but your streak doesn't have to be! Take a few minutes now to complete today's quiz and extend your impressive streak. Don't let the day end without keeping your momentum going!</p>
    <a href="https://www.rapidrecap.co.in/" style="background-color: #00466a; color: #fff; text-decoration: none; padding: 10px 20px; border-radius: 5px; display: inline-block; margin-top: 10px;">Log in now</a>
    <p style="margin-top: 20px;">Best regards,<br /><strong>Rapid Recap Team</strong></p>
    <hr style="border: none; border-top: 1px solid #eee; margin-top: 20px; margin-bottom: 10px;" />
    <div style="color: #aaa; font-size: 0.9em;">
      <p>Rapid Recap Inc<br />India</p>
    </div>
    <p style="font-size: 0.9em;"><strong>📧 P.S.:</strong> Need assistance or have any questions? Feel free to reach out to our support team at <a href="mailto:rapidrecap2k23@gmail.com" style="color: #00466a; text-decoration: none;">rapidrecap2k23@gmail.com</a>.</p>
  </div>
</div>`,
  },
  streakMaintainReminder3: {
    from: "rapidrecap2k23@gmail.com",
    subject: `Final Call to Keep Your Streak Alive! 🚨`,
    html: ({
      name,
    }) => `<div style="font-family: Helvetica, Arial, sans-serif; background-color: #f9f9f9; padding: 20px;">
  <div style="margin: 20px auto; max-width: 600px; background-color: #fff; border-radius: 8px; box-shadow: 0 0 10px rgba(0,0,0,0.1); padding: 20px;">
    <div style="border-bottom: 2px solid #00466a; margin-bottom: 20px;">
      <a href="" style="color: #00466a; font-weight: 600; font-size: 1.5em; text-decoration: none;">Rapid Recap</a>
    </div>
    <p style="font-size: 1.2em;">Hello ${name} 👋,</p>
    <p>We hope this message finds you well.</p>
    <p>We noticed that you haven't completed today's quiz yet. Don't let your hard-earned streak come to an end!</p>
    <p>Keep your momentum going and set yourself up for success tomorrow by completing today's quiz.</p>
    <a href="https://www.rapidrecap.co.in/" style="background-color: #00466a; color: #fff; text-decoration: none; padding: 10px 20px; border-radius: 5px; display: inline-block; margin-top: 10px;">Log in now</a>
    <p style="margin-top: 20px;">Best regards,<br /><strong>Rapid Recap Team</strong></p>
    <hr style="border: none; border-top: 1px solid #eee; margin-top: 20px; margin-bottom: 10px;" />
    <div style="color: #aaa; font-size: 0.9em;">
      <p>Rapid Recap Inc<br />India</p>
    </div>
    <p style="font-size: 0.9em;"><strong>📧 P.S.:</strong> Need assistance or have any questions? Feel free to reach out to our support team at <a href="mailto:rapidrecap2k23@gmail.com" style="color: #00466a; text-decoration: none;">rapidrecap2k23@gmail.com</a>.</p>
  </div>
</div>`,
  },
};

module.exports = MailTemplates;
