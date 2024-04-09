const User = require("../model/userSchema");
const QuizAttempt = require("../model/quizAttemptSchema");
const DailyIQ = require("../model/dailyIQSchema");
const bcrypt = require("bcryptjs");
const {
  generateOtp,
  mailTransporter,
  generateEmailTemplate,
} = require("../utils/mail");
const VerificationToken = require("../model/verificationToken");
const { isValidObjectId } = require("mongoose");
const jwt = require("jsonwebtoken");
const { updatePercentilesOnQuizDeactivation } = require("../utils/quiz");
const { progressBar } = require("../utils/progress");
const {
  getUserIQScoreHistory,
  currentTopPercentOfUser,
  getSolvedQuizzesCount,
  getDailyActivity,
  calculateUserRank,
} = require("../utils/user");

const registerUser = async (req, res) => {
  //console.log(req.body);
  const { name, email, pic, password, cpassword, inGameName } = req.body;

  if (!name || !email || !pic || !password || !cpassword || !inGameName)
    return res.status(422).json({ error: "Please fill the required field" });
  // inGameName cannot have spaces
  if (inGameName.includes(" "))
    return res.status(422).json({ error: "In Game Name cannot have spaces" });

  try {
    const response = await User.findOne({ email: email });
    const response2 = await User.findOne({ inGameName });
    if (response2)
      return res
        .status(422)
        .json({ error: "This In Game Name is already Taken" });
    if (response)
      return res.status(422).json({ error: "Email already exists" });
    if (password.length < 8)
      throw new Error("Password should be of atleast 8 characters");

    if (password != cpassword)
      return res
        .status(422)
        .json({ error: "password is not equal to confirm password" });
    // if (phone.toString().length != 10) {
    //   return res
    //     .status(422)
    //     .json({ error: "Phone no. should be of 10 digits" });
    // }
    const user = new User({
      inGameName,
      name,
      email,
      pic,
      password,
      cpassword,
      googleEmail: email,
    });

    const OTP = generateOtp();
    const verificationToken = new VerificationToken({
      owner: user._id,
      token: OTP,
    });
    await verificationToken.save();
    user.resetOtpCnt();
    user.setOtpCntResetTime();
    await user.save();

    const transporter = await mailTransporter();
    await transporter.sendMail({
      from: "rapidrecap2k23@gmail.com",
      to: user.email,
      subject: "OTP for verification",
      text: `Your OTP for verification`,
      html: generateEmailTemplate(OTP),
    });
    return res.status(201).json({ message: "Registered Successfully" });
  } catch (err) {
    res.status(500).send("Internal Server Error");
    console.log(err);
  }
};

const loginUser = async (req, res) => {
  // Implement login logic here
  //console.log(req.body);
  const { email, password } = req.body.data;
  const inGameName = req.body.inGameName;
  if (!((email || inGameName) && password)) {
    return res.status(422).json({ error: "Please fill the required fields" });
  }

  try {
    let findUser;
    if (email && inGameName) {
      // Both email and inGameName are provided, check if they belong to the same user
      const userByEmail = await User.findOne({ email });
      const userByInGameName = await User.findOne({ inGameName });

      if (
        !userByEmail ||
        !userByInGameName ||
        userByEmail._id !== userByInGameName._id
      ) {
        return res.status(422).json({ error: "Invalid Credentials" });
      }

      findUser = userByEmail;
    } else if (email) {
      findUser = await User.findOne({ email });
    } else {
      findUser = await User.findOne({ inGameName });
    }
    //console.log(findUser);
    if (!findUser)
      return res.status(422).json({ error: "Invalid Credentials" });

    const isMatch = await bcrypt.compare(password, findUser.password);
    if (!isMatch) return res.status(401).json({ error: "Invalid Credentials" });
    const token = await findUser.generateAuthToken();
    // console.log(token);
    res.cookie("jwtoken", token, {
      expires: new Date(Date.now() + 2592000000),
      httpOnly: true,
    });

    return res
      .status(201)
      .json({ message: "SignIn Successfull", user: findUser });
  } catch (err) {
    console.log(err);
  }
};

const logoutUser = async (req, res) => {
  try {
    res.clearCookie("jwtoken", { path: "/" });
    res.status(201).send("User Logout");
  } catch (error) {
    console.log(error.message);
    res.status(422).json({ error: error.message });
  }
};

