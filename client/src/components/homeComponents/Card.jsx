import { Slide } from "@chakra-ui/react";
import { useRef, useContext, useEffect } from "react";
import { AppContext } from "../../contextAPI/appContext";
import imageData from "../../assets/AltNewsImage";

const Card = ({ newsNumber, data }) => {
  //console.log("card :", data);
  const newArticle = {
    ...data,
    imgURL: data?.imgURL[0],
  };
  const alt_img = imageData.find((img) => {
    return (
      img.category.toLocaleLowerCase() === data.category.toLocaleLowerCase()
    );
  })?.image;
  //console.log(alt_img);
  const { state, dispatch } = useContext(AppContext);
  const cardWrapper = useRef(null);
  const card = useRef(null);
  const project_meta = useRef(null);
  // highest values for angle
  const mostX = 10; // 10 or -10
  const mostY = 10; // 10 or -10
  const mousemove = (e) => {
    card.current.style.transition = "none";
    project_meta.current.style.transition = "none";

    const x = e.nativeEvent.offsetX;
    const y = e.nativeEvent.offsetY;
    const { width, height } = cardWrapper.current.getBoundingClientRect();
    const halfWidth = width / 2;
    const halfHeight = height / 2;

    // calculate angle
    const rotationY = ((x - halfWidth) / halfWidth) * mostX;
    const rotationX = ((y - halfHeight) / halfHeight) * mostY;

    // set rotation
    card.current.style.transform = `rotateY(${rotationY}deg) rotateX(${rotationX}deg)`;
    project_meta.current.style.transform = `rotateY(${rotationY}deg) rotateX(${rotationX}deg)`;
  };
  const mouseleave = () => {
    card.current.style.transition = "transform 0.5s ease-in-out";
    card.current.style.transform = `rotateY(0) rotateX(0)`;
    project_meta.current.style.transition = "transform 0.5s ease-in-out";
    project_meta.current.style.transform = `rotateY(0) rotateX(0)`;
  };

  useEffect(() => {}, [
    data,
    newsNumber,
    data.imgURL,
    data.title,
    data.mainText,
  ]);

  return (
    <div className={`containers`}>
      <div
        className={`cardWrapper`}
        ref={cardWrapper}
        onClick={() => {
          // window.open(
          //   `${data.url}`,
          //   "_blank"
          // )
          //console.log(`hi`);
          dispatch({ type: "showModal", payloadModal: true });
          dispatch({ type: "setNews", payloadNews: newArticle });
        }}
        onMouseMove={mousemove}
        onMouseLeave={mouseleave}
      >
        <div className="project-meta" ref={project_meta}>
          <div className=" projects">
            <span className="block-reveal__text">{data?.title}</span>
          </div>
          <div className="divider"></div>
          <div className="project-nav">
            <span className="block-reveal__text numb">
              {newsNumber}
              <br /> <span className="arr">→</span>
            </span>
          </div>
        </div>
        <Slide direction="left" in={true} unmountOnExit>
          <div className="cards" ref={card}>
            <div className="img-box">
              <img
                src={data?.imgURL[0] ? data?.imgURL[0] : alt_img}
                alt=""
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = alt_img;
                }}
              />
            </div>
            <div className="contents text-white">
              <h2> Click here to know More </h2>
              <p>
                {data?.mainText[0].length > 135
                  ? `${data?.mainText[0].substring(0, 135)}...`
                  : data?.mainText[0]}
              </p>
            </div>
          </div>
        </Slide>
      </div>
    </div>
  );
};

export default Card;
