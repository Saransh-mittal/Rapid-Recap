import React from 'react'
import { HStack, Icon } from '@chakra-ui/react'

const StarIcon = props => (
  <Icon viewBox="0 0 24 24" {...props}>
    <path
      fill="currentColor"
      d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"
    />
  </Icon>
)

const StarRating = ({ rating, onRatingChange }) => {
  return (
    <HStack spacing={2}>
      {[1, 2, 3, 4, 5].map(star => (
        <StarIcon
          key={star}
          boxSize={8}
          color={star <= rating ? 'yellow.400' : 'gray.400'}
          cursor="pointer"
          onClick={() => onRatingChange(star)}
          _hover={{ color: 'yellow.300' }}
          transition="color 0.2s"
        />
      ))}
    </HStack>
  )
}

export default StarRating
