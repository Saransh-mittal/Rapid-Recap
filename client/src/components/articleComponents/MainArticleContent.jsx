import React, { useState } from 'react'
import {
  Box,
  Flex,
  Image,
  Skeleton,
  Text,
  useBreakpointValue,
  ListItem,
  UnorderedList,
  Link,
  Icon,
} from '@chakra-ui/react'
import { ExternalLinkIcon } from '@chakra-ui/icons'
import SourceLinkTag from './SourceLinkTag'

const FormattedContent = ({ mainText, themedContent }) => {
  const content = themedContent || mainText
  const formatURL = text => {
    const urlRegex = /(https?:\/\/[^\s]+)/g
    return text.split(urlRegex).map((part, index) => {
      if (part.match(urlRegex)) {
        // Extract the main website name from the URL
        let websiteName = new URL(part).hostname.replace('www.', '')
        websiteName = websiteName.charAt(0).toUpperCase() + websiteName.slice(1)

        return (
          <Link
            key={index}
            href={part}
            isExternal
            display="inline-flex"
            alignItems="center"
            px={2}
            py={1}
            mx={1}
            fontSize="sm"
            fontWeight="semibold"
            color="blue.500"
            bg="blue.50"
            borderRadius="md"
            boxShadow="sm"
            _hover={{
              bg: 'blue.100',
              color: 'blue.600',
              textDecoration: 'none',
            }}
            _active={{
              bg: 'blue.200',
            }}
            transition="all 0.2s ease-in-out"
          >
            {websiteName}
            <Icon as={ExternalLinkIcon} ml={1} boxSize={3} />
          </Link>
        )
      }
      return part
    })
  }
  const parseContent = text => {
    // Join the text if it's an array, otherwise use it as is
    const fullText = Array.isArray(text) ? text.join('\n') : text

    // Clean the text: remove numeric prefixes and normalize colons
    const cleanText = fullText?.replace(/\d+\.\s+/g, '').replace(/:{2,}/g, ':')

    // Split the text into sections based on bold headers
    const sections = cleanText
      ?.split(/(?=\*\*.+?\*\*:)/)
      ?.filter(item => item.trim() !== '')
    if (sections?.length === 1 && !themedContent) {
      // return the original 3 paragraphs of the mainText and also bold the ** headers in the first paragraph
      return content?.map((item, _) => {
        return {
          type: 'paragraph',
          header: item.trim(),
        }
      })
    }
    return sections?.map(section => {
      const [header, ...content] = section.split(':')
      const headerText = header.trim()
      const contentText = content.join(':').trim()

      if (contentText.includes('\n')) {
        // If the content has line breaks, treat it as a list
        const listItems = contentText
          .split('\n')
          .filter(item => item.trim() !== '')
        return { type: 'list', header: headerText, items: listItems }
      } else {
        // Otherwise, treat it as a paragraph
        return { type: 'paragraph', header: headerText, content: contentText }
      }
    })
  }

  const formatText = (text, type) => {
    return text?.split(/(\*\*.*?\*\*)/).map((part, index) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        return (
          <Text
            as={type === 'list' ? 'strong' : 'span'}
            key={index}
            display="inline"
            fontWeight="bold"
            align={'justify'}
          >
            {formatURL(part.slice(2, -2))}
          </Text>
        )
      } else if (part.startsWith('**')) {
        return (
          <Text
            as={type === 'list' ? 'strong' : 'span'}
            key={index}
            display="inline"
            fontWeight="bold"
            align={'justify'}
          >
            {formatURL(part.slice(2))}
          </Text>
        )
      } else if (part.endsWith('**')) {
        return (
          <Text
            as={type === 'list' ? 'strong' : 'span'}
            key={index}
            display="inline"
            fontWeight="bold"
            align={'justify'}
          >
            {formatURL(part.slice(0, -2))}
          </Text>
        )
      }
      return (
        <Text as="span" key={index} display="inline" align={'justify'}>
          {formatURL(part)}
        </Text>
      )
    })
  }

  const formatHeader = header => {
    if (header.startsWith('### ')) {
      return (
        <Text
          as="strong"
          display="block"
          fontWeight="extrabold"
          fontSize="1.2em"
          mb={2}
          align={'justify'}
        >
          {formatURL(header.slice(4))}
        </Text>
      )
    }
    return header.split(/(\*\*.*?\*\*)/).map((part, index) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        return (
          <Text
            as="strong"
            key={index}
            display="inline"
            fontWeight="bold"
            align={'justify'}
          >
            {formatURL(part.slice(2, -2))}
          </Text>
        )
      } else if (part.startsWith('**')) {
        return (
          <Text
            as="strong"
            key={index}
            display="inline"
            fontWeight="bold"
            align={'justify'}
          >
            {formatURL(part.slice(2))}
          </Text>
        )
      } else if (part.endsWith('**')) {
        return (
          <Text
            as="strong"
            key={index}
            display="inline"
            fontWeight="bold"
            align={'justify'}
          >
            {formatURL(part.slice(0, -2))}
          </Text>
        )
      }
      return (
        <Text as="span" key={index} display="inline" align={'justify'}>
          {formatURL(part)}
        </Text>
      )
    })
  }

  const parsedContent = parseContent(content)

  return (
    <Box>
      {parsedContent?.map((item, index) => {
        if (item.type === 'paragraph') {
          return (
            <Box key={index} mb={4}>
              <Text as="div" display="block" mb={2} align={'justify'}>
                {formatHeader(item.header)}
              </Text>
              <Text align={'justify'}>
                {formatText(item.content, item.type)}
              </Text>
            </Box>
          )
        } else if (item.type === 'list') {
          return (
            <Box key={index} mb={4}>
              <Text as="div" display="block" mb={2} align={'justify'}>
                {formatHeader(item.header)}
              </Text>
              <UnorderedList spacing={2}>
                {item.items.map((listItem, listItemIndex) => (
                  <ListItem key={listItemIndex}>
                    {formatText(listItem, item.type)}
                  </ListItem>
                ))}
              </UnorderedList>
            </Box>
          )
        }
      })}
    </Box>
  )
}

