import React, { useContext, useEffect, useState } from "react";
import Timeline from "../components/homeComponents/Timeline";
import axios from "axios";
import Loading from "../components/miscellaneous/Loading";
import { AppContext } from "../contextAPI/appContext";
import { useNavigate } from "react-router-dom";
import Modal from "./Modal";
import News from "../components/articleComponents/News";
import useDrag from "../customHooks/useDrag";
import { debounce } from "lodash";

const Home = () => {
  const { state, dispatch } = useContext(AppContext);
  const [items, setItems] = useState(state.items);
  const [page, setPage] = useState(state.page + 1);
  const [load, setLoad] = useState(true);
  const [initialRender, setInitialRender] = useState(true);
  const { startDrag, drag, endDrag } = useDrag();
  const navigate = useNavigate();
  async function fetchData() {
    try {
      const response = await axios.get(
        `/api/articles?page=${page}&pageSize=9&category=${state.category}`
      );
      dispatch({ type: "PAGE", payloadPage: page - 1 });
      dispatch({
        type: "ITEMS",
        payloadItems: [...state.items, ...response.data],
      });

      setItems((prev) => [...prev, ...response.data]);
    } catch (error) {
      console.log(error.message);
    } finally {
      setLoad(false);
    }
  }

  const handleScroll = async () => {
    try {
      if (
        window.innerHeight + document.documentElement.scrollTop + 10 >
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
  const debouncedHandleScroll = debounce(handleScroll, 300);
  useEffect(() => {
    if (initialRender) {
      setInitialRender(false);
    }
    window.addEventListener("scroll", debouncedHandleScroll);
    return () => window.removeEventListener("scroll", debouncedHandleScroll);
  }, []);
  useEffect(() => {
    if (items.length < page * 9) fetchData();
    else setLoad(false);
  }, [page]);
  useEffect(() => {
    handleLoginAlert();
  }, [state.show]);
  useEffect(() => {
    if (!initialRender) {
      const currPage = page;
      dispatch({ type: "PAGE", payloadPage: 0 });
      dispatch({ type: "ITEMS", payloadItems: [] });
      setPage(() => 1);
      //setCategory(() => state.category);
      setItems(() => []);
      setLoad(true);
      if (currPage === 1)
        setTimeout(() => {
          fetchData();
        }, 0);
    }
  }, [state.category]);

  return (
    <div
      onTouchStart={startDrag}
      onTouchMove={(e) => drag(e.touches[0])}
      onTouchEnd={endDrag}
    >
      {state.modal && (
        <Modal
          onClose={() => dispatch({ type: "showModal", payloadModal: false })}
        >
          <News />
        </Modal>
      )}
      {state.user && <Timeline data={items} />}
      {load && <Loading />}
    </div>
  );
};

export default Home;
