/* eslint-disable no-useless-escape */
import React, { useContext, useEffect, useState } from 'react'
import { useHistory, Link } from 'react-router-dom'
import { makeStyles, createStyles } from '@material-ui/core/styles'
import { IoIosArrowBack, IoIosClose } from 'react-icons/io'
import { Box, Drawer, IconButton } from '@material-ui/core'
import Step1 from './Step1/Step1'
import Step2 from './Step2/Step2'
import useForm from '../../../../Hooks/useForm'
import { iOS } from '../../../../Global/Functions'
import { AuthContext } from '../../../../Context/AuthContext'
import RegistrationSuccessDialog from '../../../../Components/Dialogs/RegistrationSuccessDialog'
import GooglePlay from '../../../../Assets/Images/android.svg'

const MasterForm = ({ openDrawer, setOpen }) => {
  const classes = useStyles()
  const { Register, isLoggedIn } = useContext(AuthContext)

  const [role, setRole] = useState('')
  const [displayDrawer, setDisplayDrawer] = useState(true)

  const history = useHistory()

  useEffect(() => {
    if (isLoggedIn) {
      history.push({
        pathname: '/',
      })
    }
  }, [isLoggedIn, history])

  useEffect(() => {
    if (iOS()) {
      setDisplayDrawer(false)
    }
  }, [])

  const registerFormData = {
    name: '',
    email: '',
    createPassword: '',
    repeatPassword: '',
    role: 'S',
  }

  const validate = (fieldValues = values) => {
    const temp = { ...errors }
    if ('name' in fieldValues) {
      const name = fieldValues.name.trim()
      temp.name =
        name.length > 0
          ? name.length <= 55
            ? ''
            : 'Name should be less than 55 characters'
          : 'Please enter your name'
    }
    if ('email' in fieldValues) {
      temp.email = fieldValues.email
        ? fieldValues.email.indexOf(' ') !== -1
          ? 'Whitespace is not allowed'
          : ''
        : 'Please enter your email'
    }
    if ('createPassword' in fieldValues) {
      temp.createPassword = fieldValues.createPassword
        ? ''
        : 'Please choose a password.'
      if (values.repeatPassword) {
        if (fieldValues.createPassword === values.repeatPassword)
          temp.repeatPassword = ''
        else temp.repeatPassword = 'Passwords do not match.'
      }
    }

    if ('repeatPassword' in fieldValues) {
      if (values.createPassword === fieldValues.repeatPassword)
        temp.repeatPassword = ''
      else temp.repeatPassword = 'Passwords do not match.'
    }
    if ('role' in fieldValues)
      temp.role = fieldValues.role.length !== 0 ? '' : 'This field is required.'
    setErrors({
      ...temp,
    })

    if (fieldValues === values)
      return Object.values(temp).every((x) => x === '')
  }

  const { values, errors, setErrors, handleInputChange } = useForm(
    registerFormData,
    true,
    validate,
  )

  const [currentStep, setCurrentStep] = useState(1)

  const goToNextStep = () => {
    setCurrentStep(currentStep + 1)
  }

  const goToPreviousStep = () => {
    setCurrentStep(currentStep - 1)
  }

  // registration modal
  const [isRegSuccessModalOpen, setIsRegSuccessModalOpen] = useState(false)
  const [registrationLoading, setRegistrationLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()

    const payload = {
      role,
      email: values.email.trim().toLowerCase(),
      name: values.name.trim(),
      password: values.createPassword,
    }

    if (validate()) {
      setRegistrationLoading(true)
      const status = await Register(payload, goToPreviousStep, setErrors)
      if (status === 201) {
        setIsRegSuccessModalOpen(true)
        setRegistrationLoading(false)
      } else {
        setRegistrationLoading(false)
      }
    }
  }

  const drawer = (anchor) => (
    <Box
      sx={{ width: 'auto' }}
      role="presentation"
      onClick={setOpen !== undefined && setOpen(false)}
      onKeyDown={setOpen !== undefined && setOpen(anchor, false)}
    >
      <div className="text-align-right">
        <IconButton onClick={handleClose}>
          <IoIosClose size={40} />
        </IconButton>
      </div>
      <div
        className="text-align-center pd-bottom-30"
        style={{ padding: '0 50px' }}
      >
        <h2 className="bolder pd-bottom-12">
          For the best experience download edvi mobile app
        </h2>
        <a href="https://play.google.com/store/apps/details?id=app.edvi">
          <img src={GooglePlay} alt="Play Store" className="width-50" />
        </a>
      </div>
    </Box>
  )

  const handleClose = () => {
    setDisplayDrawer(false)
  }

  return (
    <>
      <RegistrationSuccessDialog
        open={isRegSuccessModalOpen}
        setOpen={setIsRegSuccessModalOpen}
        email={values.email.trim().toLowerCase()}
        password={values.createPassword}
      />
      <div className="container">
        <div className="flex-column">
          {currentStep === 1 && (
            <div className="flex-column">
              <div>
                <p className={classes.subtext}>Welcome </p>
              </div>
              <div>
                <p className={classes.headText}>
                  <span className={classes.span}>Register</span> to edvi
                </p>
              </div>
              <div className="flex-row-reverse">
                <p className="bold">Step {currentStep} of 2</p>
              </div>
            </div>
          )}
          {currentStep === 2 && (
            <div className="flex-column">
              <div>
                <IconButton
                  onClick={() => {
                    goToPreviousStep()
                  }}
                >
                  <IoIosArrowBack />
                </IconButton>
              </div>
              <div>
                <p className={classes.headText}>
                  <span className={classes.span}>Set a New Password</span>
                </p>
              </div>
              <div className="margin-top-small margin-bottom-small">
                <p className={classes.subtext}>
                  Let&apos;s set a new password to secure your account{' '}
                </p>
              </div>
              <div className="flex-row-reverse">
                <p className="bold">Step {currentStep} of 2</p>
              </div>
            </div>
          )}

          {currentStep === 1 && (
            <Step1
              values={values}
              handleInputChange={handleInputChange}
              goToNextStep={goToNextStep}
              errors={errors}
              role={role}
              setRole={setRole}
            />
          )}
          {currentStep === 2 && (
            <Step2
              values={values}
              handleInputChange={handleInputChange}
              handleSubmit={handleSubmit}
              goToPreviousStep={goToPreviousStep}
              errors={errors}
              registrationLoading={registrationLoading}
              registrationComplete={isRegSuccessModalOpen}
            />
          )}
        </div>
        {currentStep === 1 && (
          <div>
            <p className={classes.fineText}>
              By registering I agree to all{' '}
              <Link
                className={classes.span2}
                to="/terms"
                target="_blank"
                rel="noopener noreferrer"
              >
                Terms & Conditions
              </Link>{' '}
              &{' '}
              <Link
                className={classes.span2}
                to="/privacy"
                target="_blank"
                rel="noopener noreferrer"
              >
                Privacy Policy
              </Link>
            </p>
          </div>
        )}
      </div>
      {displayDrawer ? (
        <div>
          <Drawer
            anchor="bottom"
            open={openDrawer}
            onClose={setOpen !== undefined && setOpen('bottom', false)}
          >
            {drawer('bottom')}
          </Drawer>
        </div>
      ) : null}
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
    span2: {
      color: '#666666',
      textDecorationLine: 'underline',
      fontWeight: 600,
      '&:hover': {
        cursor: 'pointer',
      },
    },
    subtext: {
      color: '#999',
    },
    headText: {
      fontSize: '1.75rem',
    },
    fineText: {
      color: '#666666',
      textAlign: 'center',
      fontSize: '0.9rem',
    },
    closeBtn: {
      position: 'absolute',
      right: 12,
      top: 12,
    },
  }),
)

export default MasterForm