const loginCheck = async (req, res) => {
  const user = await User.findById(req.user._id);
  res.status(201).send(user);
};

const verifyUser = async (req, res) => {
  const { otp, email } = req.body;
  // type of forgotPassword is string
  const forgotPassword = req.query.forgotPassword;

  try {
    const user = await User.findOne({ email: email });
    if (!user) throw new Error("No user found");
    const userid = user._id;
    if (!userid || !otp.trim()) throw new Error("No user or otp provided");
    if (!isValidObjectId(userid)) throw new Error("Invalid user");

    if (user.verified && forgotPassword === "false")
      throw new Error("User already verified");

    const token = await VerificationToken.findOne({ owner: userid });
    if (!token) throw new Error("No token found");

    const isMatch = await token.compareToken(otp);

    if (!isMatch) throw new Error("Invalid OTP");

    user.verified = true;
    await VerificationToken.findByIdAndDelete(token._id);
    await user.save();
    //console.log("Email verified successfully");

    if (forgotPassword === "false") {
      //console.log("Sending email");
      const transporter = await mailTransporter();
      await transporter.sendMail({
        from: "rapidrecap2k23@gmail.com",
        to: user.email,
        subject: "Welcom to Rapid Recap",
        html: "<h1>Welcome to Rapid Recap. Your account has been verified successfully</h1>",
      });
      //console.log("Email sent");
    }
    res.status(201).json({ message: "Email verified successfully" });
  } catch (error) {
    console.log(error);
    return res.status(422).json({ error: error.message });
  }
};

const resendOTP = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email)
      throw new Error("No email provided : Write the Email in the email field");
    const user = await User.findOne({ email: email });
    const user_id = user._id;
    if (!user_id) throw new Error("No user found");
    const otpCnt = user.otpCnt;
    if (!user.otpCntResetTime || new Date() > user.otpCntResetTime) {
      user.resetOtpCnt();
      user.setOtpCntResetTime();
      await user.save();
    }
    if (otpCnt >= 3) {
      throw new Error(
        "OTP limit exceeded, Try again after " +
          user.otpCntResetTime.toLocalString
      );
    }
    const OTP = generateOtp();
    user.incrementOtpCnt();
    await user.save();
    const prevToken = await VerificationToken.findOne({ owner: user_id });
    if (prevToken) await VerificationToken.findByIdAndDelete(prevToken._id);
    const verificationToken = new VerificationToken({
      owner: user._id,
      token: OTP,
    });
    await verificationToken.save();
    const transporter = await mailTransporter();
    await transporter.sendMail({
      from: "rapidrecap2k23@gmail.com",
      to: user.email,
      subject: "OTP for verification",
      text: `Your OTP for verification`,
      html: generateEmailTemplate(OTP),
    });
    return res.status(201).json({ message: "OTP send Successfully" });
  } catch (error) {
    console.log(error.message);
    return res.status(422).json({ error: error.message });
  }
};

const forgotPassword = async (req, res) => {
  const { email, newPassword } = req.body;
  try {
    const user = await User.findOne({ email: email });
    if (!user) throw new Error("No user found");
    const isSamePassword = await bcrypt.compare(newPassword, user.password);
    if (isSamePassword)
      throw new Error("New password should be different from old password");
    if (newPassword.length < 8)
      throw new Error("Password should be of atleast 8 characters");

    user.password = newPassword;
    user.cpassword = newPassword;

    await user.save();
    res.status(201).json({ message: "Password changed successfully" });
  } catch (error) {
    console.log(error.message);
    res.status(422).json({ error: error.message });
  }
};

