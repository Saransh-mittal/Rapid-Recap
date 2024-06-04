import { manageOverlay, toggleClass } from "../../utils/tutorial.utlis";

const stepsTutorialDailyStreak = [
  {
    id: "step-1-dailyStreak",
    attachTo: {
      element: ".streak-tracker-lg",
      on: "bottom",
    },
    title: "Daily Streaks Quest!",
    text: "Keep your streak alive for epic rewards! Every 7th day, your RQM score gets a 1.5x boost. Stay on track and level up! 🌟💪",
    buttons: [
      {
        classes: "shepherd-button-primary",
        text: "Next",
        type: "next",
      },
    ],
    classes: "step-2",
    cancelIcon: {
      enabled: false,
    },
    when: {
      show: () => {
        const isLargeWindow = window.innerWidth > 992;
        const streakButton = document.querySelector(".streak-tracker-lg");
        toggleClass({
          element: streakButton,
          className: "highlighted-card-0-streak",
          addClass: true,
        });
      },
      hide: () => {
        const isLargeWindow = window.innerWidth > 992;
        const streakButton = document.querySelector(".streak-tracker-lg");
        toggleClass({
          element: streakButton,
          className: "highlighted-card-0-streak",
          addClass: false,
        });

        manageOverlay({ element: streakButton, overlay: false });
      },
    },
  },
  {
    id: "step-2-dailyStreak",
    attachTo: {
      element: ".streak-tracker-lg",
      on: "bottom",
    },
    title: "Track Your Streak",
    text: "Monitor your streak progress here. Check in daily to keep it going and reap the rewards. Click here to learn more!",
    buttons: [
      {
        classes: "shepherd-button-primary-back",
        text: "Back",
        type: "back",
      },
      {
        classes: "shepherd-button-primary",
        text: "Finish",
        type: "next",
      },
    ],
    classes: "step-2",
    cancelIcon: {
      enabled: false,
    },
    when: {
      show: () => {
        const streakButton = document.querySelector(".streak-tracker-lg");
        streakButton.classList.add("highlighted-card-streak");
        toggleClass({
          element: streakButton,
          className: "highlighted-card-streak",
          addClass: true,
        });

        manageOverlay({ element: streakButton, overlay: false });
      },
      hide: () => {
        const streakButton = document.querySelector(".streak-tracker-lg");
        toggleClass({
          element: streakButton,
          className: "highlighted-card-streak",
          addClass: false,
        });
      },
    },
  },
];

export default stepsTutorialDailyStreak;
