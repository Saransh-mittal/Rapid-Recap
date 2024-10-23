import { Flex, Text, Link } from '@chakra-ui/react'
import React from 'react'

const SourceLinkTag = ({ SourceURL }) => {
  // Extract domain name using regex
  const extractCompanyName = url => {
    try {
      // Match domain name between // and next /
      const domainRegex = /^(?:https?:\/\/)?(?:www\.)?([^\/]+)/i
      const match = url?.match(domainRegex)

      if (match && match[1]) {
        // Get the domain without .com/.org etc
        const domain = match[1].split('.')[0]
        // Capitalize first letter and format domain name
        return domain?.charAt(0)?.toUpperCase() + domain?.slice(1)
      }
      return 'Source Link' // Fallback text
    } catch (error) {
      console.error('Error extracting company name:', error)
      return 'Source Link'
    }
  }

  return (
    <Flex alignItems={'center'}>
      <Text
        fontSize="2xs"
        fontWeight="700"
        color="gray.500"
        textTransform="uppercase"
        letterSpacing="wide"
      >
        Source:
      </Text>

      <Link
        href={SourceURL}
        px={1}
        fontSize="2xs"
        fontWeight="700"
        color="gray.500"
        textTransform={'capitalize'}
        target="_blank"
      >
        {extractCompanyName(SourceURL)}
      </Link>
    </Flex>
  )
}

export default SourceLinkTag
