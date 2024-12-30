import React, { memo } from 'react'
import { Box } from '@chakra-ui/react'
import { motion } from 'framer-motion'
import { Sparkles } from 'lucide-react'

const ClaimButton = ({ onClick, disabled, t }) => (
  <Box
    as={motion.button}
    w="full"
    h="70px"
    borderRadius="2xl"
    fontSize={{ base: 'xl', md: '2xl' }}
    fontWeight="bold"
    display="flex"
    alignItems="center"
    justifyContent="center"
    gap={3}
    disabled={disabled}
    whileHover={{ scale: 1.02, boxShadow: '0 0 30px rgba(99, 179, 237, 0.4)' }}
    whileTap={{ scale: 0.98 }}
    onClick={onClick}
    bgGradient="linear(to-r, blue.400, blue.600)"
    color="white"
    _hover={{
      cursor: 'pointer',
    }}
    transition="all 0.3s ease"
    boxShadow="0 0 20px rgba(99, 179, 237, 0.3)"
    css={{
      backdropFilter: 'blur(10px)',
    }}
  >
    <Sparkles size={28} />
    <span>{t('claimButton.text')}</span>
    <Sparkles size={28} />
  </Box>
)

export default memo(ClaimButton)
