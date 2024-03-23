import React, { useEffect, useState } from "react";
import { Box, Flex, Grid, Text, Tooltip, useToast } from "@chakra-ui/react";
import axios from "axios";

const DAYS_IN_WEEK = 7;
const MONTHS_IN_YEAR = 12;
const MONTH_NAMES = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];

const DailyActivity = () => {
  const toast = useToast();
  const [isLoading, setIsLoading] = useState(true);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());
  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth());
  const [dailyActivity, setDailyActivity] = useState([]);

  const fetchDailyActivity = async () => {
    try {
      const response = await axios.get("/api/user/dailyActivity");
      //console.log(response.data);
      const data = response.data.dailyActivity.map((activity) => {
        return formatDate(new Date(activity.date));
      });
      //console.log(data);
      setDailyActivity(data);
    } catch (error) {
      toast({
        title: "Error",
        description: "An error occurred while fetching daily activity",
        status: "error",
        duration: 9000,
        isClosable: true,
      });
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const getMonthDays = (year, month) => {
    const date = new Date(year, month, 1);

    // Get the date for the first day of the next month
    const nextMonth = month === 11 ? 0 : month + 1; // Handle December as a special case
    const nextDate = new Date(year, nextMonth, 1);

    // Subtract one day from the next date to get the last day of the current month
    const lastDay = new Date(nextDate.getTime() - 1);

    // Return the day of the month (which is the number of days)
    return lastDay.getDate();
  };

  function generateCalendarData(year, currentMonthIndex) {
    const calendarData = [];
    const monthsToShow = MONTHS_IN_YEAR; // Total number of months to show

    // Calculate the starting month index
    let startingMonthIndex = currentMonthIndex - 5;
    let startingYear = year;
    if (startingMonthIndex < 0) {
      startingMonthIndex += MONTHS_IN_YEAR;
      startingYear--;
    }

    // Loop through each month to generate data
    for (let i = 0; i < monthsToShow; i++) {
      const monthIndex = (startingMonthIndex + i) % MONTHS_IN_YEAR;
      let monthYear =
        startingYear + Math.floor((startingMonthIndex + i) / MONTHS_IN_YEAR);
      const month = new Date(monthYear, monthIndex, 1);
      const monthDays = getMonthDays(monthYear, monthIndex);
      const firstDay = month.getDay();
      const allDays = [];

      // Fill the beginning of the calendar with days from the previous month
      let prevMonthDays = getMonthDays(monthYear, monthIndex - 1); // Get days in previous month
      if (monthIndex === 0) {
        // Adjust for December of previous year
        prevMonthDays = getMonthDays(monthYear - 1, 11);
      }
      for (let j = 0; j < firstDay; j++) {
        const prevMonthDate = new Date(
          monthYear,
          monthIndex - 1,
          prevMonthDays - j
        );
        allDays.push({
          isCurrentMonth: false,
          day: prevMonthDays - j,
          fullDate: formatDate(prevMonthDate),
        });
      }

      // Fill the calendar with days from the current month
      for (let j = 1; j <= monthDays; j++) {
        const currentDate = new Date(monthYear, monthIndex, j);
        allDays.push({
          isCurrentMonth: true,
          day: j,
          fullDate: formatDate(currentDate),
        });
      }

      // Fill the remaining cells with days from the next month
      const remainingCells =
        DAYS_IN_WEEK - ((firstDay + monthDays) % DAYS_IN_WEEK);
      for (let j = 1; j <= remainingCells; j++) {
        const nextMonthDate = new Date(monthYear, monthIndex + 1, j);
        allDays.push({
          isCurrentMonth: false,
          day: j,
          fullDate: formatDate(nextMonthDate),
        });
      }

      calendarData.push({
        month: monthIndex,
        year: monthYear,
        days: allDays,
      });
    }

    return calendarData;
  }

  function formatDate(date) {
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "2-digit",
      year: "numeric",
    });
  }
  const calendarData = generateCalendarData(currentYear, currentMonth);
  function renderCalendarBody(month, allDays) {
    return (
      <Flex direction={{ base: "column" }} key={month} p={0} m={0}>
        <Flex h={"80px"} p={0} m={0}>
          <Flex
            p={0}
            m={0}
            mb={{ base: "10px", md: 0 }}
            justifyContent={"center"}
            alignItems={"center"}
            w={{ xl: "fit-content", md: "65px", base: "48px" }}
          >
            <Grid
              templateColumns={`repeat(${DAYS_IN_WEEK}, 1fr)`}
              gap={"2px"}
              transform={"rotate(-90deg) scaleX(-1)"}
              p={0}
              m={0}
            >
              {allDays.map((dayObj, index) => {
                const backgroundColor = dailyActivity.includes(dayObj.fullDate)
                  ? "green.500"
                  : "#eff2f699";
                return (
                  <Box
                    key={index}
                    textAlign="center"
                    p={0}
                    h={{ base: "5px", md: "7px", lg: "8px" }}
                    w={{ base: "5px", md: "7px", lg: "8px" }}
                  >
                    {dayObj.isCurrentMonth ? (
                      <Tooltip label={dayObj.fullDate}>
                        <Flex
                          borderRadius={"1px"}
                          h={{ base: "5px", md: "7px", lg: "8px" }}
                          w={{ base: "5px", md: "7px", lg: "8px" }}
                          p={0}
                          backgroundColor={backgroundColor}
                          justifyContent={"center"}
                          alignItems={"center"}
                        ></Flex>
                      </Tooltip>
                    ) : null}
                  </Box>
                );
              })}
            </Grid>
          </Flex>
        </Flex>
        <Text
          fontSize={{ base: "xs", md: "sm" }}
          textAlign="center"
          marginTop={{ base: "10px", md: 0 }}
        >
          {MONTH_NAMES[month]}
        </Text>
      </Flex>
    );
  }

  useEffect(() => {
    fetchDailyActivity();
  }, []);

  return (
    <Box m={0} pt={3}>
      {isLoading ? (
        <Text>Loading...</Text>
      ) : (
        <Flex
          overflow={"hidden"}
          p={0}
          m={0}
          w={"100%"}
          justifyContent={"center"}
        >
          {calendarData.map((data, id) =>
            renderCalendarBody(data.month, data.days)
          )}
        </Flex>
      )}
    </Box>
  );
};

export default DailyActivity;