const handleGoogleLogin = async (req, res) => {
  const { credentialResponse, inGameName } = req.body;
  const credential = credentialResponse.credential;

  try {
    const userInfo = jwt.decode(credential);
    let user = await User.findOne({
      $or: [
        { email: userInfo.email },
        { googleEmail: userInfo.email },
        { googleId: userInfo.sub },
      ],
    });
    //console.log(userInfo);
    if (user) {
      if (!user.inGameName) {
        if (!inGameName)
          return res.status(422).json({
            EnterInGameName: true,
            error:
              "Please provide your chosen In-Game Name for your initial login.",
          });

        const u = await User.findOne({ inGameName });
        if (u)
          return res.status(422).json({
            error: "This In Game Name is already Taken",
          });
        // inGameName cannot have spaces
        if (inGameName.includes(" "))
          return res
            .status(422)
            .json({ error: "In Game Name cannot have spaces" });
        user.inGameName = inGameName;
      }

      user.googleEmail = userInfo.email;
      user.googleId = userInfo.sub;
      user.verified = true;
      await user.save();
    } else {
      if (!inGameName)
        return res.status(422).json({
          EnterInGameName: true,
          error:
            "Please provide your chosen In-Game Name for your initial login.",
        });

      const u = await User.findOne({ inGameName });
      if (u)
        return res.status(422).json({
          error: "This In Game Name is already Taken",
        });
      // inGameName cannot have spaces
      if (inGameName.includes(" "))
        return res
          .status(422)
          .json({ error: "In Game Name cannot have spaces" });
      // If not, create a new user with Google data
      const name = userInfo.name.split(" ");
      user = new User({
        name: name[0] + " " + name[name.length - 1],
        email: userInfo.email,
        inGameName,
        // Add other necessary Google fields
        googleId: userInfo.sub,
        googleEmail: userInfo.email,
        verified: true,
      });
      await user.save();
    }

    const token = await user.generateAuthToken();
    res.cookie("jwtoken", token, {
      expires: new Date(Date.now() + 2592000000),
      httpOnly: true,
    });
    res.status(201).json({ message: "Google Login Successfull", user });
  } catch (error) {
    console.log(error.message);
    res.status(422).json({ error: error.message });
  }
};

const calculateUserIQScores = async (req, res) => {
  try {
    // Fetch all users
    console.log("\nFetching users...\n");
    const users = await User.aggregate([
      {
        $lookup: {
          from: "quiz_attempts",
          localField: "_id",
          foreignField: "user",
          as: "quizAttempts",
        },
      },
      {
        $addFields: {
          distinctArticles: { $size: { $setUnion: "$quizAttempts.article" } },
        },
      },
      {
        $match: {
          distinctArticles: { $gte: 10 },
        },
      },
    ]);
    console.log("\nFetched users.\n");

    const uniqueArticleIds = await QuizAttempt.aggregate([
      { $group: { _id: "$article" } }, // Group by the article field
      { $project: { _id: 0, articleId: "$_id" } }, // Project only the article IDs
    ]);

    console.log("\nUpdating percentiles on quiz...\n");
    await Promise.all(
      uniqueArticleIds.map(async (doc) => {
        // Check if the quiz attempt is valid based on its creation date and quiz activity
        // if (
        //   attempt.article.quiz.createdAt.getTime() + 24 * 60 * 60 * 1000 <
        //   Date.now()
        // ) {
        //if (attempt.article.quiz.isActive) {
        await updatePercentilesOnQuizDeactivation({
          id: doc.articleId,
        });

        //   attempt.article.quiz.isActive = false;
        //   await attempt.article.quiz.save();
        // }
      })
    );
    console.log("\nUpdated percentiles on quiz.\n");
    // Array to store user scores
    const userScores = [];
    let sumOfUserScores = 0;
    // Fetch quiz attempts concurrently for each user
    const fetchQuizAttemptsPromises = users.map(async (user) => {
      const quizAttempts = await QuizAttempt.find({ user: user._id }).populate({
        path: "article",
        populate: { path: "quiz" },
      });
      return { user, quizAttempts };
    });

    const userQuizAttempts = await Promise.all(fetchQuizAttemptsPromises);
    console.log("\nFetched quiz attempts.\n");
    // Iterate through each user's quiz attempts
    console.log("\nCalculating user scores...\n");
    const updateProgress1 = progressBar(userQuizAttempts.length);
    for (const { user, quizAttempts } of userQuizAttempts) {
      let userScore = 0;

      for (const attempt of quizAttempts) {
        // Check if quiz attempt, quiz, and article exist
        if (
          !attempt ||
          !attempt.article ||
          !attempt.article.quiz ||
          !attempt.articleDifficulty
        ) {
          //console.log("Inside IF", attempt);
          console.error("Invalid quiz attempt data.");
          continue; // Skip this attempt
        }
        //console.log("Outside IF", attempt);

        // Calculate score for the quiz attempt (Wi * Pi)

        const quizScore = attempt.articleDifficulty * attempt.userPercentile;
        userScore += quizScore;
        //}
      }
      // add userScore in the user also
      const u = await User.findById(user._id);
      u.userScore = userScore;
      await u.save();

      sumOfUserScores += userScore;
      // Add user score to the array
      userScores.push({ user, userScore });
      updateProgress1();
    }

    // Calculate mean and standard deviation
    const meanOfUserScores = sumOfUserScores / userScores.length;
    const sumOfSquares = userScores.reduce(
      (acc, user) => acc + Math.pow(user.userScore - meanOfUserScores, 2),
      0
    );
    const standardDeviation = Math.sqrt(sumOfSquares / userScores.length);

    // Calculate and update IQ scores for each user
    console.log("\nCalculating IQ scores...\n");
    const updateProgress2 = progressBar(userScores.length);
    userScores.sort((a, b) => b.userScore - a.userScore);
    let rank = 1;
    for (const user of userScores) {
      if (!user || !user.user) {
        console.error("Invalid user data.");
        continue; // Skip this user
      }

      const normalizedScore =
        (user.userScore - meanOfUserScores) / standardDeviation;
      const IQScore = 100 + 15 * normalizedScore;
      const updatedUser = await User.findById(user.user._id);
      updatedUser.IQ_score = Math.round(IQScore);

      const dailyIQ = new DailyIQ({
        user: updatedUser._id,
        IQ_score: Math.round(IQScore),
        dailyRank: `${rank}/${userScores.length}`,
      });
      await dailyIQ.save();
      updatedUser.dailyIQScores.push(dailyIQ._id);
      await updatedUser.save();
      rank++;
      updateProgress2();
    }

    // Send success response
    res.status(200).json({ message: "IQ scores calculated successfully." });
  } catch (error) {
    // Handle errors
    console.error("Error calculating IQ score:", error);
    res.status(500).json({ error: "Internal server error." });
  }
};

