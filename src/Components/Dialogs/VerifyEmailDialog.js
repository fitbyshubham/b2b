import React, { useState, useContext, useEffect } from 'react'
import {
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  IconButton,
} from '@material-ui/core'
import { useHistory } from 'react-router-dom'
import { makeStyles, createStyles } from '@material-ui/core/styles'
import { IoCloseSharp } from 'react-icons/io5'
import { FaRegEdit } from 'react-icons/fa'
import { useSnackbar } from 'notistack'
import { BatchContext } from '../../Context/BatchContext'
import Controls from '../Controls/Controls'
import OtpField from '../OtpField/OtpField'
import Dialog from './Dialog'
import showErrorSnackbar from '../Snackbar/errorSnackbar'

const VerifyEmailDialog = ({ open, close, email, sendOTP }) => {
  const classes = useStyles()

  const [otp, setOtp] = useState(new Array(6).fill(''))
  const [allowVerify, setAllowVerify] = useState(false)

  const history = useHistory()
  const { ResendEmailVerify, VerifyEmailWithOtp } = useContext(BatchContext)

  useEffect(() => {
    if (sendOTP) {
      const data = {
        email,
      }
      ResendEmailVerify(data)
    }
  }, [])

  useEffect(() => {
    const data = otp.join('')
    if (data.length !== 6) {
      setAllowVerify(false)
    } else {
      setAllowVerify(true)
    }
  }, [otp])

  const handleDialogClose = () => {
    setTimeout(() => setOtp(new Array(6).fill('')), 500)
    close()
  }

  const handleChange = (element, index) => {
    if (Number.isNaN(element.value)) return false
    setOtp([...otp.map((d, idx) => (idx === index ? element.value : d))])
    // Focus next input
    if (element.nextSibling) {
      element.nextSibling.focus()
    }
  }
  const { enqueueSnackbar } = useSnackbar()

  const handleVerify = async () => {
    const data = otp.join('')
    if (data.length === 6) {
      const payload = {
        contact: 'E',
        otp: data,
      }
      const res = await VerifyEmailWithOtp(payload)
      if (res === 200) {
        window.location.reload(false)
      }
    } else {
      showErrorSnackbar(enqueueSnackbar, 'Please enter a 6 digit OTP')
    }
  }

  return (
    <Dialog open={open} fullWidth={false}>
      <DialogTitle>
        <div className={classes.header}>
          <p className="sub-text bold text-align-center">Email Verification</p>
          <IconButton onClick={handleDialogClose} className={classes.close}>
            <IoCloseSharp size={20} />
          </IconButton>
        </div>
      </DialogTitle>
      <Divider />
      <DialogContent classes={classes.root}>
        <div className={classes.content}>
          <p className={classes.text}>
            Please Enter one time password sent to your email
          </p>
          <p className={classes.text}>
            <span className={classes.bold}>{email}</span>{' '}
            <FaRegEdit
              onClick={() => {
                handleDialogClose()
                history.push('/dashboard/editprofile')
              }}
              className="cursor-pointer"
            />
          </p>
          <p className="fine-text text-align-center">
            Please check your spam folder as well.
          </p>
          <div className={classes.otp}>
            <p className={classes.text}>Enter OTP</p>
            <OtpField otp={otp} setOtp={setOtp} handleChange={handleChange} />
          </div>
        </div>
      </DialogContent>
      <Divider />
      <DialogActions>
        <Controls.Button
          onClick={handleVerify}
          style={{ margin: '0.5rem' }}
          disabled={!allowVerify}
        >
          Verify
        </Controls.Button>
      </DialogActions>
    </Dialog>
  )
}
const useStyles = makeStyles(() =>
  createStyles({
    header: {
      display: 'flex',
      flexDirection: 'row',
      paddingLeft: 20,
      justifyContent: 'center',
      alignItems: 'center',
      marginInline: 40,
      '@media (max-width: 400px)': {
        paddingLeft: 0,
      },
    },
    root: {
      '& .MuiDialogContent-root': {
        '@media (max-width: 400px)': {
          padding: '8px 5px',
        },
      },
    },
    close: {
      position: 'absolute',
      right: 10,
    },
    content: {
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center',
    },
    text: {
      fontSize: '1rem',
      margin: '5px 0',
      textAlign: 'center',
    },
    bold: {
      fontWeight: 'bold',
    },
    otp: {
      padding: '20px 0',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center',
      '@media (max-width: 400px)': {
        paddingBlock: 0,
      },
    },
    link: {
      textDecorationLine: 'underline',
      color: '#5687E1',
      '&:hover': {
        cursor: 'pointer',
      },
    },
  }),
)
export default VerifyEmailDialog
