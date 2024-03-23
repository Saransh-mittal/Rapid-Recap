import { useState, useContext, useEffect, useCallback, useRef } from "react";
import "./Signin.css";
import axios from "axios";
import { NavLink, useNavigate } from "react-router-dom";
import { AppContext } from "../contextAPI/appContext";
import EmailVerify from "../components/authComponents/EmailVerify";
import Modal from "./Modal";
import ResetPassword from "../components/authComponents/ResetPassword";
import { throttle } from "lodash";
import { useToast, Button } from "@chakra-ui/react";
import { GoogleOAuthProvider } from "@react-oauth/google";
import { GoogleLogin } from "@react-oauth/google";

export default function Sigin() {
  const toast = useToast();
  const { state, dispatch } = useContext(AppContext);
  const [data, setData] = useState({
    email: "",
    password: "",
  });
  const [inGameName, setInGameName] = useState("");
  const [enterInGameName, setEnterInGameName] = useState(false);
  const [load, setLoad] = useState({
    submitLoad: false,
    forgotLoad: false,
  }); //for loading spinner
  const navigate = useNavigate();
  const inGameNameRef = useRef(null);

  const inGameNameHandler = (e) => {
    setInGameName(e.target.value);
  };
  const inputHandler = (e) => {
    const { name, value } = e.target;
    setData({ ...data, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoad({ submitLoad: true, forgotLoad: false });
      const response = await axios.post(`/api/user/login`, {
        data,
        inGameName,
      });
      console.log(response);
      if (response.status === 201) {
        dispatch({ type: "UNSHOW" });
        dispatch({
          type: "setUser",
          payloadUser: response.data.user,
        });
        toast({
          title: "Logined Successfully",
          status: "success",
          duration: 5000,
          isClosable: true,
          position: "top",
        });
        navigate("/");
      } else {
        throw new Error("Login Failed");
      }
    } catch (error) {
      toast({
        title: error.response.data.error,
        status: "error",
        duration: 5000,
        isClosable: true,
        position: "top",
      });
      console.log(error.response.data.error);
    } finally {
      setLoad({ submitLoad: false, forgotLoad: false });
    }
  };

  const forgotPassword = async () => {
    console.log("forgotPassword");
    try {
      setLoad({ submitLoad: false, forgotLoad: true });
      const response = await axios.post(`/api/user/resendOTP`, {
        email: data.email,
      });
      if (response.status === 201) {
        let i = data.email.indexOf("@");

        const starredEmail =
          data.email.slice(0, 2) +
          data.email.slice(2, i).replace(/./g, "*") +
          data.email.slice(i);
        await dispatch({ type: "forgotPassword", payloadForgotPassword: true });
        await dispatch({ type: "verifyEmail", payloadverifyEmail: true });
        toast({
          title: "OTP sent to your email",
          description: starredEmail,
          status: "success",
          duration: 5000,
          isClosable: true,
          position: "top",
        });
        //alert("OTP sent to your email : " + starredEmail);
      }
      await dispatch({ type: "showModal", payloadModal: true });
    } catch (error) {
      toast({
        description: error.response.data.error,
        status: "error",
        duration: 9000,
        isClosable: true,
        position: "top",
      });
      console.error(error.response.data.error);
    } finally {
      setLoad({ submitLoad: false, forgotLoad: false });
    }
  };

  useEffect(() => {
    if (enterInGameName) {
      inGameNameRef.current.focus();
      setEnterInGameName(false);
    }
  }, [enterInGameName]);

  useEffect(() => {
    if (state.show === false) {
      navigate("/");
    }
  }, []);

  const handleForgotPasswordThrottled = useCallback(
    throttle(forgotPassword, 1000),
    [data.email]
  );

  useEffect(() => {
    return () => handleForgotPasswordThrottled.cancel();
  }, [handleForgotPasswordThrottled]);

  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      // If Enter key is pressed, submit the form
      handleSubmit(e);
    }
  };
  return (
    <div>
      {state.modal && state.forgotPassword && !state.verifyEmail && (
        <Modal
          onClose={() => dispatch({ type: "showModal", payloadModal: false })}
        >
          <ResetPassword email={data.email} />
        </Modal>
      )}
      {state.modal && state.verifyEmail && (
        <Modal
          onClose={() => dispatch({ type: "showModal", payloadModal: false })}
        >
          <EmailVerify email={data.email} />
        </Modal>
      )}
      <div className="alert alert-warning" role="alert">
        You must log in to view this content.
      </div>
      <section className="container">
        <div className="login-container">
          <div className="circle circle-one"></div>
          <div className="form-container">
            <h1 className="opacity">LOG-IN</h1>
            <form onSubmit={handleSubmit} onKeyDown={handleKeyPress}>
              <input
                onFocus={() =>
                  (inGameNameRef.current.style =
                    "border-color: #4fd1c5; box-shadow: 0 0 0 3px rgba(79, 209, 197, 0.3); outline: none;")
                }
                onBlur={() => (inGameNameRef.current.style = "")}
                onChange={inputHandler}
                name="email"
                value={data.email}
                type="email"
                placeholder="Email ID"
              />
              <input
                onFocus={() =>
                  (inGameNameRef.current.style =
                    "border-color: #4fd1c5; box-shadow: 0 0 0 3px rgba(79, 209, 197, 0.3); outline: none;")
                }
                onBlur={() => (inGameNameRef.current.style = "")}
                onChange={inputHandler}
                name="password"
                value={data.password}
                type="password"
                placeholder="Password"
              />
              <input
                onFocus={() =>
                  (inGameNameRef.current.style =
                    "border-color: #4fd1c5; box-shadow: 0 0 0 3px rgba(79, 209, 197, 0.3); outline: none;")
                }
                onBlur={() => (inGameNameRef.current.style = "")}
                ref={inGameNameRef}
                onChange={inGameNameHandler}
                name="inGameName"
                value={inGameName}
                type="text"
                placeholder="In Game Name"
              />
              <Button
                isLoading={load.submitLoad}
                loadingText="Submitting"
                colorScheme="teal"
                variant="outline"
                type="submit"
                size="lg"
                w={"100%"}
              >
                Submit
              </Button>
            </form>
            <div className="register-forget opacity d-flex flex-column gap-3">
              <div className="d-flex justify-content-around gap-2">
                <NavLink
                  type="button"
                  className="w-50 btn btn-success p-2 rounded-2"
                  to="/register"
                >
                  Create an account
                </NavLink>
                <Button
                  isLoading={load.forgotLoad}
                  variant="solid"
                  w="50%"
                  colorScheme="red"
                  onClick={handleForgotPasswordThrottled}
                >
                  Forgot Password ?
                </Button>
              </div>
              <Button variant="solid" colorScheme="red">
                <GoogleOAuthProvider clientId="492859619634-m81f6tnro73fg6sflkuj0nemm1g6aecb.apps.googleusercontent.com">
                  <GoogleLogin
                    onSuccess={async (credentialResponse) => {
                      //console.log(credentialResponse);
                      try {
                        const response = await axios.post(
                          "/api/user/handleGoogleLogin",
                          { credentialResponse, inGameName }
                        );
                        console.log(response);
                        if (response.status === 201) {
                          dispatch({ type: "UNSHOW" });
                          dispatch({
                            type: "setUser",
                            payloadUser: response.data.user,
                          });
                          toast({
                            title: "Logined Successfully",
                            status: "success",
                            duration: 5000,
                            isClosable: true,
                            position: "top",
                          });
                          navigate("/");
                        }
                      } catch (error) {
                        console.error(error.response.data.error);
                        if (error.response.data.EnterInGameName)
                          setEnterInGameName(true);
                        toast({
                          title: "Login Failed",
                          description: error.response.data.error,
                          status: "error",
                          duration: 5000,
                          isClosable: true,
                          position: "top",
                        });
                      }
                    }}
                    onError={() => {
                      console.log("Login Failed");
                    }}
                  />
                </GoogleOAuthProvider>
              </Button>
            </div>
          </div>
          <div className="circle circle-two"></div>
        </div>
        <div className="theme-btn-container"></div>
      </section>
    </div>
  );
}
