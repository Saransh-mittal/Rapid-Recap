import React from 'react'
import { Flex } from '@chakra-ui/react'
import BookmarkSVG from '../../../assets/svg/BookmarkSVG'
import FilledBookmarkSVG from '../../../assets/svg/FilledBookmarkSVG'

const BookmarkIcon = React.memo(({ bookmark, onBookmarkClick, playClick }) => (
  <Flex
    onClick={() => {
      playClick()
      onBookmarkClick()
    }}
    cursor="pointer"
    h={'100%'}
    mt={3}
  >
    {bookmark ? (
      <FilledBookmarkSVG width={'25px'} height={'25px'} />
    ) : (
      <BookmarkSVG width={'25px'} height={'25px'} />
    )}
  </Flex>
))

export default BookmarkIcon
