const stepsTutorialHome = [
  {
    id: "intro",
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
    classes: "custom-class-name-2",
    highlightClass: "highlight",
    scrollTo: false,
    cancelIcon: {
      enabled: false,
    },
    title: "Welcome to Rapid Recap!",
    text: [
      "Stay informed, challenge your mind, and boost your IQ with our app's dynamic news, quizzes, and personalized scores. Join the intelligence revolution!",
    ],
  },
  {
    id: "iq_explanation",
    attachTo: { element: ".timeline-container", on: "bottom" },
    title: "Understanding Your IQ",
    text: "Your IQ isn't just a number; it's a dynamic reflection of your quiz performance, recalibrated daily for precision.",
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
  },
  {
    id: "news_card",
    attachTo: {
      element: ".containers",
      on: window.innerWidth <= 1028 ? "bottom" : "right",
    },
    title: "Explore News",
    text: "Discover insightful news stories! Click on the card to delve into the article, then challenge yourself with a quiz.",
    buttons: [
      {
        classes: "shepherd-button-secondary",
        text: "Exit",
        type: "cancel",
      },
      {
        classes: "shepherd-button-primary-back",
        text: "Back",
        type: "back",
      },
    ],
    classes: "card-guide",
    when: {
      show: () => {
        const cardWrapper = document.querySelector(".timeline-item");
        if (cardWrapper) {
          cardWrapper.classList.add("highlighted-card-0");

          // Scroll the cardWrapper into view with smooth behavior
          cardWrapper.scrollIntoView({
            behavior: "smooth",
            block: "center", // Scroll to center of the viewport
            inline: "nearest", // Scroll to the nearest edge of the viewport
          });

          // If necessary, adjust the scroll position to ensure the element is centered vertically
          const windowHeight = window.innerHeight;
          const cardWrapperRect = cardWrapper.getBoundingClientRect();
          const topOffset = cardWrapperRect.top;
          const newScrollTop =
            window.scrollY +
            topOffset -
            windowHeight / 2 +
            cardWrapperRect.height / 2;

          // Scroll to the new position with smooth behavior
          window.scrollTo({
            top: newScrollTop,
            behavior: "smooth",
          });
          const img = document.createElement("img");
          img.src = "../../../images/click.webp"; // Replace with your image path
          img.alt = "Hand Click Sign";
          img.classList.add("hand-click-img");
          cardWrapper.appendChild(img);
        }
      },
      hide: () => {
        const containers = document.querySelector(".timeline-item");
        containers.classList.remove("highlighted-card-0");
        const img = document.querySelector(".hand-click-img");
        if (img) {
          img.remove();
        }
      },
    },
  },
  // ...
];

export default stepsTutorialHome;
