const User = require("../model/userSchema");
const QuizAttempt = require("../model/quizAttemptSchema");

const bcrypt = require("bcryptjs");
const {
  generateOtp,
  mailTransporter,
  generateEmailTemplate,
} = require("../utils/mail");
const VerificationToken = require("../model/verificationToken");
const { isValidObjectId } = require("mongoose");
const jwt = require("jsonwebtoken");
const {
  getUserIQScoreHistory,
  currentTopPercentOfUser,
  getSolvedQuizzesCount,
  getDailyActivity,
  calculateUserRank,
} = require("../utils/user");
const dailyUserIQCalc = require("../utils/dailyUserIQCalc");

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
        userByEmail._id.toString() !== userByInGameName._id.toString()
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
    if (findUser.verified)
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
    await dailyUserIQCalc();

    // Send success response
    res.status(200).json({ message: "IQ scores calculated successfully." });
  } catch (error) {
    // Handle errors
    console.error("Error calculating IQ score:", error);
    res.status(500).json({ error: "Internal server error." });
  }
};

const leaderBoard = async (req, res) => {
  const currUserId = req.user._id;
  try {
    const users = await User.find({ inGameName: { $exists: true, $ne: "" } })
      .select("name inGameName IQ_score pic maxIQScore rank _id")
      .sort({ rank: 1 })
      .limit(50)
      .populate("quizAttempts");
    const currUser = await User.findById(currUserId).populate("quizAttempts");
    //AVG. RQM SCORES
    const result = [];

    users.forEach((user) => {
      let sum = 0;
      const { name, inGameName, IQ_score, pic, _id, maxIQScore } = user;
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
        maxIQScore,
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
    let sum = 0;
    for (let i = 0; i < currUser.quizAttempts.length; i++) {
      sum += currUser.quizAttempts[i].RQM_score;
    }
    const RQM_avg = (sum / currUser.quizAttempts.length).toFixed(0);
    const quizSubmissions = currUser.quizAttempts.length;

    res
      .status(200)
      .json({ users: result, currUser: { RQM_avg, quizSubmissions } });
  } catch (error) {
    res.status(500).json({ error: "Error fetching the Leaderboard" });
    console.log(error.message);
  }
};

const profile = async (req, res) => {
  try {
    const inGameName = req.params.inGameName;
    //console.log(inGameName);
    const user = await User.findOne({ inGameName });
    const userId = user._id;
    // Fetch user information
    //const user = await User.findById(userId);
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
    const profilePrivacy = user.profilePrivacy
      ? user.profilePrivacy
      : {
          fullProfile: false,
          lineGraph: false,
          barGraph: false,
          solvedQuizzes: false,
          dailyActivity: false,
          society: false,
        };
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
      USER_IQ,
      maxIQScore: user.maxIQScore,
      profilePrivacy,
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

const solvedQuizHistory = async (req, res) => {
  //const userId = req.user._id;
  const { inGameName } = req.query;
  const { page = 1, pageSize = 50 } = req.query;
  try {
    const user = await User.findOne({ inGameName });
    if (!user) {
      throw new Error("User not found");
    }
    const quizAttempts = await QuizAttempt.find({ user: user._id })
      .populate({
        path: "article",
      })
      .sort({ createdAt: -1 }) // Sort by createdAt field in descending order (latest first)
      .limit(pageSize);
    const history = [];
    quizAttempts.forEach((attempt) => {
      const { article, RQM_score, userPercentile, articleDifficulty } = attempt;
      if (
        !article ||
        isNaN(RQM_score) ||
        isNaN(userPercentile) ||
        isNaN(articleDifficulty)
      )
        return;
      const { title } = article;
      let diff = "";
      if (articleDifficulty < 0.5) diff = "Easy";
      else if (articleDifficulty < 0.7) diff = "Medium";
      else diff = "Hard";

      history.push({
        newsArticle: article,
        _id: attempt._id,
        article: article._id,
        title,
        RQM_score,
        userPercentile,
        articleDifficulty: diff,
      });
    });
    res.status(200).json({ history });
  } catch (error) {
    console.error("Error in fetching solved quiz history:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

const userSearch = async (req, res) => {
  try {
    const { query } = req.query;

    // Construct MongoDB query to search by inGameName, name, or email
    const searchQuery = {
      $or: [
        { inGameName: query }, // Full match for inGameName
        { name: query }, // Full match for name
        { email: query }, // Full match for email
        { inGameName: { $regex: query, $options: "i" } }, // Partial match for inGameName
        { name: { $regex: query, $options: "i" } }, // Partial match for name
        { email: { $regex: query, $options: "i" } }, // Partial match for email
      ],
      inGameName: { $ne: null, $exists: true },
    };

    // Execute the query and retrieve the matching users
    const users = await User.find(searchQuery).populate("quizAttempts");
    // Prioritize results with full query match
    const prioritizedUsers = users.sort((a, b) => {
      // Check if a has a full query match
      const aFullMatch =
        a.inGameName === query || a.name === query || a.email === query;
      // Check if b has a full query match
      const bFullMatch =
        b.inGameName === query || b.name === query || b.email === query;

      // Prioritize full match over partial match
      if (aFullMatch && !bFullMatch) return -1;
      if (!aFullMatch && bFullMatch) return 1;
      return 0;
    });
    const result = [];

    prioritizedUsers.forEach((user) => {
      let sum = 0;
      const { name, inGameName, IQ_score, pic, _id, maxIQScore, rank } = user;
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
        maxIQScore,
        rank,
      });
    });
    res.status(201).json(result); // Return the prioritized users as JSON response
  } catch (error) {
    console.error("Error searching users:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

const profilePrivacy = async (req, res) => {
  const userId = req.user._id;
  const {
    fullProfile,
    lineGraph,
    barGraph,
    solvedQuizzes,
    dailyActivity,
    society,
  } = req.body;
  try {
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    user.profilePrivacy = {
      fullProfile,
      lineGraph,
      barGraph,
      solvedQuizzes,
      dailyActivity,
      society,
    };
    await user.save();
    res.status(200).json({ message: "Profile privacy settings updated" });
  } catch (error) {
    console.error("Error in fetching solved quiz history:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

// Get all application updates
const getUpdates = async (req, res) => {
  const userId = req.user._id;
  try {
    const user = await User.findById(userId).populate("applicationUpdates");
    res.status(200).json({ updates: user.applicationUpdates });
  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
    console.log(error.message);
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
  solvedQuizHistory,
  userSearch,
  profilePrivacy,
  getUpdates,
};