const MainArticleContent = ({
  imgURL,
  selectedLanguage,
  mainText,
  textRef,
  articleRef,
  articleLoading,
  themedContent,
  SourceURL,
}) => {
  const [useAltImage, setUseAltImage] = useState(false)

  const handleImageError = () => {
    if (!useAltImage) {
      setUseAltImage(true)
    }
  }

  const fontSize = useBreakpointValue({
    base: '1.1rem',
    md: '1.2rem',
    lg: '1.25rem',
  })
  const padding = useBreakpointValue({ base: 3, md: 4, lg: 6 })

  return (
    <Flex w={{ base: '90vw', md: '100%' }} overflow="hidden">
      <Skeleton isLoaded={!articleLoading} w={'100%'}>
        <Box
          ref={articleRef}
          px={padding}
          py={3}
          bg="rgba(26, 21, 39, 0.8)"
          borderRadius="lg"
          boxShadow="lg"
          fontFamily="'Segoe UI', Tahoma, Geneva, Verdana, sans-serif"
          fontSize={fontSize}
          lineHeight="1.8"
        >
          <figure>
            <Flex justifyContent="center" mt={[2, 3, 5]}>
              <Image
                src={imgURL}
                alt="Article Image"
                borderRadius="md"
                mb={[3, 4, 5]}
                width={{ base: '100%', sm: '100%', md: '80%', lg: '100%' }}
                height="auto"
                maxHeight={{
                  base: '300px',
                  sm: '400px',
                  md: '500px',
                  lg: '600px',
                }}
                objectFit="contain"
                onError={handleImageError}
                loading="lazy"
              />
            </Flex>
          </figure>
          <FormattedContent
            mainText={mainText[selectedLanguage]}
            themedContent={themedContent}
          />
          <SourceLinkTag SourceURL={SourceURL} />
        </Box>
      </Skeleton>
    </Flex>
  )
}

export default MainArticleContent