const leaderBoard = async (req, res) => {
  try {
    const users = await User.find({ inGameName: { $exists: true, $ne: "" } })
      .sort({ IQ_score: -1 })
      .limit(50)
      .populate("quizAttempts");
    //AVG. RQM SCORES
    const result = [];

    users.forEach((user) => {
      let sum = 0;
      const { name, inGameName, IQ_score, pic, _id } = user;
      for (let i = 0; i < user.quizAttempts.length; i++) {
        sum += user.quizAttempts[i].RQM_score;
      }
      const RQM_avg = (sum / user.quizAttempts.length).toFixed(0);
      const quizSubmissions = user.quizAttempts.length;
      result.push({
        _id,
        RQM_avg,
        name,
        inGameName,
        IQ_score,
        pic,
        quizSubmissions,
      });
    });
    result.sort((a, b) => {
      if (a.IQ_score !== b.IQ_score) {
        return b.IQ_score - a.IQ_score; // Sort by IQ_score in descending order
      } else if (a.quizSubmissions !== b.quizSubmissions) {
        return b.quizSubmissions - a.quizSubmissions; // Sort by quizSubmissions in descending order
      } else {
        return b.RQM_avg - a.RQM_avg; // Sort by RQM_avg in descending order
      }
    });
    res.status(200).json({ users: result });
  } catch (error) {
    res.status(500).json({ error: "Error fetching the Leaderboard" });
    console.log(error.message);
  }
};

