import { useEffect } from "react";
import { useShepherdTour } from "react-shepherd";
import stepsTutorialHome from "../components/homeComponents/stepsTutorialHome";
import stepsGuideArticle from "../components/articleComponents/stepsGuideArticle";
import {
  isTutorialTakenCheck,
  manageOverlay,
  toggleClass,
  //isTutorialTakenUpdate,
} from "../utils/tutorial.utlis";
import stepsLeaderBoard from "../components/leaderBoardComponents/stepsLeaderBoard";
import stepsTutorialProfile from "../components/profileComponents/stepsTutorialProfile";
import stepsTutorialDailyStreak from "../components/Header-Footer/stepsTutorialDailyStreak";
import stepsTutorialQuinBoost from "../components/articleComponents/stepsTutorialQuinBoost";
import { useTutorialTakenUpdate } from "./useTutorialTakenUpdate";
import { useLocation, useNavigate } from "react-router-dom";
const tourOptions = {
  defaultStepOptions: {
    cancelIcon: {
      enabled: true,
    },
  },
  useModalOverlay: true,
};

export const useHomeTour = ({ setSwipeDisable }) => {
  const tour = useShepherdTour({ tourOptions, steps: stepsTutorialHome });
  const updateStatusOfTutorial = useTutorialTakenUpdate();

  useEffect(() => {
    const timeline = document.querySelector(".timeline");
    const nav = document.querySelector(".navbar");
    const body = document.querySelector("body");

    const handleTourStart = () => {
      setSwipeDisable(true);
      toggleClass({
        element: timeline,
        className: "shepherd-active",
        addClass: true,
      });
      toggleClass({
        element: nav,
        className: "shepherd-active",
        addClass: true,
      });
      body.style.overflow = "hidden"; // Reapply scroll behavior

      manageOverlay({ element: timeline, overlay: true });
      manageOverlay({ element: nav, overlay: true });
    };

    const handleTourEnd = () => {
      setSwipeDisable(false);
      body.style.overflow = "auto";
      toggleClass({
        element: timeline,
        className: "shepherd-active",
        addClass: false,
      });
      toggleClass({
        element: nav,
        className: "shepherd-active",
        addClass: false,
      });
      const timelineItem = document.querySelector(".timeline-item");
      toggleClass({
        element: timelineItem,
        className: "highlighted-card-0",
        addClass: false,
      });
      manageOverlay({ element: timeline, overlay: false });
      manageOverlay({ element: nav, overlay: false });
      const img = document.querySelector(".hand-click-img");
      if (img) {
        img.remove();
      }
    };

    const handleTourComplete = () => {
      setSwipeDisable(false);
      handleTourEnd();
      updateStatusOfTutorial("homePage");
      // Additional logic if needed on complete
    };

    const handleTourCancel = () => {
      handleTourEnd();

      updateStatusOfTutorial("homePage");

      // Additional logic if needed on cancel
    };

    tour.on("start", handleTourStart);
    tour.on("complete", handleTourComplete);
    tour.on("cancel", handleTourCancel);

    return () => {
      tour.off("start", handleTourStart);
      tour.off("complete", handleTourComplete);
      tour.off("cancel", handleTourCancel);
      tour.cancel();
      body.style.overflow = "auto";
      manageOverlay({
        element: document.querySelector(".navbar"),
        overlay: false,
      });
      toggleClass({
        element: document.querySelector(".navbar"),
        className: "shepherd-active",
        addClass: false,
      });
    };
  }, [tour]);

  return { tour, isTutorialTakenCheck };
};

