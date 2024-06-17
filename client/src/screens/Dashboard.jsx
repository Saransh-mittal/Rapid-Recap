// /src/screens/Dashboard.jsx
import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  Box,
  Heading,
  Input,
  VStack,
  HStack,
  Button,
  Text,
  Alert,
  AlertIcon,
  Skeleton,
} from "@chakra-ui/react";
import DataTable from "../components/miscellaneous/DataTable";

const Dashboard = () => {
  const [quizAttempts, setQuizAttempts] = useState([]);
  const [lastLogin, setLastLogin] = useState([]);
  const [timeSpent, setTimeSpent] = useState([]);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [lastLoginAfterDate, setLastLoginAfterDate] = useState("");
  const [selectedTables, setSelectedTables] = useState(["quizAttempts"]);
  const [dateError, setDateError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const today = new Date().toISOString().split("T")[0];
    setStartDate(today);
    setEndDate(today);
    setLastLoginAfterDate(today);
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const token = localStorage.getItem("token");
        const config = { headers: { Authorization: `Bearer ${token}` } };

        if (selectedTables.includes("quizAttempts")) {
          const quizResponse = await axios.get("/api/admin/quiz-attempts", {
            params: { startDate, endDate },
            ...config,
          });
          setQuizAttempts(
            quizResponse.data.users.map((user) => ({
              ...user._id,
              quizAttempts: user.quizAttempts,
            }))
          );
        }

        if (selectedTables.includes("lastLogin")) {
          const loginResponse = await axios.get("/api/admin/last-login", {
            params: { afterDate: lastLoginAfterDate },
            ...config,
          });
          setLastLogin(loginResponse.data.users);
        }

        if (selectedTables.includes("timeSpent")) {
          const timeResponse = await axios.get("/api/admin/time-spent", {
            params: { startDate, endDate },
            ...config,
          });
          setTimeSpent(
            timeResponse.data.users.map((user) => ({
              timeSpent: Math.ceil(user.timeSpent),
              ...user._id,
            }))
          );
        }
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [startDate, endDate, lastLoginAfterDate, selectedTables]);

  const handleTableChange = (table) => {
    setSelectedTables((prevSelectedTables) => {
      if (prevSelectedTables.includes(table)) {
        return prevSelectedTables.filter((t) => t !== table);
      } else {
        return [...prevSelectedTables, table];
      }
    });
  };

  const handleDateChange = (setter) => (event) => {
    const { value } = event.target;
    const today = new Date().toISOString().split("T")[0];
    if (value > today) {
      setDateError("Dates cannot be in the future.");
    } else if (setter === setStartDate && value > endDate) {
      setDateError("Start date cannot be greater than end date.");
    } else if (setter === setEndDate && value < startDate) {
      setDateError("End date cannot be less than start date.");
    } else {
      setDateError("");
      setter(value);
    }
  };

  const mergeData = () => {
    const mergedData = [];
    const users = new Set([
      ...quizAttempts.map((user) => user.email),
      ...lastLogin.map((user) => user.email),
      ...timeSpent.map((user) => user.email),
    ]);

    let totalUsers = users.size;
    let totalQuizAttemptsUsers = 0;
    let totalLastLoginUsers = 0;
    let totalTimeSpentUsers = 0;

    users.forEach((email) => {
      const quizData = quizAttempts.find((user) => user.email === email) || {};
      const loginData = lastLogin.find((user) => user.email === email) || {};
      const timeData = timeSpent.find((user) => user.email === email) || {};

      if (quizData.email) totalQuizAttemptsUsers++;
      if (loginData.email) totalLastLoginUsers++;
      if (timeData.email) totalTimeSpentUsers++;

      mergedData.push({
        name: quizData.name || loginData.name || timeData.name || "",
        email,
        inGameName:
          quizData.inGameName ||
          loginData.inGameName ||
          timeData.inGameName ||
          "",
        quizAttempts: quizData.quizAttempts || 0,
        lastLogin: loginData.lastLogin || "",
        timeSpent: timeData.timeSpent || 0,
      });
    });

    return {
      data: mergedData,
      totals: {
        totalUsers,
        totalQuizAttemptsUsers,
        totalLastLoginUsers,
        totalTimeSpentUsers,
      },
    };
  };

  const getMergedColumns = () => {
    const columns = ["name", "email", "inGameName"];
    if (selectedTables.includes("quizAttempts")) columns.push("quizAttempts");
    if (selectedTables.includes("lastLogin")) columns.push("lastLogin");
    if (selectedTables.includes("timeSpent")) columns.push("timeSpent");
    return columns;
  };

  const renderButton = (label, table) => (
    <Button
      onClick={() => handleTableChange(table)}
      backgroundColor={selectedTables.includes(table) ? "blue.500" : "gray.200"}
      color={selectedTables.includes(table) ? "white" : "black"}
    >
      {label}
    </Button>
  );

  const { data: mergedData, totals } = mergeData();

  return (
    <Box margin={"5rem"}>
      <Heading textAlign={"center"} margin={"1rem"}>
        Dashboard
      </Heading>
      {(selectedTables.includes("quizAttempts") ||
        selectedTables.includes("timeSpent")) && (
        <HStack spacing={4} align="flex-start">
          <label>
            Start Date:
            <Input
              type="date"
              value={startDate}
              max={new Date().toISOString().split("T")[0]}
              onChange={handleDateChange(setStartDate)}
            />
          </label>

          <label>
            End Date:
            <Input
              type="date"
              value={endDate}
              max={new Date().toISOString().split("T")[0]}
              onChange={handleDateChange(setEndDate)}
            />
          </label>
        </HStack>
      )}

      {selectedTables.includes("lastLogin") && (
        <HStack spacing={4} align="flex-start" marginTop={4}>
          <label>
            Last Login After Date:
            <Input
              type="date"
              value={lastLoginAfterDate}
              max={new Date().toISOString().split("T")[0]}
              onChange={handleDateChange(setLastLoginAfterDate)}
            />
          </label>
        </HStack>
      )}

      {dateError && (
        <Alert status="error" marginTop={4}>
          <AlertIcon />
          {dateError}
        </Alert>
      )}

      <HStack spacing={4} align="flex-start" marginTop={4}>
        {renderButton("Show Quiz Attempts", "quizAttempts")}
        {renderButton("Show Last Login Times", "lastLogin")}
        {renderButton("Show Time Spent", "timeSpent")}
      </HStack>

      {selectedTables.length > 0 && (
        <Box mt={8}>
          <HStack w={"100%"} justifyContent={"space-between"}>
            <Text>Total Users: {totals.totalUsers}</Text>
            <Text>
              Total Quiz Attempts Users: {totals.totalQuizAttemptsUsers}
            </Text>
            <Text>Total Last Login Users: {totals.totalLastLoginUsers}</Text>
            <Text>Total Time Spent Users: {totals.totalTimeSpentUsers}</Text>
          </HStack>
          <Heading size="md">Merged Data</Heading>
          {loading ? (
            <Skeleton height="200px" />
          ) : (
            <DataTable columns={getMergedColumns()} data={mergedData} />
          )}
        </Box>
      )}
    </Box>
  );
};

export default Dashboard;
