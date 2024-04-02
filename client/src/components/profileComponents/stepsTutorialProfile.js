const stepsTutorialProfile = [
  {
    id: "step1",
    highlightClass: "highlight",
    attachTo: { element: ".profile-info", on: "right" },
    title: "View Profile Info",
    text: "Explore your profile information and settings.",
    buttons: [
      { classes: "shepherd-button-primary", text: "Next", type: "next" },
    ],
    classes: "profile-info-step1",
    scrollTo: false,
    cancelIcon: {
      enabled: false,
    },
  },
  {
    id: "step2",
    attachTo: { element: ".left-profile-box", on: "bottom" },
    title: "Profile Box",
    text: "Review your profile details and update if necessary.",
    buttons: [
      { classes: "shepherd-button-secondary", text: "Back", type: "back" },
      { classes: "shepherd-button-primary", text: "Next", type: "next" },
    ],
    cancelIcon: {
      enabled: false,
    },
    scrollTo: false,
    classes: "profile-info-step2-and-ahead",
    when: {
      show: () => {
        const leftProfileBox = document.querySelector(".left-profile-box");
        const shepherdActive = document.querySelector(".profile-info");
        shepherdActive.classList.remove("shepherd-active");
        const rightProfileBox = document.querySelector(".right-profile-box");
        rightProfileBox.classList.add("shepherd-active");
        if (leftProfileBox) {
          leftProfileBox.scrollIntoView({
            behavior: "smooth",
            block: "end",
            inline: "nearest",
          });
          leftProfileBox.classList.add("highlighted-card-1");
        }
      },
      hide: () => {
        const leftProfileBox = document.querySelector(".left-profile-box");
        if (leftProfileBox) {
          leftProfileBox.classList.remove("highlighted-card-1");
        }
        const shepherdActive = document.querySelector(".profile-info");
        shepherdActive.classList.add("shepherd-active");
        const rightProfileBox = document.querySelector(".right-profile-box");
        rightProfileBox.classList.remove("shepherd-active");
      },
    },
  },
  {
    id: "step3",
    attachTo: { element: ".iq-line-graph", on: "bottom" },
    title: "Information Quotient (IQ) Graph",
    text: "You can view your Information Quotient (IQ) graph calculated on a daily basis.",
    buttons: [
      { classes: "shepherd-button-secondary", text: "Back", type: "back" },
      { classes: "shepherd-button-primary", text: "Next", type: "next" },
    ],
    scrollTo: false,
    cancelIcon: {
      enabled: false,
    },
    classes: "profile-info-step2-and-ahead",
    when: {
      show: () => {
        const iqGraph = document.querySelector(".iq-line-graph");
        const shepherdActive = document.querySelector(".profile-info");
        shepherdActive.classList.remove("shepherd-active");
        const leftProfileBox = document.querySelector(".left-profile-box");
        leftProfileBox.classList.add("shepherd-active");
        const iqBarGraph = document.querySelector(".iq-bar-graph");
        const solvedQuizzes = document.querySelector(".solved-quizzes");
        const rankAndSociety = document.querySelector(".rank-and-society");
        const dailyAct = document.querySelector(".daily-activity");
        solvedQuizzes.classList.add("shepherd-active");
        iqBarGraph.classList.add("shepherd-active");
        rankAndSociety.classList.add("shepherd-active");
        dailyAct.classList.add("shepherd-active");
        if (iqGraph) {
          iqGraph.scrollIntoView({
            behavior: "smooth",
            block: "end",
            inline: "nearest",
          });
          iqGraph.classList.add("highlighted-card-1");
        }
      },
      hide: () => {
        const iqGraph = document.querySelector(".iq-line-graph");
        if (iqGraph) {
          iqGraph.classList.remove("highlighted-card-1");
        }
        const shepherdActive = document.querySelector(".profile-info");
        shepherdActive.classList.add("shepherd-active");
        const leftProfileBox = document.querySelector(".left-profile-box");
        leftProfileBox.classList.remove("shepherd-active");
        const iqBarGraph = document.querySelector(".iq-bar-graph");
        const solvedQuizzes = document.querySelector(".solved-quizzes");
        const rankAndSociety = document.querySelector(".rank-and-society");
        const dailyAct = document.querySelector(".daily-activity");
        iqBarGraph.classList.remove("shepherd-active");
        solvedQuizzes.classList.remove("shepherd-active");
        rankAndSociety.classList.remove("shepherd-active");
        dailyAct.classList.remove("shepherd-active");
      },
    },
  },
  {
    id: "step4",
    attachTo: { element: ".iq-bar-graph", on: "bottom" },
    title: "Top Percentile Bar Graph",
    text: "Discover your position in the top percentile of users.",
    buttons: [
      { classes: "shepherd-button-secondary", text: "Back", type: "back" },
      { classes: "shepherd-button-primary", text: "Next", type: "next" },
    ],
    scrollTo: false,
    cancelIcon: {
      enabled: false,
    },
    classes: "profile-info-step2-and-ahead",
    when: {
      show: () => {
        const iqGraph = document.querySelector(".iq-bar-graph");
        const shepherdActive = document.querySelector(".profile-info");
        shepherdActive.classList.remove("shepherd-active");
        const leftProfileBox = document.querySelector(".left-profile-box");
        leftProfileBox.classList.add("shepherd-active");
        const iqlineGraph = document.querySelector(".iq-line-graph");
        const solvedQuizzes = document.querySelector(".solved-quizzes");
        const rankAndSociety = document.querySelector(".rank-and-society");
        const dailyAct = document.querySelector(".daily-activity");
        solvedQuizzes.classList.add("shepherd-active");
        iqlineGraph.classList.add("shepherd-active");
        rankAndSociety.classList.add("shepherd-active");
        dailyAct.classList.add("shepherd-active");
        if (iqGraph) {
          iqGraph.scrollIntoView({
            behavior: "smooth",
            block: "end",
            inline: "nearest",
          });
          iqGraph.classList.add("highlighted-card-1");
        }
      },
      hide: () => {
        const iqGraph = document.querySelector(".iq-bar-graph");
        if (iqGraph) {
          iqGraph.classList.remove("highlighted-card-1");
        }
        const shepherdActive = document.querySelector(".profile-info");
        shepherdActive.classList.add("shepherd-active");
        const leftProfileBox = document.querySelector(".left-profile-box");
        leftProfileBox.classList.remove("shepherd-active");
        const iqlineGraph = document.querySelector(".iq-line-graph");
        const solvedQuizzes = document.querySelector(".solved-quizzes");
        const rankAndSociety = document.querySelector(".rank-and-society");
        const dailyAct = document.querySelector(".daily-activity");
        iqlineGraph.classList.remove("shepherd-active");
        solvedQuizzes.classList.remove("shepherd-active");
        rankAndSociety.classList.remove("shepherd-active");
        dailyAct.classList.remove("shepherd-active");
      },
    },
  },
  {
    id: "step5",
    attachTo: { element: ".solved-quizzes", on: "bottom" },
    title: "Quizzes Summary",
    text: "See total quizzes solved in each difficulty and percentage of users you surpassed in each.",
    buttons: [
      { classes: "shepherd-button-secondary", text: "Back", type: "back" },
      { classes: "shepherd-button-primary", text: "Next", type: "next" },
    ],
    scrollTo: false,
    cancelIcon: {
      enabled: false,
    },
    classes: "profile-info-step2-and-ahead",
    when: {
      show: () => {
        const solvedQuizzes = document.querySelector(".solved-quizzes");
        const shepherdActive = document.querySelector(".profile-info");
        shepherdActive.classList.remove("shepherd-active");
        const leftProfileBox = document.querySelector(".left-profile-box");
        leftProfileBox.classList.add("shepherd-active");
        const iqBarGraph = document.querySelector(".iq-bar-graph");
        const iqlineGraph = document.querySelector(".iq-line-graph");
        const rankAndSociety = document.querySelector(".rank-and-society");
        const dailyAct = document.querySelector(".daily-activity");
        iqBarGraph.classList.add("shepherd-active");
        iqlineGraph.classList.add("shepherd-active");
        rankAndSociety.classList.add("shepherd-active");
        dailyAct.classList.add("shepherd-active");
        if (solvedQuizzes) {
          solvedQuizzes.scrollIntoView({
            behavior: "smooth",
            block: "end",
            inline: "nearest",
          });
          solvedQuizzes.classList.add("highlighted-card-1");
        }
      },
      hide: () => {
        const solvedQuizzes = document.querySelector(".solved-quizzes");
        if (solvedQuizzes) {
          solvedQuizzes.classList.remove("highlighted-card-1");
        }
        const shepherdActive = document.querySelector(".profile-info");
        shepherdActive.classList.add("shepherd-active");
        const leftProfileBox = document.querySelector(".left-profile-box");
        leftProfileBox.classList.remove("shepherd-active");
        const iqBarGraph = document.querySelector(".iq-bar-graph");
        const iqlineGraph = document.querySelector(".iq-line-graph");

        const rankAndSociety = document.querySelector(".rank-and-society");
        const dailyAct = document.querySelector(".daily-activity");
        iqBarGraph.classList.remove("shepherd-active");
        iqlineGraph.classList.remove("shepherd-active");
        rankAndSociety.classList.remove("shepherd-active");
        dailyAct.classList.remove("shepherd-active");
      },
    },
  },
  {
    id: "step6",
    attachTo: { element: ".rank-and-society", on: "bottom" },
    title: "Society Information",
    text: "Explore your society and circle within the society.",
    buttons: [
      { classes: "shepherd-button-secondary", text: "Back", type: "back" },
      { classes: "shepherd-button-primary", text: "Next", type: "next" },
    ],
    scrollTo: false,
    cancelIcon: {
      enabled: false,
    },
    classes: "profile-info-step2-and-ahead",
    when: {
      show: () => {
        const rankAndSociety = document.querySelector(".rank-and-society");
        const shepherdActive = document.querySelector(".profile-info");
        shepherdActive.classList.remove("shepherd-active");
        const leftProfileBox = document.querySelector(".left-profile-box");
        leftProfileBox.classList.add("shepherd-active");
        const iqBarGraph = document.querySelector(".iq-bar-graph");
        const iqlineGraph = document.querySelector(".iq-line-graph");

        const solvedQuizzes = document.querySelector(".solved-quizzes");
        const dailyAct = document.querySelector(".daily-activity");
        solvedQuizzes.classList.add("shepherd-active");
        iqBarGraph.classList.add("shepherd-active");
        iqlineGraph.classList.add("shepherd-active");
        dailyAct.classList.add("shepherd-active");
        if (rankAndSociety) {
          rankAndSociety.scrollIntoView({
            behavior: "smooth",
            block: "end",
            inline: "nearest",
          });
          rankAndSociety.classList.add("highlighted-card-1");
        }
      },
      hide: () => {
        const rankAndSociety = document.querySelector(".rank-and-society");
        if (rankAndSociety) {
          rankAndSociety.classList.remove("highlighted-card-1");
        }
        const shepherdActive = document.querySelector(".profile-info");
        shepherdActive.classList.add("shepherd-active");
        const leftProfileBox = document.querySelector(".left-profile-box");
        leftProfileBox.classList.remove("shepherd-active");
        const iqBarGraph = document.querySelector(".iq-bar-graph");
        const iqlineGraph = document.querySelector(".iq-line-graph");
        const solvedQuizzes = document.querySelector(".solved-quizzes");

        const dailyAct = document.querySelector(".daily-activity");
        iqBarGraph.classList.remove("shepherd-active");
        iqlineGraph.classList.remove("shepherd-active");
        solvedQuizzes.classList.remove("shepherd-active");
        dailyAct.classList.remove("shepherd-active");
      },
    },
  },
  {
    id: "step7",
    attachTo: { element: ".daily-activity", on: "bottom" },
    title: "Daily Quiz Activity",
    text: "View your daily quiz activity on the calendar.",
    buttons: [
      { classes: "shepherd-button-secondary", text: "Back", type: "back" },
      { classes: "shepherd-button-primary", text: "Exit", type: "cancel" },
    ],
    scrollTo: false,
    classes: "profile-info-step2-and-ahead",
    when: {
      show: () => {
        const dailyAct = document.querySelector(".daily-activity");
        const shepherdActive = document.querySelector(".profile-info");
        shepherdActive.classList.remove("shepherd-active");
        const leftProfileBox = document.querySelector(".left-profile-box");
        leftProfileBox.classList.add("shepherd-active");
        const iqBarGraph = document.querySelector(".iq-bar-graph");
        const iqlineGraph = document.querySelector(".iq-line-graph");
        const rankAndSociety = document.querySelector(".rank-and-society");
        const solvedQuizzes = document.querySelector(".solved-quizzes");

        solvedQuizzes.classList.add("shepherd-active");
        iqBarGraph.classList.add("shepherd-active");
        iqlineGraph.classList.add("shepherd-active");
        rankAndSociety.classList.add("shepherd-active");
        if (dailyAct) {
          dailyAct.scrollIntoView({
            behavior: "smooth",
            block: "end",
            inline: "nearest",
          });
          dailyAct.classList.add("highlighted-card-1");
        }
      },
      hide: () => {
        const dailyAct = document.querySelector(".daily-activity");

        if (dailyAct) {
          dailyAct.classList.remove("highlighted-card-1");
        }
        const shepherdActive = document.querySelector(".profile-info");
        shepherdActive.classList.add("shepherd-active");
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
      },
    },
  },
  // Additional steps can be added here if needed
];

export default stepsTutorialProfile;
