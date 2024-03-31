import Loading from "../miscellaneous/Loading";
import Card from "./Card";

const TimelineItem = ({ newsNumber, data, tourComplete }) => {
  return (
    <>
        <div className="timeline-item" onClick={() => tourComplete()}>
          <div className="timeline-item-content">
            <Card newsNumber={newsNumber} data={data} />
          </div>
        </div>
    </>
  );
};

export default TimelineItem;
