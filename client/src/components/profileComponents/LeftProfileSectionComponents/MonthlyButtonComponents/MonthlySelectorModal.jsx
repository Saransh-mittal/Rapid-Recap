import React, {
  useState,
  useCallback,
  useMemo,
  Suspense,
  useEffect,
} from 'react'
import {
  Drawer,
  DrawerBody,
  DrawerHeader,
  DrawerOverlay,
  DrawerContent,
  DrawerCloseButton,
  Flex,
  useDisclosure,
  useMediaQuery,
  useToast,
  Spinner,
  Select,
  Box,
  Text,
} from '@chakra-ui/react'
import axios from 'axios'
import { useTranslation } from 'react-i18next'

// Lazy load components
const Button = React.lazy(() =>
  import('../../../miscellaneous/ButtonComponent'),
)
const ButtonGradient = React.lazy(() =>
  import('../../../../assets/svg/ButtonGradient'),
)
const MonthlyModal = React.lazy(() => import('./MonthlyModal'))

const MONTHS = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
]

const MonthlySelectorModal = ({
  isOpen,
  onClose,
  inGameName,
  loginedUserProfile,
  privacyProfileData = {},
}) => {
  const { t } = useTranslation('MonthlySelectorModal')
  const {
    isOpen: isOpenMonthModal,
    onOpen: onOpenMonthModal,
    onClose: onCloseMonthModal,
  } = useDisclosure()

  const [selectedMonth, setSelectedMonth] = useState(null)
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear())
  const [monthlyData, setMonthlyData] = useState(null)
  const [availableMonths, setAvailableMonths] = useState([])
  const [isLoading, setIsLoading] = useState(false)
  const [isLoadingAvailability, setIsLoadingAvailability] = useState(true)
  const [error, setError] = useState(null)
  const [isLargerThan992px] = useMediaQuery('(min-width: 992px)')
  const toast = useToast()

  useEffect(() => {
    const fetchAvailability = async () => {
      if (isOpen) {
        setIsLoadingAvailability(true)
        try {
          const response = await axios.get(
            `/api/user/monthlyAvailability/${inGameName}`,
          )
          setAvailableMonths(response.data.availableMonths)

          if (response.data.availableMonths.length > 0) {
            setSelectedYear(response.data.availableMonths[0].year)
          }
        } catch (error) {
          console.error('Error fetching monthly availability:', error)
          toast({
            title: t('errorTitle'),
            description: t('errorFetchingAvailability'),
            status: 'error',
            duration: 5000,
            isClosable: true,
            position: 'top',
          })
        } finally {
          setIsLoadingAvailability(false)
        }
      }
    }

    fetchAvailability()
  }, [isOpen, inGameName, toast, t])

  const fetchMonthHistory = useCallback(
    async (month, year) => {
      setIsLoading(true)
      setError(null)

      try {
        const response = await axios.get(
          `/api/user/monthlyHistory/${inGameName}`,
          {
            params: {
              month,
              year,
            },
          },
        )
        setMonthlyData(response.data)
        onOpenMonthModal()
      } catch (error) {
        setError(error)
        toast({
          title: t('errorTitle'),
          description: error.response?.data?.error || t('errorDescription'),
          status: 'error',
          duration: 5000,
          isClosable: true,
          position: 'top',
        })
      } finally {
        setIsLoading(false)
      }
    },
    [inGameName, onOpenMonthModal, toast, t],
  )

  const handleMonthClick = useCallback(
    month => {
      if (selectedMonth === month) {
        onCloseMonthModal()
        setSelectedMonth(null)
        setMonthlyData(null)
      } else {
        setSelectedMonth(month)
        fetchMonthHistory(month, selectedYear)
      }
    },
    [selectedMonth, selectedYear, fetchMonthHistory, onCloseMonthModal],
  )

  const handleYearChange = useCallback(
    event => {
      const year = parseInt(event.target.value)
      setSelectedYear(year)
      setSelectedMonth(null)
      setMonthlyData(null)
      onCloseMonthModal()
    },
    [onCloseMonthModal],
  )

  const availableYears = useMemo(() => {
    return availableMonths.map(ym => ym.year).sort((a, b) => b - a)
  }, [availableMonths])

  const availableMonthsForYear = useMemo(() => {
    const yearData = availableMonths.find(ym => ym.year === selectedYear)
    return yearData?.months || []
  }, [availableMonths, selectedYear])

  const monthButtons = useMemo(() => {
    // Only show months that have data
    return availableMonthsForYear.map(monthIndex => {
      const isSelected = selectedMonth === monthIndex && !isLoading

      return (
        <Suspense fallback={<Spinner />} key={`${selectedYear}-${monthIndex}`}>
          <Box position="relative" mb={2}>
            <Button
              white={isSelected}
              onClick={() => handleMonthClick(monthIndex)}
              _hover={{
                opacity: 0.8,
              }}
            >
              <Flex alignItems="center" gap={2}>
                {MONTHS[monthIndex - 1]}
                <Text fontSize="sm" color="whiteAlpha.700">
                  {selectedYear}
                </Text>
              </Flex>
            </Button>
            {isLoading && isSelected && (
              <Spinner
                position="absolute"
                right="-25px"
                top="50%"
                transform="translateY(-50%)"
                size="sm"
                color="white"
              />
            )}
          </Box>
        </Suspense>
      )
    })
  }, [
    selectedYear,
    selectedMonth,
    isLoading,
    availableMonthsForYear,
    handleMonthClick,
  ])

  const handleClose = useCallback(() => {
    onCloseMonthModal()
    onClose()
    setSelectedMonth(null)
    setMonthlyData(null)
    setError(null)
  }, [onClose, onCloseMonthModal])

  return (
    <>
      <Drawer
        isOpen={isOpen}
        placement={isLargerThan992px ? 'left' : 'top'}
        onClose={handleClose}
      >
        <DrawerOverlay />
        <DrawerContent
          bg="rgba(15, 13, 21, 0.8)"
          borderRadius="xl"
          boxShadow="0 8px 32px 0 rgba(31, 38, 135, 0.37)"
          border="1px solid rgba(255, 255, 255, 0.18)"
          width={{ base: '100vw', lg: '20rem' }}
          maxWidth={{ base: '100vw', lg: '20rem' }}
        >
          <DrawerCloseButton color="white" />
          <DrawerHeader
            textAlign="center"
            mt={{ base: '0', lg: '2rem' }}
            color="white"
            flexDirection="column"
            display="flex"
            gap={4}
          >
            {t('selectMonth')}
            {isLoadingAvailability ? (
              <Spinner size="sm" color="white" alignSelf="center" />
            ) : (
              <Select
                value={selectedYear}
                onChange={handleYearChange}
                bg="#0f0d15"
                color="white"
                borderColor="rgba(255, 255, 255, 0.16)"
                _hover={{
                  borderColor: 'rgba(255, 255, 255, 0.24)',
                }}
                sx={{
                  '& option': {
                    backgroundColor: '#0f0d15',
                    color: 'white',
                  },
                }}
              >
                {availableYears.map(year => (
                  <option key={year} value={year}>
                    {year}
                  </option>
                ))}
              </Select>
            )}
          </DrawerHeader>

          <DrawerBody>
            <Suspense fallback={<Spinner />}>
              <ButtonGradient />
            </Suspense>
            {isLoadingAvailability ? (
              <Flex justify="center" align="center" h="200px">
                <Spinner size="xl" color="white" />
              </Flex>
            ) : (
              <Flex
                w="100%"
                justifyContent="center"
                alignItems="center"
                flexDirection={isLargerThan992px ? 'column' : 'row'}
                flexWrap="wrap"
                gap={4}
                py={4}
              >
                {monthButtons}
              </Flex>
            )}
            {error && (
              <Text color="red.400" textAlign="center" mt={4}>
                {error.response?.data?.error || t('errorDescription')}
              </Text>
            )}
          </DrawerBody>
        </DrawerContent>
      </Drawer>

      <Suspense fallback={<Spinner />}>
        <MonthlyModal
          isOpen={isOpenMonthModal}
          onClose={() => {
            onCloseMonthModal()
            setSelectedMonth(null)
            setMonthlyData(null)
          }}
          month={selectedMonth}
          year={selectedYear}
          isLoading={isLoading}
          profile={monthlyData}
          privacyProfileData={privacyProfileData}
          loginedUserProfile={loginedUserProfile}
          inGameName={inGameName}
        />
      </Suspense>
    </>
  )
}

export default MonthlySelectorModal
