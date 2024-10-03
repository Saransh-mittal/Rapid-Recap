import CrownSVG from '../assets/svg/CrownSVG'
import TrophySVG from '../assets/svg/TrophySVG'
import Medal from '../assets/svg/Medal'

export const badgeConfig = {
  RANK_1: {
    image: '/images/rank_1.webp',
    style: {
      background: 'linear-gradient(135deg, #FFD700, #FFA500)',
      color: '#000000',
      textShadow: '0 0 5px rgba(255, 255, 255, 0.5)',
      boxShadow: '0 0 10px rgba(255, 215, 0, 0.5)',
    },
    icon: CrownSVG,
    sizeValues: {
      base: {
        width: '40px',
        height: '40px',
        fontSize: '8px',
        textPosition: { x: -52, y: 160, bottom: '15%' },
      },
      sm: {
        width: '50px',
        height: '50px',
        fontSize: '9px',
        textPosition: { x: -52, y: 170, bottom: '15%' },
      },
      md: {
        width: '60px',
        height: '60px',
        fontSize: '11px',
        textPosition: { x: -52, y: 185, bottom: '15%' },
      },
      lg: {
        width: '80px',
        height: '80px',
        fontSize: '12px',
        textPosition: { x: -52, y: 200, bottom: '15%' },
      },
    },
  },
  RANK_2: {
    image: '/images/rank_2.webp',
    style: {
      background: 'linear-gradient(135deg, #C0C0C0, #A9A9A9)',
      color: '#000000',
      textShadow: '0 0 5px rgba(255, 255, 255, 0.5)',
      boxShadow: '0 0 10px rgba(192, 192, 192, 0.5)',
    },
    icon: TrophySVG,
    sizeValues: {
      base: {
        width: '40px',
        height: '40px',
        fontSize: '8px',
        textPosition: { x: -52, y: 160, bottom: '12%' },
      },
      sm: {
        width: '50px',
        height: '50px',
        fontSize: '9px',
        textPosition: { x: -52, y: 170, bottom: '12%' },
      },
      md: {
        width: '60px',
        height: '60px',
        fontSize: '11px',
        textPosition: { x: -52, y: 185, bottom: '12%' },
      },
      lg: {
        width: '80px',
        height: '80px',
        fontSize: '12px',
        textPosition: { x: -52, y: 200, bottom: '12%' },
      },
    },
  },
  RANK_3: {
    image: '/images/rank_3.webp',
    icon: Medal,
    sizeValues: {
      base: {
        width: '40px',
        height: '40px',
        fontSize: '8px',
        textPosition: { x: -52, y: 160, bottom: '18%' },
      },
      sm: {
        width: '50px',
        height: '50px',
        fontSize: '9px',
        textPosition: { x: -52, y: 170, bottom: '10%' },
      },
      md: {
        width: '60px',
        height: '60px',
        fontSize: '11px',
        textPosition: { x: -52, y: 185, bottom: '18%' },
      },
      lg: {
        width: '80px',
        height: '80px',
        fontSize: '12px',
        textPosition: { x: -52, y: 200, bottom: '18%' },
      },
    },
  },
  TOP_5: {
    image: '/images/top5.webp',
    style: {
      background: 'linear-gradient(135deg, #FFD700, #FFA500)',
      color: '#000000',
      textShadow: '0 0 5px rgba(255, 255, 255, 0.5)',
      boxShadow: '0 0 10px rgba(255, 215, 0, 0.5)',
    },
    icon: Medal,
    sizeValues: {
      base: {
        width: '40px',
        height: '40px',
        fontSize: '8px',
        textPosition: { x: -52, y: 70, bottom: '18%' },
      },
      sm: {
        width: '50px',
        height: '50px',
        fontSize: '9px',
        textPosition: { x: -52, y: 75, bottom: '18%' },
      },
      md: {
        width: '60px',
        height: '70px',
        fontSize: '11px',
        textPosition: { x: -52, y: 85, bottom: '18%' },
      },
      lg: {
        width: '80px',
        height: '80px',
        fontSize: '12px',
        textPosition: { x: -52, y: 95, bottom: '18%' },
      },
    },
  },
  TOP_10: {
    image: '/images/top10.webp',
    style: {
      background: 'linear-gradient(135deg, #FFD700, #FFA500)',
      color: '#000000',
      textShadow: '0 0 5px rgba(255, 255, 255, 0.5)',
      boxShadow: '0 0 10px rgba(255, 215, 0, 0.5)',
    },
    icon: Medal,
    sizeValues: {
      base: {
        width: '40px',
        height: '40px',
        fontSize: '8px',
        textPosition: { x: -52, y: 70, bottom: '18%' },
      },
      sm: {
        width: '50px',
        height: '50px',
        fontSize: '9px',
        textPosition: { x: -52, y: 75, bottom: '18%' },
      },
      md: {
        width: '60px',
        height: '70px',
        fontSize: '11px',
        textPosition: { x: -52, y: 85, bottom: '18%' },
      },
      lg: {
        width: '80px',
        height: '80px',
        fontSize: '12px',
        textPosition: { x: -52, y: 95, bottom: '18%' },
      },
    },
  },
  TOP_25: {
    image: '/images/top25.webp',
    style: {
      background: 'linear-gradient(135deg, #FFD700, #FFA500)',
      color: '#000000',
      textShadow: '0 0 5px rgba(255, 255, 255, 0.5)',
      boxShadow: '0 0 10px rgba(255, 215, 0, 0.5)',
    },
    icon: Medal,
    sizeValues: {
      base: {
        width: '40px',
        height: '40px',
        fontSize: '8px',
        textPosition: { x: -52, y: 70, bottom: '18%' },
      },
      sm: {
        width: '60px',
        height: '60px',
        fontSize: '9px',
        textPosition: { x: -52, y: 75, bottom: '0' },
        mr: -1,
      },
      md: {
        width: '70px',
        height: '70px',
        fontSize: '11px',
        textPosition: { x: -52, y: 85, bottom: '0%' },
        mr: -1,
      },
      lg: {
        width: '80px',
        height: '80px',
        fontSize: '12px',
        textPosition: { x: -52, y: 95, bottom: '5%' },
      },
    },
  },
  QUIZ_WARRIOR: {
    image: '/images/quizWarrior.webp',
    style: {
      background: 'linear-gradient(135deg, #B0C4DE, #4682B4)',
      color: '#000000',
      textShadow: '0 0 5px rgba(255, 255, 255, 0.5)',
      boxShadow: '0 0 10px rgba(176, 196, 222, 0.5)',
    },
    sizeValues: {
      base: {
        width: '40px',
        height: '40px',
        fontSize: '8px',
        textPosition: { x: -52, y: 85, bottom: '18%' },
      },
      sm: {
        width: '60px',
        height: '60px',
        fontSize: '9px',
        textPosition: { x: -52, y: 95, bottom: '15%' },
        mr: -1,
      },
      md: {
        width: '70px',
        height: '70px',
        fontSize: '11px',
        textPosition: { x: -52, y: 105, bottom: '18%' },
        mr: -1,
      },
      lg: {
        width: '80px',
        height: '80px',
        fontSize: '12px',
        textPosition: { x: -52, y: 115, bottom: '18%' },
      },
    },
  },
  ACE: {
    image: '/images/ace_category.webp',
    style: {
      background: 'linear-gradient(135deg, #FFD700, #FFA500)',
      color: '#000000',
      textShadow: '0 0 5px rgba(255, 255, 255, 0.5)',
      boxShadow: '0 0 10px rgba(255, 215, 0, 0.5)',
    },
    sizeValues: {
      base: {
        width: '40px',
        height: '40px',
        fontSize: '8px',
        textPosition: { x: -52, y: 110, bottom: '18%' },
      },
      sm: {
        width: '50px',
        height: '50px',
        fontSize: '9px',
        textPosition: { x: -52, y: 120, bottom: '18%' },
      },
      md: {
        width: '60px',
        height: '60px',
        fontSize: '11px',
        textPosition: { x: -52, y: 130, bottom: '27%' },
      },
      lg: {
        width: '80px',
        height: '80px',
        fontSize: '12px',
        textPosition: { x: -52, y: 140, bottom: '25%' },
      },
    },
  },
  PRO: {
    image: '/images/pro_category.webp',
    style: {
      background: 'linear-gradient(135deg, #C0C0C0, #A9A9A9)',
      color: '#000000',
      textShadow: '0 0 5px rgba(255, 255, 255, 0.5)',
      boxShadow: '0 0 10px rgba(192, 192, 192, 0.5)',
    },
    sizeValues: {
      base: {
        width: '40px',
        height: '40px',
        fontSize: '8px',
        textPosition: { x: -52, y: 110, bottom: '18%' },
      },
      sm: {
        width: '50px',
        height: '50px',
        fontSize: '9px',
        textPosition: { x: -52, y: 120, bottom: '18%' },
      },
      md: {
        width: '55px',
        height: '55px',
        fontSize: '11px',
        textPosition: { x: -52, y: 130, bottom: '25%' },
      },
      lg: {
        width: '80px',
        height: '80px',
        fontSize: '12px',
        textPosition: { x: -52, y: 140, bottom: '18%' },
      },
    },
  },
  CHAMP: {
    image: '/images/champ_category.webp',
    style: {
      background: 'linear-gradient(135deg, #CD7F32, #B8860B)',
      color: '#FFFFFF',
      textShadow: '0 0 5px rgba(0, 0, 0, 0.5)',
      boxShadow: '0 0 10px rgba(205, 127, 50, 0.5)',
    },
    sizeValues: {
      base: {
        width: '40px',
        height: '40px',
        fontSize: '8px',
        textPosition: { x: -52, y: 110, bottom: '18%' },
      },
      sm: {
        width: '60px',
        height: '50px',
        fontSize: '9px',
        textPosition: { x: -52, y: 120, bottom: '18%' },
        mr: -1,
      },
      md: {
        width: '70px',
        height: '60px',
        fontSize: '11px',
        textPosition: { x: -52, y: 130, bottom: '27%' },
        mr: -1,
      },
      lg: {
        width: '80px',
        height: '80px',
        fontSize: '12px',
        textPosition: { x: -52, y: 140, bottom: '18%' },
      },
    },
  },
}
