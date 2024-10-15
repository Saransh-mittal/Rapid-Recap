import Mavericks_Brain from '/images/Mavericks_Brain.webp'
import Explorers_Brain from '/images/Explorers_Brain.webp'
import Strivers_Brain from '/images/Strivers_Brain.webp'
import Elites_Brain from '/images/Elites_Brain.webp'
import Titans_Brain from '/images/Titans_Brain.webp'
const CircleAndSocietyData = [
  {
    society: 'Titans',
    circle: null,
    image: Titans_Brain,
    IQ_Lower: 150,
    IQ_Upper: null,
    boxShadow: '0 0 10px 5px rgba(255, 215, 0, 0.8)',
    textColor: 'goldenrod',
    CircleUpgradeMsg:
      'Congratulations! You have reached the pinnacle of intellectual achievement. Welcome to the Titans Society, where brilliance knows no bounds. You are a Titan!',
  },
  {
    society: 'Mavericks',
    circle: 'Visionaries',
    image: Mavericks_Brain,
    IQ_Lower: 140,
    IQ_Upper: 150,
    boxShadow: '0 0 10px 5px rgba(255, 100, 0, 0.7)',
    textColor: 'darkorange',
    CircleUpgradeMsg:
      "Congratulations! You've surpassed all boundaries of conventional thought and soared into the realm of true visionaries. Welcome to the Visionaries Circle, where Mavericks shape the future!",
    SocietyUpgradeMsg:
      'Congratulations! You have demonstrated exceptional intellect and earned your place among the scholarly elite. Welcome to the Elites Society!',
  },
  {
    society: 'Mavericks',
    circle: 'Pioneers',
    image: Mavericks_Brain,
    IQ_Lower: 130,
    IQ_Upper: 140,
    boxShadow: '0 0 10px 5px rgba(255, 150, 0, 0.5)',
    textColor: 'darkorange',
    CircleUpgradeMsg:
      "Congratulations! You've now ascended to the second highest echelon of society, joining the esteemed Pioneer Circle. Embrace your Maverick status with pride!",
    SocietyUpgradeMsg:
      'Congratulations! You have demonstrated exceptional intellect and earned your place among the scholarly elite. Welcome to the Elites Society!',
  },
  {
    society: 'Elites',
    circle: 'Scholars',
    image: Elites_Brain,
    IQ_Lower: 120,
    IQ_Upper: 130,
    boxShadow: '0 0 10px 5px rgba(0, 255, 100, 0.5)',
    textColor: 'lightgreen',
    CircleUpgradeMsg:
      "Congratulations! You've demonstrated exceptional intellect and earned your place among the scholarly elite. Welcome to the Scholars Circle!",
    SocietyUpgradeMsg:
      'Congratulations! You have demonstrated exceptional intellect and earned your place among the scholarly elite. Welcome to the Elites Society!',
  },
  {
    society: 'Elites',
    circle: 'Masters',
    image: Elites_Brain,
    IQ_Lower: 110,
    IQ_Upper: 120,
    boxShadow: '0 0 10px 5px rgba(0, 255, 100, 0.5)',
    textColor: 'lightgreen',
    CircleUpgradeMsg:
      "Congratulations! You've achieved mastery in your intellectual pursuits, earning your rightful place among the esteemed Masters Circle.",
    SocietyUpgradeMsg:
      'Congratulations! You have demonstrated exceptional intellect and earned your place among the scholarly elite. Welcome to the Elites Society!',
  },
  {
    society: 'Strivers',
    circle: 'Enthusiasts',
    image: Strivers_Brain,
    IQ_Lower: 104,
    IQ_Upper: 110,
    boxShadow: null,
    textColor: 'cornflowerblue',
    CircleUpgradeMsg:
      'Congratulations! Your enthusiasm and dedication have propelled you to the Enthusiasts Circle. Keep striving for greatness!',
    SocietyUpgradeMsg:
      'Congratulations! You have made significant strides in your intellectual journey and have now entered the Strivers Society. Keep pushing boundaries and striving for excellence!',
  },
  {
    society: 'Strivers',
    circle: 'Achievers',
    image: Strivers_Brain,
    IQ_Lower: 97,
    IQ_Upper: 104,
    boxShadow: null,
    textColor: 'cornflowerblue',
    CircleUpgradeMsg:
      'Congratulations! Your hard work and determination have paid off. Welcome to the Achievers Circle!',
    SocietyUpgradeMsg:
      'Congratulations! You have made significant strides in your intellectual journey and have now entered the Strivers Society. Keep pushing boundaries and striving for excellence!',
  },
  {
    society: 'Strivers',
    circle: 'Progressors',
    image: Strivers_Brain,
    IQ_Lower: 90,
    IQ_Upper: 97,
    boxShadow: null,
    textColor: 'cornflowerblue',
    CircleUpgradeMsg:
      'Congratulations! Your commitment to progress has led you to the Progressors Circle. Keep pushing boundaries!',
    SocietyUpgradeMsg:
      'Congratulations! You have made significant strides in your intellectual journey and have now entered the Strivers Society. Keep pushing boundaries and striving for excellence!',
  },
  {
    society: 'Explorers',
    circle: null,
    image: Explorers_Brain,
    IQ_Lower: 0,
    IQ_Upper: 90,
    boxShadow: null,
    textColor: 'white',
    CircleUpgradeMsg:
      'Congratulations! You are embarking on an incredible journey of discovery and exploration. Embrace the unknown and welcome to the Explorers Society!',
    SocietyUpgradeMsg:
      'Congratulations! You are embarking on an incredible journey of discovery and exploration. Embrace the unknown and welcome to the Explorers Society!',
  },
]

export default CircleAndSocietyData
