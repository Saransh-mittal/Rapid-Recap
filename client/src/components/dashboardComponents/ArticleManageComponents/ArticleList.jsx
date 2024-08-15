import React, { useCallback, memo } from 'react'
import { Box, HStack, VStack, Text, IconButton } from '@chakra-ui/react'
import { ViewIcon, EditIcon } from '@chakra-ui/icons'

const ArticleItem = memo(({ article, onView, onEdit }) => (
  <Box p={4} borderWidth="1px" borderRadius="md">
    <HStack justify="space-between">
      <VStack align="start" spacing={0}>
        <Text fontWeight="bold">{article.title}</Text>
        <Text fontSize="sm" color="gray.600">
          by {article.author}
        </Text>
      </VStack>
      <HStack>
        <IconButton
          aria-label="View article"
          icon={<ViewIcon />}
          onClick={onView}
        />
        <IconButton
          aria-label="Edit article"
          icon={<EditIcon />}
          onClick={onEdit}
        />
      </HStack>
    </HStack>
  </Box>
))

const ArticleList = memo(({ articles, navigate, handleEditArticle }) => {
  const handleViewArticle = useCallback(
    id => {
      navigate(`/article/${id}`)
    },
    [navigate],
  )

  return (
    <>
      {articles &&
        articles.length > 0 &&
        articles.map(article => (
          <ArticleItem
            key={article._id}
            article={article}
            onView={() => handleViewArticle(article._id)}
            onEdit={() => handleEditArticle(article._id)}
          />
        ))}
    </>
  )
})

export default ArticleList
