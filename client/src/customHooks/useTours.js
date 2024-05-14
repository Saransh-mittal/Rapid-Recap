import { useEffect } from "react";
import { useShepherdTour } from "react-shepherd";
import stepsTutorialHome from "../components/homeComponents/stepsTutorialHome";
import stepsGuideArticle from "../components/articleComponents/stepsGuideArticle";
import { isTutorialTakenCheck, isTutorialTakenUpdate } from "../utils/tutorial";
import stepsLeaderBoard from "../components/leaderBoardComponents/stepsLeaderBoard";
import stepsTutorialProfile from "../components/profileComponents/stepsTutorialProfile";

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
      isTutorialTakenUpdate("homePage");
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
      isTutorialTakenUpdate("homePage");
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
      isTutorialTakenUpdate("articlePage");
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
      isTutorialTakenUpdate("articlePage");
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
      isTutorialTakenUpdate("leaderBoardPage");
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
      isTutorialTakenUpdate("leaderBoardPage");
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
      isTutorialTakenUpdate("profilePage");
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
      isTutorialTakenUpdate("profilePage");
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
