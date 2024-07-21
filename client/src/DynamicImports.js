import { lazy } from "react";

// Dynamically import components
export const Home = lazy(() => import("./screens/Home"));
export const Contact = lazy(() => import("./screens/Contact"));
export const Article = lazy(() => import("./screens/Article.jsx"));
export const Profile = lazy(() => import("./screens/Profile.jsx"));
export const LeaderBoard = lazy(() => import("./screens/LeaderBoard.jsx"));
export const GetStarted = lazy(() => import("./screens/GetStarted.jsx"));
export const ChatPage = lazy(() => import("./screens/ChatPage.jsx"));
export const Dashboard = lazy(() => import("./screens/Dashboard.jsx"));
export const Footer = lazy(() =>
  import("./components/Header-Footer/Footer.jsx")
);
export const FeedbackModal = lazy(() =>
  import("./components/getStartedComponents/modals/FeedbackModal.jsx")
);

// You can add more dynamic imports here as needed
