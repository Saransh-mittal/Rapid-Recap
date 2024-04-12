import { useRef, useContext, useEffect, useState } from "react";
import { AppContext } from "../../contextAPI/appContext";
import { Button, Image } from "@chakra-ui/react";
import { Link, useNavigate } from "react-router-dom";

import imageData from "../../assets/AltNewsImage";

const News = () => {
  const [isMobile, setIsMobile] = useState(false);
  const { state, dispatch } = useContext(AppContext);
  const data = state.news;
  const alt_image = imageData.find(
    (img) =>
      img.category.toLocaleLowerCase() === data.category.toLocaleLowerCase()
  ).image;
  const navigate = useNavigate();

  useEffect(() => {
    if (window.innerWidth < 768) {
      setIsMobile(true);
    }
  }, [window.innerWidth]);

  useEffect(() => {
    if (isMobile) {
      dispatch({ type: "showModal", payloadModal: false });
      navigate(`/article/${data._id}`);
    }
  }, [isMobile, data._id]);

  if (isMobile) {
    return null; // Prevent rendering the News component if redirecting
  }

  return (
    <div
      className="d-flex justify-content-center flex-column align-items-center"
      style={{
        backgroundColor: "#1a1a2e",
        color: "#253547",
        minHeight: "90vh",
        // maxWidth: "80vh",
      }}
    >
      <Image
        src={data.imgURL ? data.imgURL : alt_image}
        style={{ width: "92%", marginTop: "1rem", maxWidth: "80vh" }}
        onError={(e) => {
          e.target.onerror = null;
          e.target.src = alt_image;
        }}
      />
      <div
        className="d-flex justify-content-center flex-column align-items-center"
        style={{ width: "92%" }}
      >
        <h1
          className="mt-3 mb-3"
          style={{ color: "#f0f0f0", textAlign: "center", maxWidth: "150vh" }}
        >
          {data.title}
        </h1>
        <p
          className="mb-2"
          style={{ color: "#f0f0f0", textAlign: "center", maxWidth: "150vh" }}
        >
          {data.mainText.length > 1000
            ? `${data.mainText.substring(0, 1000)}...`
            : data.mainText}
        </p>
        <Link to={`/article/${data._id}`}>
          <Button
            mb={2}
            _hover={{ backgroundColor: "#37474f", color: "#f0f0f0" }}
            style={{
              maxWidth: "100%",
              transition: "background-color 0.3s, color 0.3s",
              boxShadow: "0 0 10px 5px rgba(255, 255, 255, 0.7)",
            }}
            onClick={() => dispatch({ type: "showModal", payloadModal: false })}
          >
            Read More
          </Button>
        </Link>
      </div>
    </div>
  );
};

export default News;
