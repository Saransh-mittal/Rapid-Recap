import React, {
  useEffect,
  useState,
  useRef,
  useMemo,
  useCallback,
  lazy,
  Suspense,
} from 'react'
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
  Spinner,
} from '@chakra-ui/react'
import { Helmet } from 'react-helmet'
import { useTranslation } from 'react-i18next'
import LanguageSwitcher from '../LanguageSwitcher'

// Lazy load heavy or less frequently used components
const ButtonGradient = lazy(() => import('../assets/svg/ButtonGradient'))
const ButtonComponent = lazy(() =>
  import('../components/miscellaneous/ButtonComponent'),
)
const Heading = lazy(() =>
  import('../components/miscellaneous/HeadingComponent'),
)
const EnvelopeSVG = lazy(() => import('../assets/svg/EnvelopeSVG'))
const InstagramSVG = lazy(() => import('../assets/svg/InstagramSVG'))
const LinkedinSVG = lazy(() => import('../assets/svg/LinkedinSVG'))

const Contact = () => {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const buttonRef = useRef(null)
  const [isHovered, setIsHovered] = useState(false)

  const buttonStyle = useMemo(
    () => ({
      backgroundColor: isHovered ? '#f9f9f9' : '#6c757d',
      borderColor: isHovered ? '#f9f9f9' : '#6c757d',
      transition: 'all 0.3s ease-in-out',
      color: isHovered ? '#6c757d' : '#f9f9f9',
    }),
    [isHovered],
  )

  const handleMouseEnter = useCallback(() => setIsHovered(true), [])
  const handleMouseLeave = useCallback(() => setIsHovered(false), [])

  useEffect(() => {
    document.title = t('contact_title')
  }, [t])

  return (
    <>
      <Helmet>
        <title>{t('contact_title')}</title>
        <meta name="description" content={t('contact_help')} />
        <meta
          name="keywords"
          content="Contact, Rapid Recap, Support, Inquiries"
        />
        <meta property="og:title" content={t('contact_title')} />
        <meta property="og:description" content={t('contact_help')} />
      </Helmet>

      <Flex
        minHeight="77vh"
        mt="4.5rem"
        className="contact-container"
        justifyContent={'center'}
        alignItems={'center'}
      >
        <LanguageSwitcher />
        <Flex
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
              backgroundColor={'rgba(15, 13, 21, 0.7)'}
              boxShadow={
                '0px 4px 8px rgba(0, 0, 0, 0.3), 0px 8px 16px rgba(0, 0, 0, 0.3), 0px 12px 24px rgba(0, 0, 0, 0.3)'
              }
              border={'1px solid white'}
              w={{ base: '40rem', lg: '30rem' }}
            >
              <Flex direction="column" p={6} w={'100%'}>
                <Suspense fallback={<Spinner />}>
                  <Heading tag={t('contact_title')} title={t('contact_help')} />
                </Suspense>
                <form
                  id="contactForm"
                  action="https://formspree.io/f/xeqbnpqv"
                  method="POST"
                >
                  <FormControl id="name" mb={3} isRequired>
                    <FormLabel>{t('form_name')}</FormLabel>
                    <Input
                      type="text"
                      name="Name"
                      placeholder={t('form_name')}
                      autoComplete="off"
                      borderColor="#6c757d"
                      color="#f9f9f9"
                    />
                  </FormControl>
                  <FormControl id="emailAddress" mb={3} isRequired>
                    <FormLabel>{t('form_email')}</FormLabel>
                    <Input
                      type="email"
                      name="Email"
                      placeholder={t('form_email')}
                      autoComplete="off"
                      borderColor="#6c757d"
                      color="#f9f9f9"
                    />
                  </FormControl>
                  <FormControl id="message" mb={3} isRequired>
                    <FormLabel>{t('form_message')}</FormLabel>
                    <Textarea
                      name="Message"
                      placeholder={t('form_message')}
                      autoComplete="off"
                      height="10rem"
                      borderColor="#6c757d"
                      color="#f9f9f9"
                    />
                  </FormControl>
                  <Button
                    type="submit"
                    style={buttonStyle}
                    ref={buttonRef}
                    onMouseEnter={handleMouseEnter}
                    onMouseLeave={handleMouseLeave}
                    size="lg"
                    w="full"
                  >
                    {t('form_submit')}
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
              backgroundColor={'rgba(15, 13, 21, 0.7)'}
              boxShadow={
                '0px 4px 8px rgba(0, 0, 0, 0.3), 0px 8px 16px rgba(0, 0, 0, 0.3), 0px 12px 24px rgba(0, 0, 0, 0.3)'
              }
              border={'1px solid white'}
              p={8}
            >
              <Suspense fallback={<Spinner />}>
                <Heading title={t('contact_info_title')} />
              </Suspense>
              <Text textAlign="center" mb={4} fontSize={'1.2rem'}>
                <Suspense fallback={<Spinner />}>
                  <EnvelopeSVG
                    style={{ display: 'inline-block', marginRight: '8px' }}
                    fill={'#f9f9f9'}
                    width={'20px'}
                    height={'20px'}
                  />
                </Suspense>
                {t('email_label')}{' '}
                <Link href="mailto:rapidrecap2k23@gmail.com" color="teal.200">
                  rapidrecap2k23@gmail.com
                </Link>
              </Text>
              <Text textAlign="center" mb={4} fontSize={'1.2rem'}>
                <Suspense fallback={<Spinner />}>
                  <InstagramSVG
                    style={{ display: 'inline-block', marginRight: '8px' }}
                    fill={'#f9f9f9'}
                    width={'20px'}
                    height={'20px'}
                  />
                </Suspense>
                {t('instagram_label')}{' '}
                <Link
                  href="https://www.instagram.com/rrapidrecap/"
                  isExternal
                  color="teal.200"
                >
                  @rrapidrecap
                </Link>
              </Text>
              <Text textAlign="center" mb={8} fontSize={'1.2rem'}>
                <Suspense fallback={<Spinner />}>
                  <LinkedinSVG
                    style={{ display: 'inline-block', marginRight: '8px' }}
                    fill={'#f9f9f9'}
                    width={'20px'}
                    height={'20px'}
                  />
                </Suspense>
                {t('linkedin_label')}{' '}
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
                  {t('feedback_prompt')}
                </Text>
                <Flex justifyContent="center" alignItems="center" zIndex={10}>
                  <Suspense fallback={<Spinner />}>
                    <ButtonGradient />
                    <ButtonComponent
                      onClick={() => {
                        navigate('/contact/feedback')
                      }}
                    >
                      {t('feedback_button')}
                    </ButtonComponent>
                  </Suspense>
                </Flex>
              </Flex>
            </Box>
          </Flex>
        </Flex>
      </Flex>
    </>
  )
}

export default Contact
