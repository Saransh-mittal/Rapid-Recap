import React, { useContext, useEffect, useState } from "react";
import Timeline from "../components/homeComponents/Timeline";
import axios from "axios";
import Loading from "../components/miscellaneous/Loading";
import { AppContext } from "../contextAPI/appContext";
import { useNavigate, useParams } from "react-router-dom";
import Modal from "./Modal";
import News from "../components/articleComponents/News";
import useDrag from "../customHooks/useDrag";
import { debounce } from "lodash";

const Home = () => {
  const { state, dispatch } = useContext(AppContext);
  const [items, setItems] = useState(state.items);
  const [page, setPage] = useState(state.page + 1);
  const [initialRender, setInitialRender] = useState(true);
  const [load, setLoad] = useState(true);
  const { startDrag, drag, endDrag } = useDrag();
  const navigate = useNavigate();
  const { category } = useParams();
  async function fetchData() {
    try {
      const response = await axios.get(
        `/api/articles?page=${page}&pageSize=9&category=${
          category ? category : "general"
        }`
      );
      dispatch({ type: "PAGE", payloadPage: page - 1 });
      dispatch({
        type: "ITEMS",
        payloadItems: [...state.items, ...response.data],
      });

      setItems((prev) => [...state.items, ...response.data]);
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
    //setInitialRender(false);
    if (!category || category === "") {
      console.log("navigating to general");
      navigate("/general");
    }
    console.log("initial useEffect");
    dispatch({ type: "homeInitialRender" });
    window.addEventListener("scroll", debouncedHandleScroll);
    return () => window.removeEventListener("scroll", debouncedHandleScroll);
  }, []);
  useEffect(() => {
    // console.log(
    //   state.category,
    //   category,
    //   "page : ",
    //   page,
    //   "items : ",
    //   items.length
    // );
    console.log("on Page change useEffect");
    if (items.length < page * 9) {
      console.log("fetching data");
      fetchData();
    } else setLoad(false);
  }, [page]);
  useEffect(() => {
    handleLoginAlert();
  }, [state.show]);
  useEffect(() => {
    //console.log(category);
    //if (state.items.length > 0 && state.items[0].category !== category) {
    //console.log("category changed", "initialRender : ", initialRender);
    console.log("category change useEffect");
    if (state.category !== category) {
      setLoad(true);
      dispatch({ type: "category", payloadCategory: category });
      console.log(
        state.category,
        category,
        "page : ",
        page,
        "items : ",
        state.items.length
      );
      dispatch({ type: "PAGE", payloadPage: 0 });
      dispatch({
        type: "ITEMS",
        payloadItems: [],
      });
    }

    //}
    //}
    return () => {
      //cleanup
      // if (state.category !== category) {
      //   dispatch({ type: "PAGE", payloadPage: 0 });
      //   dispatch({
      //     type: "ITEMS",
      //     payloadItems: [],
      //   });
      // }
    };
  }, [category]);

  useEffect(() => {
    console.log("items change useEffect");
    const currPage = state.page;
    if (
      currPage === 0 &&
      !state.homeInitialRender &&
      state.items.length === 0 &&
      state.category === category
    ) {
      console.log("fetching data");
      console.log(
        "items.length : ",
        state.items.length,
        "page : ",
        currPage,
        "local Items.length : ",
        items.length
      );
      setPage(() => 1);
      setItems(() => []);
      setTimeout(() => {
        fetchData();
      }, 0);
    }
  }, [state.items]);

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