export const useArticlePageTour = () => {
  const location = useLocation();
  const tour = useShepherdTour({ tourOptions, steps: stepsGuideArticle });
  const updateStatusOfTutorial = useTutorialTakenUpdate();

  useEffect(() => {
    const body = document.querySelector("body");

    const handleTourStart = () => {
      body.style.overflow = "hidden"; // Reapply scroll behavior

      manageOverlay({
        element: document.querySelector(".article-page"),
        overlay: true,
      });
      manageOverlay({
        element: document.querySelector(".navbar"),
        overlay: true,
      });
    };

    const handleTourEnd = () => {
      console.log("handleTourEnd");
      body.style.overflow = "auto";
      const generateQuizButton = document.querySelector(
        ".generate-quiz-button"
      );

      toggleClass({
        element: generateQuizButton,
        className: "highlighted-button-0",
        addClass: false,
      });
      manageOverlay({
        element: document.querySelector(".article-page"),
        overlay: false,
      });
      manageOverlay({
        element: document.querySelector(".navbar"),
        overlay: false,
      });
      //Scroll to the top of the page
      window.scrollTo({ top: 0, behavior: "smooth" });
    };

    const handleTourComplete = () => {
      handleTourEnd();
      updateStatusOfTutorial("articlePage");
      // Additional logic if needed on complete
    };

    const handleTourCancel = () => {
      handleTourEnd();
      updateStatusOfTutorial("articlePage");
      // Additional logic if needed on cancel
    };
    tour.on("start", handleTourStart);
    tour.on("complete", handleTourComplete);
    tour.on("cancel", handleTourCancel);

    return () => {
      tour.off("start", handleTourStart);
      tour.off("complete", handleTourComplete);
      tour.off("cancel", handleTourCancel);
      tour.cancel();
      body.style.overflow = "auto";
      manageOverlay({
        element: document.querySelector(".navbar"),
        overlay: false,
      });
      toggleClass({
        element: document.querySelector(".navbar"),
        className: "shepherd-active",
        addClass: false,
      });
    };
  }, [tour]);

  return { tour, isTutorialTakenCheck };
};

export const useLeaderBoardTour = () => {
  const tour = useShepherdTour({
    tourOptions,
    steps: stepsLeaderBoard,
  });
  const updateStatusOfTutorial = useTutorialTakenUpdate();

  useEffect(() => {
    const body = document.querySelector("body");

    const handleTourStart = () => {
      body.style.overflow = "hidden"; // Reapply scroll behavior
      toggleClass({
        element: document.querySelector(".leaderboard"),
        className: "shepherd-active",
        addClass: true,
      });
      toggleClass({
        element: document.querySelector(".navbar"),
        className: "shepherd-active",
        addClass: true,
      });
      manageOverlay({
        element: document.querySelector(".leaderboard"),
        overlay: true,
      });
      manageOverlay({
        element: document.querySelector(".navbar"),
        overlay: true,
      });
    };

    const handleTourEnd = () => {
      body.style.overflow = "auto";
      toggleClass({
        element: document.querySelector(".navbar"),
        className: "shepherd-active",
        addClass: false,
      });
      toggleClass({
        element: document.querySelector(".leaderboard"),
        className: "shepherd-active",
        addClass: false,
      });

      manageOverlay({
        element: document.querySelector(".leaderboard"),
        overlay: false,
      });
      manageOverlay({
        element: document.querySelector(".navbar"),
        overlay: false,
      });
    };

    const handleTourComplete = () => {
      handleTourEnd();
      updateStatusOfTutorial("leaderBoardPage");
      // Additional logic if needed on complete
    };

    const handleTourCancel = () => {
      handleTourEnd();
      updateStatusOfTutorial("leaderBoardPage");

      // Additional logic if needed on cancel
    };

    tour.on("start", handleTourStart);
    tour.on("complete", handleTourComplete);
    tour.on("cancel", handleTourCancel);

    return () => {
      tour.off("start", handleTourStart);
      tour.off("complete", handleTourComplete);
      tour.off("cancel", handleTourCancel);
      tour.cancel();
      body.style.overflow = "auto";
      manageOverlay({
        element: document.querySelector(".navbar"),
        overlay: false,
      });
      toggleClass({
        element: document.querySelector(".navbar"),
        className: "shepherd-active",
        addClass: false,
      });
    };
  }, [tour]);

  return { tour, isTutorialTakenCheck };
};

