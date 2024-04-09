const stepsLeaderBoard = [
  {
    id: "introduction",
    attachTo: { element: ".leaderboard", on: "bottom" },
    title: "Welcome to Leaderboard",
    text: "This is where the champions stand out! Click 'Next' to explore more.",
    buttons: [{ text: "Next", type: "next" }],
    classes: "custom-class-name-1",
    cancelIcon: {
      enabled: false,
    },
  },
  {
    id: "exploring-table",
    attachTo: { element: ".mainBoard", on: "top" },
    title: "Exploring the Leaderboard Table",
    text: "Here you can see the details of the top performers like IQ score, Rank, Quiz Submissions and Avg RQM score. Take a look and understand the columns.",
    buttons: [
      { text: "Back", type: "back" },
      { text: "Next", type: "next" },
    ],
    classes: "custom-class-name-2",
    cancelIcon: {
      enabled: false,
    },
    when: {
      show: () => {
        const mainBoard = document.querySelector(".mainBoard");
        // console.log(mainBoard);
        mainBoard.classList.add("highlighted-card-1");
        document
          .querySelector(".leaderboard")
          ?.classList.remove("shepherd-active");
      },
      hide: () => {
        document
          .querySelector(".leaderboard")
          ?.classList.add("shepherd-active");
        const mainBoard = document.querySelector(".mainBoard");
        mainBoard.classList.remove("highlighted-card-1");
      },
    },
  },
  {
    id: "profiles",
    attachTo: { element: ".mainBoard", on: "top" },
    title: "Understanding Leaderboard Entries",
    text: "Each row represents a user with their respective stats. You can see profiles of other players by clicking on that row.",
    buttons: [
      { text: "Back", type: "back" },
      { text: "Next", type: "next" },
    ],
    classes: "custom-class-name-2",
    cancelIcon: {
      enabled: false,
    },
    when: {
      show: () => {
        const mainBoard = document.querySelector(".mainBoard");
        // console.log(mainBoard);
        mainBoard.classList.add("highlighted-card-1");
        const img = document.createElement("img");
        img.src = "../../images/arrow1.png"; // Replace with your image path
        img.alt = "Hand Click Sign";
        img.classList.add("hand-click-img-leaderboard");
        mainBoard.appendChild(img);

        document
          .querySelector(".mainBoard")
          ?.classList.remove("shepherd-active");
      },
      hide: () => {
        const mainBoard = document.querySelector(".mainBoard");
        mainBoard.classList.remove("highlighted-card-1");
        const img = document.querySelector(".hand-click-img-leaderboard");
        if (img) {
          img.remove();
        }
      },
    },
  },
  {
    id: "understanding-entry",
    title: "End of Tour",
    text: "Here you can see the details of the top performers.  Click 'Exit' to end the tour.",
    buttons: [
      { text: "Back", type: "back" },
      { text: "Exit", type: "cancel" },
    ],
    classes: "custom-class-name-2",
    cancelIcon: {
      enabled: false,
    },
  },
];

const tourOptions = {
  defaultStepOptions: {
    cancelIcon: {
      enabled: true,
    },
  },
  useModalOverlay: true,
};

export default stepsLeaderBoard;
export { tourOptions };
