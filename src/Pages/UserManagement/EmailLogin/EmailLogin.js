/* eslint-disable no-unused-vars */
import React, { useContext, useEffect, useState } from 'react'
import { Link, useHistory, useLocation } from 'react-router-dom'
import {
  Checkbox,
  Divider,
  FormControlLabel,
  IconButton,
  InputAdornment,
} from '@material-ui/core'
import { Visibility, VisibilityOff } from '@material-ui/icons'
import { makeStyles, createStyles } from '@material-ui/core/styles'
import { HiOutlineMail, HiOutlineLockClosed } from 'react-icons/hi'
import { CgArrowLongRight } from 'react-icons/cg'
import { AuthContext } from '../../../Context/AuthContext'
import Form from '../../../Components/Form/Form'
import Controls from '../../../Components/Controls/Controls'
import useForm from '../../../Hooks/useForm'

import GoogleLoginBtn from '../Register/MasterForm/Step1/GoogleLoginBtn'
import Spinner from '../../../Components/Progress/Spinner'
import RegularTooltip from '../../../Components/Tooltips/RegularTooltip'

const EmailLogin = () => {
  const { LogIn, isLoggedIn, B2BLogin } = useContext(AuthContext)
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const history = useHistory()
  const location = useLocation()
  const loginFormData = {
    email: '',
    password: '',
    remember_me: false,
  }

  // Testing
  const [b2bData, setb2bData] = useState({
    isB2B: false,
    client_id: '',
    redirect_uri: '',
    scopes: '',
  })
  const { search } = location

  useEffect(() => {
    const client_id = new URLSearchParams(search).get('client_id')
    const redirect_uri = new URLSearchParams(search).get('redirect_uri')
    const scopes = new URLSearchParams(search).get('scopes')

    if (client_id && redirect_uri && scopes) {
      setb2bData({
        isB2B: true,
        client_id,
        redirect_uri,
        scopes,
      })
    }
  }, [location])

  // console.log(b2bData)

  useEffect(() => {
    if (isLoggedIn) {
      if (location.state && location.state.from) {
        if (location.state.from.search) {
          history.push(
            `${location.state.from.pathname}${location.state.from.search}`,
          )
        } else {
          history.push(location.state.from.pathname)
        }
      } else {
        history.push('/')
      }
    }
  }, [isLoggedIn])

  const classes = useStyles()

  const validate = (fieldValues = values) => {
    const temp = { ...errors }
    if ('password' in fieldValues)
      temp.password = fieldValues.password ? '' : 'This field is required.'
    if ('email' in fieldValues)
      temp.email = fieldValues.email
        ? fieldValues.email.indexOf(' ') !== -1
          ? 'Whitespace is not allowed'
          : ''
        : 'Please enter your email'
    setErrors({
      ...temp,
    })

    if (fieldValues === values)
      return Object.values(temp).every((x) => x === '')
  }

  const { values, setValues, errors, setErrors, handleInputChange } = useForm(
    loginFormData,
    true,
    validate,
  )

  const handleCheckBoxChange = (e) => {
    setValues((vals) => ({
      ...vals,
      remember_me: e.target.checked,
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (validate()) {
      setIsLoading(true)

      if (b2bData.isB2B) {
        console.log('b2blogin', {
          ...values,
          email: values.email.trim().toLowerCase(),
          client_id: b2bData.client_id,
          redirect_uri: b2bData.redirect_uri,
          scopes: b2bData.scopes.split(','),
        })
        const res = await B2BLogin({
          ...values,
          email: values.email.trim().toLowerCase(),
          client_id: b2bData.client_id,
          redirect_uri: b2bData.redirect_uri,
          scopes: b2bData.scopes.split(','),
        })

        if (res.status === 200) {
          history.push(
            `/auth/consent?client_id=${b2bData.client_id}&redirect_uri=${b2bData.redirect_uri}&scopes=${b2bData.scopes}`,
          )
        }
      } else {
        await LogIn({
          ...values,
          email: values.email.trim().toLowerCase(),
        })
      }
      setIsLoading(false)
    }
  }

  return (
    <>
      <div className="container">
        <div className="flex-column">
          <div className="flex-column">
            <div>
              <p className={classes.subtext}>Welcome back </p>
            </div>
            <div>
              <p className={classes.headText}>
                <span className={classes.span}>Sign In</span> to edvi
              </p>
            </div>
          </div>
          <Form onSubmit={handleSubmit}>
            <GoogleLoginBtn />
            <div
              className={`margin-bottom-30 margin-top-30 ${classes.divider}`}
            >
              <Divider variant="fullWidth" />
            </div>
            <div className="form-control width-100">
              <div className="form-control-label">Email</div>
              <Controls.Input
                type="text"
                name="email"
                value={values.email}
                onChange={handleInputChange}
                autoFocus
                placeholder="Email"
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <HiOutlineMail />
                    </InputAdornment>
                  ),
                }}
                error={errors.email}
              />
            </div>
            <div className="form-control width-100">
              <div className="form-control-label">Password</div>
              <Controls.Input
                type={showPassword ? 'text' : 'password'}
                name="password"
                value={values.password}
                onChange={handleInputChange}
                placeholder="Password"
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        onClick={() => {
                          setShowPassword((prev) => !prev)
                        }}
                        aria-label={
                          showPassword ? 'hide password' : 'show password'
                        }
                      >
                        {showPassword ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  ),
                  startAdornment: (
                    <InputAdornment position="start">
                      <HiOutlineLockClosed />
                    </InputAdornment>
                  ),
                }}
                error={errors.password}
              />
            </div>

            <div className={classes.forgotPassBtn}>
              <RegularTooltip
                title="Stay signed in for 30 days. Please do this only on a trusted device"
                placement="right"
              >
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={values.remember_me}
                      onChange={handleCheckBoxChange}
                      inputProps={{ 'aria-label': 'remember me checkbox' }}
                      color="primary"
                    />
                  }
                  label="Remember Me"
                  className={classes.label}
                />
              </RegularTooltip>
              <p className="fine-text bold">
                <Link to="/auth/recovery/sendlink" className={classes.link}>
                  <span className={classes.span2}>Forgot Password?</span>
                </Link>
              </p>
            </div>
            <Controls.Button
              type="submit"
              endIcon={<CgArrowLongRight />}
              startIcon={
                isLoading && (
                  <Spinner
                    size={20}
                    className="margin-left-unset position-unset"
                    color="inherit"
                  />
                )
              }
              disabled={
                isLoading || Boolean(errors.email) || Boolean(errors.password)
              }
            >
              Sign In
            </Controls.Button>
          </Form>
        </div>
      </div>
    </>
  )
}

