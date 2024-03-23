import React, { useEffect, useRef, useState } from "react";
import { Line } from "react-chartjs-2";
import { Flex, Image, Text, useToast } from "@chakra-ui/react";
import Chart from "chart.js/auto";
import moment from "moment";
import "chartjs-adapter-date-fns";
import axios from "axios";

const IQLineGraph = () => {
  const [isLoading, setIsLoading] = useState(true);
  const toast = useToast();
  const [IQScoreHistory, setIQScoreHistory] = useState([]);
  const [hoveredIndex, setHoveredIndex] = useState(null);
  const [minIQ, setMinIQ] = useState(0);
  const [maxIQ, setMaxIQ] = useState(0);

  const [hoveredData, setHoveredData] = useState(null);
  const [isHovering, setIsHovering] = useState(false);
  const [chartOptions, setChartOptions] = useState(null);
  const chartRef = useRef(null);
  const handleHover = (event, array) => {
    const chart = chartRef.current;
    setIsHovering(true);
    if (array && array.length) {
      const point = array[0];
      const index = point.index;
      if (index !== hoveredIndex) {
        // Update hovered index only when index changes
        setHoveredIndex(index);
        setIsHovering(true);
        const ctx = chart.ctx;
        const x = point.element.x;
        const topY = chart.scales.y.top;
        const bottomY = chart.scales.y.bottom;

        ctx.save();
        ctx.beginPath();
        ctx.moveTo(x, topY);
        ctx.lineTo(x, bottomY);
        //console.log(ctx);
        ctx.lineWidth = 1;
        ctx.strokeStyle = "#B3A492";
        ctx.stroke();
        ctx.restore();

        const y = point.element.y;
        const radius = 8; // Adjust the size of the shadow
        ctx.beginPath();
        ctx.arc(x, y, radius, 0, 2 * Math.PI, false);
        ctx.fillStyle = "rgba(255, 152, 0, 0.2)"; // Orangish color with opacity
        ctx.fill();
        ctx.closePath();
        //console.log(IQScoreHistory);
        //setHoveredData(() => IQScoreHistory[index]);
      }
    } else {
      setHoveredData(null);
    }
  };
  useEffect(() => {
    setHoveredData(IQScoreHistory[hoveredIndex]);
  }, [hoveredIndex]);
  const [chartData, setChartData] = useState(null);

  const nextDateFunc = (dateString) => {
    // Split the date string into year, month, and day
    const [yearStr, monthStr, dayStr] = dateString.split(":");

    // Parse the year, month, and day as integers
    const year = parseInt(yearStr);
    const month = parseInt(monthStr) - 1; // Months are 0-indexed
    const day = parseInt(dayStr);

    // Create a new Date object
    const dateObject = new Date(year, month, day);

    // Add one day to the date
    dateObject.setDate(dateObject.getDate() + 1);

    // Get the updated year, month, and day
    const newYear = dateObject.getFullYear();
    const newMonth = dateObject.getMonth() + 1; // Adding 1 to adjust for 0-indexed months
    const newDay = dateObject.getDate();

    return `${newYear}:${newMonth.toString().padStart(2, "0")}:${newDay
      .toString()
      .padStart(2, "0")}`;
  };

  const fetchIQData = async () => {
    try {
      const response = await axios.get(`/api/user/getUserIQScoreHistory`);
      //console.log(response.data);
      if (response.data.IQ_score_history.length === 0) {
        return;
      }
      const dateString =
        response.data.IQ_score_history[
          response.data.IQ_score_history.length - 1
        ].date; // Assuming the date format is "YYYY:MM:DD"

      const newDateString = nextDateFunc(dateString);
      setIQScoreHistory((prev) => [
        { date: null, IQScore: null, dailyRank: null },
        ...response.data.IQ_score_history,
        { date: newDateString, IQScore: null, dailyRank: null },
      ]);
      const minimumIQ = Math.min(
        ...response.data.IQ_score_history.map((entry) => entry.IQScore)
      );
      const maximumIQ = Math.max(
        ...response.data.IQ_score_history.map((entry) => entry.IQScore)
      );
      // Convert the date string to a Date object

      const IQData = [
        { date: null, IQScore: null, dailyRank: null },
        ...response.data.IQ_score_history,
        { date: newDateString, IQScore: null, dailyRank: null },
      ];
      setChartData({
        labels: IQData.map((entry) => entry.date),
        datasets: [
          {
            data: IQData.map((entry) => entry.IQScore),
            borderColor: "#F2D8D8", // Orangish color for the line
            pointBorderColor: "#FFF6F6",
            pointBackgroundColor: (context) => {
              return context.dataIndex === IQData.length - 2 && !isHovering
                ? "white"
                : "#ff9800";
            },
            backgroundColor: "rgba(0, 0, 0, 0)", // Transparent background
            borderWidth: 1, // Thin line
          },
        ],
      });
      setMinIQ(minimumIQ);
      setMaxIQ(maximumIQ);

      setHoveredData(() => IQData[IQData.length - 2]);
      setChartOptions({
        animation: {
          duration: 0,
        },
        onHover: handleHover,
        plugins: {
          tooltip: {
            enabled: false,
          },
          legend: {
            display: false,
          },
        },
        interaction: {
          mode: "index", // Enable interaction mode for closest point
          intersect: false,
        },
        scales: {
          x: {
            ticks: {
              color: "#ccc",
              font: {
                size: 12,
              },
              callback: function (value, index, values) {
                if (index === values.length - 1 || index === 1)
                  return moment(
                    this.getLabelForValue(value),
                    "YYYY:MM:DD"
                  ).format("MMM YYYY");
                else return null;
              },
              min: IQData[1].date, // Set min to the second date in the data array
              max: newDateString, // Set max to the last date in the data array
            },
          },

          y: {
            beginAtZero: true,
            display: false,
            ticks: {
              stepSize: 0.5,
            },
            min: minimumIQ - 20 >= 0 ? minimumIQ - 20 : 0,
            max: maximumIQ + 10,
          },
        },
        responsive: true,
        maintainAspectRatio: false,
        elements: {
          line: {
            z: 2,
            tension: 0, // Set tension to 0 for straight lines
          },
          point: {
            z: 2, // Set z-index for points
            radius: (context) => {
              // Adjust point radius dynamically
              if (context.dataIndex === IQData.length - 2 && !isHovering) {
                return 3; // Set radius to 4 for the last point when not hovered
              } else {
                return 0; // Set radius to 0 for other points or when hovered
              }
            },
          },
        },
      });
    } catch (error) {
      toast({
        title: "An error occurred.",
        description: "Unable to fetch IQ data. Please try again later.",
        status: "error",
        duration: 5000,
        isClosable: true,
        position: "top",
      });
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchIQData();
  }, []);
  useEffect(() => {
    if (chartData)
      setChartData((prevChartData) => ({
        ...prevChartData,
        datasets: prevChartData.datasets.map((dataset) => ({
          ...dataset,
          pointBackgroundColor: (context) =>
            context.dataIndex === IQScoreHistory.length - 2 && !isHovering
              ? "white"
              : "#ff9800",
        })),
      }));

    const chartCanvas = chartRef.current?.canvas;
    const handleMouseLeave = () => {
      setIsHovering(false);
      setHoveredData(IQScoreHistory[IQScoreHistory.length - 2]);
    };

    if (chartCanvas) {
      chartCanvas.addEventListener("mouseleave", handleMouseLeave);
    }

    return () => {
      if (chartCanvas) {
        chartCanvas.removeEventListener("mouseleave", handleMouseLeave);
      }
    };
  }, [isHovering]);

  return (
    <Flex
      w={"100%"}
      flexDirection={"column"}
      borderRight={{ xl: "1px" }}
      padding={{ base: "20px", xl: "0" }}
      paddingX={{ base: "20px", xl: "30px" }}
      flex={1}
      paddingRight={"30px"}
      backgroundColor={{ base: "#0f0d15", xl: "transparent" }}
      backgroundImage={{
        xl: "none",
        base: "linear-gradient(-180deg, #1a1527, #0e0c16 88%, #0e0c16 99%)",
      }}
      boxShadow={{
        xl: "none",
        base: "0px 4px 8px rgba(0, 0, 0, 0.3), 0px 8px 16px rgba(0, 0, 0, 0.3), 0px 12px 24px rgba(0, 0, 0, 0.3)",
      }}
    >
      {isLoading ? (
        <Text>...Loading</Text>
      ) : IQScoreHistory.length === 0 ? (
        <Flex
          w={"100%"}
          justifyContent={"center"}
          alignItems={"center"}
          flexDirection={"column"}
        >
          <Text m={0}>
            Give 10 Quizzes to get the IQ score and enter the ranking
          </Text>
          <Image
            h={"200px"}
            w={"200px"}
            background={"transparent"}
            src="/images/lock.png"
          />
        </Flex>
      ) : (
        <>
          <Flex justifyContent={"space-between"}>
            <Flex flexDirection={"column"}>
              <Text textAlign={"left"} color={"#9CAFAA"} p={0} m={0}>
                IQ Score
              </Text>
              <Text textAlign={"left"} fontSize={"1.5rem"}>
                {hoveredData?.IQScore}
              </Text>
            </Flex>
            <Flex flexDirection={"column"}>
              <Text textAlign={"left"} color={"#9CAFAA"} p={0} m={0}>
                Date
              </Text>
              <Text textAlign={"left"}>
                {moment(hoveredData?.date, "YYYY:MM:DD").format("MMM DD, YYYY")}
              </Text>
            </Flex>
            <Flex flexDirection={"column"}>
              <Text textAlign={"left"} color={"#9CAFAA"} p={0} m={0}>
                Daily Rank
              </Text>
              <Text textAlign={"left"}>{hoveredData?.dailyRank}</Text>
            </Flex>
          </Flex>

          {/* Render chart only when chartOptions and chartData are not null */}

          <Flex
            w={"100%"}
            justifyContent={"center"}
            alignItems={"center"}
            height={"150px"}
            p={0}
            m={0}
          >
            <Line ref={chartRef} data={chartData} options={chartOptions} />
          </Flex>
        </>
      )}
    </Flex>
  );
};

export default IQLineGraph;