export const useProfileTour = () => {
  const tour = useShepherdTour({ tourOptions, steps: stepsTutorialProfile });
  const updateStatusOfTutorial = useTutorialTakenUpdate();

  useEffect(() => {
    const body = document.querySelector("body");

    const handleTourStart = () => {
      body.style.overflow = "hidden"; // Reapply scroll behavior
      toggleClass({
        element: document.querySelector(".profile-info"),
        className: "shepherd-active",
        addClass: true,
      });
      toggleClass({
        element: document.querySelector(".navbar"),
        className: "shepherd-active",
        addClass: true,
      });
      manageOverlay({
        element: document.querySelector(".profile-info"),
        overlay: true,
      });
      manageOverlay({
        element: document.querySelector(".navbar"),
        overlay: true,
      });
    };

    const handleTourEnd = () => {
      body.style.overflow = "auto";
      toggleClass({
        element: document.querySelector(".daily-activity"),
        className: "highlighted-card-1",
        addClass: false,
      });
      toggleClass({
        element: document.querySelector(".navbar"),
        className: "shepherd-active",
        addClass: false,
      });
      toggleClass({
        element: document.querySelector(".left-profile-box"),
        className: "shepherd-active",
        addClass: false,
      });
      toggleClass({
        element: document.querySelector(".iq-bar-graph"),
        className: "shepherd-active",
        addClass: false,
      });
      toggleClass({
        element: document.querySelector(".iq-line-graph"),
        className: "shepherd-active",
        addClass: false,
      });
      toggleClass({
        element: document.querySelector(".solved-quizzes"),
        className: "shepherd-active",
        addClass: false,
      });
      toggleClass({
        element: document.querySelector(".rank-and-society"),
        className: "shepherd-active",
        addClass: false,
      });

      manageOverlay({
        element: document.querySelector(".profile-info"),
        overlay: false,
      });
      manageOverlay({
        element: document.querySelector(".navbar"),
        overlay: false,
      });
    };

    const handleTourComplete = () => {
      handleTourEnd();
      updateStatusOfTutorial("profilePage");
      // Additional logic if needed on complete
    };

    const handleTourCancel = () => {
      handleTourEnd();
      updateStatusOfTutorial("profilePage");
      // Additional logic if needed on cancel
    };

    tour.on("start", handleTourStart);
    tour.on("complete", handleTourComplete);
    tour.on("cancel", handleTourCancel);

    return () => {
      tour.off("start", handleTourStart);
      tour.off("complete", handleTourComplete);
      tour.off("cancel", handleTourCancel);
      tour.cancel();
      body.style.overflow = "auto";
      manageOverlay({
        element: document.querySelector(".navbar"),
        overlay: false,
      });
      toggleClass({
        element: document.querySelector(".navbar"),
        className: "shepherd-active",
        addClass: false,
      });
    };
  }, [tour]);

  return { tour, isTutorialTakenCheck };
};

