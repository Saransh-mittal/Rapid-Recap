const stepsTutorialHome = [
  {
    id: "step1",
    attachTo: { element: ".article-container", on: "right" },
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
    classes: "step-1",
    highlightClass: "highlight",
    scrollTo: false,
    cancelIcon: {
      enabled: false,
    },
    title: "Explore the Article",
    text: [
      "Take some time to read through the article and understand its content.",
    ],
    when: {
      show: () => {
        const generateQuizButton = document.querySelector(".article-container");
        if (generateQuizButton) {
          generateQuizButton.scrollIntoView({
            behavior: "smooth",
            block: "end",
            inline: "nearest",
          });
          generateQuizButton.classList.add("highlighted-article");
        }
      },
      hide: () => {
        const generateQuizButton = document.querySelector(".article-container");
        if (generateQuizButton) {
          generateQuizButton.classList.remove("highlighted-article");
        }
      },
    },
  },
  {
    id: "step2",
    attachTo: { element: ".generate-quiz-button", on: "bottom" },
    title: "Generate Quiz",
    text: "Once you've finished reading the article, click on the 'Generate Quiz' button to create a quiz based on the article content.",
    buttons: [
      {
        classes: "shepherd-button-secondary",
        text: "Back",
        type: "back",
      },
      {
        classes: "shepherd-button-primary",
        text: "Exit",
        type: "cancel",
      },
    ],
    classes: "step-2",
    when: {
      show: () => {
        const generateQuizButton = document.querySelector(
          ".generate-quiz-button"
        );
        if (generateQuizButton) {
          generateQuizButton.scrollIntoView({
            behavior: "smooth",
            block: "end",
            inline: "nearest",
          });
          generateQuizButton.classList.add("highlighted-button-0");
        }
      },
      hide: () => {
        const generateQuizButton = document.querySelector(
          ".generate-quiz-button"
        );
        if (generateQuizButton) {
          generateQuizButton.classList.remove("highlighted-button-0");
        }
      },
    },
  },
  // Additional steps can be added here if needed
];

export default stepsTutorialHome;
