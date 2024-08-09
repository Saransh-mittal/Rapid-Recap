import { Box, Flex } from '@chakra-ui/react'
import TagLine from './TaglineComponent'

const Heading = ({
  className,
  title,
  text,
  tag,
  marginBottom = '8',
  textTransform = '',
  children,
  tagMarginBottom = '4',
  tagColor = 'white',
  tagFontSize,
  tagFontWeight,
  headingWeight = '',
}) => {
  return (
    <Flex
      maxWidth="50rem"
      marginX="auto"
      marginBottom={marginBottom}
      justifyContent={'center'}
      alignItems={'center'}
      flexDirection={'column'}
      textAlign="center"
      className={className}
      textTransform={textTransform}
    >
      {tag && (
        <Box textAlign="center" marginBottom={tagMarginBottom} color={tagColor}>
          <TagLine tagFontSize={tagFontSize} tagFontWeight={tagFontWeight}>
            {tag} {children}
          </TagLine>
        </Box>
      )}
      {title && (
        <Box as="h2" className="h2" fontWeight={headingWeight}>
          {title}
        </Box>
      )}
      {text && (
        <Box as="p" fontSize="md" marginTop="4" color="gray.600">
          {text}
        </Box>
      )}
    </Flex>
  )
}

export default Heading
