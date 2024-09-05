import { Avatar } from '@chakra-ui/avatar'
import { Box, Text } from '@chakra-ui/layout'
import { useTranslation } from 'react-i18next'

const UserListItem = ({ handleFunction, user }) => {
  const { t } = useTranslation('UserListItem') // Adjust the namespace as needed

  return (
    <Box
      onClick={handleFunction}
      cursor="pointer"
      bg={'#0f0d15'}
      _hover={{
        background: '#38B2AC',
        color: 'white',
      }}
      color={'white'}
      boxShadow={
        '0px 4px 8px rgba(0, 0, 0, 0.3), 0px 8px 16px rgba(0, 0, 0, 0.3), 0px 12px 24px rgba(0, 0, 0, 0.3)'
      }
      w="100%"
      d="flex"
      alignItems="center"
      px={3}
      py={2}
      mb={4}
      borderRadius="lg"
    >
      <Avatar
        mr={2}
        size="sm"
        cursor="pointer"
        name={user.name}
        src={user.pic}
      />
      <Box>
        <Text>{user.name}</Text>
        <Text fontSize="xs" mb={0}>
          <b>{t('IQScore')} : </b>
          {user.IQ_score}
        </Text>
        <Text fontSize="xs">
          <b>{t('InGameName')} : </b>
          {user.inGameName}
        </Text>
      </Box>
    </Box>
  )
}

export default UserListItem
