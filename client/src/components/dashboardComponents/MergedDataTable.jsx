// src/components/dashboard/MergedDataTable.jsx
import React, { Suspense } from 'react'
import {
  Box,
  Heading,
  Skeleton,
  Spinner,
  useMediaQuery,
} from '@chakra-ui/react'
import DataTable from '../miscellaneous/DataTable'

const MergedDataTable = ({ loading, columns, data }) => {
  const [isLargerThan768] = useMediaQuery('(min-width: 768px)')

  return (
    <Box py={6} borderRadius="lg" boxShadow="md">
      <Heading size={isLargerThan768 ? 'md' : 'sm'} mb={4}>
        Merged Data
      </Heading>
      {loading ? (
        <Skeleton height="200px" />
      ) : (
        <Suspense fallback={<Spinner />}>
          <DataTable columns={columns} data={data} />
        </Suspense>
      )}
    </Box>
  )
}

export default MergedDataTable
