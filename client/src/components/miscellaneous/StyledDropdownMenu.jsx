import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import {
  Button,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  Flex,
  Text,
  Box,
  useToast,
} from '@chakra-ui/react'
import CrownSVG from '../../assets/svg/CrownSVG'
import TrophySVG from '../../assets/svg/TrophySVG'
import Medal from '../../assets/svg/Medal'

const itemVariants = {
  open: {
    opacity: 1,
    y: 0,
    transition: { type: 'spring', stiffness: 300, damping: 24 },
  },
  closed: { opacity: 0, y: 20, transition: { duration: 0.2 } },
}

const GreenTickSVG = ({ size = 24 }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M20.4086 6.65258C21.1289 7.35524 21.1448 8.49105 20.4421 9.21137L10.6921 19.2114C9.98944 19.9317 8.85363 19.9476 8.13331 19.2449L3.55831 14.8074C2.85565 14.0871 2.83974 12.9513 3.5424 12.231C4.24506 11.5107 5.38087 11.4948 6.10119 12.1975L9.37868 15.3885L17.8498 6.68598C18.5525 5.96566 19.6883 5.94992 20.4086 6.65258Z"
      fill="#4CAF50"
    />
  </svg>
)

const StyledDropdownMenu = ({
  options,
  onSelect,
  buttonText,
  t,
  selectedBadge,
}) => {
  const toast = useToast()
  const [isOpen, setIsOpen] = useState(false)
  const menuRef = useRef(null)

  const handleSelect = useCallback(
    option => {
      onSelect(option)
      setIsOpen(false)
    },
    [onSelect],
  )

  const handleClose = useCallback(() => {
    setIsOpen(false)
  }, [])

  const handleOpen = useCallback(() => {
    if (options.length !== 0) {
      setIsOpen(true)
    }
  }, [options.length, t, toast])

  const getRankStyle = rank => {
    switch (rank) {
      case 1:
        return {
          background: 'linear-gradient(135deg, #FFD700, #FFA500)',
          color: '#000000',
          textShadow: '0 0 5px rgba(255, 255, 255, 0.5)',
          boxShadow: '0 0 10px rgba(255, 215, 0, 0.5)',
        }
      case 2:
        return {
          background: 'linear-gradient(135deg, #C0C0C0, #A9A9A9)',
          color: '#000000',
          textShadow: '0 0 5px rgba(255, 255, 255, 0.5)',
          boxShadow: '0 0 10px rgba(192, 192, 192, 0.5)',
        }
      case 3:
        return {
          background: 'linear-gradient(135deg, #CD7F32, #B8860B)',
          color: '#FFFFFF',
          textShadow: '0 0 5px rgba(0, 0, 0, 0.5)',
          boxShadow: '0 0 10px rgba(205, 127, 50, 0.5)',
        }
      default:
        return {
          background: '#526D82',
          color: 'white',
        }
    }
  }

  const listStyle = useMemo(
    () => ({
      padding: '10px',
      cursor: 'pointer',
      width: '100%',
      borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
      transition: 'all 0.3s ease',
    }),
    [],
  )

  const listHoverStyle = useMemo(
    () => ({
      filter: 'brightness(1.2)',
    }),
    [],
  )

  const getRankIcon = rank => {
    const iconSize = '24px'
    const iconStyles = {
      filter: 'drop-shadow(1px 1px 1px rgba(0, 0, 0, 0.5))',
    }

    switch (rank) {
      case 1:
        return (
          <Box
            bg="rgba(255, 255, 255, 0.2)"
            borderRadius="50%"
            p={1}
            display="flex"
            alignItems="center"
            justifyContent="center"
          >
            <CrownSVG
              size={iconSize}
              style={iconStyles}
              color={getRankStyle(rank).color}
            />
          </Box>
        )
      case 2:
        return <TrophySVG size={iconSize} style={iconStyles} />
      case 3:
        return <Medal size={iconSize} style={iconStyles} />
      default:
        return null
    }
  }
  useEffect(() => {
    const handleClickOutside = event => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        handleClose()
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [handleClose])

  return (
    <div
      ref={menuRef}
      style={{
        width: '100%',
      }}
    >
      <Menu
        isOpen={isOpen}
        onClose={handleClose}
        onOpen={handleOpen}
        closeOnSelect={false}
      >
        <MenuButton
          as={Button}
          size="md"
          height="35px"
          width="100%"
          border="none"
          background="linear-gradient(135deg, #2C3E50, #4CA1AF)"
          color="white"
          _hover={{
            background: 'linear-gradient(135deg, #4CA1AF, #2C3E50)',
          }}
          _active={{
            background: 'linear-gradient(135deg, #4CA1AF, #2C3E50)',
          }}
          boxShadow="0 4px 6px rgba(0, 0, 0, 0.1)"
          transition="all 0.3s ease"
          onClick={() => {
            if (options.length === 0) {
              toast({
                title: t('noBadgesAvailable'),
                status: 'info',
                duration: 3000,
                isClosable: true,
              })
            }
          }}
        >
          <Box as="span" position="relative" zIndex="1">
            {options.length === 0 ? t('noBadge') : buttonText}
          </Box>
        </MenuButton>
        {options.length > 0 && (
          <MenuList
            bg="rgba(0, 0, 0, 0.8)"
            border="none"
            boxShadow="dark-lg"
            padding="0"
            overflow="hidden"
          >
            <AnimatePresence>
              {isOpen && (
                <motion.div
                  initial="closed"
                  animate="open"
                  exit="closed"
                  variants={{
                    open: {
                      clipPath: 'inset(0% 0% 0% 0% round 10px)',
                      transition: {
                        type: 'spring',
                        bounce: 0,
                        duration: 0.7,
                        delayChildren: 0.3,
                        staggerChildren: 0.05,
                      },
                    },
                    closed: {
                      clipPath: 'inset(10% 50% 90% 50% round 10px)',
                      transition: {
                        type: 'spring',
                        bounce: 0,
                        duration: 0.3,
                      },
                    },
                  }}
                >
                  {options?.map((option, index) => (
                    <motion.div key={index} variants={itemVariants}>
                      <MenuItem
                        onClick={e => {
                          e.preventDefault()
                          e.stopPropagation()

                          handleSelect(option)
                        }}
                        _hover={listHoverStyle}
                        sx={{ ...listStyle, ...getRankStyle(option.rank) }}
                      >
                        <Flex
                          alignItems="center"
                          width="100%"
                          justifyContent="space-between"
                        >
                          <Flex alignItems="center">
                            {getRankIcon(option.rank)}
                            <Text fontWeight="bold" ml={2}>
                              {option.label}
                            </Text>
                          </Flex>
                          <Flex alignItems="center">
                            <Text fontSize="sm" mr={2}>
                              Rank: {option.rank}
                            </Text>
                            {selectedBadge &&
                              selectedBadge.tournamentNumber ===
                                option.value && (
                                <Box ml={2}>
                                  <GreenTickSVG size={20} />
                                </Box>
                              )}
                          </Flex>
                        </Flex>
                      </MenuItem>
                    </motion.div>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </MenuList>
        )}
      </Menu>
    </div>
  )
}

export default StyledDropdownMenu
