import { Flex } from '@chakra-ui/react'
import WhyToUseSection from '../components/getStartedComponents/whyToUseSection'
import HeroSection from '../components/getStartedComponents/heroSection'
import CommingSoonSection from '../components/getStartedComponents/commingSoonSection'

const GetStarted = () => {
  return (
    <Flex
      mt={{ base: '4rem', lg: '5rem' }}
      flexDirection={'column'}
      overflow={'hidden'}
      letterSpacing={'2px'}
    >
      <HeroSection />
      <WhyToUseSection />
      <CommingSoonSection />
    </Flex>
  )
}

export default GetStarted
