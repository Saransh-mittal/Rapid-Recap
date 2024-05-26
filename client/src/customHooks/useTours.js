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
const tourOptions = {
  defaultStepOptions: {
    cancelIcon: {
      enabled: true,
    },
  },
  useModalOverlay: true,
};
export const useHomeTour = () => {
  const tour = useShepherdTour({ tourOptions, steps: stepsTutorialHome });
  const updateStatusOfTutorial = useTutorialTakenUpdate();
  useEffect(() => {
    const timeline = document.querySelector(".timeline");
    const nav = document.querySelector(".navbar");
    const body = document.querySelector("body");
    const handleTourStart = () => {
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

    const handleTourComplete = () => {
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

      updateStatusOfTutorial("homePage");

      //isTutorialTakenUpdate("homePage");
    };

    const handleTourCancel = () => {
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

      updateStatusOfTutorial("homePage");

      //isTutorialTakenUpdate("homePage");
    };

    tour.on("start", handleTourStart);
    tour.on("complete", handleTourComplete);
    tour.on("cancel", handleTourCancel);

    return () => {
      tour.off("start", handleTourStart);
      tour.off("complete", handleTourComplete);
      tour.off("cancel", handleTourCancel);
    };
  }, [tour]);

  return { tour, isTutorialTakenCheck };
};

export const useArticlePageTour = () => {
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

    const handleTourComplete = () => {
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
      updateStatusOfTutorial("articlePage");
    };

    const handleTourCancel = () => {
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
      updateStatusOfTutorial("articlePage");
    };

    tour.on("start", handleTourStart);
    tour.on("complete", handleTourComplete);
    tour.on("cancel", handleTourCancel);

    return () => {
      tour.off("start", handleTourStart);
      tour.off("complete", handleTourComplete);
      tour.off("cancel", handleTourCancel);
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

    const handleTourComplete = () => {
      body.style.overflow = "auto";
      const navbar = document.querySelector(".navbar");
      navbar.classList.remove("shepherd-active");
      toggleClass({
        element: document.querySelector(".navbar"),
        className: "shepherd-active",
        addClass: false,
      });
      toggleClass({
        element: querySelector(".leaderboard"),
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

      updateStatusOfTutorial("leaderBoardPage");
    };

    const handleTourCancel = () => {
      body.style.overflow = "auto";
      const navbar = document.querySelector(".navbar");
      navbar.classList.remove("shepherd-active");
      toggleClass({
        element: document.querySelector(".navbar"),
        className: "shepherd-active",
        addClass: false,
      });
      toggleClass({
        element: querySelector(".leaderboard"),
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

      updateStatusOfTutorial("leaderBoardPage");
    };

    tour.on("start", handleTourStart);
    tour.on("complete", handleTourComplete);
    tour.on("cancel", handleTourCancel);

    return () => {
      tour.off("start", handleTourStart);
      tour.off("complete", handleTourComplete);
      tour.off("cancel", handleTourCancel);
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

    const handleTourComplete = () => {
      body.style.overflow = "auto";
      // const dailyAct = document.querySelector(".daily-activity");
      // if (dailyAct) {
      //   dailyAct.classList.remove("highlighted-card-1");
      // }
      toggleClass({
        element: document.querySelector(".daily-activity"),
        className: "highlighted-card-1",
        addClass: false,
      });
      // const navbar = document.querySelector(".navbar");
      // navbar.classList.remove("shepherd-active");
      toggleClass({
        element: document.querySelector(".navbar"),
        className: "shepherd-active",
        addClass: false,
      });
      // const leftProfileBox = document.querySelector(".left-profile-box");
      // leftProfileBox.classList.remove("shepherd-active");
      toggleClass({
        element: document.querySelector(".left-profile-box"),
        className: "shepherd-active",
        addClass: false,
      });
      const iqBarGraph = document.querySelector(".iq-bar-graph");
      const iqlineGraph = document.querySelector(".iq-line-graph");
      const solvedQuizzes = document.querySelector(".solved-quizzes");
      const rankAndSociety = document.querySelector(".rank-and-society");
      toggleClass({
        element: iqBarGraph,
        className: "shepherd-active",
        addClass: false,
      });
      toggleClass({
        element: iqlineGraph,
        className: "shepherd-active",
        addClass: false,
      });
      toggleClass({
        element: solvedQuizzes,
        className: "shepherd-active",
        addClass: false,
      });
      toggleClass({
        element: rankAndSociety,
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
      updateStatusOfTutorial("profilePage");
    };

    const handleTourCancel = () => {
      body.style.overflow = "auto";
      // const dailyAct = document.querySelector(".daily-activity");
      // if (dailyAct) {
      //   dailyAct.classList.remove("highlighted-card-1");
      // }
      toggleClass({
        element: document.querySelector(".daily-activity"),
        className: "highlighted-card-1",
        addClass: false,
      });
      // const navbar = document.querySelector(".navbar");
      // navbar.classList.remove("shepherd-active");
      toggleClass({
        element: document.querySelector(".navbar"),
        className: "shepherd-active",
        addClass: false,
      });
      // const leftProfileBox = document.querySelector(".left-profile-box");
      // leftProfileBox.classList.remove("shepherd-active");
      toggleClass({
        element: document.querySelector(".left-profile-box"),
        className: "shepherd-active",
        addClass: false,
      });
      const iqBarGraph = document.querySelector(".iq-bar-graph");
      const iqlineGraph = document.querySelector(".iq-line-graph");
      const solvedQuizzes = document.querySelector(".solved-quizzes");
      const rankAndSociety = document.querySelector(".rank-and-society");
      toggleClass({
        element: iqBarGraph,
        className: "shepherd-active",
        addClass: false,
      });
      toggleClass({
        element: iqlineGraph,
        className: "shepherd-active",
        addClass: false,
      });
      toggleClass({
        element: solvedQuizzes,
        className: "shepherd-active",
        addClass: false,
      });
      toggleClass({
        element: rankAndSociety,
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
      updateStatusOfTutorial("profilePage");
    };

    tour.on("start", handleTourStart);
    tour.on("complete", handleTourComplete);
    tour.on("cancel", handleTourCancel);

    return () => {
      tour.off("start", handleTourStart);
      tour.off("complete", handleTourComplete);
      tour.off("cancel", handleTourCancel);
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
    const inboxButton = document.querySelector(
      isLargeWindow ? ".inbox-button-lg" : ".inbox-button-base"
    );
    const streakButton = document.querySelector(
      isLargeWindow ? ".streak-tracker-lg" : ".streak-tracker-base"
    );
    const hamCategory = isLargeWindow
      ? null
      : document.querySelector(".menu-button");

    const rrIcon = document.querySelector(".navbar-brand");

    const handleTourStart = () => {
      window.scrollTo({ top: 0, behavior: "smooth" });
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
    };

    const handleTourComplete = () => {
      body.style.overflow = "auto";
      const isLargeWindow = window.innerWidth > 992;
      const streakButton = document.querySelector(
        isLargeWindow ? ".streak-tracker-lg" : ".streak-tracker-base"
      );
      toggleClass({
        element: timeline,
        className: "shepherd-active",
        addClass: false,
      });
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
      manageOverlay({ element: timeline, overlay: false });
      manageOverlay({ element: navbarContent, overlay: false });
      manageOverlay({ element: profile, overlay: false });
      manageOverlay({ element: inboxButton, overlay: false });
      manageOverlay({ element: streakButton, overlay: false });
      manageOverlay({ element: hamCategory, overlay: false });
      manageOverlay({ element: rrIcon, overlay: false });
      updateStatusOfTutorial("dailyStreakPage");
    };

    tour.on("start", handleTourStart);
    tour.on("complete", handleTourComplete);

    return () => {
      tour.off("start", handleTourStart);
      tour.off("complete", handleTourComplete);
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
      const articleContent = document.querySelector(".article-content-all");
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

    const handleTourComplete = () => {
      const articleContent = document.querySelector(".article-content-all");
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
      updateStatusOfTutorial("quinBoostPage");
    };

    quinTour.on("start", handleTourStart);
    quinTour.on("complete", handleTourComplete);

    return () => {
      quinTour.off("start", handleTourStart);
      quinTour.off("complete", handleTourComplete);
    };
  }, [quinTour]);

  return { quinTour };
};
