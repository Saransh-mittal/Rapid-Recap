import React, { useState, useMemo } from 'react'
import { motion } from 'framer-motion'
import {
  Button,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  Flex,
  Text,
  Box,
} from '@chakra-ui/react'
import { ChevronDownIcon } from '@chakra-ui/icons'

const itemVariants = {
  open: {
    opacity: 1,
    y: 0,
    transition: { type: 'spring', stiffness: 300, damping: 24 },
  },
  closed: { opacity: 0, y: 20, transition: { duration: 0.2 } },
}

const StyledDropdownMenu = ({ options, onSelect, buttonText }) => {
  const [isOpen, setIsOpen] = useState(false)

  const listStyle = useMemo(
    () => ({
      padding: '10px',
      backgroundColor: '#526D82',
      color: 'white',
      cursor: 'pointer',
      width: '100%',
      borderBottom: '1px solid',
      backgroundImage:
        'linear-gradient(to right, transparent, #27374D, transparent)',
      backgroundClip: 'border-box',
      borderImage:
        'linear-gradient(to right, rgba(255, 255, 255, 0), rgba(255, 255, 255, 0.3), rgba(255, 255, 255, 0)) 1',
    }),
    [],
  )

  const listHoverStyle = useMemo(
    () => ({
      backgroundColor: '#27374D',
    }),
    [],
  )

  return (
    <Menu>
      <MenuButton
        as={Button}
        onClick={() => setIsOpen(!isOpen)}
        size="md"
        height="35px"
        width="100%"
        border="5px"
        borderColor="green.200"
        backgroundColor="#F2D8D8"
        color="#374259"
        css={{
          '&:hover': {
            backgroundColor: '#316B83',
            color: '#11324D',
          },
        }}
      >
        <Box
          as="span"
          position="absolute"
          top="0"
          left="0"
          width="100%"
          height="100%"
          bgGradient="linear(to-r, rgba(255,255,255,0.1), rgba(255,255,255,0.2), rgba(255,255,255,0.1))"
          transform="skew(-20deg)"
          opacity="0"
          transition="opacity 0.3s"
          _groupHover={{ opacity: '1' }}
        />
        <Box as="span" position="relative" zIndex="1">
          {buttonText}
        </Box>
      </MenuButton>
      <MenuList bg="rgba(0, 0, 0, 0.8)" border="none" boxShadow="dark-lg">
        <motion.div
          initial="closed"
          animate={isOpen ? 'open' : 'closed'}
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
          {options.map((option, index) => (
            <motion.div key={index} variants={itemVariants}>
              <MenuItem
                onClick={() => {
                  onSelect(option)
                  setIsOpen(false)
                }}
                _hover={listHoverStyle}
                sx={listStyle}
              >
                <Flex alignItems="center" width="100%">
                  {option.icon && (
                    <option.icon style={{ marginRight: '8px' }} />
                  )}
                  <Text>{option.label}</Text>
                </Flex>
              </MenuItem>
            </motion.div>
          ))}
        </motion.div>
      </MenuList>
    </Menu>
  )
}

export default StyledDropdownMenu