export const useDailyStreakTour = () => {
  const tour = useShepherdTour({
    tourOptions,
    steps: stepsTutorialDailyStreak,
  });
  const updateStatusOfTutorial = useTutorialTakenUpdate();

  useEffect(() => {
    const timeline = document.querySelector(".timeline-container");
    const navbarContent = document.querySelector(".navbar-content-lg");
    const body = document.querySelector("body");
    const isLargeWindow = window.innerWidth > 992;
    const profile = isLargeWindow
      ? document.querySelector(".profile-dropdown-lg")
      : document.querySelector(".profile-dropdown-base");
    const inboxButton = document.querySelector(".inbox-button-lg");
    const streakButton = document.querySelector(".streak-tracker-lg");
    const hamCategory = isLargeWindow
      ? null
      : document.querySelector(".menu-button");
    const rrIcon = document.querySelector(".navbar-brand");
    const categories = document.querySelector(".categories-container");

    const handleTourStart = () => {
      window.scrollTo({ top: 0, behavior: "smooth" });
      toggleClass({
        element: categories,
        className: "shepherd-active",
        addClass: true,
      });
      toggleClass({
        element: timeline,
        className: "shepherd-active",
        addClass: true,
      });
      isLargeWindow &&
        toggleClass({
          element: navbarContent,
          className: "shepherd-active",
          addClass: true,
        });
      toggleClass({
        element: profile,
        className: "shepherd-active",
        addClass: true,
      });
      toggleClass({
        element: inboxButton,
        className: "shepherd-active",
        addClass: true,
      });
      toggleClass({
        element: streakButton,
        className: "highlighted-card-0-streak",
        addClass: true,
      });
      toggleClass({
        element: hamCategory,
        className: "shepherd-active",
        addClass: true,
      });
      toggleClass({
        element: rrIcon,
        className: "shepherd-active",
        addClass: true,
      });
      body.style.overflow = "hidden"; // Reapply scroll behavior

      manageOverlay({ element: timeline, overlay: true });
      isLargeWindow && manageOverlay({ element: navbarContent, overlay: true });
      manageOverlay({ element: profile, overlay: true });
      manageOverlay({ element: inboxButton, overlay: true });
      manageOverlay({ element: streakButton, overlay: true });
      manageOverlay({ element: hamCategory, overlay: true });
      manageOverlay({ element: rrIcon, overlay: true });
      manageOverlay({ element: categories, overlay: true });
    };

    const handleTourEnd = () => {
      body.style.overflow = "auto";
      toggleClass({
        element: categories,
        className: "shepherd-active",
        addClass: false,
      });
      toggleClass({
        element: timeline,
        className: "shepherd-active",
        addClass: false,
      });
      isLargeWindow &&
        toggleClass({
          element: navbarContent,
          className: "shepherd-active",
          addClass: false,
        });
      toggleClass({
        element: profile,
        className: "shepherd-active",
        addClass: false,
      });
      toggleClass({
        element: inboxButton,
        className: "shepherd-active",
        addClass: false,
      });
      toggleClass({
        element: streakButton,
        className: "highlighted-card-0-streak",
        addClass: false,
      });
      toggleClass({
        element: streakButton,
        className: "highlighted-card-streak",
        addClass: false,
      });
      toggleClass({
        element: hamCategory,
        className: "shepherd-active",
        addClass: false,
      });
      toggleClass({
        element: rrIcon,
        className: "shepherd-active",
        addClass: false,
      });
      toggleClass({
        element: streakButton,
        className: "highlighted-card-streak",
        addClass: false,
      });
      manageOverlay({ element: timeline, overlay: false });
      isLargeWindow &&
        manageOverlay({ element: navbarContent, overlay: false });
      manageOverlay({ element: profile, overlay: false });
      manageOverlay({ element: inboxButton, overlay: false });
      manageOverlay({ element: streakButton, overlay: false });
      manageOverlay({ element: hamCategory, overlay: false });
      manageOverlay({ element: rrIcon, overlay: false });
      manageOverlay({ element: categories, overlay: false });
    };

    const handleTourComplete = () => {
      handleTourEnd();
      updateStatusOfTutorial("dailyStreakPage");
      // Additional logic if needed on complete
    };

    const handleTourCancel = () => {
      handleTourEnd();

      updateStatusOfTutorial("dailyStreakPage");

      // Additional logic if needed on cancel
    };

    tour.on("start", handleTourStart);
    tour.on("complete", handleTourComplete);
    tour.on("cancel", handleTourCancel);

    return () => {
      tour.off("start", handleTourStart);
      tour.off("complete", handleTourComplete);
      tour.off("cancel", handleTourCancel);
      tour.cancel();
      body.style.overflow = "auto";
      manageOverlay({
        element: document.querySelector(".navbar"),
        overlay: false,
      });
      toggleClass({
        element: document.querySelector(".navbar"),
        className: "shepherd-active",
        addClass: false,
      });
    };
  }, [tour]);

  return { tour, isTutorialTakenCheck };
};

