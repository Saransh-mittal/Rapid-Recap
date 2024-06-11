import React, { useState, useContext, useEffect, useCallback } from "react";
import { AppContext } from "../../contextAPI/appContext";
import axios from "axios";
import { throttle } from "lodash";
import {
  useToast,
  Button,
  Input,
  InputGroup,
  InputRightElement,
} from "@chakra-ui/react";

const ResetPassword = ({ email }) => {
  const toast = useToast();
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const { state, dispatch } = useContext(AppContext);
  const [load, setLoad] = useState(false); //for loading spinner
  const [show, setShow] = useState({
    new_p: false,
    confirm_p: false,
  });

  const handleResetPassword = async () => {
    setLoad(true);
    if (newPassword !== confirmPassword) {
      alert("Passwords do not match");
      return;
    }

    try {
      const response = await axios.post(`/api/user/forgotPassword`, {
        email,
        newPassword,
      });

      if (response.status === 201) {
        toast({
          title: "Password Reset Successfully",
          status: "success",
          duration: 5000,
          isClosable: true,
          position: "top",
        });

        dispatch({ type: "forgotPassword", payloadForgotPassword: false });
        dispatch({ type: "showModal", payloadModal: false });
      }
    } catch (error) {
      toast({
        //title: ,
        description: error.response.data.error,
        status: "error",
        duration: 5000,
        isClosable: true,
        position: "top",
      });
      //alert(error.response.data.error);
      console.log(error.response.data.error);
    } finally {
      setLoad(false);
    }
  };

  const handleResetPasswordThrottled = useCallback(
    throttle(handleResetPassword, 1000),
    [newPassword, confirmPassword]
  );

  useEffect(() => {
    return () => handleResetPasswordThrottled.cancel();
  }, [handleResetPasswordThrottled]);

  return (
    <>
      <div className="h-100 d-flex flex-column justify-content-center align-items-center text-white">
        <h2>Reset Password</h2>
        <div className="d-flex flex-column gap-3 mt-3">
          <div className="d-grid">
            <div className="row">
              <div className="col-6 d-flex">
                <label className="ms-auto me-4 text-white">New Password:</label>
              </div>
              <div className="col-6 d-flex">
                <InputGroup size="md">
                  <Input
                    pr="4.5rem"
                    type={show.new_p ? "text" : "password"}
                    placeholder="Enter password"
                    minLength={8}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                  />
                  <InputRightElement width="4.5rem">
                    <Button
                      h="1.75rem"
                      size="sm"
                      name="new_p"
                      onClick={(e) =>
                        setShow({
                          ...show,
                          [e.target.name]: !show[e.target.name],
                        })
                      }
                    >
                      {show.new_p ? "Hide" : "Show"}
                    </Button>
                  </InputRightElement>
                </InputGroup>
              </div>
            </div>
          </div>
          <div className="d-grid">
            <div className="row">
              <div className="col-6 d-flex">
                <label className="ms-auto me-4 text-white">
                  Confirm Password:
                </label>
              </div>
              <div className="col-6 d-flex">
                <InputGroup size="md">
                  <Input
                    pr="4.5rem"
                    type={show.confirm_p ? "text" : "password"}
                    placeholder="Enter password"
                    minLength={8}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                  />
                  <InputRightElement width="4.5rem">
                    <Button
                      h="1.75rem"
                      size="sm"
                      name="confirm_p"
                      onClick={(e) =>
                        setShow({
                          ...show,
                          [e.target.name]: !show[e.target.name],
                        })
                      }
                    >
                      {show.confirm_p ? "Hide" : "Show"}
                    </Button>
                  </InputRightElement>
                </InputGroup>
              </div>
            </div>
          </div>
        </div>
        <Button
          colorScheme="messenger"
          className="mt-5 rounded-2"
          onClick={handleResetPasswordThrottled}
          isLoading={load}
        >
          Reset Password
        </Button>
      </div>
    </>
  );
};

export default ResetPassword;
