// src/screens/RuleBook.jsx
import React from 'react'
import { Box, Container, Heading, useMediaQuery } from '@chakra-ui/react'
import { motion } from 'framer-motion'
import { useParams, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import PageSlide from '../components/ruleBookComponents/PageSlide'
import { SearchBar } from '../components/ruleBookComponents/SearchComponents'
import DropdownMenu from '../components/ruleBookComponents/DropdownMenu'
import { getRuleBookPages } from '../assets/ruleBookData'
import { Helmet } from 'react-helmet'

const MotionBox = motion(Box)

const RuleBook = () => {
  const { pageId } = useParams()
  const navigate = useNavigate()
  const [isLargerThan768] = useMediaQuery('(min-width: 768px)')
  const { t } = useTranslation('rulebook')

  // Get fresh pages whenever language changes
  const pages = React.useMemo(() => getRuleBookPages(), [t])

  const currentPage = React.useMemo(() => {
    return pages.find(page => page.id === pageId) || pages[0]
  }, [pageId, pages])

  React.useEffect(() => {
    if (!pageId) {
      navigate(`/manual/${pages[0].id}`)
    }
  }, [pageId, navigate, pages])

  return (
    <Box minH="100vh" w="full" pt={20} pb={10}>
      <Helmet>
        <title>{t('meta.title')}</title>
        <meta name="description" content={t('meta.description')} />
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
            {t('heading')}
          </Heading>
        </MotionBox>

        <Box position="relative" zIndex={10}>
          <SearchBar
            pages={pages}
            onSelectResult={section => {
              const page = pages.find(p => p.title === section)
              if (page) {
                navigate(`/manual/${page.id}`)
              }
            }}
          />

          <DropdownMenu
            pages={pages}
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
