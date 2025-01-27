// src/screens/RuleBook.jsx
import React from 'react'
import { Box, Container, Heading, useMediaQuery } from '@chakra-ui/react'
import { motion } from 'framer-motion'
import { useParams, useNavigate } from 'react-router-dom'
import PageSlide from '../components/ruleBookComponents/PageSlide'
import { SearchBar } from '../components/ruleBookComponents/SearchComponents'
import DropdownMenu from '../components/ruleBookComponents/DropdownMenu'
import { ruleBookPages } from '../assets/ruleBookData'
import { Helmet } from 'react-helmet'

const MotionBox = motion(Box)

const RuleBook = () => {
  const { pageId } = useParams()
  const navigate = useNavigate()
  const [isLargerThan768] = useMediaQuery('(min-width: 768px)')

  const currentPage = React.useMemo(() => {
    return ruleBookPages.find(page => page.id === pageId) || ruleBookPages[0]
  }, [pageId])

  React.useEffect(() => {
    if (!pageId) {
      navigate(`/manual/${ruleBookPages[0].id}`)
    }
  }, [pageId, navigate])

  return (
    <Box minH="100vh" w="full" pt={20} pb={10}>
      <Helmet>
        <title>Player's Manual | Rapid Recap</title>
        <meta
          name="description"
          content="Learn how to play and master Rapid Recap with our comprehensive player's manual."
        />
      </Helmet>

      <Container
        maxW={isLargerThan768 ? 'container.md' : 'container.sm'}
        px={4}
      >
        <MotionBox
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          mb={4}
          textAlign="center"
        >
          <Heading
            fontSize="4xl"
            fontWeight="bold"
            color="pink.300"
            letterSpacing="tight"
          >
            Player's Manual
          </Heading>
        </MotionBox>

        <Box position="relative" zIndex={10}>
          <SearchBar
            pages={ruleBookPages}
            onSelectResult={section => {
              const page = ruleBookPages.find(p => p.title === section)
              if (page) {
                navigate(`/manual/${page.id}`)
              }
            }}
          />

          <DropdownMenu
            pages={ruleBookPages}
            currentPage={currentPage}
            onSelect={id => navigate(`/manual/${id}`)}
          />

          <Box flex={1}>
            <PageSlide key={currentPage.id} {...currentPage} />
          </Box>
        </Box>
      </Container>
    </Box>
  )
}

export default RuleBook
