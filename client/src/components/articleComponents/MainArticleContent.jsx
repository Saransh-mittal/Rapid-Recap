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
} from '@chakra-ui/react'

const FormattedContent = ({ mainText }) => {
  const parseContent = text => {
    // Join the text if it's an array, otherwise use it as is
    const fullText = Array.isArray(text) ? text.join('\n') : text

    // Clean the text: remove numeric prefixes and normalize colons
    const cleanText = fullText?.replace(/\d+\.\s+/g, '').replace(/:{2,}/g, ':')

    // Split the text into sections based on bold headers
    const sections = cleanText
      ?.split(/(?=\*\*.+?\*\*:)/)
      ?.filter(item => item.trim() !== '')
    if (sections?.length === 1) {
      // return the original 3 paragraphs of the mainText and also bold the ** headers in the first paragraph
      return mainText?.map((item, _) => {
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
          >
            {part.slice(2, -2)}
          </Text>
        )
      }
      return (
        <Text as="span" key={index} display="inline">
          {part}
        </Text>
      )
    })
  }

  const formatHeader = header => {
    return header.split(/(\*\*.*?\*\*)/).map((part, index) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        return (
          <Text as="strong" key={index} display="inline" fontWeight="bold">
            {part.slice(2, -2)}
          </Text>
        )
      } else if (part.startsWith('**')) {
        return (
          <Text as="strong" key={index} display="inline" fontWeight="bold">
            {part.slice(2)}
          </Text>
        )
      } else if (part.endsWith('**')) {
        return (
          <Text as="strong" key={index} display="inline" fontWeight="bold">
            {part.slice(0, -2)}
          </Text>
        )
      }
      return (
        <Text as="span" key={index} display="inline">
          {part}
        </Text>
      )
    })
  }

  const parsedContent = parseContent(mainText)

  return (
    <Box>
      {parsedContent?.map((item, index) => {
        if (item.type === 'paragraph') {
          return (
            <Box key={index} mb={4}>
              <Text as="div" display="block" mb={2}>
                {formatHeader(item.header)}
              </Text>
              <Text>{formatText(item.content, item.type)}</Text>
            </Box>
          )
        } else if (item.type === 'list') {
          return (
            <Box key={index} mb={4}>
              <Text as="div" display="block" mb={2}>
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
  translateLoading,
  selectedLanguage,
  mainText,
  textRef,
  articleRef,
  articleLoading,
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
      <Skeleton isLoaded={!translateLoading && !articleLoading} w={'100%'}>
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
          <FormattedContent mainText={mainText[selectedLanguage]} />
        </Box>
      </Skeleton>
    </Flex>
  )
}

export default MainArticleContent
