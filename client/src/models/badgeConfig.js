import CrownSVG from '../assets/svg/CrownSVG'
import TrophySVG from '../assets/svg/TrophySVG'
import Medal from '../assets/svg/Medal'
export const badgeConfig = {
  RANK_1: {
    image: '/images/rank_1.webp',
    textPosition: { x: -57, y: 185, bottom: '15%' },
    style: {
      background: 'linear-gradient(135deg, #FFD700, #FFA500)',
      color: '#000000',
      textShadow: '0 0 5px rgba(255, 255, 255, 0.5)',
      boxShadow: '0 0 10px rgba(255, 215, 0, 0.5)',
    },
    icon: CrownSVG,
    sizeValues: {
      base: { width: '40px', height: '40px', fontSize: '8px' },
      sm: { width: '50px', height: '50px', fontSize: '9px' },
      md: { width: '60px', height: '60px', fontSize: '11px' },
      lg: { width: '80px', height: '80px', fontSize: '12px' },
    },
  },
  RANK_2: {
    image: '/images/rank_2.webp',
    textPosition: { x: -50, y: 185, bottom: '12%' },
    style: {
      background: 'linear-gradient(135deg, #C0C0C0, #A9A9A9)',
      color: '#000000',
      textShadow: '0 0 5px rgba(255, 255, 255, 0.5)',
      boxShadow: '0 0 10px rgba(192, 192, 192, 0.5)',
    },
    icon: TrophySVG,
    sizeValues: {
      base: { width: '40px', height: '40px', fontSize: '8px' },
      sm: { width: '50px', height: '50px', fontSize: '9px' },
      md: { width: '60px', height: '60px', fontSize: '11px' },
      lg: { width: '80px', height: '80px', fontSize: '12px' },
    },
  },
  RANK_3: {
    image: '/images/rank_3.webp',
    textPosition: { x: -55, y: 185, bottom: '18%' },
    style: {
      background: 'linear-gradient(135deg, #CD7F32, #B8860B)',
      color: '#FFFFFF',
      textShadow: '0 0 5px rgba(0, 0, 0, 0.5)',
      boxShadow: '0 0 10px rgba(205, 127, 50, 0.5)',
    },
    icon: Medal,
    sizeValues: {
      base: { width: '40px', height: '40px', fontSize: '8px' },
      sm: { width: '50px', height: '50px', fontSize: '9px' },
      md: { width: '60px', height: '60px', fontSize: '11px' },
      lg: { width: '80px', height: '80px', fontSize: '12px' },
    },
  },
  TOP_5: {
    image: '/images/top5.webp',
    textPosition: { x: -55, y: 85, bottom: '18%' },
    style: {
      background: 'linear-gradient(135deg, #FFD700, #FFA500)',
      color: '#000000',
      textShadow: '0 0 5px rgba(255, 255, 255, 0.5)',
      boxShadow: '0 0 10px rgba(255, 215, 0, 0.5)',
    },
    icon: Medal,
    sizeValues: {
      base: { width: '60px', height: '60px', fontSize: '8px' },
      sm: { width: '60px', height: '60px', fontSize: '8px' },
      md: { width: '70px', height: '70px', fontSize: '11px' },
      lg: { width: '80px', height: '80px', fontSize: '12px' },
    },
  },
  TOP_10: {
    image: '/images/top10.webp',
    textPosition: { x: -54, y: 85, bottom: '18%' },
    style: {
      background: 'linear-gradient(135deg, #FFD700, #FFA500)',
      color: '#000000',
      textShadow: '0 0 5px rgba(255, 255, 255, 0.5)',
      boxShadow: '0 0 10px rgba(255, 215, 0, 0.5)',
    },
    icon: Medal,
    sizeValues: {
      base: { width: '60px', height: '60px', fontSize: '8px' },
      sm: { width: '50px', height: '50px', fontSize: '8px' },
      md: { width: '70px', height: '70px', fontSize: '11px' },
      lg: { width: '80px', height: '80px', fontSize: '12px' },
    },
  },
  TOP_25: {
    image: '/images/top25.webp',
    textPosition: { x: -55, y: 85, bottom: '18%' },
    style: {
      background: 'linear-gradient(135deg, #FFD700, #FFA500)',
      color: '#000000',
      textShadow: '0 0 5px rgba(255, 255, 255, 0.5)',
      boxShadow: '0 0 10px rgba(255, 215, 0, 0.5)',
    },
    icon: Medal,
    sizeValues: {
      base: { width: '60px', height: '60px', fontSize: '8px' },
      sm: { width: '60px', height: '60px', fontSize: '8px' },
      md: { width: '70px', height: '70px', fontSize: '11px' },
      lg: { width: '80px', height: '80px', fontSize: '12px' },
    },
  },
  QUIZ_WARRIOR: {
    image: '/images/quizWarrior.webp',
    textPosition: { x: -52, y: 105, bottom: '18%' },
    style: {
      background: 'linear-gradient(135deg, #B0C4DE, #4682B4)',
      color: '#000000',
      textShadow: '0 0 5px rgba(255, 255, 255, 0.5)',
      boxShadow: '0 0 10px rgba(176, 196, 222, 0.5)',
    },
    sizeValues: {
      base: { width: '30px', height: '30px', fontSize: '6px' },
      sm: { width: '55px', height: '55px', fontSize: '10px' },
      md: { width: '70px', height: '70px', fontSize: '11px' },
      lg: { width: '80px', height: '80px', fontSize: '12px' },
    },
  },
  ACE: {
    image: '/images/ace_category.webp',
    textPosition: { x: -52, y: 130, bottom: '18%' },
    style: {
      background: 'linear-gradient(135deg, #FFD700, #FFA500)',
      color: '#000000',
      textShadow: '0 0 5px rgba(255, 255, 255, 0.5)',
      boxShadow: '0 0 10px rgba(255, 215, 0, 0.5)',
    },
    sizeValues: {
      base: { width: '30px', height: '30px', fontSize: '6px' },
      sm: { width: '45px', height: '45px', fontSize: '8px' },
      md: { width: '60px', height: '60px', fontSize: '11px' },
      lg: { width: '80px', height: '80px', fontSize: '12px' },
    },
  },
  PRO: {
    image: '/images/pro_category.webp',
    textPosition: { x: -52, y: 130, bottom: '18%' },
    style: {
      background: 'linear-gradient(135deg, #C0C0C0, #A9A9A9)',
      color: '#000000',
      textShadow: '0 0 5px rgba(255, 255, 255, 0.5)',
      boxShadow: '0 0 10px rgba(192, 192, 192, 0.5)',
    },
    sizeValues: {
      base: { width: '30px', height: '30px', fontSize: '6px' },
      sm: { width: '45px', height: '45px', fontSize: '8px' },
      md: { width: '60px', height: '60px', fontSize: '11px' },
      lg: { width: '80px', height: '80px', fontSize: '12px' },
    },
  },
  CHAMP: {
    image: '/images/champ_category.webp',
    textPosition: { x: -52, y: 130, bottom: '18%' },
    style: {
      background: 'linear-gradient(135deg, #CD7F32, #B8860B)',
      color: '#FFFFFF',
      textShadow: '0 0 5px rgba(0, 0, 0, 0.5)',
      boxShadow: '0 0 10px rgba(205, 127, 50, 0.5)',
    },
    sizeValues: {
      base: { width: '30px', height: '30px', fontSize: '6px' },
      sm: { width: '45px', height: '45px', fontSize: '8px' },
      md: { width: '60px', height: '60px', fontSize: '11px' },
      lg: { width: '80px', height: '80px', fontSize: '12px' },
    },
  },
}
