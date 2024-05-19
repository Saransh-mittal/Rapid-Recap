const mongoose = require("mongoose");
const DB = process.env.DATABASE;
// const Article = require("../model/articleSchema");
// const articlesData = require("../../articleEntertainment.json");
// const updates = require("./updates/updates(29.04.2024).json");
// const User = require("../model/userSchema");
// const ApplicationUpdates = require("../model/applicationUpdatesSchema");
// const { progressBar } = require("../utils/progress");
// const { sendNotification } = require("../services/notificationService");
// const {
//   mailTransporter,
// } = require("../utils/mail");
// const MailTemplates = require("../data/MailTemplates.js");

mongoose
  .connect(DB)
  .then(() => {
    console.log(`connection successful`);
  })
  .catch((err) => {
    console.log(`connection unsuccessful`);
  });

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
//       email: { $not: /dummy\d+mail\.com/ },
//       inGameName: { $exists: true },
//     });
//     for (const update of updates) {
//       const progress = progressBar(users.length);
//       const updateTitle = `📢 ${update.title} 📰`;
//       const updateBody =
//         update.mainText.length > 100
//           ? `${update.mainText.slice(0, 100)}...`
//           : update.mainText;
//       const url = "https://rapidrecap.co.in/";
//       await sendNotification({ title: updateTitle, body: updateBody, url });
//       for (const user of users) {
//         // Create a new update object for the user
//         const { title, mainText, img, read } = update;
//         //console.log("User:", user.name);
//         const newUpdate = new ApplicationUpdates({
//           title,
//           mainText,
//           img,
//           userId: user._id, // Associate the update with the current user
//           read,
//         });
//         await newUpdate.save();
//         //console.log("Update saved:", title);
//         const transporter = await mailTransporter();
// await transporter.sendMail({
//   from: MailTemplates.AppUpdates.from,
//   to: user.email,
//   subject: MailTemplates.AppUpdates.subject,
//   html: MailTemplates.AppUpdates.html({
//     title,
//     mainText,
//     name: user.name,
//   }),
// });
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
