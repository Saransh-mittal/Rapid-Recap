import "./App.css";
import { Navigate, Route, Routes, useLocation } from "react-router-dom";
import "../node_modules/bootstrap/dist/css/bootstrap.min.css";
import "../node_modules/bootstrap/dist/js/bootstrap.bundle.min.js";
import Navbar from "./components/Header-Footer/Navbar.jsx";
import Home from "./screens/Home";
import About from "./screens/About";
import Signin from "./screens/Signin";
import Register from "./screens/Register";
import Contact from "./screens/Contact";
import Footer from "./components/Header-Footer/Footer.jsx";
import Article from "./screens/Article.jsx";
import Profile from "./screens/Profile.jsx";
import LeaderBoard from "./screens/LeaderBoard.jsx";
import GetStarted from "./screens/GetStarted.jsx";
import ReactGA from "react-ga4";
import { useEffect } from "react";
const App = () => {
  ReactGA.initialize("G-ES5VQ8NW7Z");
  const location = useLocation();

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
    ReactGA.send({
      hitType: "pageview",
      page: location.pathname + location.search,
      title: document.title,
    });
  }, [location]);
  return (
    <>
      <Navbar />
      <Routes>
        <Route exact path="/getStarted" element={<GetStarted />} />
        <Route path="/:category" element={<Home />} />
        <Route path="/" element={<Home />} />
        <Route exact path="/article/:id" element={<Article />} />
        {/* <Route exact path="/about" element={<About />} /> */}
        <Route path="/profile/:inGameName" element={<Profile />} />
        <Route path="/profile" element={<Profile />} />
        <Route exact path="/signin" element={<Signin />} />
        <Route exact path="/register" element={<Register />} />
        <Route exact path="/contact" element={<Contact />} />
        <Route exact path="/leaderboard" element={<LeaderBoard />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      <Footer />
    </>
  );
};

export default App;
