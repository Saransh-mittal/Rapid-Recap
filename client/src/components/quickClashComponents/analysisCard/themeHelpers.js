/**
 * Helper function to get theme colors based on challenge result
 * @param {boolean} userIsWinner - Whether the user won the challenge
 * @param {boolean} isTie - Whether the challenge ended in a tie
 * @returns {Object} Object containing theme color values
 */
export const getThemeColors = (userIsWinner, isTie) => {
  if (userIsWinner) {
    return {
      primaryColor: 'green.400',
      secondaryColor: 'green.500',
      accentColor: 'green.300',
      gradientStart: 'rgba(72, 187, 120, 0.15)',
      gradientEnd: 'rgba(56, 161, 105, 0.05)',
      borderColor: 'green.500',
      cardBg:
        'linear-gradient(135deg, rgba(26, 32, 44, 0.95) 0%, rgba(23, 43, 35, 0.9) 100%)',
      iconColor: 'green.300',
      commentBg: 'rgba(35, 50, 40, 0.6)',
      commentBorder: 'green.400',
      progressColorScheme: 'green',
      secondaryProgressColorScheme: 'teal',
    }
  } else if (isTie) {
    return {
      primaryColor: 'blue.400',
      secondaryColor: 'blue.500',
      accentColor: 'blue.300',
      gradientStart: 'rgba(66, 153, 225, 0.15)',
      gradientEnd: 'rgba(49, 130, 206, 0.05)',
      borderColor: 'blue.500',
      cardBg:
        'linear-gradient(135deg, rgba(26, 32, 44, 0.95) 0%, rgba(23, 30, 54, 0.9) 100%)',
      iconColor: 'blue.300',
      commentBg: 'rgba(30, 32, 55, 0.6)',
      commentBorder: 'blue.400',
      progressColorScheme: 'blue',
      secondaryProgressColorScheme: 'cyan',
    }
  } else {
    return {
      primaryColor: 'red.400',
      secondaryColor: 'red.500',
      accentColor: 'red.300',
      gradientStart: 'rgba(245, 101, 101, 0.15)',
      gradientEnd: 'rgba(229, 62, 62, 0.05)',
      borderColor: 'red.500',
      cardBg:
        'linear-gradient(135deg, rgba(26, 32, 44, 0.95) 0%, rgba(45, 25, 25, 0.9) 100%)',
      iconColor: 'red.300',
      commentBg: 'rgba(50, 30, 30, 0.6)',
      commentBorder: 'red.400',
      progressColorScheme: 'red',
      secondaryProgressColorScheme: 'orange',
    }
  }
}
