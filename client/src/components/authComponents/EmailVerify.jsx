import { useState, useRef, useEffect, useCallback } from 'react'
import './EmailVerify.css'
import axios from 'axios'
import { Otptimer } from 'otp-timer-ts'
import Loading from '../miscellaneous/Loading'
import { Box, Flex } from '@chakra-ui/react'
import { useToast } from '@chakra-ui/react'
import { throttle } from 'lodash'
import { useDispatch, useSelector } from 'react-redux'
import { setModal } from '../../redux/uiSlice'
import { setVerifyEmail } from '../../redux/authSlice'
import useSound from '../../customHooks/useSound'
const EmailVerify = ({ email, setEmailVerified }) => {
  const toast = useToast()
  const dispatch = useDispatch()
  const { forgotPassword } = useSelector(state => state.auth)
  const [load, setLoad] = useState(false) //for loading spinner
  const { playClick } = useSound()
  const [otp, setOtp] = useState({
    i1: '',
    i2: '',
    i3: '',
    i4: '',
    i5: '',
    i6: '',
  })
  const refs = {
    i1: useRef(null),
    i2: useRef(null),
    i3: useRef(null),
    i4: useRef(null),
    i5: useRef(null),
    i6: useRef(null),
  }

  const handleChange = e => {
    const { name, value } = e.target
    if (value === '+') {
      return
    }
    if (otp[name] !== '' && value !== '') {
      return
    }
    if (/^\d*$/.test(value)) {
      // Update the state if it's a whole number
      setOtp({ ...otp, [name]: value })
      if (value !== '' && /^[0-9]$/.test(value)) {
        const nextInput =
          name === 'i6' ? null : refs[`i${parseInt(name[1], 10) + 1}`]
        nextInput && nextInput.current.focus()
      }
    }
  }

  const submitOTP = async e => {
    const otpValue = `${otp.i1}${otp.i2}${otp.i3}${otp.i4}${otp.i5}${otp.i6}`
    const data = { otp: otpValue, email: email }
    setLoad(true)
    try {
      const response = await axios.post(
        `/api/user/verifyEmail?forgotPassword=${forgotPassword}`,
        data,
      )

      if (response.status === 201) {
        setEmailVerified && setEmailVerified(true)
        toast({
          title: 'Email Verified',
          status: 'success',
          duration: 5000,
          isClosable: true,
          position: 'top',
        })
        //alert("Email Verified");
        if (forgotPassword) {
          dispatch(setVerifyEmail(false))
        } else {
          dispatch(setModal(false))
          toast({
            title: 'Email Verified',
            status: 'success',
            duration: 5000,
            isClosable: true,
            position: 'top',
          })
        }
      } else {
        throw new Error('Email Verification Failed')
      }
      return
    } catch (error) {
      toast({
        title: 'Email Verification Failed',
        description: error.response.data.error,
        status: 'error',
        duration: 9000,
        isClosable: true,
        position: 'top',
      })
      //alert("Email Verification Failed");
      console.log(error.response.data.error)
    } finally {
      setLoad(false)
    }
    //console.log(otpValue);
  }

  const showEmail = () => {
    let i = email.indexOf('@')

    const starredEmail =
      email.slice(0, 2) + email.slice(2, i).replace(/./g, '*') + email.slice(i)
    return starredEmail
  }

  const resendOTP = async e => {
    //e.preventDefault();
    setLoad(true)
    try {
      const response = await axios.post(`/api/user/resendOTP`, {
        email: email,
      })
      if (response.status === 201) {
        toast({
          title: 'OTP sent',
          status: 'success',
          duration: 5000,
          isClosable: true,
          position: 'top',
        })
      }
    } catch (error) {
      toast({
        title: 'OTP sending failed',
        description: error.response.data.error,
        status: 'error',
        duration: 5000,
        isClosable: true,
        position: 'top',
      })

      console.log(error.response.data.error)
    } finally {
      setLoad(false)
    }
  }

  const handlePaste = e => {
    e.preventDefault()
    const pastedData = e.clipboardData.getData('text/plain').slice(0, 6)
    if (/^\d*$/.test(pastedData)) {
      setOtp({
        i1: pastedData[0] || '',
        i2: pastedData[1] || '',
        i3: pastedData[2] || '',
        i4: pastedData[3] || '',
        i5: pastedData[4] || '',
        i6: pastedData[5] || '',
      })
    }
  }

  const handleKeyDown = e => {
    const { name, value } = e.target
    const isBackspace = e.code === 'Backspace'
    if (isBackspace) {
      // If backspace is pressed and the current input is empty, move focus to the previous input
      if (value === '') {
        const prevInput =
          name === 'i1' ? null : refs[`i${parseInt(name[1], 10) - 1}`]
        prevInput && prevInput.current.focus()
      }
    }
  }

  const submitOTPThrottled = useCallback(throttle(submitOTP, 1000), [otp])
  useEffect(() => {
    return () => submitOTPThrottled.cancel()
  }, [])
  return (
    <div className="otp-form">
      <form name="otp-form">
        <div className="title">
          <h3>OTP VERIFICATION</h3>
          <p className="info">An otp has been sent to {showEmail()}</p>
          <p className="msg">Please enter OTP to verify</p>
        </div>
        <div className="otp-input-fields">
          {Object.keys(otp).map((key, index) => (
            <input
              key={index}
              onChange={handleChange}
              onPaste={handlePaste}
              name={key}
              value={otp[key]}
              type="number"
              className={`otp__digit otp__field__${index + 1}`}
              ref={refs[key]}
              onKeyDown={handleKeyDown}
              maxLength={1}
            />
          ))}
        </div>
        <Flex
          w={'100%'}
          justifyContent={'center'}
          flexDirection={'column'}
          textAlign={'center'}
        >
          <button
            onClick={() => {
              playClick()
              submitOTPThrottled()
            }}
            className="btn btn-primary my-3"
            disabled={load}
          >
            Verify
          </button>
          <p className="resend mb-2">Didn't receive code?</p>
          <Box>
            <Otptimer
              buttonText="Resend OTP"
              buttonContainerClass="btn btn-danger"
              minutes={0}
              seconds={60}
              onResend={resendOTP}
              textStyle={{ color: 'white' }}
              timerStyle={{ color: 'white' }}
            />
          </Box>
        </Flex>
      </form>

      <div className="mt-3">{load && <Loading />}</div>
    </div>
  )
}

export default EmailVerify