const useStyles = makeStyles(() =>
  createStyles({
    span: {
      color: '#6480e4',
      fontWeight: 600,
      position: 'relative',
      '&::after': {
        content: '""',
        width: '78px',
        height: '4px',
        backgroundColor: '#6480e4',
        borderRadius: 2,
        position: 'absolute',
        top: 45,
        left: 0,
      },
    },
    link: {
      textDecoration: 'none',
    },
    span2: {
      color: '#6480e4',
      fontWeight: 600,
    },
    subtext: {
      color: '#999',
    },
    google_login: {
      marginTop: 30,
      backgroundColor: '#fff',
      color: '#000',
      '&:hover': {
        backgroundColor: '#fff',
      },
      width: '100%',
      justifyContent: 'center',
    },
    forgotPassBtn: {
      display: 'flex',
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginTop: -8,
      marginBottom: 6,
    },
    headText: {
      fontSize: '1.75rem',
    },
    label: {
      '& .MuiTypography-body1': {
        fontSize: '0.9rem',
        fontWeight: 500,
        color: '#666',
      },
    },
    spinner: {
      marginLeft: 'unset',
      position: 'unset',
    },
    divider: {
      position: 'relative',
      '&:after': {
        content: '"OR"',
        position: 'absolute',
        height: 'max-content',
        width: 'max-content',
        left: '50%',
        top: '50%',
        transform: 'translate(-50%,-50%)',
        textAlign: 'center',
        backgroundColor: '#fff',
        padding: '0 12px',
        color: '#666',
      },
    },
  }),
)

export default EmailLogin
