import React, { useContext, useState } from 'react'
import { Avatar, Divider } from '@material-ui/core'
import { makeStyles } from '@material-ui/core/styles'
import { IoCheckmarkCircleSharp } from 'react-icons/io5'
import { HiOutlineMail, HiOutlinePhone } from 'react-icons/hi'
import { MdError } from 'react-icons/md'
import { useHistory } from 'react-router-dom'
import Controls from '../Controls/Controls'
import { AuthContext } from '../../Context/AuthContext'
import Card from './Card'
import { CheckForDaytime } from '../../Global/Functions'
import VerifyEmailDialog from '../Dialogs/VerifyEmailDialog'
import profilePlaceholder from '../../Assets/Images/profilePlaceholder.svg'
import useWindowDimensions from '../../Hooks/useWindowDimensions'

const DashboardProfileCard = () => {
  const classes = useStyles()
  const { width } = useWindowDimensions()
  const history = useHistory()

  const [openVerifyEmailDialog, setOpenVerifyEmailDialog] = useState(false)

  const handleOpenVerifyEmailDialog = () => {
    setOpenVerifyEmailDialog(true)
  }

  const handleCloseVerifyEmailDialog = () => {
    setOpenVerifyEmailDialog(false)
  }

  const { authState } = useContext(AuthContext)
  const {
    email,
    is_email_verified,
    is_phone_verified,
    name,
    phone_number,
    role,
    avatar,
  } = authState

  return (
    <div className="edit-profile__container">
      <p className="edit-profile__greeting-text">
        Hi, Good {CheckForDaytime()}!
      </p>
      <Card>
        <div className="edit-profile__desktop">
          <div className="edit-profile__card-content">
            <div className="edit-profile__content-wrapper">
              <Avatar
                src={avatar || profilePlaceholder}
                style={{ width: 80, height: 80 }}
                alt={name}
              />
              <div className="edit-profile__info-wrapper">
                <p className="edit-profile__info-wrapper__name">{name}</p>
                <p className="edit-profile__info-wrapper__role">
                  {role === 'S' ? 'Student' : 'Teacher'}
                </p>
              </div>
            </div>
            <div className="edit-profile__content-wrapper">
              <Divider
                orientation="vertical"
                variant="fullWidth"
                className={classes.divider}
              />
              <div className="edit-profile__icons">
                <HiOutlineMail color="#6992e4" />
              </div>
              <div className="edit-profile__info-wrapper">
                <p className="edit-profile__info-wrapper__heading">Email ID</p>
                <p className="edit-profile__info-wrapper__text">
                  {email}{' '}
                  {is_email_verified ? (
                    <IoCheckmarkCircleSharp
                      color="#00bea7"
                      className="edit-profile__verified"
                    />
                  ) : (
                    <MdError
                      color="#ff471b"
                      className="edit-profile__verified"
                    />
                  )}
                </p>
              </div>
            </div>

            <div className="edit-profile__content-wrapper">
              <Divider
                orientation="vertical"
                variant="fullWidth"
                className={classes.divider}
              />
              <div className="edit-profile__icons">
                <HiOutlinePhone color="#6992e4" />
              </div>
              <div className="edit-profile__info-wrapper">
                <p className="edit-profile__info-wrapper__heading">
                  Mobile No.
                </p>
                {phone_number === null ? (
                  <p
                    className="edit-profile__info-wrapper__add-mobile"
                    onClick={() => history.push('/dashboard/editprofile')}
                    onKeyDown={() => history.push('/dashboard/editprofile')}
                  >
                    + Add Mobile No.
                  </p>
                ) : (
                  <p className="edit-profile__info-wrapper__text">
                    {phone_number.substring(2)}{' '}
                    {is_phone_verified ? (
                      <IoCheckmarkCircleSharp
                        color="#00bea7"
                        className="edit-profile__verified"
                      />
                    ) : (
                      <MdError
                        color="#ff471b"
                        className="edit-profile__verified"
                      />
                    )}
                  </p>
                )}
              </div>
            </div>
            <div className="edit-profile__content-wrapper">
              <Controls.Button
                className={classes.editBtn}
                variant="outlined"
                onClick={() => history.push('/dashboard/editprofile')}
              >
                Edit Profile
              </Controls.Button>
            </div>
          </div>
        </div>
        <div className="edit-profile__tab">
          <div className="edit-profile__card-content">
            <div className="edit-profile__content-wrapper">
              <div className="edit-profile__tab__user">
                <Avatar
                  src={avatar || profilePlaceholder}
                  style={{ width: 48, height: 48 }}
                />
                <div className="edit-profile__info-wrapper">
                  <p className="edit-profile__info-wrapper__name">{name}</p>
                  <p className="edit-profile__info-wrapper__role">
                    {role === 'S' ? 'Student' : 'Teacher'}
                  </p>
                </div>
              </div>
              <div className="edit-profile__tab__edit-button">
                <Controls.Button
                  className={classes.editBtn}
                  variant="outlined"
                  onClick={() => history.push('/dashboard/editprofile')}
                >
                  Edit Profile
                </Controls.Button>
              </div>
            </div>
            <hr className="edit-profile__tab__divider" />
            <div className="edit-profile__tab__user-details">
              <div className="edit-profile__content-wrapper">
                <div className="edit-profile__icons">
                  <HiOutlineMail color="#6992e4" />
                </div>
                <div className="edit-profile__info-wrapper">
                  <p className="edit-profile__info-wrapper__heading">
                    Email ID
                  </p>
                  <p className="edit-profile__info-wrapper__text">
                    {email}{' '}
                    {is_email_verified ? (
                      <IoCheckmarkCircleSharp
                        color="#00bea7"
                        className="edit-profile__verified"
                      />
                    ) : (
                      <MdError
                        color="#ff471b"
                        className="edit-profile__verified"
                      />
                    )}
                  </p>
                </div>
              </div>

              {width > 500 && (
                <div className="edit-profile__content-wrapper">
                  <div className="edit-profile__icons">
                    <HiOutlinePhone color="#6992e4" />
                  </div>
                  <div className="edit-profile__info-wrapper">
                    <p className="edit-profile__info-wrapper__heading">
                      Mobile No
                    </p>
                    {phone_number === null ? (
                      <p
                        className="edit-profile__info-wrapper__add-mobile"
                        onClick={() => history.push('/dashboard/editprofile')}
                        onKeyDown={() => history.push('/dashboard/editprofile')}
                      >
                        + Add Mobile No.
                      </p>
                    ) : (
                      <p className="edit-profile__info-wrapper__text">
                        {phone_number}{' '}
                        {is_phone_verified ? (
                          <IoCheckmarkCircleSharp
                            color="#00bea7"
                            className="edit-profile__verified"
                          />
                        ) : (
                          <MdError
                            color="#ff471b"
                            className="edit-profile__verified"
                          />
                        )}
                      </p>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
        {authState.is_email_verified ? null : (
          <div className="edit-profile__verify-email-strip text-align-center">
            <span className="bold">
              Please verify your email ID to proceed. The email could have
              landed in your spam/junk folder.
            </span>
            <Controls.Button
              text="Resend Link"
              size="small"
              style={{ width: 'unset', marginLeft: '1rem' }}
              onClick={handleOpenVerifyEmailDialog}
            />
          </div>
        )}
        {openVerifyEmailDialog && (
          <VerifyEmailDialog
            open={openVerifyEmailDialog}
            close={handleCloseVerifyEmailDialog}
            email={authState.email}
            sendOTP
          />
        )}
      </Card>
    </div>
  )
}

const useStyles = makeStyles(() => ({
  editBtn: {
    borderColor: '#4f86e7',
  },
  divider: {
    margin: '0 20px 0 0',
    '@media (max-width: 900px)': {
      margin: '0 60px 0 0',
    },
  },
  resendBtn: {
    width: 'unset',
    margin: '0 0 0 1rem',
  },
}))

export default DashboardProfileCard
