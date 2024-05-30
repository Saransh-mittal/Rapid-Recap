import { useContext, useEffect } from "react";
import TimelineItem from "./TimelineItem";
import { AppContext } from "../../contextAPI/appContext";
import { useHomeTour } from "../../customHooks/useTours";
import { Box, Flex, Skeleton, SkeletonText } from "@chakra-ui/react";
import Categories from "./Categories";

const Timeline = ({ data, load }) => {
  const { state } = useContext(AppContext);
  const { tour, isTutorialTakenCheck } = useHomeTour();

  useEffect(() => {
    if (!load && !state.show && state.user && state.user.tutorial.homePage)
      isTutorialTakenCheck({ page: "homePage", tour });
  }, [load]);
  const renderSkeletons = () => {
    return Array.from({ length: 9 }).map((_, index) => (
      <Box key={index} className="timeline-item">
        <Box className="timeline-item-content">
          <Box className="containers">
            <Skeleton className="cardWrapper" />
          </Box>
        </Box>
        {/* <SkeletonText mt="4" noOfLines={4} spacing="4" /> */}
      </Box>
    ));
  };
  return (
    <div
      className="pr-3 pl-1 timeline"
      style={{ display: "flex", flexDirection: "row", gap: "2%" }}
    >
      <Flex
        w={"15%"}
        h={"100vh"}
        display={{ base: "none", lg: "flex" }}
        position={"fixed"}
        backgroundColor={{ base: "transparent", lg: "#0f0d15" }}
        backgroundImage={{
          base: "none",
          lg: "linear-gradient(-180deg, #1a1527, #0e0c16 88%, #0e0c16 99%)",
        }}
        boxShadow={{
          base: "none",
          lg: "0px 4px 8px rgba(0, 0, 0, 0.3), 0px 8px 16px rgba(0, 0, 0, 0.3), 0px 12px 24px rgba(0, 0, 0, 0.3)",
        }}
        overflow={"auto"}
        sx={{
          "::-webkit-scrollbar": {
            width: "4px",
            height: "10px",
          },
          "::-webkit-scrollbar-track": {
            background: "transparent",
          },
          "::-webkit-scrollbar-thumb": {
            background: "#0f0d15",
            borderRadius: "10px",
          },
          "::-webkit-scrollbar-thumb:hover": {
            background: "#555",
          },
          scrollbarWidth: "thin",
          scrollbarColor: "#0f0d15 transparent",
        }}
        //css={customScrollbar}
      >
        <Categories />
      </Flex>
      <div className="timeline-container">
        <div className="row item-container">
          {data.map((item, id) => {
            //console.log(item.dateTime);
            return (
              <div className="col-md-6 col-xxl-4 item" key={id}>
                <TimelineItem
                  newsNumber={id}
                  data={item}
                  tourComplete={tour.complete}
                />
              </div>
            );
          })}
          {load && (
            <Flex wrap="wrap" justify="space-between">
              {renderSkeletons()}
            </Flex>
          )}
        </div>
      </div>
    </div>
  );
};
export default Timeline;
