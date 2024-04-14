import React, { useState, useContext, useEffect, useCallback } from "react";
import "./Register.css";
import axios from "axios";
import { NavLink, useNavigate } from "react-router-dom";
import Modal from "./Modal";
import EmailVerify from "../components/authComponents/EmailVerify";
import { AppContext } from "../contextAPI/appContext";
import {
  Button,
  useToast,
  Input,
  Image,
  Spinner,
  InputGroup,
  InputRightElement,
  IconButton,
} from "@chakra-ui/react";
import { AiFillEye, AiFillEyeInvisible } from "react-icons/ai";
import _ from "lodash";

export default function Register({
  isOpen,
  onClose,
  profileData,
  setProfileData,
  onSubmit,
}) {
  const toast = useToast();
  const { state, dispatch } = useContext(AppContext);
  const [data, setData] = useState({
    name: "",
    inGameName: "",
    email: "",
    password: "",
    cpassword: "",
    pic: "https://icon-library.com/images/anonymous-avatar-icon/anonymous-avatar-icon-25.jpg",
    showPassword: false,
    showCPassword: false,
  });
  const [load, setLoad] = useState(false);
  const [imageLoading, setImageLoading] = useState(false);
  const [picDisplay, setPicDisplay] = useState(
    "https://icon-library.com/images/anonymous-avatar-icon/anonymous-avatar-icon-25.jpg"
  );
  const navigate = useNavigate();

  const inputHandler = (e) => {
    const { name, value } = e.target;
    setData({ ...data, [name]: value });
  };

  const togglePasswordVisibility = (field) => {
    setData({
      ...data,
      [field]: !data[field],
    });
  };

  const handleSubmit = async (e) => {
    setLoad(true);
    e.preventDefault();
    try {
      const newData = data;
      const pic = await submitImage(data);
      newData.pic = pic;
      const response = await axios.post(`/api/user/register`, newData);
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
      handleSubmitThrottled(e);
    }
  };

  const submitImage = async (dataForPic) => {
    try {
      const img = dataForPic.pic;
      const data = new FormData();
      data.append("file", img);
      data.append("upload_preset", "ProfilePics");
      data.append("cloud_name", "dxstsrnbs");
      const response = await axios.post(
        "https://api.cloudinary.com/v1_1/dxstsrnbs/image/upload",
        data
      );
      const pic = response.data.url;
      return pic;
    } catch (e) {
      console.log(e);
    }
  };

  const handleImageChange = async (e) => {
    setImageLoading(true);
    try {
      const img = e.target.files[0];
      const reader = new FileReader();
      reader.onloadend = () => {
        setPicDisplay(reader.result);
        setData({ ...data, pic: img });
      };
      reader.readAsDataURL(img);
    } catch (error) {
      toast({
        title: "Image upload Failed",
        description: error,
        status: "error",
        duration: 5000,
        isClosable: true,
        position: "top",
      });
      console.error(error);
    } finally {
      setImageLoading(false);
    }
  };

  return (
    <div className="content">
      {state.modal && (
        <Modal
          onClose={() => dispatch({ type: "showModal", payloadModal: false })}
        >
          <EmailVerify email={data.email} />
        </Modal>
      )}
      <section className="">
        <div className="r-container">
          <div className="form-container">
            <h1 className="opacity">Welcome!</h1>
            <form onSubmit={handleSubmitThrottled} onKeyDown={handleKeyPress}>
              <div>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "center",
                    marginBottom: "4px",
                  }}
                >
                  {imageLoading ? (
                    <Spinner size="lg" />
                  ) : (
                    <Image
                      loading={"eager"}
                      src={picDisplay}
                      alt="Profile Picture"
                      style={{
                        width: "100px",
                        height: "100px",
                        borderRadius: "50%",
                        marginBottom: "4px",
                      }}
                    />
                  )}
                </div>
                <div>
                  <div style={{ display: "flex", justifyContent: "center" }}>
                    <label style={{ color: "white", fontWeight: "bold" }}>
                      Upload Profile Picture
                    </label>
                  </div>
                  <Input
                    id="profile-pic"
                    type="file"
                    name="pic"
                    accept="image/*"
                    onChange={handleImageChange}
                    style={{ display: "none" }}
                  />
                  <label htmlFor="profile-pic">
                    <Button as="span" colorScheme="blue" style={{ size: "sm" }}>
                      Choose File
                    </Button>
                  </label>
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
              </div>
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
                  <InputGroup>
                    <Input
                      name="password"
                      onChange={inputHandler}
                      required
                      value={data.password}
                      type={data.showPassword ? "text" : "password"}
                      placeholder="Password"
                      minLength={8}
                    />
                    <InputRightElement width="4.5rem">
                      <IconButton
                        // h="1.75rem"
                        // size="sm"
                        style={{
                          marginBottom: "-44%",
                          marginLeft: "40%",
                          backgroundColor: "transparent",
                          color: "black",
                        }}
                        onClick={() => togglePasswordVisibility("showPassword")}
                        icon={
                          data.showPassword ? (
                            <AiFillEyeInvisible />
                          ) : (
                            <AiFillEye />
                          )
                        }
                      />
                    </InputRightElement>
                  </InputGroup>
                </div>
                <div className="col">
                  <InputGroup>
                    <Input
                      name="cpassword"
                      onChange={inputHandler}
                      required
                      value={data.cpassword}
                      type={data.showCPassword ? "text" : "password"}
                      placeholder="Confirm Password"
                      minLength={8}
                    />
                    <InputRightElement width="4.5rem">
                      <IconButton
                        // h="1.75rem"
                        // size="sm"
                        style={{
                          marginBottom: "-44%",
                          marginLeft: "40%",
                          backgroundColor: "transparent",
                          color: "black",
                        }}
                        onClick={() =>
                          togglePasswordVisibility("showCPassword")
                        }
                        icon={
                          data.showCPassword ? (
                            <AiFillEyeInvisible />
                          ) : (
                            <AiFillEye />
                          )
                        }
                      />
                    </InputRightElement>
                  </InputGroup>
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
            </form>
            <div className="r-forget opacity">
              <h6>
                Already a Member ?
                <NavLink
                  type="button"
                  className="w-50 btn btn-success p-1 rounded-2 mt-2 mb-2"
                  to="/signin"
                >
                  {" "}
                  Login Here
                </NavLink>
              </h6>
            </div>
          </div>
        </div>
        <div className="theme-btn-container"></div>
      </section>
    </div>
  );
}
