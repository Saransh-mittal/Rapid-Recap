import React, { useContext, useEffect, useState } from "react";
import Timeline from "../components/homeComponents/Timeline";
import axios from "axios";
import Loading from "../components/miscellaneous/Loading";
import { AppContext } from "../contextAPI/appContext";
import { useNavigate } from "react-router-dom";
import Modal from "./Modal";
import News from "../components/articleComponents/News";
import useDrag from "../customHooks/useDrag";
const Home = () => {
  const { state, dispatch } = useContext(AppContext);
  const [items, setItems] = useState([]);
  const [page, setPage] = useState(1);
  const [load, setLoad] = useState(true);
  const { startDrag, drag, endDrag } = useDrag();
  const navigate = useNavigate();
  async function fetchData() {
    try {
      const response = await axios.get(`/api/articles?page=${page}&pageSize=9`);

      setItems((prev) => [...prev, ...response.data]);

      setLoad(false);
    } catch (error) {
      // Handle errors
      console.log(error.message);
    }
  }

  const handleScroll = async () => {
    try {
      if (
        window.innerHeight + document.documentElement.scrollTop + 1 >
        document.documentElement.scrollHeight
      ) {
        setLoad(true);

        setPage((ele) => ele + 1);
      }
    } catch (error) {
      console.log(error);
    }
  };

  const handleLoginAlert = () => {
    if (state.show === true) {
      navigate("/signin");
    }
  };

  useEffect(() => {
    handleLoginAlert();
  }, [state.show]);
  useEffect(() => {
    fetchData();
  }, [page]);

  useEffect(() => {
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div
      onMouseDown={startDrag}
      onTouchStart={startDrag}
      onMouseMove={(e) => drag(e)}
      onTouchMove={(e) => drag(e.touches[0])}
      onMouseUp={endDrag}
      onTouchEnd={endDrag}
    >
      {state.modal && (
        <Modal
          onClose={() => dispatch({ type: "showModal", payloadModal: false })}
        >
          <News />
        </Modal>
      )}
      <Timeline data={items} />
      {load && <Loading />}
    </div>
  );
};

export default React.memo(Home);
