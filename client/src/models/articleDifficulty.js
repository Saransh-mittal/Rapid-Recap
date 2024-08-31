import LightbulbIcon from '../assets/svg/LightbulbIcon'
import SkullIcon from '../assets/svg/SkullIcon'
import StarIcon from '../assets/svg/StarIcon'

export const ARTICLE_DIFFICULTY = {
  EASY: 'easy',
  MEDIUM: 'medium',
  HARD: 'hard',
}

export const ICONS_ARTICLE_DIFFICULTY = {
  [ARTICLE_DIFFICULTY.EASY]: LightbulbIcon,
  [ARTICLE_DIFFICULTY.MEDIUM]: StarIcon,
  [ARTICLE_DIFFICULTY.HARD]: SkullIcon,
}

export const DIFF_COLOR = {
  [ARTICLE_DIFFICULTY.EASY]: 'green',
  [ARTICLE_DIFFICULTY.MEDIUM]: 'yellow',
  [ARTICLE_DIFFICULTY.HARD]: 'red',
}
