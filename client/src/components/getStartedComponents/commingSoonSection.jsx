import React, { useRef, useMemo, useCallback } from 'react'
import {
  Box,
  Flex,
  Badge,
  useMediaQuery,
  Image,
  chakra,
} from '@chakra-ui/react'
import { RepeatClockIcon, CheckIcon } from '@chakra-ui/icons'
import { lazy, Suspense } from 'react'

// Lazy-loaded components
const Heading = lazy(() => import('../miscellaneous/HeadingComponent'))
const TagLine = lazy(() => import('../miscellaneous/TaglineComponent'))
const Section = lazy(() => import('../miscellaneous/Section'))
const BottomLine = lazy(() =>
  import('./design/Roadmap').then(module => ({ default: module.BottomLine })),
)

// Import images
import roadmap2 from '../../assets/roadmap/image-2.webp'
import roadmap4 from '../../assets/roadmap/image-4.webp'
import roadmap5 from '../../assets/roadmap/bookmark.webp'
import tournament from '../../assets/roadmap/tournament.webp'
import grid from '../../assets/grid.webp'

const roadmapData = [
  {
    id: '0',
    title: 'Personalized Feed and Notifications',
    text: "Enjoy a tailored news and quiz experience with Rapid Recap's personalization feature, plus timely notifications to keep you updated and engaged with relevant content.",
    date: 'June 2024',
    status: 'done',
    imageUrl: roadmap2,
    colorful: true,
  },
  {
    id: '1',
    title: 'Bookmark feature',
    text: "Rapid Recap's new Bookmark feature lets you save, manage, and quickly access your favorite articles. Personalize your feed and track your reading progress easily. Stay informed effortlessly!",
    date: 'July 2024',
    status: 'done',
    imageUrl: roadmap5,
  },
  {
    id: '2',
    title: 'Wise Web',
    text: 'Wise Web is a dynamic feature that lets you connect, share, and grow with others in a vibrant digital community. It’s where knowledge flows and collective wisdom thrives, weaving a network of meaningful connections.',
    date: 'August 2024',
    status: 'done',
    imageUrl: roadmap4,
  },

  {
    id: '3',
    title: 'Tournament Mode',
    text: `
I come around every weekend,
Where knowledge is the key to ascend.
With five chances to prove you're wise,
And on Monday, you'll see who gets the prize.
What am I?
    `,
    date: 'August 2024',
    status: 'progress',
    imageUrl: tournament,
  },
]

const RoadmapItem = React.memo(({ item, isScreenGreaterThan820, index }) => {
  const status = item.status === 'done' ? 'Done' : 'In Progress'
  const translateY = index % 2 !== 0 ? '6rem' : '0'

  return (
    <Box
      bgGradient="linear(to-br, #FFBF00, #D10363)"
      maxW={{ base: '100%', md: '45%' }}
      mx={4}
      mb={8}
      height={'37rem'}
      style={{
        borderRadius: '2.5rem',
        boxShadow: '0px 4px 10px rgba(0, 0, 0, 0.3)',
        transform: isScreenGreaterThan820 ? `translateY(${translateY})` : '',
        transition: 'transform 0.3s ease-in-out',
      }}
    >
      <Box
        m={'1px'}
        height={'36.8rem'}
        background={'transparent'}
        style={{ borderRadius: '2.5rem' }}
        bgGradient="linear-gradient(-180deg, #1a1527, #0e0c16 88%, #0e0c16 99%)"
      >
        <Box
          p={{ base: 6, md: 8 }}
          overflow="hidden"
          boxShadow="lg"
          background={'transparent'}
          borderRadius={'2.5rem'}
        >
          <Box position={'absolute'}>
            <Image src={grid} alt="grid" w={550} h={550} bg={'transparent'} />
          </Box>
          <Box>
            <Flex justifyContent={'space-between'} alignItems={'center'}>
              <Suspense fallback={<div>Loading...</div>}>
                <TagLine fontSize="sm" mb={2}>
                  {item.date}
                </TagLine>
              </Suspense>
              <Flex align="center" mb={4}>
                <Box mr={2}>
                  {item.status === 'done' ? <CheckIcon /> : <RepeatClockIcon />}
                </Box>
                <Badge
                  variant="subtle"
                  colorScheme={item.status === 'done' ? 'green' : 'orange'}
                >
                  {status}
                </Badge>
              </Flex>
            </Flex>
            <Flex w={'100%'} justifyContent={'center'} alignItems={'center'}>
              <Image
                src={item.imageUrl}
                alt={item.title}
                width={'80%'}
                height="80%"
                objectFit="cover"
                mb={4}
                background={'transparent'}
              />
            </Flex>
            <Flex>
              <Suspense fallback={<div>Loading...</div>}>
                <Heading title={item.title} />
              </Suspense>
            </Flex>
            <Box fontSize="md" color="gray.600">
              {item.text}
            </Box>
          </Box>
        </Box>
      </Box>
    </Box>
  )
})

const ComingSoonSection = () => {
  const [isScreenGreaterThan820] = useMediaQuery('(min-width: 820px)')
  const parallaxRef = useRef(null)

  const memoizedRoadmap = useMemo(() => roadmapData, [])

  const renderRoadmapItems = useCallback(() => {
    return memoizedRoadmap.map((item, index) => (
      <RoadmapItem
        key={item.id}
        item={item}
        isScreenGreaterThan820={isScreenGreaterThan820}
        index={index}
      />
    ))
  }, [memoizedRoadmap, isScreenGreaterThan820])

  return (
    <Suspense fallback={<div>Loading...</div>}>
      <Section crosses customPaddings={`2.85rem 0 0 0`} id="ComingSoon">
        <Box
          mb={'2rem'}
          textAlign="center"
          maxW="62rem"
          mx="auto"
          ref={parallaxRef}
        >
          <Box className="overflow-hidden" id="roadmap">
            <Box maxW="container" pb={{ md: 10 }}>
              <Heading
                tag="Discover What's New and What's Coming Soon"
                title="Feature Highlights"
              />
              <Flex
                position="relative"
                gap={{ base: 6, md: 4 }}
                pb={{ md: '7rem' }}
                direction="row"
                flexWrap="wrap"
                justifyContent="center"
              >
                {renderRoadmapItems()}
              </Flex>
            </Box>
          </Box>
        </Box>
        <BottomLine />
      </Section>
    </Suspense>
  )
}

export default React.memo(ComingSoonSection)
