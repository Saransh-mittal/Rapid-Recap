import { useContext, useEffect } from "react";
import TimelineItem from "./TimelineItem";
import { AppContext } from "../../contextAPI/appContext";
import { useHomeTour } from "../../customHooks/useTours";

const Timeline = ({ data, load }) => {
  const { state } = useContext(AppContext);
  const { tour, isTutorialTakenCheck } = useHomeTour();

  useEffect(() => {
    if (!load && !state.show && state.user && state.user.tutorial.homePage)
      isTutorialTakenCheck({ page: "homePage", tour });
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
