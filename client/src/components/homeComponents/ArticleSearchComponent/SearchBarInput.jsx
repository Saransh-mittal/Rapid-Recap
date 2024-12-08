import React from 'react'
import { Input, Box } from '@chakra-ui/react'
import { useTranslation } from 'react-i18next'

const SearchBarInput = React.memo(
  ({ searchTerm, handleInputChange, handleKeyDown, isHovered, isFocused }) => {
    const { t } = useTranslation('SearchBarInput')

    return (
      <Box position="relative" flexGrow={1}>
        <Input
          px={6}
          py={4}
          fontSize="md"
          bg="transparent"
          border="none"
          color="white"
          placeholder={t('placeholder')}
          value={searchTerm}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          transition="all 0.3s"
          letterSpacing={isFocused ? '0.025em' : 'normal'}
          _placeholder={{
            color: 'whiteAlpha.500',
            textTransform: 'uppercase',
            transition: 'opacity 0.3s',
            opacity: isHovered || isFocused ? 0.7 : 0.5,
          }}
          _focus={{
            outline: 'none',
            boxShadow: 'none',
          }}
          width="full"
        />
      </Box>
    )
  },
)

export default SearchBarInput
