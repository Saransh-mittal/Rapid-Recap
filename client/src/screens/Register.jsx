import { useState, useContext, useEffect, useCallback } from "react";
import "./Register.css";
import axios from "axios";
import { NavLink, useNavigate } from "react-router-dom";
import Modal from "./Modal";
import EmailVerify from "../components/authComponents/EmailVerify";
import { AppContext } from "../contextAPI/appContext";
//import Loading from "../components/Loading";
import { Button, useToast } from "@chakra-ui/react";
import _ from "lodash";

export default function Register() {
  const toast = useToast();
  const { state, dispatch } = useContext(AppContext);
  const [data, setData] = useState({
    name: "",
    inGameName: "",
    email: "",
    phone: "",
    password: "",
    cpassword: "",
  });
  const [load, setLoad] = useState(false); //for loading spinner
  const navigate = useNavigate();

  const inputHandler = (e) => {
    const { name, value } = e.target;
    setData({ ...data, [name]: value });
  };

  const handleSubmit = async (e) => {
    console.log(data);
    setLoad(true);
    e.preventDefault();
    try {
      //console.log(data);
      const response = await axios.post(`/api/user/register`, data);
      if (response.status === 201) {
        await dispatch({ type: "showModal", payloadModal: true });
        toast({
          title: "Registered Successfully",
          status: "success",
          duration: 5000,
          isClosable: true,
          position: "top",
        });
      } else {
        throw new Error("Registration Failed");
      }
    } catch (error) {
      toast({
        title: "Registration Failed",
        description: error.response.data.error,
        status: "error",
        duration: 5000,
        isClosable: true,
        position: "top",
      });
      //console.log(error);
    } finally {
      setLoad(false);
    }
  };

  useEffect(() => {
    if (state.show === false) {
      navigate("/");
    }
  }, []);

  const handleSubmitThrottled = useCallback(_.throttle(handleSubmit, 1000), [
    data,
  ]);

  useEffect(() => {
    return () => handleSubmitThrottled.cancel();
  }, [handleSubmitThrottled]);

  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      // If Enter key is pressed, submit the form
      handleSubmitThrottled(e);
    }
  };
  return (
    <div>
      {state.modal && (
        <Modal
          onClose={() => dispatch({ type: "showModal", payloadModal: false })}
        >
          <EmailVerify email={data.email} />
        </Modal>
      )}
      <section className="container">
        <div className="r-container">
          <div className="circle circle-one"></div>
          <div className="form-container">
            <h1 className="opacity">Welcome!</h1>
            <form onSubmit={handleSubmitThrottled} onKeyDown={handleKeyPress}>
              <div className="row">
                <div className="col">
                  <input
                    name="name"
                    onChange={inputHandler}
                    required
                    value={data.name}
                    type="text"
                    placeholder="Name"
                  />
                </div>
                <div className="col">
                  <input
                    name="inGameName"
                    onChange={inputHandler}
                    required
                    value={data.inGameName}
                    type="text"
                    placeholder="In Game Name"
                  />
                </div>
              </div>
              <div className="row">
                <div className="col">
                  <input
                    name="email"
                    onChange={inputHandler}
                    required
                    value={data.email}
                    type="email"
                    placeholder="Email ID"
                  />
                </div>
                <div className="col">
                  <input
                    name="phone"
                    onChange={inputHandler}
                    required
                    value={data.phone}
                    type="tel"
                    placeholder="Mobile No."
                  />
                </div>
              </div>
              <div className="row">
                <div className="col">
                  <input
                    name="password"
                    onChange={inputHandler}
                    required
                    value={data.password}
                    type="password"
                    placeholder="Password"
                    minLength={8}
                  />
                </div>

                <div className="col">
                  <input
                    name="cpassword"
                    onChange={inputHandler}
                    required
                    value={data.cpassword}
                    type="password"
                    placeholder="Confirm Password"
                    minLength={8}
                  />
                </div>
              </div>
              <Button
                isLoading={load}
                loadingText="Submitting"
                colorScheme="teal"
                variant="outline"
                type="submit"
                size="lg"
                w={"100%"}
              >
                Submit
              </Button>
              {/* <button
                className="opacity mt-3 mb-0"
                type="submit"
                disabled={load}
              >
                SUBMIT
              </button> */}
            </form>
            <div className="r-forget opacity">
              <h6>
                Already a Member ?
                <NavLink
                  type="button"
                  className="w-50 btn btn-success p-1 rounded-2 mt-2"
                  to="/signin"
                >
                  {" "}
                  Login Here
                </NavLink>
              </h6>
              {/* <div>{load && <Loading />}</div> */}
            </div>
          </div>
          <div className="circle circle-two"></div>
        </div>
        <div className="theme-btn-container"></div>
      </section>
    </div>
  );
}
