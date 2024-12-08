import React from 'react'
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalCloseButton,
  Button,
  useDisclosure,
  Image,
  Flex,
  Text,
  Box,
  useToast,
  Drawer,
  DrawerBody,
  DrawerHeader,
  DrawerOverlay,
  DrawerContent,
  DrawerCloseButton,
  useBreakpointValue,
  VStack,
} from '@chakra-ui/react'
import { CopyIcon } from '@chakra-ui/icons'
import { useTranslation } from 'react-i18next'
import { motion } from 'framer-motion'
import { keyframes } from '@emotion/react'

// Social platforms configuration with enhanced styling
const socialPlatforms = [
  {
    name: 'whatsapp',
    logo: '/images/whatsapp-logo.png',
    color: '#25D366',
    hoverBg: 'rgba(37, 211, 102, 0.1)',
  },
  {
    name: 'twitter',
    logo: '/images/twitter-logo.png',
    color: '#1DA1F2',
    hoverBg: 'rgba(29, 161, 242, 0.1)',
  },
  {
    name: 'facebook',
    logo: '/images/facebook-logo.png',
    color: '#1877F2',
    hoverBg: 'rgba(24, 119, 242, 0.1)',
  },
  {
    name: 'linkedin',
    logo: '/images/linkedin-logo.png',
    color: '#0A66C2',
    hoverBg: 'rgba(10, 102, 194, 0.1)',
  },
]

// Shimmer animation for buttons
const shimmer = keyframes`
  0% { background-position: -1000px 0; }
  100% { background-position: 1000px 0; }
`

const SocialShareComponent = ({ isOpen, onClose, articleToShare }) => {
  const { t } = useTranslation('ShareChatModal')
  const toast = useToast()
  const isMobile = useBreakpointValue({ base: true, md: false })

  // Share functionality
  const handleSocialShare = platform => {
    let url = ''
    const articleUrl = `https://www.rapidrecap.co.in/article/${articleToShare._id}`
    const text = encodeURIComponent(
      `${t('checkOutArticle')}: ${articleToShare.title}`,
    )

    switch (platform) {
      case 'whatsapp':
        url = `https://api.whatsapp.com/send?text=${text} ${articleUrl}`
        break
      case 'twitter':
        url = `https://twitter.com/intent/tweet?text=${text}&url=${articleUrl}`
        break
      case 'facebook':
        url = `https://www.facebook.com/sharer/sharer.php?u=${articleUrl}`
        break
      case 'linkedin':
        url = `https://www.linkedin.com/sharing/share-offsite/?url=${articleUrl}`
        break
      default:
        return
    }

    window.open(url, '_blank')
  }

  const handleCopyArticleUrl = () => {
    const articleUrl = `https://www.rapidrecap.co.in/article/${articleToShare._id}`
    navigator.clipboard.writeText(articleUrl)
    toast({
      title: t('linkCopied'),
      description: t('articleUrlCopied'),
      status: 'success',
      duration: 3000,
      isClosable: true,
      position: 'top',
    })
  }

  // Shared styles for both modal and drawer
  const sharedContentStyles = {
    bg: 'linear-gradient(180deg, rgba(30, 26, 46, 0.95) 0%, rgba(42, 36, 64, 0.95) 100%)',
    color: 'white',
    backdropFilter: 'blur(10px)',
    border: '1px solid rgba(255, 255, 255, 0.1)',
  }

  const socialButtonStyles = platform => ({
    position: 'relative',
    overflow: 'hidden',
    transition: 'all 0.3s ease',
    bg: 'transparent',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    borderRadius: 'xl',
    p: 4,
    _hover: {
      bg: platform.hoverBg,
      transform: 'translateY(-2px)',
      boxShadow: `0 0 20px ${platform.color}40`,
    },
    _before: {
      content: '""',
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: `linear-gradient(90deg, transparent, ${platform.color}20, transparent)`,
      animation: `${shimmer} 2s infinite`,
    },
  })

  const content = (
    <VStack spacing={6} p={6}>
      <Text
        fontSize="xl"
        fontWeight="bold"
        bgGradient="linear(to-r, purple.300, blue.300)"
        bgClip="text"
        textAlign="center"
      >
        {t('shareOnSocialMedia')}
      </Text>

      <Flex gap={4} flexWrap="wrap" justify="center">
        {socialPlatforms.map(platform => (
          <Box
            key={platform.name}
            as={motion.div}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Button
              onClick={() => handleSocialShare(platform.name)}
              aria-label={t(`shareOn${platform.name}`)}
              {...socialButtonStyles(platform)}
            >
              <Image
                src={platform.logo}
                alt={platform.name}
                boxSize="32px"
                transition="transform 0.3s ease"
                _hover={{ transform: 'scale(1.1)' }}
              />
            </Button>
          </Box>
        ))}
      </Flex>

      <Button
        onClick={handleCopyArticleUrl}
        leftIcon={<CopyIcon />}
        size="lg"
        bgGradient="linear(to-r, purple.500, blue.500)"
        color="white"
        _hover={{
          bgGradient: 'linear(to-r, purple.600, blue.600)',
          transform: 'translateY(-2px)',
        }}
        _active={{
          transform: 'translateY(0)',
        }}
        transition="all 0.2s ease"
        boxShadow="0 4px 15px rgba(0,0,0,0.2)"
      >
        {t('copyArticleUrl')}
      </Button>
    </VStack>
  )

  return isMobile ? (
    <Drawer isOpen={isOpen} placement="bottom" onClose={onClose}>
      <DrawerOverlay backdropFilter="blur(8px)" />
      <DrawerContent {...sharedContentStyles} borderTopRadius="2xl">
        <DrawerCloseButton />
        <DrawerHeader borderBottomWidth="1px" textAlign="center">
          {t('share')}
        </DrawerHeader>
        <DrawerBody>{content}</DrawerBody>
      </DrawerContent>
    </Drawer>
  ) : (
    <Modal isOpen={isOpen} onClose={onClose} size="md">
      <ModalOverlay backdropFilter="blur(8px)" />
      <ModalContent {...sharedContentStyles} borderRadius="xl">
        <ModalHeader borderBottomWidth="1px" textAlign="center">
          {t('share')}
        </ModalHeader>
        <ModalCloseButton />
        {content}
      </ModalContent>
    </Modal>
  )
}

export default SocialShareComponent
