import { Box, Flex, Link, Text } from '@chakra-ui/react'
import InstagramSVG from '../../assets/svg/InstagramSVG'
import LinkedinSVG from '../../assets/svg/LinkedinSVG'

const Footer = () => {
  return (
    <Box as="footer" pt={3}>
      <Flex
        as="ul"
        justify="center"
        borderBottom="1px solid"
        borderColor="gray.600"
        pb={3}
        mb={3}
      >
        <Box mr={4}>
          <Link
            href="https://www.instagram.com/rrapidrecap/"
            target="_blank"
            color="#f9f9f9"
            aria-label="Follow us on Instagram"
            title="Follow us on Instagram"
          >
            <InstagramSVG width={'25px'} height={'25px'} fill={'#fff'} />
          </Link>
        </Box>
        <Box mr={4}>
          <Link
            href="https://www.linkedin.com/company/rrapidrecap/"
            target="_blank"
            color="#f9f9f9"
            aria-label="Follow us on LinkedIn"
            title="Follow us on LinkedIn"
          >
            <LinkedinSVG width={'25px'} height={'25px'} fill={'#fff'} />
          </Link>
        </Box>
      </Flex>
      <Text textAlign="center" color="#f9f9f9">
        2024, All rights reserved
      </Text>
    </Box>
  )
}

export default Footer
