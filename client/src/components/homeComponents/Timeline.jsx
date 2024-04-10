import { useContext, useEffect } from "react";
import TimelineItem from "./TimelineItem";
import { useShepherdTour } from "react-shepherd";
import stepsTutorialHome from "./stepsTutorialHome";
import axios from "axios";
import { useToast } from "@chakra-ui/react";
import { AppContext } from "../../contextAPI/appContext";

const tourOptions = {
  defaultStepOptions: {
    cancelIcon: {
      enabled: true,
    },
  },
  useModalOverlay: true,
};
const Timeline = ({ data }) => {
  const { state } = useContext(AppContext);
  const tour = useShepherdTour({ tourOptions, steps: stepsTutorialHome });
  const toast = useToast();
  const isTutorialTakenCheck = async () => {
    try {
      const Page = "homePage";
      const response = await axios.get(
        `/api/user/isTutorialTakenCheck/${Page}`
      );

      if (response.data.status) tour.start();
    } catch (err) {
      toast({
        title: "Error in Checking tutorial taken",
        description: err,
        status: "error",
        duration: 5000,
        isClosable: true,
        position: "top",
      });
    }
  };
  const isTutorialTakenUpdate = async () => {
    try {
      const page = "homePage";
      await axios.post(`/api/user/isTutorialTakenUpdate`, {
        page,
      });
    } catch (err) {
      toast({
        title: "Error in updating tutorial taken",
        description: err,
        status: "error",
        duration: 5000,
        isClosable: true,
        position: "top",
      });
    }
  };
  useEffect(() => {
    const timeline = document.querySelector(".timeline");
    const nav = document.querySelector(".navbar");
    const body = document.querySelector("body");
    const handleTourStart = () => {
      timeline.classList.add("shepherd-active");
      nav.classList.add("shepherd-active");
      body.style.overflow = "hidden"; // Reapply scroll behavior
      const overlay = document.createElement("div");
      overlay.classList.add("custom-overlay");
      const overlayNav = document.createElement("div");
      overlayNav.classList.add("custom-overlay-nav");
      document.querySelector(".timeline").appendChild(overlay);
      document.querySelector(".navbar").appendChild(overlayNav);
    };

    const handleTourComplete = () => {
      body.style.overflow = "auto";
      timeline.classList.remove("shepherd-active");
      nav.classList.remove("shepherd-active");
      const timelineItem = document.querySelector(".timeline-item");
      if (timelineItem.classList.contains("highlighted-card-0")) {
        timelineItem.classList.remove("highlighted-card-0");
      }
      const overlay = document.querySelector(".custom-overlay");
      if (overlay) overlay.remove();
      const overlayNav = document.querySelector(".custom-overlay-nav");
      if (overlayNav) overlayNav.remove();
      const img = document.querySelector(".hand-click-img");
      if (img) {
        img.remove();
      }
      isTutorialTakenUpdate();
    };

    const handleTourCancel = () => {
      body.style.overflow = "auto";
      timeline.classList.remove("shepherd-active");
      nav.classList.remove("shepherd-active");
      const timelineItem = document.querySelector(".timeline-item");
      if (timelineItem.classList.contains("highlighted-card-0")) {
        timelineItem.classList.remove("highlighted-card-0");
      }

      const overlay = document.querySelector(".custom-overlay");
      overlay.remove();
      const overlayNav = document.querySelector(".custom-overlay-nav");
      overlayNav.remove();
      const img = document.querySelector(".hand-click-img");
      if (img) {
        img.remove();
      }
      isTutorialTakenUpdate();
    };

    tour.on("start", handleTourStart);
    tour.on("complete", handleTourComplete);
    tour.on("cancel", handleTourCancel);

    return () => {
      tour.off("start", handleTourStart);
      tour.off("complete", handleTourComplete);
      tour.off("cancel", handleTourCancel);
    };
  }, [tour]);

  useEffect(() => {
    if (state.user && state.user.tutorial.homePage) isTutorialTakenCheck();
  }, []);
  return (
    <div className="px-5 timeline">
      <div className="timeline-container">
        <div className="intro">
          <div className="info">
            <h1>🌍 Stay Informed:</h1>
            <p className="mb-5">
              Explore the latest global developments, breaking news, and top
              stories from around the world. Our team of dedicated journalists
              and AI algorithms work tirelessly to bring you the most relevant
              and comprehensive news coverage.
            </p>
          </div>
          <div className="short">
            <h1>📰 Short and Sweet:</h1>
            <p>
              We understand that your time is valuable. That's why we provide
              concise and engaging summaries of the day's most important events.
              Get all the essential information you need in a format
              that's easy to digest.
            </p>
          </div>
        </div>
        <div className="row item-container">
          {data.map((item, id) => {
            //console.log(item.dateTime);
            return (
              <div className="col-md-6 col-lg-4 item" key={id}>
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
