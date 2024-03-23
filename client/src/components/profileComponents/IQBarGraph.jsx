import React, { useEffect, useRef, useState } from "react";
import { Bar } from "react-chartjs-2";
import { Flex, Image, Text, useToast } from "@chakra-ui/react";
import Chart from "chart.js/auto";
import "chartjs-adapter-date-fns";
import axios from "axios";

const IQBarGraph = () => {
  const [USER_IQ, setUSER_IQ] = useState(null); // [USER_IQ, setUSER_IQ
  const [TOP_PERCENT, setTOP_PERCENT] = useState(null);
  const [filteredIQData, setFilteredIQData] = useState(null);
  const [filteredLabels, setFilteredLabels] = useState(null);
  const [percentileData, setPercentileData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const toast = useToast();
  const [hoveredPercentile, setHoveredPercentile] = useState(null);
  const [isHovering, setIsHovering] = useState(false);
  const [hoveredIndex, setHoveredIndex] = useState(null);
  const [currentData, setCurrentData] = useState(null);

  //console.log(filteredLabels, filteredIQData);
  const [chartData, setChartData] = useState(null);

  const handleHover = (event, array) => {
    setIsHovering(true);
    //console.log(array);
    //console.log("hovering");
    if (array && array.length) {
      const point = array[0];
      const index = point.index;
      const percentile = percentileData[index].percentile;

      setHoveredIndex(index);
      //console.log(percentile);
      setHoveredPercentile(percentile);
    } else {
      setHoveredPercentile(TOP_PERCENT);
    }
  };
  const options = {
    animation: {
      duration: 0,
    },
    indexAxis: "x",
    responsive: true,
    maintainAspectRatio: true,
    scales: {
      y: {
        grid: {
          display: false,
        },
        ticks: {
          display: false,
          stepSize: 1,
        },
      },
      x: {
        beginAtZero: true,
        grid: {
          display: false,
        },
        ticks: {
          display: false,
        },
      },
    },
    plugins: {
      tooltip: {
        enabled: false, // Disable default tooltip
      },
      legend: {
        display: false,
      },
      minHeightBar: {
        minHeight: 100, // Minimum height for each bar (in pixels)
      },
    },
    layout: {
      padding: {
        left: 5,
        right: 5,
      },
    },
    onHover: handleHover,
    hover: {
      mode: "index",
      intersect: false,
    },
    elements: {
      line: {
        borderWidth: 0, // Hide the line
      },
      point: {
        radius: 10, // Hide the point
      },
    },
    interaction: {
      mode: "index",
      intersect: false,
    },
  };
  const chartRef = useRef(null);
  const fetchBarIQData = async () => {
    try {
      const response = await axios.get(`/api/user/currentTopPercentOfUser`);

      setUSER_IQ(response.data.USER_IQ);
      setTOP_PERCENT(response.data.Top_Percentage);
      setHoveredPercentile(response.data.Top_Percentage);
      setPercentileData(response.data.percentileData);
      setFilteredLabels(response.data.filteredLabels);
      setFilteredIQData(response.data.filteredIQData);
      setChartData({
        labels: response.data.filteredLabels,
        datasets: [
          {
            label: "Number of People",
            data: response.data.filteredIQData,
            backgroundColor: response.data.filteredLabels.map((threshold) => {
              const [lowerBound, upperBound] = threshold.split("-").map(Number);

              //console.log(USER_IQ, lowerBound, upperBound);

              // Check if USER_IQ falls within the range
              return response.data.USER_IQ < lowerBound + 10 &&
                response.data.USER_IQ >= lowerBound
                ? "#776B5D"
                : "#DED0B6";
            }),
            borderColor: "#1a1527",
            borderRadius: "5",
            minBarLength: "15",
          },
        ],
      });
    } catch (error) {
      toast({
        title: "An error occurred.",
        description: "Unable to fetch IQ Bar Data. Please try again later.",
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
    fetchBarIQData();
  }, []);
  useEffect(() => {
    const chartCanvas = chartRef.current?.canvas;
    const handleMouseLeave = () => {
      setIsHovering(false);
      setHoveredIndex(null);
      setHoveredPercentile(TOP_PERCENT);
      setCurrentData(null);
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

  useEffect(() => {
    if (percentileData) {
      const count = percentileData[hoveredIndex]
        ? percentileData[hoveredIndex].count
        : null;
      const range = percentileData[hoveredIndex]
        ? `${percentileData[hoveredIndex].lowerBound}-${percentileData[hoveredIndex].upperBound}`
        : null;
      setCurrentData({ range, count });
    }
    if (chartData) {
      setChartData((prevChartData) => ({
        ...prevChartData,
        datasets: prevChartData.datasets.map((dataset) => ({
          ...dataset,
          backgroundColor: filteredLabels.map((threshold, idx) => {
            const [lowerBound, upperBound] = threshold.split("-").map(Number);
            return (USER_IQ < lowerBound + 10 &&
              USER_IQ >= lowerBound &&
              !isHovering) ||
              idx === hoveredIndex
              ? "#776B5D"
              : "#DED0B6";
          }),
        })),
      }));
    }
  }, [hoveredIndex]);

  return (
    <Flex
      w={"100%"}
      padding={{ base: "20px", xl: "0" }}
      flexDirection={"column"}
      flex={1}
      justifyContent={"center"}
      alignItems={"center"}
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
      ) : filteredLabels.length === 0 ? (
        <Flex
          w={"100%"}
          justifyContent={"center"}
          alignItems={"center"}
          flexDirection={"column"}
        >
          <Text m={0}>
            Give 10 Quizzes to get the IQ score and Unlock the bar graph
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
          <Flex width={"100%"}>
            <Flex marginStart={"15px"} flexDirection={"column"}>
              <Text textAlign={"left"} color={"#9CAFAA"} p={0} m={0}>
                Top
              </Text>
              <Text textAlign={"left"} fontSize={"1.5rem"}>
                {hoveredPercentile}%
              </Text>
            </Flex>
            {currentData && currentData.range && currentData.count ? (
              <Flex marginLeft={"40px"} flexDirection={"column"}>
                <Text textAlign={"left"} color={"#9CAFAA"} p={0} m={0}>
                  {currentData.range}
                </Text>

                <Text textAlign={"left"}>{currentData.count} users</Text>
              </Flex>
            ) : null}
          </Flex>
          <Flex height={"150px"} width={"100%"} justifyContent={"center"}>
            {chartData && (
              <Bar ref={chartRef} data={chartData} options={options} />
            )}
          </Flex>
        </>
      )}
    </Flex>
  );
};

export default IQBarGraph;
