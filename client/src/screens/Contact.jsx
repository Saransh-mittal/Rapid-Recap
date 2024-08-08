import { useEffect, useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Box,
  Flex,
  Text,
  Button,
  Input,
  Textarea,
  FormControl,
  FormLabel,
  Link,
} from '@chakra-ui/react'
import { Helmet } from 'react-helmet'
import ButtonGradient from '../assets/svg/ButtonGradient'
import ButtonComponent from '../components/miscellaneous/ButtonComponent'
import Heading from '../components/miscellaneous/HeadingComponent'
import EnvelopeSVG from '../assets/svg/EnvelopeSVG'
import InstagramSVG from '../assets/svg/InstagramSVG'
import LinkedinSVG from '../assets/svg/LinkedinSVG'

const Contact = () => {
  const navigate = useNavigate()
  const buttonRef = useRef(null)
  const [isHovered, setIsHovered] = useState(false)
  const buttonStyle = {
    backgroundColor: isHovered ? '#f9f9f9' : '#6c757d',
    borderColor: isHovered ? '#f9f9f9' : '#6c757d',
    transition: 'all 0.3s ease-in-out',
    color: isHovered ? '#6c757d' : '#f9f9f9',
  }

  useEffect(() => {
    document.title = 'Contact Us - Rapid Recap'
  }, [])

  return (
    <>
      <Helmet>
        <title>Contact Us - Rapid Recap</title>
        <meta
          name="description"
          content="Contact the Rapid Recap team for any inquiries or support. We're here to help you with your questions and feedback."
        />
        <meta
          name="keywords"
          content="Contact, Rapid Recap, Support, Inquiries"
        />
        <meta property="og:title" content="Contact Us - Rapid Recap" />
        <meta
          property="og:description"
          content="Contact the Rapid Recap team for any inquiries or support. We're here to help you with your questions and feedback."
        />
      </Helmet>
      <Flex
        minHeight="77vh"
        mt="4.5rem"
        className="contact-container"
        // width={"50%"}
        justifyContent={'center'}
        alignItems={'center'}
        // flexDirection="row"
      >
        <Flex
          // w="full"
          // px={5}
          my={5}
          flexDirection={{ base: 'column', lg: 'row' }}
          alignItems={'center'}
          justifyContent={'space-between'}
          w={'100%'}
        >
          <Flex w={'100%'} justifyContent={'center'} alignItems={'center'}>
            <Flex
              borderRadius="lg"
              overflow="hidden"
              textColor="white"
              // bgGradient="linear(to-b, #1a1527, #0e0c16 88%, #0e0c16 99%)"
              // boxShadow="0 0 20px rgba(0, 0, 0, 0.5)"
              backgroundColor={'rgba(15, 13, 21, 0.7)'} // Adjust the alpha value (0.8) for transparency
              boxShadow={
                '0px 4px 8px rgba(0, 0, 0, 0.3), 0px 8px 16px rgba(0, 0, 0, 0.3), 0px 12px 24px rgba(0, 0, 0, 0.3)'
              }
              border={'1px solid white'}
              // w={{ base: "40rem", lg: "40rem" }}
              // p={8}
              w={{ base: '40rem', lg: '30rem' }}
            >
              <Flex direction="column" p={6} w={'100%'}>
                {/* <Heading textAlign="center" mb={4}>
                  How can we help?
                </Heading> */}
                <Heading
                  tag={'Contact our team for any query'}
                  title={'How can we help?'}
                />
                {/* <Text textAlign="center" mb={8}>
                  Contact our team for any query
                </Text> */}
                <form
                  id="contactForm"
                  action="https://formspree.io/f/xeqbnpqv"
                  method="POST"
                >
                  <FormControl id="name" mb={3} isRequired>
                    <FormLabel>Name</FormLabel>
                    <Input
                      type="text"
                      name="Name"
                      placeholder="Name"
                      autoComplete="off"
                      // bgColor="#1a1527"
                      borderColor="#6c757d"
                      color="#f9f9f9"
                    />
                  </FormControl>
                  <FormControl id="emailAddress" mb={3} isRequired>
                    <FormLabel>Email Address</FormLabel>
                    <Input
                      type="email"
                      name="Email"
                      placeholder="Email Address"
                      autoComplete="off"
                      // bgColor="#1a1527"
                      borderColor="#6c757d"
                      color="#f9f9f9"
                    />
                  </FormControl>
                  <FormControl id="message" mb={3} isRequired>
                    <FormLabel>Message</FormLabel>
                    <Textarea
                      name="Message"
                      placeholder="Message"
                      autoComplete="off"
                      height="10rem"
                      // bgColor="#1a1527"
                      borderColor="#6c757d"
                      color="#f9f9f9"
                    />
                  </FormControl>
                  <Button
                    type="submit"
                    style={buttonStyle}
                    ref={buttonRef}
                    onMouseEnter={() => setIsHovered(true)}
                    onMouseLeave={() => setIsHovered(false)}
                    size="lg"
                    w="full"
                  >
                    Submit
                  </Button>
                </form>
              </Flex>
            </Flex>
          </Flex>
          <Flex justify="center" align="center" w={{ base: '100%' }}>
            <Box
              borderRadius="lg"
              overflow="hidden"
              textColor="white"
              // bgGradient="linear(to-b, #1a1527, #0e0c16 88%, #0e0c16 99%)"
              // boxShadow="0 0 20px rgba(0, 0, 0, 0.5)"
              backgroundColor={'rgba(15, 13, 21, 0.7)'} // Adjust the alpha value (0.8) for transparency
              boxShadow={
                '0px 4px 8px rgba(0, 0, 0, 0.3), 0px 8px 16px rgba(0, 0, 0, 0.3), 0px 12px 24px rgba(0, 0, 0, 0.3)'
              }
              border={'1px solid white'}
              // w={{ base: "none", md: "40rem" }}
              p={8}
            >
              <Heading title={'Contact Information'} />
              <Text textAlign="center" mb={4} fontSize={'1.2rem'}>
                <EnvelopeSVG
                  style={{ display: 'inline-block', marginRight: '8px' }}
                  fill={'#f9f9f9'}
                  width={'20px'}
                  height={'20px'}
                />
                Email:{' '}
                <Link href="mailto:rapidrecap2k23@gmail.com" color="teal.200">
                  rapidrecap2k23@gmail.com
                </Link>
              </Text>
              <Text textAlign="center" mb={4} fontSize={'1.2rem'}>
                <InstagramSVG
                  style={{ display: 'inline-block', marginRight: '8px' }}
                  fill={'#f9f9f9'}
                  width={'20px'}
                  height={'20px'}
                />
                Instagram:{' '}
                <Link
                  href="https://www.instagram.com/rrapidrecap/"
                  isExternal
                  color="teal.200"
                >
                  @rrapidrecap
                </Link>
              </Text>
              <Text textAlign="center" mb={8} fontSize={'1.2rem'}>
                <LinkedinSVG
                  style={{ display: 'inline-block', marginRight: '8px' }}
                  fill={'#f9f9f9'}
                  width={'20px'}
                  height={'20px'}
                />
                LinkedIn:{' '}
                <Link
                  href="https://www.linkedin.com/company/rrapidrecap/"
                  isExternal
                  color="teal.200"
                >
                  Rapid Recap
                </Link>
              </Text>
              <Flex
                justifyContent={'center'}
                mt={6}
                border={'1px solid white'}
                flexDirection={'column'}
                p={'1rem'}
                borderRadius={'xl'}
              >
                <Text textAlign="center" mb={4} fontSize={'2xl'}>
                  Your feedback helps us improve. Share your thoughts!
                </Text>
                <Flex justifyContent="center" alignItems="center" zIndex={10}>
                  <ButtonGradient />
                  <ButtonComponent
                    onClick={() => {
                      navigate('/contact/feedback')
                    }}
                  >
                    FeedBack
                  </ButtonComponent>
                </Flex>
              </Flex>
              {/* <Box mb={4}>
                <Text mb={2}>Your Name:</Text>
                <Input placeholder="Enter your name" />
              </Box>
              <Box mb={4}>
                <Text mb={2}>Your Email:</Text>
                <Input placeholder="Enter your email" />
              </Box>
              <Box mb={4}>
                <Text mb={2}>Your Feedback:</Text>
                <Textarea placeholder="Enter your feedback" />
              </Box> */}
            </Box>
          </Flex>
        </Flex>
      </Flex>
    </>
  )
}

export default Contact
