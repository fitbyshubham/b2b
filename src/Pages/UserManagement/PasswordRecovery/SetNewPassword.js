import React, { useEffect, useRef, useContext, useState } from 'react'
import { useHistory, useLocation } from 'react-router-dom'
import {
  createStyles,
  IconButton,
  InputAdornment,
  makeStyles,
} from '@material-ui/core'
import { Visibility, VisibilityOff } from '@material-ui/icons'
import { HiOutlineLockClosed } from 'react-icons/hi'
import { IoIosArrowBack } from 'react-icons/io'
import jwt from 'jsonwebtoken'
import Controls from '../../../Components/Controls/Controls'
import Form from '../../../Components/Form/Form'
import useForm from '../../../Hooks/useForm'
import { AuthContext } from '../../../Context/AuthContext'

const SetNewPassword = () => {
  const classes = useStyles()
  const token = useRef()
  const location = useLocation()
  const history = useHistory()

  const [newPassword, setNewPassword] = useState(false)
  const [repeatPassword, setRepeatPassword] = useState(false)
  const [tokenPurpose, setTokenPurpose] = useState()

  useEffect(() => {
    // eslint-disable-next-line prefer-destructuring
    token.current = location.search.split('=')[1]

    const decoded = jwt.decode(token.current)
    setTokenPurpose(decoded.purpose)
  }, [])

  const setNewPasswordFormData = {
    setNewPassword: '',
    repeatNewPassword: '',
  }
  const { ResetPassword, NewPassword } = useContext(AuthContext)

  const validate = (fieldValues = values) => {
    const temp = { ...errors }
    if ('setNewPassword' in fieldValues) {
      temp.setNewPassword = fieldValues.setNewPassword
        ? ''
        : 'This field is required.'
      if (values.repeatNewPassword) {
        if (fieldValues.setNewPassword === values.repeatNewPassword)
          temp.repeatNewPassword = ''
        else temp.repeatNewPassword = 'Passwords do not match.'
      }
    }

    if ('repeatNewPassword' in fieldValues) {
      if (values.setNewPassword === fieldValues.repeatNewPassword)
        temp.repeatNewPassword = ''
      else temp.repeatNewPassword = 'Passwords do not match.'
    }
    setErrors({
      ...temp,
    })

    if (fieldValues === values)
      return Object.values(temp).every((x) => x === '')
  }

  const { values, errors, setErrors, handleInputChange } = useForm(
    setNewPasswordFormData,
    true,
    validate,
  )

  async function handleSubmit(e) {
    e.preventDefault()
    if (validate()) {
      if (tokenPurpose === 'set_password') {
        const status = await NewPassword(
          { ...values, setNewPassword: values.setNewPassword },
          token.current,
        )
        if (status) {
          setTimeout(() => {
            history.push('/auth/login')
          }, 1000)
        }
      } else if (tokenPurpose === 'reset_password') {
        const currentStatus = await ResetPassword(
          { ...values, setNewPassword: values.setNewPassword },
          token.current,
        )
        if (currentStatus) {
          setTimeout(() => {
            history.push('/auth/login')
          }, 3000)
        }
      }
    }
  }

  return (
    <div className="container">
      <IconButton
        onClick={() => {
          history.push('/auth/recovery/sendlink')
        }}
      >
        <IoIosArrowBack />
      </IconButton>
      <div className="flex-column">
        <div className="flex-column">
          <div>
            <p className={classes.headText}>
              <span className={classes.span}>
                {tokenPurpose === 'reset_password'
                  ? 'Forgot Password'
                  : 'Create Password'}
              </span>
            </p>
          </div>
          <div>
            <p className={classes.text}>
              Let&apos;s set a {tokenPurpose === 'reset_password' && 'new'}{' '}
              password to secure your account
            </p>
          </div>
        </div>
        <Form onSubmit={handleSubmit}>
          <div className="form-control width-100">
            <div className="form-control-label bold">
              Set {tokenPurpose === 'reset_password' && 'New'} Password
            </div>
            <Controls.Input
              type={newPassword ? 'text' : 'password'}
              value={values.setNewPassword}
              onChange={handleInputChange}
              autoFocus
              placeholder="Password"
              name="setNewPassword"
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      onClick={() => {
                        setNewPassword((prev) => !prev)
                      }}
                    >
                      {newPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
                startAdornment: (
                  <InputAdornment position="start">
                    <HiOutlineLockClosed />
                  </InputAdornment>
                ),
              }}
              error={errors.setNewPassword}
            />
          </div>
          <div className="form-control width-100">
            <div className="form-control-label bold">
              Repeat {tokenPurpose === 'reset_password' && 'New'} Password
            </div>
            <Controls.Input
              type={repeatPassword ? 'text' : 'password'}
              value={values.repeatNewPassword}
              onChange={handleInputChange}
              placeholder="Repeat Password"
              name="repeatNewPassword"
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      onClick={() => {
                        setRepeatPassword((prev) => !prev)
                      }}
                    >
                      {repeatPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
                startAdornment: (
                  <InputAdornment position="start">
                    <HiOutlineLockClosed />
                  </InputAdornment>
                ),
              }}
              error={errors.repeatNewPassword}
            />
          </div>
          <Controls.Button
            type="submit"
            text={
              tokenPurpose === 'reset_password'
                ? 'Reset Password'
                : 'Create Password'
            }
          />
        </Form>
      </div>
    </div>
  )
}

export default SetNewPassword

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
    headText: {
      fontSize: '1.75rem',
    },
    text: {
      fontSize: '0.9rem',
      marginTop: '1rem',
      color: '#666',
      marginBottom: '2rem',
    },
  }),
)
