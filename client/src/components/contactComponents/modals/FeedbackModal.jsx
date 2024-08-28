import React, { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalCloseButton,
  Button,
  FormControl,
  FormLabel,
  Input,
  Textarea,
  Box,
  Flex,
  Heading,
  Radio,
  RadioGroup,
  Stack,
  useToast,
} from '@chakra-ui/react'
import axios from 'axios'
import Section from '../../miscellaneous/Section'
import SliderWithMarks from './SliderWithMarks'
import {
  initialFormState,
  handleSliderChange,
  getLabelForValue,
} from './utils/formState'
import { useSelector } from 'react-redux'
import useSound from '../../../customHooks/useSound'

const FeedbackModal = ({ isOpen, onClose }) => {
  const { t } = useTranslation('FeedbackModal')
  const toast = useToast()
  const { isAuthenticated, user } = useSelector(state => state.auth)
  const { playClick } = useSound()
  const loggedIn = isAuthenticated
  const [formState, setFormState] = useState(initialFormState)
  const [quizIssueAnswer, setQuizIssueAnswer] = useState('no')
  const [email, setEmail] = useState('')

  useEffect(() => {
    if (loggedIn && user) setEmail(user?.email)
  }, [isAuthenticated, user])

  const handleSubmit = async e => {
    playClick()
    e.preventDefault()
    const formData = {
      email: e.target.email.value,
      answers: Object.keys(formState).reduce(
        (acc, key) => {
          acc[key] = getLabelForValue(key, formState[key])
          return acc
        },
        {
          scoringSystemLikes: e.target.scoringSystemLikes.value,
          mostUsedFeature: e.target.mostUsedFeature.value,
          missingFeatures: e.target.missingFeatures.value,
          quizIssues: {
            issue: e.target?.quizIssues?.value || '',
            inGameName: e.target?.inGameName?.value || '',
          },
          improvements: e.target.improvements.value,
          additionalComments: e.target.additionalComments.value,
        },
      ),
    }

    try {
      const response = await axios.post(
        '/api/contact/feedback/submit',
        formData,
      )
      if (response.status !== 201) {
        throw new Error('Failed to submit feedback')
      }
      toast({
        title: t('Feedback submitted successfully'),
        status: 'success',
        duration: 5000,
        isClosable: true,
        position: 'top',
      })
      onClose()
    } catch (error) {
      console.error('Error submitting feedback:', error)
      toast({
        title: t('Failed to submit feedback'),
        status: 'error',
        duration: 5000,
        isClosable: true,
        position: 'top',
      })
    }
  }

  const sliderMarks = [
    { value: 1, label: t('Poor') },
    { value: 2, label: t('Average') },
    { value: 3, label: t('Good') },
    { value: 4, label: t('Excellent') },
  ]

  return (
    <Modal isOpen={isOpen} onClose={onClose} size={{ base: 'full', md: '4xl' }}>
      <ModalOverlay />
      <ModalContent
        sx={{
          fontFamily: "'Roboto Condensed', 'Lato', sans-serif",
          color: 'white',
          backgroundColor: '#0f0d15',
          backgroundImage:
            'linear-gradient(-180deg, #1a1527, #0e0c16 88%, #0e0c16 99%)',
        }}
        overflow={'hidden'}
      >
        <ModalHeader
          display={'flex'}
          justifyContent={'center'}
          alignItems={'center'}
          w={'100%'}
          mb={3}
        >
          <Heading
            fontSize="3xl"
            fontWeight="bold"
            letterSpacing="3px"
            textTransform="uppercase"
            borderBottom="2px solid"
            pb={'0.2rem'}
            px={0}
            style={{
              background: 'linear-gradient(90deg, teal, cyan, purple, pink)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}
            textAlign={'center'}
          >
            {t('Feedback')}
          </Heading>
        </ModalHeader>
        <ModalCloseButton />
        <Section crosses customPaddings={`0 4rem 0 4rem`} id="feedback">
          <ModalBody letterSpacing={'0.105rem'} px={0}>
            <form onSubmit={handleSubmit}>
              <Box mb={4} p={'2rem'}>
                <FormControl id="email" isRequired mt={4}>
                  <FormLabel fontSize="lg" fontWeight="medium" color="cyan.300">
                    {t('Email')}
                  </FormLabel>
                  <Input
                    type="email"
                    value={email}
                    onChange={e => {
                      !loggedIn && setEmail(e.target.value)
                    }}
                    color={loggedIn && 'grey'}
                  />
                </FormControl>
              </Box>

              <FormLabel
                fontSize="lg"
                fontWeight="medium"
                color="cyan.300"
                ml={'1rem'}
                mt={'2rem'}
              >
                {t(
                  'How would you rate your overall experience with Rapid Recap?',
                )}
              </FormLabel>
              <SliderWithMarks
                name="experience"
                defaultValue={3}
                min={1}
                max={4}
                step={1}
                marks={sliderMarks}
                formState={formState}
                handleSliderChange={handleSliderChange(setFormState)}
              />

              <FormLabel
                mt={'3rem'}
                fontSize="lg"
                fontWeight="medium"
                color="cyan.300"
                ml={'1rem'}
              >
                {t('How often do you use Rapid Recap?')}
              </FormLabel>
              <SliderWithMarks
                name="usageFrequency"
                defaultValue={2}
                min={1}
                max={4}
                step={1}
                marks={[
                  { value: 1, label: t('Rarely') },
                  { value: 2, label: t('Monthly') },
                  { value: 3, label: t('Weekly') },
                  { value: 4, label: t('Daily') },
                ]}
                formState={formState}
                handleSliderChange={handleSliderChange(setFormState)}
              />

              <FormLabel
                mt={'3rem'}
                fontSize="lg"
                fontWeight="medium"
                color="cyan.300"
                ml={'1rem'}
              >
                {t(
                  'How satisfied are you with the difficulty level of the quizzes?',
                )}
              </FormLabel>
              <SliderWithMarks
                name="difficultySatisfaction"
                defaultValue={3}
                min={1}
                max={5}
                step={1}
                marks={[
                  { value: 1, label: t('Very Dissatisfied') },
                  { value: 2, label: t('Dissatisfied') },
                  { value: 3, label: t('Neutral') },
                  { value: 4, label: t('Satisfied') },
                  { value: 5, label: t('Very Satisfied') },
                ]}
                formState={formState}
                handleSliderChange={handleSliderChange(setFormState)}
              />

              <FormLabel
                mt={'3rem'}
                fontSize="lg"
                fontWeight="medium"
                color="cyan.300"
                ml={'1rem'}
              >
                {t(
                  'Do you feel the IQ score accurately reflects your knowledge and understanding of the articles/news?',
                )}
              </FormLabel>
              <SliderWithMarks
                name="iqAccuracy"
                defaultValue={3}
                min={1}
                max={5}
                step={1}
                marks={[
                  { value: 1, label: t('Strongly Disagree') },
                  { value: 2, label: t('Disagree') },
                  { value: 3, label: t('Neutral') },
                  { value: 4, label: t('Agree') },
                  { value: 5, label: t('Strongly Agree') },
                ]}
                formState={formState}
                handleSliderChange={handleSliderChange(setFormState)}
              />

              <Box mb={4}>
                <FormControl id="scoringSystemLikes">
                  <FormLabel
                    fontSize="lg"
                    fontWeight="medium"
                    color="cyan.300"
                    ml={'1rem'}
                    mt={'3rem'}
                  >
                    {t(
                      'What features do you like the most about the scoring system and leaderboard?',
                    )}
                  </FormLabel>
                  <Textarea />
                </FormControl>
              </Box>

              <FormLabel
                fontSize="lg"
                fontWeight="medium"
                color="cyan.300"
                ml={'1rem'}
                mt={'3rem'}
              >
                {t(
                  'How would you rate the user interface and design of the app?',
                )}
              </FormLabel>
              <SliderWithMarks
                name="uiDesignRating"
                defaultValue={3}
                min={1}
                max={4}
                step={1}
                marks={sliderMarks}
                formState={formState}
                handleSliderChange={handleSliderChange(setFormState)}
              />

              <FormLabel
                fontSize="lg"
                fontWeight="medium"
                color="cyan.300"
                ml={'1rem'}
                mt={'3rem'}
              >
                {t(
                  'Is the IQ graph on your profile helpful in tracking your progress?',
                )}
              </FormLabel>
              <SliderWithMarks
                name="iqGraphHelpfulness"
                defaultValue={3}
                min={1}
                max={5}
                step={1}
                marks={[
                  { value: 1, label: t('Very Unhelpful') },
                  { value: 2, label: t('Unhelpful') },
                  { value: 3, label: t('Neutral') },
                  { value: 4, label: t('Helpful') },
                  { value: 5, label: t('Very Helpful') },
                ]}
                formState={formState}
                handleSliderChange={handleSliderChange(setFormState)}
              />

              <FormLabel
                fontSize="lg"
                fontWeight="medium"
                color="cyan.300"
                ml={'1rem'}
                mt={'3rem'}
              >
                {t(
                  'Do you find the IQ bar graph showing the top percentage of the population useful?',
                )}
              </FormLabel>
              <SliderWithMarks
                name="iqBarGraphUsefulness"
                defaultValue={3}
                min={1}
                max={5}
                step={1}
                marks={[
                  { value: 1, label: t('Very Not Useful') },
                  { value: 2, label: t('Not Useful') },
                  { value: 3, label: t('Neutral') },
                  { value: 4, label: t('Useful') },
                  { value: 5, label: t('Very Useful') },
                ]}
                formState={formState}
                handleSliderChange={handleSliderChange(setFormState)}
              />

              <Box mb={4} ml={'1rem'} mt={'3rem'}>
                <FormControl id="mostUsedFeature">
                  <FormLabel fontSize="lg" fontWeight="medium" color="cyan.300">
                    {t('Which feature do you use the most?')}
                  </FormLabel>
                  <Input type="text" />
                </FormControl>
              </Box>

              <Box mb={4} ml={'1rem'} mt={'3rem'}>
                <FormControl id="missingFeatures">
                  <FormLabel fontSize="lg" fontWeight="medium" color="cyan.300">
                    {t(
                      'Are there any features you find missing or would like to see added?',
                    )}
                  </FormLabel>
                  <Textarea />
                </FormControl>
              </Box>

              <FormLabel
                fontSize="lg"
                fontWeight="medium"
                color="cyan.300"
                ml={'1rem'}
                mt={'3rem'}
              >
                {t(
                  'Do you find the concept of societies (Explorers, Strivers, Elites, Mavericks) motivating?',
                )}
              </FormLabel>
              <SliderWithMarks
                name="societyMotivation"
                defaultValue={3}
                min={1}
                max={5}
                step={1}
                marks={[
                  { value: 1, label: t('Very Not Motivating') },
                  { value: 2, label: t('Not Motivating') },
                  { value: 3, label: t('Neutral') },
                  { value: 4, label: t('Motivating') },
                  { value: 5, label: t('Very Motivating') },
                ]}
                formState={formState}
                handleSliderChange={handleSliderChange(setFormState)}
              />

              <FormLabel
                fontSize="lg"
                fontWeight="medium"
                color="cyan.300"
                ml={'1rem'}
                mt={'3rem'}
              >
                {t(
                  'How often do you encounter technical issues (e.g., app crashes, slow loading times)?',
                )}
              </FormLabel>
              <SliderWithMarks
                name="technicalIssuesFrequency"
                defaultValue={3}
                min={1}
                max={5}
                step={1}
                marks={[
                  { value: 1, label: t('Never') },
                  { value: 2, label: t('Rarely') },
                  { value: 3, label: t('Sometimes') },
                  { value: 4, label: t('Often') },
                  { value: 5, label: t('Always') },
                ]}
                formState={formState}
                handleSliderChange={handleSliderChange(setFormState)}
              />

              <Box mb={4} ml={'1rem'} mt={'3rem'}>
                <FormControl as="fieldset">
                  <FormLabel
                    as="legend"
                    fontSize="lg"
                    fontWeight="medium"
                    color="cyan.300"
                  >
                    {t(
                      'Have you ever faced issues with quiz scoring or leaderboard updates? If yes, please describe.',
                    )}
                  </FormLabel>
                  <RadioGroup
                    defaultValue="no"
                    onChange={setQuizIssueAnswer}
                    value={quizIssueAnswer}
                  >
                    <Stack direction="row">
                      <Radio value="yes">{t('Yes')}</Radio>
                      <Radio value="no">{t('No')}</Radio>
                    </Stack>
                  </RadioGroup>
                </FormControl>
                {quizIssueAnswer === 'yes' && (
                  <>
                    <FormControl id="inGameName" mt={4} isRequired>
                      <FormLabel
                        fontSize="lg"
                        fontWeight="medium"
                        color="cyan.300"
                      >
                        {t('In-Game Name')}
                      </FormLabel>
                      <Input type="text" />
                    </FormControl>
                    <FormControl id="quizIssues" mt={4} isRequired>
                      <Textarea placeholder={t('Describe the issues...')} />
                    </FormControl>
                  </>
                )}
              </Box>

              <Box mb={4} ml={'1rem'} mt={'3rem'}>
                <FormControl id="improvements">
                  <FormLabel fontSize="lg" fontWeight="medium" color="cyan.300">
                    {t('What improvements would you suggest for Rapid Recap?')}
                  </FormLabel>
                  <Textarea />
                </FormControl>
              </Box>

              <FormLabel
                fontSize="lg"
                fontWeight="medium"
                color="cyan.300"
                ml={'1rem'}
                mt={'3rem'}
              >
                {t('Would you recommend Rapid Recap to a friend or colleague?')}
              </FormLabel>
              <SliderWithMarks
                name="recommendationLikelihood"
                defaultValue={3}
                min={1}
                max={5}
                step={1}
                marks={[
                  { value: 1, label: t('Definitely Not') },
                  { value: 2, label: t('Probably Not') },
                  { value: 3, label: t('Not Sure') },
                  { value: 4, label: t('Probably') },
                  { value: 5, label: t('Definitely') },
                ]}
                formState={formState}
                handleSliderChange={handleSliderChange(setFormState)}
              />

              <Box mb={4} ml={'1rem'} mt={'3rem'}>
                <FormControl id="additionalComments">
                  <FormLabel fontSize="lg" fontWeight="medium" color="cyan.300">
                    {t('Any additional comments or feedback?')}
                  </FormLabel>
                  <Textarea />
                </FormControl>
              </Box>
              <Flex justifyContent={'center'} alignItems={'center'}>
                <Button my={'2rem'} colorScheme="teal" type="submit">
                  {t('Submit')}
                </Button>
              </Flex>
            </form>
          </ModalBody>
        </Section>
      </ModalContent>
    </Modal>
  )
}

export default FeedbackModal
