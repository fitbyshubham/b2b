/* eslint-disable*/
import React, { createContext, useState } from 'react'
import jwt from 'jsonwebtoken'
import { useSnackbar } from 'notistack'
import axios from 'axios'
import handleError from '../Global/HandleError/handleError'
import axiosGet from '../Global/Axios/axiosGet'
import showSuccessSnackbar from '../Components/Snackbar/successSnackbar'
import showErrorSnackbar from '../Components/Snackbar/errorSnackbar'
import axiosPost from '../Global/Axios/axiosPost'
import axiosPatch from '../Global/Axios/axiosPatch'

export const AuthContext = createContext()

const loginUrl = `/login/`
const registerUrl = `/register/`
const requestPasswordResetUrl = `/reset_password/request/`
const passwordResetUrl = `/reset_password/`
const setNewPasswordUrl = `/set_password/`
let tokenTimer

const AuthContextProvider = (props) => {
  const initialState = {
    access_token: '',
    refresh_token: '',
    role: '',
    name: '',
    email: '',
    exp: '',
    user_id: '',
    avatar: '',
    is_email_verified: false,
    is_phone_verified: false,
    can_update_name: false,
    phone_number: null,
  }
  const initialFeatures = {
    img: '',
    msg: '',
  }
  const [features, setFeatures] = useState(initialFeatures)

  const [authState, setAuthState] = useState(initialState)
  const [loading, setLoading] = useState(false)
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const { enqueueSnackbar } = useSnackbar()
  const [verifyEmailStatus, setVerifyEmailStatus] = useState(undefined)

  const [b2bLoginData, setb2bLoginData] = useState()

  const Refresh = async () => {
    const payload = {
      refresh: localStorage.getItem('refresh'),
    }
    try {
      const data = await axiosPost(`/login/refresh/`, { data: payload })
      await __setAuthData(data.data.access)
    } catch (err) {
      await LogOut()
    }
  }

  const ChangePassword = async (oldPassword, newPassword) => {
    const payload = {
      password: oldPassword,
      new_password: newPassword,
    }
    return axiosPost(`/change_password/`, {
      data: payload,
      headers: getAuthHeader(),
    })
  }

  const NewPassword = async (values, token) => {
    try {
      const headers = {
        'Content-Type': 'application/json; charset=UTF-8',
      }
      const payload = {
        token,
        new_password: values.setNewPassword,
      }
      await axiosPost(setNewPasswordUrl, { data: payload, headers })

      showSuccessSnackbar(enqueueSnackbar, 'Account Created')
      return true
    } catch (err) {
      handleError(enqueueSnackbar, err)
    }
  }

  const LogIn = async (values) => {
    try {
      const headers = {
        'Content-Type': 'application/json; charset=UTF-8',
      }
      const data = await axiosPost(loginUrl, { data: values, headers })
      const { access, refresh } = data.data
      localStorage.setItem('refresh', refresh)
      await __setAuthData(access)
    } catch (err) {
      handleError(enqueueSnackbar, err)
    }
  }

  const B2BLogin = async (data) => {
    try {
      const headers = {
        'Content-Type': 'application/json; charset=UTF-8',
      }

      // const normalLoginPayload = {
      //   email: values.email,
      //   password: values.password,
      //   remember_me: values.remember_me,
      // }
      // const res = await axiosPost(loginUrl, {
      //   data: normalLoginPayload,
      //   headers,
      // })

      // if (res.status === 200) {
      // const payload = {
      //   email: values.email,
      //   password: values.password,

      // }

      const b2bRes = await axiosPost(`https://34.87.101.190/login/`, {
        headers,
        data,
      })

      console.log(b2bRes)

      setb2bLoginData(b2bRes.data)

      return b2bRes
      // }
    } catch (err) {
      console.log(err.response)
      handleError(enqueueSnackbar, err)
    }
  }

  const AuthorizeUserGrant = async (data) => {
    try {
      // console.log('headers', headers)
      console.log('data', data)

      const payload = {
        client_id: data.client_id,
        consent: data.consent,
        redirect_uri: data.redirect_uri,
        scopes: data.scopes,
      }

      var config = {
        method: 'post',
        url: 'https://34.87.101.190/auth/user/authorize-grant/',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${data.token}`,
        },
        data: payload,
      }

      const res = await axios(config)

      console.log('res', res)

      return res
    } catch (err) {
      // handleError(enqueueSnackbar, err)
      console.log(err.response)
    }
  }

  const Authenticate = async () => {
    setLoading(true)
    const authInformation = __getAuthData()
    if (!authInformation) {
      setLoading(false)
      return
    }
    const decodedToken = jwt.decode(authInformation.access)
    let exp
    let user_id
    let role
    try {
      exp = decodedToken.exp
      user_id = decodedToken.user_id
      role = decodedToken.role
    } catch (err) {
      await LogOut()
    }
    if (!exp || !user_id || !role) {
      return
    }
    const expDate = new Date(parseInt(exp, 10) * 1000)
    const now = new Date()
    const expiresIn = expDate.getTime() - now.getTime()

    if (expiresIn > 0) {
      await __setAuthData(authInformation.access)
    } else {
      await Refresh()
    }
  }

  const LogOut = async () => {
    try {
      const refreshToken = {
        refresh: localStorage.getItem('refresh'),
      }
      await axiosPost(`/logout/`, { data: refreshToken })
    } finally {
      localStorage.clear()
      clearTimeout(tokenTimer)
      setAuthState(initialState)
      setVerifyEmailStatus(undefined)
      setIsLoggedIn(false)
      setLoading(false)
    }
  }

  const Register = async (values, goToPreviousStep, setErrors) => {
    try {
      const headers = {
        'Content-Type': 'application/json; charset=UTF-8',
      }
      const payload = {
        name: values.name,
        email: values.email,
        role: values.role,
        password: values.password,
      }
      const data = await axiosPost(registerUrl, { data: payload, headers })
      return data.status
    } catch (err) {
      if (err?.response?.status === 400) {
        if (err.response.data.code === 'duplicate_email') {
          showErrorSnackbar(
            enqueueSnackbar,
            'You already have an account with Edvi. Login to continue!',
          )
        }
        if (err?.response?.data.errors) {
          const keys = Object.keys(err.response.data.errors)
          keys.forEach((key) => {
            setErrors((errors) => ({
              ...errors,
              [key]: [err.response.data.errors[key][0]],
            }))
            if (key === 'email' || key === 'name') {
              goToPreviousStep()
              return true
            }
          })
        }
      } else {
        handleError(enqueueSnackbar, err)
      }

      return err?.response?.status || 400
    }
  }

  const RequestResetPassword = async (values) => {
    try {
      const headers = {
        'Content-Type': 'application/json; charset=UTF-8',
      }
      const payload = {
        email: values.email,
      }

      await axiosPost(requestPasswordResetUrl, {
        data: payload,
        headers,
      })

      showSuccessSnackbar(
        enqueueSnackbar,
        `Request sent on ${values.email} successfully! Please check your spam folder.`,
      )
    } catch (err) {
      handleError(enqueueSnackbar, err)
    }
  }

  const ResetPassword = async (values, token) => {
    try {
      const headers = {
        'Content-Type': 'application/json; charset=UTF-8',
      }
      const payload = {
        token,
        new_password: values.setNewPassword,
      }
      await axiosPost(passwordResetUrl, { data: payload, headers })

      showSuccessSnackbar(
        enqueueSnackbar,
        'Password has been changed successfully',
      )
      return true
    } catch (error) {
      handleError(enqueueSnackbar, error)
    }
  }

  const SetProfile = (data) => {
    const {
      is_email_verified,
      name,
      email,
      is_phone_verified,
      phone_number,
      avatar,
      can_update_name,
    } = data.data
    setAuthState((state) => ({
      ...state,
      is_email_verified,
      name,
      email,
      is_phone_verified,
      phone_number,
      avatar,
      can_update_name,
    }))
    localStorage.setItem('name', name)
    localStorage.setItem('email', email)
  }

  const GetProfile = async () => {
    try {
      const data = await axiosGet(`/profile/`, { headers: getAuthHeader() })
      SetProfile(data)
    } catch (err) {
      // console.log(err)
    }
  }

  const UpdateProfile = async (data) => {
    try {
      const res = await axiosPatch(`/profile/`, {
        data,
        headers: getAuthHeader(),
      })
      SetProfile(res)
      return {
        success: true,
      }
    } catch (err) {
      // showErrorSnackbar(enqueueSnackbar, err)
      return {
        success: false,
        err,
      }
    }
  }

  const VerifyEmail = async (registerToken) => {
    try {
      const tokenPayload = {
        token: registerToken,
      }
      const data = await axiosPost(`/verify_email/`, { data: tokenPayload })
      setVerifyEmailStatus({ data: data.request.status })
      if (data.request.status === 200) {
        setAuthState((state) => ({ ...state, is_email_verified: true }))
      }
      return {
        data: data.request.status,
      }
    } catch (err) {
      setVerifyEmailStatus({ data: err.response.status })
      return {
        data: err.response.status,
      }
    }
  }

  const VerifyPhoneOTP = async (data) => {
    try {
      const payload = {
        contact: 'P',
        otp: data,
      }
      const res = await axiosPost(`/verify_otp/`, {
        data: payload,
        headers: getAuthHeader(),
      })

      if (res.request.status === 200) {
        setAuthState((state) => ({
          ...state,
          is_phone_verified: true,
        }))
        return {
          success: true,
        }
      }
    } catch (err) {
      handleError(enqueueSnackbar, err)
      return {
        success: false,
      }
    }
  }

  const __getAuthData = () => {
    const access = localStorage.getItem('access')
    const role = localStorage.getItem('role')
    const name = localStorage.getItem('name')
    const email = localStorage.getItem('email')
    if (!access) {
      return
    }
    return {
      access,
      role,
      name,
      email,
    }
  }

  const __setAuthTimer = (duration) => {
    tokenTimer = setTimeout(() => {
      Refresh()
    }, duration - 10000)
  }

  const __setAuthData = async (token) => {
    const decodedToken = jwt.decode(token)
    let exp
    let user_id
    let role
    try {
      exp = decodedToken.exp
      user_id = decodedToken.user_id
      role = decodedToken.role
    } catch (err) {
      return
    }
    if (!exp || !user_id || !role) {
      await LogOut()
    }
    localStorage.setItem('access', token)
    const expDate = new Date(parseInt(exp, 10) * 1000)
    const now = new Date()
    const expiresIn = expDate.getTime() - now.getTime()
    __setAuthTimer(expiresIn)
    setAuthState((state) => ({
      ...state,
      access_token: token,
      role,
      exp: expDate.toISOString(),
      user_id,
    }))
    GetProfile().then(() => {
      setIsLoggedIn(true)
      setLoading(false)
    })
  }

  const getAuthHeader = () => ({
    Authorization: `Bearer ${localStorage.getItem('access')}`,
  })

  const SetFeatures = (img, msg) => {
    setFeatures({
      ...features,
      img,
      msg,
    })
  }

  const DirectGoogleLogin = async (payload) => {
    try {
      setLoading(true)
      const headers = {
        'Content-Type': 'application/json; charset=UTF-8',
      }
      const data = await axiosPost(`/login/google/`, { data: payload, headers })
      setLoading(true)
      const { access, refresh } = data.data
      localStorage.setItem('refresh', refresh)
      __setAuthData(access)
    } catch (err) {
      setLoading(false)
      handleError(enqueueSnackbar, err)
    }
  }

  const DirectGoogleRegister = async (payload) => {
    try {
      const headers = {
        'Content-Type': 'application/json; charset=UTF-8',
      }

      const data = await axiosPost(`/register/google/`, {
        data: payload,
        headers,
      })
      return data.status
    } catch (err) {
      setIsLoggedIn(false)
      handleError(enqueueSnackbar, err)
    }
  }

  const UploadProfilePhoto = async (formData, filetype, file_format) => {
    try {
      // Get Signed URL
      const storageUrlRes = await axiosGet(
        `/get_storage_url/?filetype=${filetype}&file_format=${file_format}`,
        {
          headers: getAuthHeader(),
        },
      )
      const storageUrl = storageUrlRes.data.url
      const storage_path = storageUrl.split('?')[0]

      // Upload File on Google Cloud Storage
      await axiosPost(storageUrl, {
        data: formData,
        headers: getAuthHeader(),
      })

      // Send data to API
      const res = await UpdateProfile({ avatar: storage_path })
      if (res.success)
        showSuccessSnackbar(enqueueSnackbar, 'Profile Photo Updated')
      return {
        success: true,
      }
    } catch (err) {
      handleError(enqueueSnackbar, err)
      return {
        success: false,
      }
    }
  }

  return (
    <AuthContext.Provider
      value={{
        LogIn,
        B2BLogin,
        b2bLoginData,
        AuthorizeUserGrant,
        authState,
        Register,
        RequestResetPassword,
        ChangePassword,
        loading,
        isLoggedIn,
        setIsLoggedIn,
        Refresh,
        LogOut,
        Authenticate,
        getAuthHeader,
        ResetPassword,
        GetProfile,
        UpdateProfile,
        VerifyEmail,
        VerifyPhoneOTP,
        verifyEmailStatus,
        DirectGoogleLogin,
        DirectGoogleRegister,
        features,
        SetFeatures,
        UploadProfilePhoto,
        NewPassword,
      }}
    >
      {props.children}
    </AuthContext.Provider>
  )
}

export default AuthContextProvider
