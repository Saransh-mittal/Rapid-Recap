// /src/App.jsx
import "./App.css";
import {
  Navigate,
  Route,
  Routes,
  useLocation,
  useNavigate,
} from "react-router-dom";
import "../node_modules/bootstrap/dist/css/bootstrap.min.css";
import "../node_modules/bootstrap/dist/js/bootstrap.bundle.min.js";
import Navbar from "./components/Header-Footer/Navbar.jsx";
import Home from "./screens/Home";
import Contact from "./screens/Contact";
import Footer from "./components/Header-Footer/Footer.jsx";
import Article from "./screens/Article.jsx";
import Profile from "./screens/Profile.jsx";
import LeaderBoard from "./screens/LeaderBoard.jsx";
import GetStarted from "./screens/GetStarted.jsx";
import FeedbackModal from "./components/getStartedComponents/modals/FeedbackModal.jsx";
import ReactGA from "react-ga4";
import { useContext, useEffect } from "react";
import { Helmet } from "react-helmet";
import { AppContext } from "./contextAPI/appContext.jsx";
// import Season from "./screens/Season.jsx";

const App = () => {
  ReactGA.initialize("G-ES5VQ8NW7Z");
  const location = useLocation();
  const { state } = useContext(AppContext);

  const isLoggedIn = () => {
    // Example logic
    return !state.show;
  };

  const getUserInGameName = () => {
    // Example logic
    return !state.show && state.user.inGameName ? state.user.inGameName : null;
  };

  useEffect(() => {
    const refreshAtMidnightUTC = () => {
      const now = new Date();
      const midnightUTC = new Date(
        now.getUTCFullYear(),
        now.getUTCMonth(),
        now.getUTCDate(),
        24, // Hours (24-hour format)
        0, // Minutes
        0, // Seconds
        0 // Milliseconds
      );

      const timeUntilMidnight = midnightUTC - now;

      // If it's already past midnight, schedule the refresh for the next day
      const timeout =
        timeUntilMidnight > 0
          ? timeUntilMidnight
          : 86400000 + timeUntilMidnight; // 86400000ms = 24 hours

      setTimeout(() => {
        window.location.reload(true);
      }, timeout);
    };

    refreshAtMidnightUTC();

    // Cleanup function
    return () => {
      clearTimeout(timeout);
    };
  }, []);

  useEffect(() => {
    const loggedIn = isLoggedIn();
    const userInGameName = getUserInGameName();

    // Set custom dimensions
    ReactGA.set({
      "User Logged In": loggedIn ? "Logged In" : "Logged Out",
      "User InGameName": userInGameName ? userInGameName : "anonymous",
    });
    ReactGA.send({
      hitType: "pageview",
      page: location.pathname + location.search,
      title: document.title,
    });
  }, [location]);

  const shouldShowFooter = !location.pathname.includes("home");

  return (
    <>
      <Helmet>
        <title>Rapid Recap - Stay Informed, Stay Ahead</title>
        <meta
          name="description"
          content="Rapid Recap is your go-to source for the latest news and articles. Test your knowledge with quizzes and track your Information Quotient (IQ) score."
        />
        <meta
          name="keywords"
          content="Rapid Recap, news, articles, quizzes, IQ score, leaderboard"
        />
        <meta
          property="og:title"
          content="Rapid Recap - Stay Informed, Stay Ahead"
        />
        <meta
          property="og:description"
          content="Stay updated with the latest news and articles. Take quizzes and see your Information Quotient (IQ) score on Rapid Recap."
        />
      </Helmet>
      <Navbar />
      <Routes>
        <Route exact path="/" element={<GetStartedLayout />} />
        <Route exact path="/feedback" element={<GetStartedLayout />} />
        <Route path="/home/:category" element={<Home />} />
        <Route path="/home" element={<Home />} />
        <Route exact path="/article/:id" element={<Article />} />
        <Route path="/profile/:inGameName" element={<Profile />} />
        <Route path="/profile" element={<Profile />} />
        <Route exact path="/contact" element={<Contact />} />
        <Route exact path="/leaderboard" element={<LeaderBoard />} />
        {/* <Route exact path="/season" element={<Season />} /> */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      {shouldShowFooter && <Footer />}
    </>
  );
};

const GetStartedLayout = () => {
  const location = useLocation();
  const isFeedbackRoute = location.pathname === "/feedback";
  const navigate = useNavigate();

  return (
    <>
      <GetStarted />
      <FeedbackModal isOpen={isFeedbackRoute} onClose={() => navigate("/")} />
    </>
  );
};

export default App;
