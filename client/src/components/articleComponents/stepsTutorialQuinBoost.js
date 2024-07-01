import { manageOverlay, toggleClass } from "../../utils/tutorial.utlis";

const stepsTutorialQuinBoost = [
  {
    id: "quin_boost_tracker",
    attachTo: { element: ".quin-boost-tracker", on: "top" },
    title: "Power Up Your RQM!!",
    text: "Complete 5 quizzes in one day to power up your Quin Boost. Keep track of your progress with our dynamic tracker and get ready to boost!",
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
    classes: "custom-class-name-3",
    cancelIcon: {
      enabled: false,
    },
    when: {
      show: () => {
        const quinBoost = document.querySelector(".quin-boost-tag");
        toggleClass({
          element: quinBoost,
          className: "highlighted-card-0-streak",
          addClass: true,
        });
      },
      hide: () => {
        const quinBoost = document.querySelector(".quin-boost-tag");
        toggleClass({
          element: quinBoost,
          className: "highlighted-card-0-streak",
          addClass: false,
        });
        // const quinBoost1 = document.querySelector(".quin-boost-tag");
        toggleClass({
          element: quinBoost,
          className: "quin-boost-tracker-img",
          addClass: true,
        });
        manageOverlay({ element: quinBoost, overlay: false });
      },
    },
  },
  {
    id: "use_quin_boost",
    attachTo: { element: ".quin-boost-tracker", on: "top" },
    title: "Unleash Your Quin Boost!",
    text: "Use your charged Quin Boost on the 6th quiz for extra rewards and leaderboard domination. Click here to know more about Quin Boost.",
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
    classes: "custom-class-name-3",
    cancelIcon: {
      enabled: false,
    },
    when: {
      show: () => {
        const quinBoost = document.querySelector(".quin-boost-tag");
        toggleClass({
          element: quinBoost,
          className: "highlighted-card-0-streak",
          addClass: false,
        });
        toggleClass({
          element: quinBoost,
          className: "quin-boost-tracker-img",
          addClass: true,
        });

        manageOverlay({ element: quinBoost, overlay: false });
      },
      hide: () => {
        const quinBoost = document.querySelector(".quin-boost-tag");
        toggleClass({
          element: quinBoost,
          className: "shepherd-active",
          addClass: false,
        });

        toggleClass({
          element: quinBoost,
          className: "quin-boost-tracker-img",
          addClass: false,
        });
        manageOverlay({ element: quinBoost, overlay: true });
      },
    },
  },
  // Add more steps if needed
];

export default stepsTutorialQuinBoost;
