import { useContext, useEffect } from "react";
import TimelineItem from "./TimelineItem";
import { AppContext } from "../../contextAPI/appContext";
import { useHomeTour } from "../../customHooks/useTours";
import { Box, Flex } from "@chakra-ui/react";

const Timeline = ({ data, load }) => {
  const { state } = useContext(AppContext);
  const { tour, isTutorialTakenCheck } = useHomeTour();

  useEffect(() => {
    if (!load && !state.show && state.user && state.user.tutorial.homePage)
      isTutorialTakenCheck({ page: "homePage", tour });
  }, [load]);
  return (
    <div
      className="px-3 timeline"
      style={{ display: "flex", flexDirection: "row", gap: "5%" }}
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
      ></Flex>
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
        </div>
      </div>
    </div>
  );
};
export default Timeline;
