const stepsTutorialDailyStreak = [
  {
    id: "step-1-dailyStreak",
    attachTo: {
      element:
        window.innerWidth <= 992
          ? ".streak-tracker-base"
          : ".streak-tracker-lg",
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
        const streakButton = document.querySelector(
          isLargeWindow ? ".streak-tracker-lg" : ".streak-tracker-base"
        );
        if (streakButton.classList.contains("highlighted-card-0-streak"))
          return;
        streakButton.classList.add("highlighted-card-0-streak");
      },
      hide: () => {
        const isLargeWindow = window.innerWidth > 992;
        const streakButton = document.querySelector(
          isLargeWindow ? ".streak-tracker-lg" : ".streak-tracker-base"
        );
        streakButton.classList.remove("highlighted-card-0-streak");
        // remove custom overlay child of streakButton
        // console.log(streakButton.children);
        // find div.custom-overlay-nav and remove it
        const customOverlay = streakButton.querySelector(".custom-overlay-nav");
        if (customOverlay) {
          customOverlay.remove();
        }
      },
    },
  },
  {
    id: "step-2-dailyStreak",
    attachTo: {
      element:
        window.innerWidth <= 992
          ? ".streak-tracker-base"
          : ".streak-tracker-lg",
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
        const isLargeWindow = window.innerWidth > 992;
        const streakButton = document.querySelector(
          isLargeWindow ? ".streak-tracker-lg" : ".streak-tracker-base"
        );
        streakButton.classList.add("highlighted-card-streak");
      },
      hide: () => {
        const isLargeWindow = window.innerWidth > 992;
        const streakButton = document.querySelector(
          isLargeWindow ? ".streak-tracker-lg" : ".streak-tracker-base"
        );
        streakButton.classList.remove("highlighted-card-streak");
      },
    },
  },
];

export default stepsTutorialDailyStreak;
