import Mavericks_Brain from "/images/Mavericks_Brain.png";
import Explorers_Brain from "/images/Explorers_Brain.png";
import Strivers_Brain from "/images/Strivers_Brain.png";
import Elites_Brain from "/images/Elites_Brain.png";
import Titans_Brain from "/images/Titans_Brain.png";
const CircleAndSocietyData = [
  {
    society: "Titans Society",
    circle: null,
    image: Titans_Brain,
    IQ_Lower: 150,
    IQ_Upper: null,
    boxShadow: "0 0 10px 5px rgba(255, 215, 0, 0.8)",
    textColor: "goldenrod",
    upgradeMsg:
      "Congratulations! You have reached the pinnacle of intellectual achievement. Welcome to the Titans Society, where brilliance knows no bounds. You are a Titan!",
  },
  {
    society: "Mavericks Society",
    circle: "Visionaries Circle",
    image: Mavericks_Brain,
    IQ_Lower: 140,
    IQ_Upper: 150,
    boxShadow: "0 0 10px 5px rgba(255, 100, 0, 0.7)",
    textColor: "darkorange",
    upgradeMsg:
      "Congratulations! You've surpassed all boundaries of conventional thought and soared into the realm of true visionaries. Welcome to the Visionaries Circle, where Mavericks shape the future!",
  },
  {
    society: "Mavericks Society",
    circle: "Pioneers Circle",
    image: Mavericks_Brain,
    IQ_Lower: 130,
    IQ_Upper: 140,
    boxShadow: "0 0 10px 5px rgba(255, 150, 0, 0.5)",
    textColor: "darkorange",
    upgradeMsg:
      "Congratulations! You've now ascended to the second highest echelon of society, joining the esteemed Pioneer Circle. Embrace your Maverick status with pride!",
  },
  {
    society: "Elites Society",
    circle: "Scholars Circle",
    image: Elites_Brain,
    IQ_Lower: 120,
    IQ_Upper: 130,
    boxShadow: "0 0 10px 5px rgba(0, 255, 100, 0.5)",
    textColor: "lightgreen",
    upgradeMsg:
      "Congratulations! You've demonstrated exceptional intellect and earned your place among the scholarly elite. Welcome to the Scholars Circle!",
  },
  {
    society: "Elites Society",
    circle: "Masters Circle",
    image: Elites_Brain,
    IQ_Lower: 110,
    IQ_Upper: 120,
    boxShadow: "0 0 10px 5px rgba(0, 255, 100, 0.5)",
    textColor: "lightgreen",
    upgradeMsg:
      "Congratulations! You've achieved mastery in your intellectual pursuits, earning your rightful place among the esteemed Masters Circle.",
  },
  {
    society: "Strivers Society",
    circle: "Enthusiasts Circle",
    image: Strivers_Brain,
    IQ_Lower: 104,
    IQ_Upper: 110,
    boxShadow: null,
    textColor: "cornflowerblue",
    upgradeMsg:
      "Congratulations! Your enthusiasm and dedication have propelled you to the Enthusiasts Circle. Keep striving for greatness!",
  },
  {
    society: "Strivers Society",
    circle: "Achievers Circle",
    image: Strivers_Brain,
    IQ_Lower: 97,
    IQ_Upper: 104,
    boxShadow: null,
    textColor: "cornflowerblue",
    upgradeMsg:
      "Congratulations! Your hard work and determination have paid off. Welcome to the Achievers Circle!",
  },
  {
    society: "Strivers Society",
    circle: "Progressors Circle",
    image: Strivers_Brain,
    IQ_Lower: 90,
    IQ_Upper: 97,
    boxShadow: null,
    textColor: "cornflowerblue",
    upgradeMsg:
      "Congratulations! Your commitment to progress has led you to the Progressors Circle. Keep pushing boundaries!",
  },
  {
    society: "Explorers Society",
    circle: null,
    image: Explorers_Brain,
    IQ_Lower: 0,
    IQ_Upper: 90,
    boxShadow: null,
    textColor: "white",
    upgradeMsg:
      "Congratulations! You are embarking on an incredible journey of discovery and exploration. Embrace the unknown and welcome to the Explorers Society!",
  },
];

export default CircleAndSocietyData;
