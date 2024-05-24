const stepsTutorialQuinBoost = [
  {
    id: "intro-> step1",
    attachTo: { element: ".timeline-container" },
    beforeShowPromise: function () {
      return new Promise(function (resolve) {
        setTimeout(function () {
          window.scrollTo(0, 0);
          resolve();
        }, 500);
      });
    },
    buttons: [
      {
        classes: "shepherd-button-primary",
        text: "Next",
        type: "next",
      },
    ],
    classes: "custom-class-name-1 custom-class-name-2",
    highlightClass: "highlight",
    scrollTo: false,
    cancelIcon: {
      enabled: false,
    },
    title: "Introducing Quin Boost",
    text: [
      "Complete 5 quizzes and earn a Quin Boost! This 1.5x multiplier will be awarded for the next quiz you complete, but remember, it's valid for a single day only. Make the most of your boosts to climb the leaderboards!",
    ],
  },
  {
    id: "quin_boost_tracker",
    attachTo: { element: ".quin-boost-tracker", on: "top" },
    title: "Track Your Quin Boost",
    text: "Here, you can see your progress towards earning a Quin Boost. Complete 5 quizzes to activate the boost and maximize your rewards.",
    buttons: [
      {
        classes: "shepherd-button-primary-back",
        text: "Back",
        type: "back",
      },
      {
        classes: "shepherd-button-primary",
        text: "Next",
        type: "next",
      },
    ],
    classes: "custom-class-name-1 custom-class-name-2",
    cancelIcon: {
      enabled: false,
    },
    // when: {
    //   show: () => {
    //     const trackerElement = document.querySelector(".quin-boost-tracker");
    //     if (trackerElement) {
    //       trackerElement.classList.add("highlighted-quin-boost-tracker");

    //       trackerElement.scrollIntoView({
    //         behavior: "smooth",
    //         block: "center",
    //       });

    //       const img = document.createElement("img");
    //       img.src = "../../../images/click.png"; // Replace with your image path
    //       img.alt = "Hand Click Sign";
    //       img.classList.add("hand-click-img");
    //       trackerElement.appendChild(img);
    //     }
    //   },
    //   hide: () => {
    //     const trackerElement = document.querySelector(".quin-boost-tracker");
    //     trackerElement.classList.remove("highlighted-quin-boost-tracker");
    //     const img = document.querySelector(".hand-click-img");
    //     if (img) {
    //       img.remove();
    //     }
    //   },
    // },
  },
  {
    id: "use_quin_boost",
    attachTo: { element: ".quiz-card", on: "top" },
    title: "Using Your Quin Boost",
    text: "Your Quin Boost will be active on 6th quiz! Complete that quiz within a day to benefit from the 1.5x multiplier. Keep an eye on the time to make the most of it.",
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
    classes: "custom-class-name-1 custom-class-name-2",
    cancelIcon: {
      enabled: false,
    },
    // when: {
    //   show: () => {
    //     const quizCard = document.querySelector(".quiz-card");
    //     if (quizCard) {
    //       quizCard.classList.add("highlighted-quiz-card");

    //       quizCard.scrollIntoView({
    //         behavior: "smooth",
    //         block: "center",
    //       });

    //       const img = document.createElement("img");
    //       img.src = "../../../images/click.png"; // Replace with your image path
    //       img.alt = "Hand Click Sign";
    //       img.classList.add("hand-click-img");
    //       quizCard.appendChild(img);
    //     }
    //   },
    //   hide: () => {
    //     const quizCard = document.querySelector(".quiz-card");
    //     quizCard.classList.remove("highlighted-quiz-card");
    //     const img = document.querySelector(".hand-click-img");
    //     if (img) {
    //       img.remove();
    //     }
    //   },
    // },
  },
  // Add more steps if needed
];

export default stepsTutorialQuinBoost;
