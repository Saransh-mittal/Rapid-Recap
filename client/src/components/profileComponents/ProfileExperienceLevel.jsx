import { Box, Flex, Text, Container } from '@chakra-ui/react'
import Heading from '../miscellaneous/HeadingComponent'

const ProgressBubble = ({ xp, level }) => {
  const calculateProgress = (transitionXp, requiredXP) => {
    return Math.round(100 - (requiredXP / transitionXp) * 100)
  }

  const calculateRequiredXp = (xp, xpBaseAtNextLevel) => {
    return xpBaseAtNextLevel - xp
  }

  const colorInc = 100 / 3

  const xpBaseAtCurrLevel = (level * (level + 1) * 10) / 2
  const xpBaseAtNextLevel = ((level + 1) * (level + 2) * 10) / 2
  const requiredXP = calculateRequiredXp(xp, xpBaseAtNextLevel)
  const percent = calculateProgress(
    xpBaseAtNextLevel - xpBaseAtCurrLevel,
    requiredXP,
  )

  const getClass = () => {
    if (percent < colorInc * 1) return 'red'
    else if (percent < colorInc * 2) return 'orange'
    else return 'green'
  }

  return (
    <Container padding={0}>
      <Flex flexDirection="column" width="100%" h={'100%'} m={0}>
        <Text textAlign="left" color="#9CAFAA" p={0} m={0}>
          Experience
        </Text>
        <Box
          display="flex"
          flexDirection="row"
          justifyContent={'space-between'}
          alignItems="center"
          mt={4}
        >
          <Flex
            justify="space-between"
            align="left"
            width="120px"
            flexDirection="column"
          >
            <Box>
              <Text
                textAlign="center"
                fontSize="16px"
                fontWeight="bold"
                color="blue.600"
                textShadow="0 0 10px blue.500"
                mb={2}
              >
                Next Level: {level + 1}
              </Text>
            </Box>
            <Box className={getClass()} position="relative" mb={4}>
              <Box
                className="progress"
                position="relative"
                borderRadius="50%"
                w="120px"
                h="120px"
                border="5px solid"
                borderColor={
                  getClass() === 'green'
                    ? 'green.400'
                    : getClass() === 'orange'
                    ? 'orange.400'
                    : 'red.400'
                }
                boxShadow={`0 0 20px ${
                  getClass() === 'green'
                    ? 'green.400'
                    : getClass() === 'orange'
                    ? 'orange.400'
                    : 'red.400'
                }`}
                transition="all 1s ease"
              >
                <Box
                  className="inner"
                  position="absolute"
                  overflow="hidden"
                  zIndex="2"
                  borderRadius="50%"
                  w="110px"
                  h="110px"
                  border="5px solid white"
                  transition="all 1s ease"
                >
                  <Box
                    className="percent"
                    position="absolute"
                    top="0"
                    left="0"
                    w="100%"
                    h="100%"
                    fontWeight="bold"
                    textAlign="center"
                    lineHeight="110px"
                    fontSize="40px"
                    color="blue.600"
                    textShadow="0 0 10px blue.500"
                    transition="all 1s ease"
                  >
                    <span>{percent}</span>%
                  </Box>
                  <Box
                    className="water"
                    position="absolute"
                    zIndex="1"
                    w="200%"
                    h="200%"
                    left="-50%"
                    top={`${100 - percent}%`}
                    borderRadius="40%"
                    bg="blue.400"
                    opacity="0.5"
                    animation="spin 10s linear infinite"
                    transition="all 1s ease"
                    boxShadow="0 0 20px blue.300"
                  ></Box>
                </Box>
              </Box>
            </Box>
            <Box textAlign="left">
              <Text
                textAlign="center"
                fontSize="16px"
                fontWeight="bold"
                color="blue.600"
                textShadow="0 0 10px blue.500"
              >
                Current Level: {level}
              </Text>
            </Box>
          </Flex>
          <Flex textAlign={'center'}>
            <Box>
              <Heading
                tag={`Required Level Up xP :`}
                marginBottom="0"
                textTransform="uppercase"
              >
                <span
                  style={{
                    color: 'blue',
                    fontSize: '1.15rem',
                    fontWeight: 'bold',
                  }}
                >
                  {requiredXP}
                </span>
              </Heading>
              <Heading
                tag={`Current XP :`}
                marginBottom="0"
                textTransform="uppercase"
              >
                <span
                  style={{
                    color: 'blue',
                    fontSize: '1.15rem',
                    fontWeight: 'bold',
                  }}
                >
                  {xp}
                </span>
              </Heading>
            </Box>
          </Flex>
        </Box>
      </Flex>
    </Container>
  )
}

export default ProgressBubble
