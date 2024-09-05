import React, { lazy, Suspense, useCallback, useMemo } from 'react'
import { Flex, Image, ListItem, Text, UnorderedList } from '@chakra-ui/react'
import { NavLink } from 'react-router-dom'
import useSound from '../../../customHooks/useSound'
import { useSelector } from 'react-redux'
import { useTranslation } from 'react-i18next'

const newBadge = lazy(() => import('/images/newBadge.webp'))

const NavbarContent = ({
  isHamburgerOpen,
  setIsHamburgerOpen,
  navLinkRefs,
  navItems,
  notLogined,
}) => {
  const { playClick } = useSound()
  const { isAdmin, isAuthenticated, user } = useSelector(state => state.auth)
  const { t } = useTranslation('NavbarContent')

  const handleClick = useCallback(() => {
    playClick()
    if (setIsHamburgerOpen) setIsHamburgerOpen(false)
  }, [playClick, setIsHamburgerOpen])

  const showDashboard = isAdmin && isAuthenticated && user

  const memoizedNavItems = useMemo(() => {
    return navItems.map((item, index) => {
      const translatedLabel = t(item.label)
      if (item.label === 'Dashboard' && !showDashboard) return null
      return (
        <ListItem
          className={`nav-item `}
          key={index}
          onClick={handleClick}
          display={'flex'}
          justifyContent={'center'}
          alignItems={'center'}
          gap={'0.25rem'}
          position={'relative'}
        >
          <NavLink
            to={item.to}
            className={`nav-link`}
            onClick={playClick}
            ref={ref => (navLinkRefs.current[index] = ref)}
          >
            {translatedLabel}
            {item.label === 'Season' && (
              <Suspense fallback={<div>Loading...</div>}>
                <>
                  <Image
                    position="absolute"
                    src={newBadge}
                    bg={'transparent'}
                    height={'1.5rem'}
                    w={'3rem'}
                    right={'-2.2rem'}
                    top={'-1.2rem'}
                  />
                  <Text
                    position="absolute"
                    right={'-1.9rem'}
                    top={'-1.05rem'}
                    fontSize="0.75rem"
                    fontWeight={'bold'}
                    color="white"
                    bg="transparent"
                    padding="0.1rem 0.3rem"
                  >
                    {t('New')}
                  </Text>
                </>
              </Suspense>
            )}
          </NavLink>
        </ListItem>
      )
    })
  }, [
    navItems,
    playClick,
    navLinkRefs,
    handleClick,
    isAdmin,
    isAuthenticated,
    user,
    t,
  ])

  return (
    <>
      <Flex
        justifyContent={{
          base: !isHamburgerOpen ? 'space-between' : 'flex-start',
          lg: 'center',
        }}
        alignItems={'center'}
        width={'100%'}
        flexDirection={isHamburgerOpen ? 'column' : 'row'}
        padding={isHamburgerOpen ? '2rem' : '0'}
        className="navbar-content-lg"
        textTransform={'uppercase'}
        marginLeft={{ lg: '12rem' }}
      >
        {/* Dropdown menu for small screens */}
        <Flex
          display={{ base: 'none', lg: 'flex !important' }}
          flexDirection={{ base: 'column', lg: 'row' }}
          id="navbarNav"
          alignItems={'center'}
          h={'100%'}
          w={'100%'}
          justifyContent={'center'}
        >
          <UnorderedList
            display={'flex'}
            p={0}
            m={0}
            w={'100%'}
            justifyContent={'center'}
            alignItems={'center'}
            height={'100%'}
            listStyleType={'none'}
            gap={{ base: '1.5rem', xl: '3rem' }}
            letterSpacing={'2px'}
            flexDirection={{ base: 'column', lg: 'row' }}
          >
            {/* Navigation items */}
            {memoizedNavItems}
          </UnorderedList>
        </Flex>
      </Flex>
    </>
  )
}

export default NavbarContent