export const useQuinBoostTour = () => {
  const quinTour = useShepherdTour({
    tourOptions,
    steps: stepsTutorialQuinBoost,
  });
  const updateStatusOfTutorial = useTutorialTakenUpdate();

  useEffect(() => {
    const body = document.querySelector("body");
    const navbar = document.querySelector(".navbar");

    const handleTourStart = () => {
      const articleContent = document.querySelector(".article-all-content");
      const langBack = document.querySelector(".lang-back-flex");
      const quinBoost = document.querySelector(".quin-boost-tag");

      toggleClass({
        element: articleContent,
        className: "shepherd-active",
        addClass: true,
      });
      toggleClass({
        element: navbar,
        className: "shepherd-active",
        addClass: true,
      });
      toggleClass({
        element: langBack,
        className: "shepherd-active",
        addClass: true,
      });
      toggleClass({
        element: quinBoost,
        className: "shepherd-active",
        addClass: true,
      });
      toggleClass({
        element: quinBoost,
        className: "highlighted-card-0-streak",
        addClass: true,
      });

      body.style.overflow = "hidden"; // Reapply scroll behavior

      manageOverlay({ element: articleContent, overlay: true });
      manageOverlay({ element: navbar, overlay: true });
      manageOverlay({ element: langBack, overlay: true });
      manageOverlay({ element: quinBoost, overlay: true });
    };

    const handleTourEnd = () => {
      const articleContent = document.querySelector(".article-all-content");
      const langBack = document.querySelector(".lang-back-flex");
      const quinBoost = document.querySelector(".quin-boost-tag");

      toggleClass({
        element: articleContent,
        className: "shepherd-active",
        addClass: false,
      });
      toggleClass({
        element: navbar,
        className: "shepherd-active",
        addClass: false,
      });
      toggleClass({
        element: langBack,
        className: "shepherd-active",
        addClass: false,
      });
      toggleClass({
        element: quinBoost,
        className: "shepherd-active",
        addClass: false,
      });
      toggleClass({
        element: quinBoost,
        className: "highlighted-card-0-streak",
        addClass: false,
      });
      toggleClass({
        element: quinBoost,
        className: "quin-boost-tracker-img",
        addClass: false,
      });

      body.style.overflow = "auto";
      manageOverlay({ element: articleContent, overlay: false });
      manageOverlay({ element: navbar, overlay: false });
      manageOverlay({ element: langBack, overlay: false });
      manageOverlay({ element: quinBoost, overlay: false });
    };

    const handleTourComplete = () => {
      handleTourEnd();
      updateStatusOfTutorial("quinBoostPage");
      // Additional logic if needed on complete
    };

    const handleTourCancel = () => {
      handleTourEnd();
      const currentStepId = quinTour.getCurrentStep().id;
      const lastStepId =
        quinTour.options.steps[quinTour.options.steps.length - 1].id;
      if (currentStepId === lastStepId) {
        updateStatusOfTutorial("quinBoostPage");
      }
      // Additional logic if needed on cancel
    };

    const handlePopState = () => {
      if (quinTour.isActive()) {
        handleTourCancel();
      }
    };

    quinTour.on("start", handleTourStart);
    quinTour.on("complete", handleTourComplete);
    quinTour.on("cancel", handleTourCancel);

    return () => {
      quinTour.off("start", handleTourStart);
      quinTour.off("complete", handleTourComplete);
      quinTour.off("cancel", handleTourCancel);
    };
  }, [quinTour]);

  return { quinTour };
};
