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
      timeline.classList.add("shepherd-active");
      nav.classList.add("shepherd-active");
      body.style.overflow = "hidden"; // Reapply scroll behavior
      const overlay = document.createElement("div");
      overlay.classList.add("custom-overlay");
      const overlayNav = document.createElement("div");
      overlayNav.classList.add("custom-overlay-nav");
      document.querySelector(".timeline").appendChild(overlay);
      document.querySelector(".navbar").appendChild(overlayNav);
    };

    const handleTourComplete = () => {
      body.style.overflow = "auto";
      timeline.classList.remove("shepherd-active");
      nav.classList.remove("shepherd-active");
      const timelineItem = document.querySelector(".timeline-item");
      if (timelineItem.classList.contains("highlighted-card-0")) {
        timelineItem.classList.remove("highlighted-card-0");
      }
      const overlay = document.querySelector(".custom-overlay");
      if (overlay) overlay.remove();
      const overlayNav = document.querySelector(".custom-overlay-nav");
      if (overlayNav) overlayNav.remove();
      const img = document.querySelector(".hand-click-img");
      if (img) {
        img.remove();
      }

      updateStatusOfTutorial("homePage");

      //isTutorialTakenUpdate("homePage");
    };

    const handleTourCancel = () => {
      body.style.overflow = "auto";
      timeline.classList.remove("shepherd-active");
      nav.classList.remove("shepherd-active");
      const timelineItem = document.querySelector(".timeline-item");
      if (timelineItem.classList.contains("highlighted-card-0")) {
        timelineItem.classList.remove("highlighted-card-0");
      }

      const overlay = document.querySelector(".custom-overlay");
      overlay.remove();
      const overlayNav = document.querySelector(".custom-overlay-nav");
      overlayNav.remove();
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

  useEffect(() => {
    const body = document.querySelector("body");
    const handleTourStart = () => {
      body.style.overflow = "hidden"; // Reapply scroll behavior
      const overlay = document.createElement("div");
      overlay.classList.add("custom-overlay");
      const overlayNav = document.createElement("div");
      overlayNav.classList.add("custom-overlay-nav");
      document.querySelector(".article-page")?.appendChild(overlay);
      document.querySelector(".navbar").appendChild(overlayNav);
    };

    const handleTourComplete = () => {
      body.style.overflow = "auto";
      const generateQuizButton = document.querySelector(
        ".generate-quiz-button"
      );
      if (generateQuizButton) {
        generateQuizButton.classList.remove("highlighted-button-0");
      }
      const overlay = document.querySelector(".custom-overlay");
      if (overlay) overlay.remove();
      const overlayNav = document.querySelector(".custom-overlay-nav");
      if (overlayNav) overlayNav.remove();
      // isTutorialTakenUpdate("articlePage");
    };

    const handleTourCancel = () => {
      body.style.overflow = "auto";
      const generateQuizButton = document.querySelector(
        ".generate-quiz-button"
      );
      if (generateQuizButton) {
        generateQuizButton.classList.remove("highlighted-button-0");
      }

      const overlay = document.querySelector(".custom-overlay");
      if (overlay) overlay.remove();
      const overlayNav = document.querySelector(".custom-overlay-nav");
      if (overlayNav) overlayNav.remove();
      // isTutorialTakenUpdate("articlePage");
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

  useEffect(() => {
    const body = document.querySelector("body");
    const handleTourStart = () => {
      body.style.overflow = "hidden"; // Reapply scroll behavior
      const overlay = document.createElement("div");
      overlay.classList.add("custom-overlay");
      const overlayNav = document.createElement("div");
      overlayNav.classList.add("custom-overlay-nav");
      document.querySelector(".leaderboard")?.appendChild(overlay);
      document.querySelector(".leaderboard")?.classList.add("shepherd-active");
      document.querySelector(".navbar").appendChild(overlayNav);
      document.querySelector(".navbar").classList.add("shepherd-active");
    };

    const handleTourComplete = () => {
      body.style.overflow = "auto";
      const navbar = document.querySelector(".navbar");
      navbar.classList.remove("shepherd-active");

      document
        .querySelector(".leaderboard")
        ?.classList.remove("shepherd-active");
      const overlay = document.querySelector(".custom-overlay");
      if (overlay) overlay.remove();
      const overlayNav = document.querySelector(".custom-overlay-nav");
      if (overlayNav) overlayNav.remove();
      // isTutorialTakenUpdate("leaderBoardPage");
    };

    const handleTourCancel = () => {
      body.style.overflow = "auto";
      const navbar = document.querySelector(".navbar");
      navbar.classList.remove("shepherd-active");
      document
        .querySelector(".leaderboard")
        ?.classList.remove("shepherd-active");
      const overlay = document.querySelector(".custom-overlay");
      if (overlay) overlay.remove();
      const overlayNav = document.querySelector(".custom-overlay-nav");
      if (overlayNav) overlayNav.remove();
      // isTutorialTakenUpdate("leaderBoardPage");
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

  useEffect(() => {
    const body = document.querySelector("body");
    const handleTourStart = () => {
      body.style.overflow = "hidden"; // Reapply scroll behavior
      const overlay = document.createElement("div");
      overlay.classList.add("custom-overlay");
      const overlayNav = document.createElement("div");
      overlayNav.classList.add("custom-overlay-nav");
      document.querySelector(".profile-info")?.appendChild(overlay);
      document.querySelector(".profile-info")?.classList.add("shepherd-active");
      document.querySelector(".navbar").appendChild(overlayNav);
      document.querySelector(".navbar").classList.add("shepherd-active");
    };

    const handleTourComplete = () => {
      body.style.overflow = "auto";
      const dailyAct = document.querySelector(".daily-activity");
      if (dailyAct) {
        dailyAct.classList.remove("highlighted-card-1");
      }
      const navbar = document.querySelector(".navbar");
      navbar.classList.remove("shepherd-active");
      const leftProfileBox = document.querySelector(".left-profile-box");
      leftProfileBox.classList.remove("shepherd-active");
      const iqBarGraph = document.querySelector(".iq-bar-graph");
      const iqlineGraph = document.querySelector(".iq-line-graph");
      const solvedQuizzes = document.querySelector(".solved-quizzes");
      const rankAndSociety = document.querySelector(".rank-and-society");

      iqBarGraph.classList.remove("shepherd-active");
      iqlineGraph.classList.remove("shepherd-active");
      solvedQuizzes.classList.remove("shepherd-active");
      rankAndSociety.classList.remove("shepherd-active");
      const overlay = document.querySelector(".custom-overlay");
      if (overlay) overlay.remove();
      const overlayNav = document.querySelector(".custom-overlay-nav");
      if (overlayNav) overlayNav.remove();
      // isTutorialTakenUpdate("profilePage");
    };

    const handleTourCancel = () => {
      body.style.overflow = "auto";
      const dailyAct = document.querySelector(".daily-activity");
      if (dailyAct) {
        dailyAct.classList.remove("highlighted-card-1");
      }
      const navbar = document.querySelector(".navbar");
      navbar.classList.remove("shepherd-active");
      const leftProfileBox = document.querySelector(".left-profile-box");
      leftProfileBox.classList.remove("shepherd-active");
      const iqBarGraph = document.querySelector(".iq-bar-graph");
      const iqlineGraph = document.querySelector(".iq-line-graph");
      const solvedQuizzes = document.querySelector(".solved-quizzes");
      const rankAndSociety = document.querySelector(".rank-and-society");

      iqBarGraph.classList.remove("shepherd-active");
      iqlineGraph.classList.remove("shepherd-active");
      solvedQuizzes.classList.remove("shepherd-active");
      rankAndSociety.classList.remove("shepherd-active");

      const overlay = document.querySelector(".custom-overlay");
      if (overlay) overlay.remove();
      const overlayNav = document.querySelector(".custom-overlay-nav");
      if (overlayNav) overlayNav.remove();
      // isTutorialTakenUpdate("profilePage");
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
    // const nav = document.querySelector(".navbar");
    // const navList = document.querySelector(".css-156e09s");
    // const navInbox = document.querySelector(".chakra-button css-eywkib");
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
    // tour.on("cancel", handleTourCancel);

    return () => {
      tour.off("start", handleTourStart);
      tour.off("complete", handleTourComplete);
      // tour.off("cancel", handleTourCancel);
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
    //const articlePage = document.querySelector(".article-page");
    //console.log(articlePage);
    const handleTourStart = () => {
      const articleContent = document.querySelector(".article-content-all");
      const langBack = document.querySelector(".lang-back-flex");
      const quinBoost = document.querySelector(".quin-boost-tag");
      // const overlay = document.createElement("div");
      // overlay.classList.add("custom-overlay");;
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

    // const handleTourCancel = () => {
    //   const articleContent = document.querySelector(".article-content-all");
    //   body.style.overflow = "auto";
    //   const generateQuizButton = document.querySelector(
    //     ".generate-quiz-button"
    //   );
    //   if (generateQuizButton) {
    //     generateQuizButton.classList.remove("highlighted-button-0");
    //   }
    //   const overlay = document.querySelector(".custom-overlay");
    //   if (overlay) overlay.remove();
    //   const overlayNav = document.querySelector(".custom-overlay-nav");
    //   if (overlayNav) overlayNav.remove();
    //   // isTutorialTakenUpdate("articlePage");
    // };

    quinTour.on("start", handleTourStart);
    quinTour.on("complete", handleTourComplete);
    // quinTour.on("cancel", handleTourCancel);

    return () => {
      quinTour.off("start", handleTourStart);
      quinTour.off("complete", handleTourComplete);
      // quinTour.off("cancel", handleTourCancel);
    };
  }, [quinTour]);

  return { quinTour };
};