const profile = async (req, res) => {
  try {
    const inGameName = req.params.inGameName;
    //console.log(inGameName);
    const u = await User.findOne({ inGameName });
    const userId = u._id;
    // Fetch user information
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // Get IQ score history
    const iqScoresHistory = await getUserIQScoreHistory(userId);

    // Calculate current top percentage
    const {
      Top_Percentage,
      percentileData,
      filteredLabels,
      filteredIQData,
      USER_IQ,
    } = await currentTopPercentOfUser(userId);

    // Get solved quizzes count and percentages
    const solvedQuizzes = await getSolvedQuizzesCount(userId);

    // Get daily activity
    const dailyActivity = await getDailyActivity(userId);

    // Calculate user rank
    const rank = await calculateUserRank(userId);

    res.status(200).json({
      lineGraph: iqScoresHistory,
      barGraph: {
        Top_Percentage,
        percentileData,
        filteredLabels,
        filteredIQData,
        USER_IQ,
      },
      solvedQuizzes,
      dailyActivity,
      leftProfileView: {
        rank,
        name: user.name,
        inGameName: user.inGameName,
        pic: user.pic,
        bio: user.bio,
      },
    });
  } catch (error) {
    console.error("Error fetching user profile:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

const editProfile = async (req, res) => {
  const { name, bio, pic } = req.body;
  try {
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    user.name = name;
    user.bio = bio;
    user.pic = pic;
    await user.save();
    res.status(200).json({ message: "Profile updated successfully" });
  } catch (error) {
    console.error("Error editing user profile:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

const expectedIQScore = async (req, res) => {
  try {
    const userId = req.user._id;
    const quizAttempts = await QuizAttempt.find({ user: userId }).populate({
      path: "article",
      populate: { path: "quiz" },
    });
    let userScore = 0;
    const cntOfQuizAttempts = quizAttempts.length;
    for (const attempt of quizAttempts) {
      if (
        !attempt ||
        !attempt.article ||
        !attempt.article.quiz ||
        !attempt.articleDifficulty
      ) {
        //console.error("Invalid quiz attempt data.");
        continue;
      }
      let percentile = attempt.userPercentile;
      if (!percentile) {
        // calculate percentile
        const quizAttempts = await QuizAttempt.find({
          article: attempt.article._id,
        });
        const sortedQuizAttempts = quizAttempts.sort(
          (a, b) => b.RQM_score - a.RQM_score
        );
        const userAttempt = sortedQuizAttempts.find(
          (attempt) => attempt.user.toString() === userId
        );
        if (!userAttempt) {
          throw new Error("User has not attempted the quiz for the article.");
        }
        const userPosition = sortedQuizAttempts.indexOf(userAttempt);
        const totalAttempts = sortedQuizAttempts.length;
        const userPercentile =
          ((totalAttempts - userPosition) / totalAttempts) * 100;
        userAttempt.userPercentile = userPercentile;
        percentile = userPercentile;
        await userAttempt.save();
      }
      const quizScore = attempt.articleDifficulty * percentile;
      userScore += quizScore;
    }
    userScore = (userScore / cntOfQuizAttempts) * 10;
    // IQscore > 0 users
    const users = await User.find({
      userScore: { $gt: 0 },
    });
    let sumOfUserScores = users.reduce((acc, user) => acc + user.userScore, 0);
    sumOfUserScores += userScore;
    const meanOfUserScores = sumOfUserScores / users.length;
    let sumOfSquares = users.reduce(
      (acc, user) => acc + Math.pow(user.userScore - meanOfUserScores, 2),
      0
    );
    sumOfSquares += Math.pow(userScore - meanOfUserScores, 2);
    const standardDeviation = Math.sqrt(sumOfSquares / users.length);
    const normalizedScore = (userScore - meanOfUserScores) / standardDeviation;
    const ExpectedIQScore = Math.round(100 + 15 * normalizedScore);
    res.status(200).json({ ExpectedIQScore });
  } catch (error) {
    console.error("Error calculating user IQ expected score:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

const tutorialTakenCheck = async (req, res) => {
  const page = req.params.Page;
  const userId = req.user._id;

  try {
    const user = await User.findById(userId);
    //console.log(user.tutorial[page], page);
    res.status(200).json({ status: user.tutorial[page] });
  } catch (error) {
    console.error("Error in saving is the user is firstTimer:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

const tutorialTakenUpdate = async (req, res) => {
  // const data=req.body;
  const page = req.body.page;
  const userId = req.user._id;
  //console.log(req.body);
  try {
    const user = await User.findById(userId);
    //console.log(user.tutorial[page], page);
    user.tutorial[page] = false;
    await user.save();
    res.status(200).json({ status: "Success" });
  } catch (error) {
    console.error("Error in saving is the user is firstTimer:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

module.exports = {
  registerUser,
  loginUser,
  logoutUser,
  loginCheck,
  verifyUser,
  resendOTP,
  forgotPassword,
  handleGoogleLogin,
  calculateUserIQScores,
  editProfile,
  leaderBoard,
  profile,
  expectedIQScore,
  tutorialTakenCheck,
  tutorialTakenUpdate,
};
