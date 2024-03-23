import "./App.css";
import { Navigate, Route, Routes } from "react-router-dom";
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

const App = () => {
  return (
    <>
      <Navbar />
      <Routes>
        <Route persistent path="/" element={<Home />} />
        <Route exact path="/article/:id" element={<Article />} />
        {/* <Route exact path="/about" element={<About />} /> */}
        <Route exact path="/profile" element={<Profile />} />
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
