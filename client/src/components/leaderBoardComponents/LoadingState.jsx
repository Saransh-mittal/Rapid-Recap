import { Spinner, Tbody, Td, Tr } from '@chakra-ui/react'

const LoadingState = () => (
  <Tbody marginTop={'20px'} className="Entries">
    <Tr>
      <Td colSpan={6} textAlign={'center'}>
        <Spinner
          thickness="4px"
          speed="0.65s"
          emptyColor="gray.200"
          color="blue.500"
          size="xl"
        />
      </Td>
    </Tr>
  </Tbody>
)

export default LoadingState
