import { useRef, useContext, useEffect } from "react";
import { AppContext } from "../../contextAPI/appContext";
import { Button, Image } from "@chakra-ui/react";
import { Link, useNavigate } from "react-router-dom";
import Alt_img from "../../assets/alt_image.jpg";

const News = () => {
  const { state, dispatch } = useContext(AppContext);
  const data = state.news;
  const navigate = useNavigate();

  useEffect(() => {
    if (window.innerWidth < 768) navigate(`/article/${data._id}`);
  }, [window.innerWidth]);

  return (
    <div
      className="d-flex justify-content-center flex-column align-items-center"
      style={{
        backgroundColor: "#1a1a2e",
        color: "#253547",
        minHeight: "90vh",
      }}
    >
      <Image
        src={data.imgURL[0]}
        style={{ width: "92%", marginTop: "1rem" }}
        onError={(e) => {
          e.target.onerror = null;
          e.target.src = Alt_img;
        }}
      />
      <div style={{ width: "92%" }}>
        <h1
          className="mt-3 mb-3"
          style={{ color: "#f0f0f0", textAlign: "center" }}
        >
          {data.title}
        </h1>
        <p className="mb-2" style={{ color: "#f0f0f0", textAlign: "justify" }}>
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
