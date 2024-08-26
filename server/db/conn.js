const mongoose = require('mongoose')
const NoteMessage = require('../model/noteMessageSchema')
const DB = process.env.DATABASE
// const Article = require("../model/articleSchema");
// const articlesData = require("../../articleEntertainment.json");
// const updates = require("./updates/updates(23.07.2024).json");
// const User = require("../model/userSchema");
// const ApplicationUpdates = require("../model/applicationUpdatesSchema");
// const { progressBar } = require("../utils/progress.utils.js");
// const { sendNotification } = require("../services/notificationService");
// const { mailTransporter } = require("../utils/mail.utils.js");
// const MailTemplates = require("../data/MailTemplates.js");
// const { Recommendation } = require("../model/recommendationSchema.js");
// const Article = require("../model/articleSchema.js");

mongoose
  .connect(DB)
  .then(() => {
    console.log(`connection successful`)
  })
  .catch(err => {
    console.log(`connection unsuccessful`)
  })

// async function saveArticlesToDB() {
//   try {
//     for (const articleData of articlesData) {
//       const article = new Article(articleData);
//       await article.save();
//       console.log(`Article saved: ${article.title}`);
//     }
//     console.log("All articles saved successfully!");
//   } catch (error) {
//     console.error("Error saving articles:", error);
//   }
// }

// // Call the function to save articles to the database
// saveArticlesToDB();

// async function saveUpdatesToDB() {
//   try {
//     const users = await User.find({
//       email: { $not: /^dummy\d+@mail\.com$/ },
//       inGameName: { $exists: true },
//     });
//     // get two users for testing saransh_1234 and mmadhavpareek
//     // const users = await User.find({
//     //   inGameName: { $in: ["saransh_1234", "mmadhavpareek"] },
//     // });
//     for (const update of updates) {
//       const progress = progressBar(users.length);
//       for (const user of users) {
//         // Create a new update object for the user
//         const { title, mainText, img, read } = update;
//         const userRecommendedArticles = await Recommendation.findOne({
//           user_id: user._id,
//         }).select("recommendations");

//         let cnt = 4;
//         const articlesForMail = [];
//         for (const article of userRecommendedArticles.recommendations) {
//           if (cnt === 0) break;
//           const articleData = await Article.findById(article._id).select(
//             "title imgURL"
//           );
//           if (
//             !articleData ||
//             !articleData.imgURL ||
//             articleData.imgURL[0] === "" ||
//             articleData.title.length > 100
//           )
//             continue;
//           articlesForMail.push({
//             articleData,
//             link: `https://www.rapidrecap.co.in/article/${articleData._id.toString()}`,
//           });
//           cnt--;
//         }
//         //console.log("User:", user.name);
//         // const newUpdate = new ApplicationUpdates({
//         //   title,
//         //   mainText,
//         //   img,
//         //   userId: user._id, // Associate the update with the current user
//         //   read,
//         // });
//         // await newUpdate.save();

// const noteMessageForApplicationUpdate = new NoteMessage({
//   userId: user._id,
//   title: 'Application Update',
//   content: title,
//   messageType: 'inbox',
//   actions: [{ actionType: 'VIEW_INBOX' }],
// })
// await noteMessageForApplicationUpdate.save()

//         // console.log("Update saved:", title);
//         const transporter = await mailTransporter();
//         await transporter.sendMail({
//           from: MailTemplates.AppUpdates.from,
//           to: user.email,
//           subject: MailTemplates.AppUpdates.subject,
//           html: MailTemplates.AppUpdates.html({
//             title,
//             mainText,
//             name: user.name,
//             img,
//             articlesForMail,
//           }),
//         });
//         progress();
//       }
//     }
//     console.log("All Updates saved successfully!");
//   } catch (error) {
//     console.error("Error saving updates:", error);
//   }
// }

// // Call the function to save articles to the database
// saveUpdatesToDB();

// async function sendNotif() {
//   const users = await User.find({
//     email: { $not: /^dummy\d+@mail\.com$/ },
//     inGameName: { $exists: true },
//   }).select("_id");
//   // const users = await User.find({ inGameName: "saransh_1234" }).select("_id");

//   const updateTitle = `🚀 The Wise Web Has Launched! Connect, Chat, and Share on Rapid Recap 🌐`;
//   const url = "https://www.rapidrecap.co.in/";
//   for (let user of users) {
//     await sendNotification({
//       userId: user._id.toString(),
//       title: updateTitle,
//       url,
//       icon: "https://res.cloudinary.com/dxstsrnbs/image/upload/v1721632268/uxznhhrwqns1jedpwy4i.png",
//     });
//   }
//   console.log("Notification sent");
// }

// sendNotif();
