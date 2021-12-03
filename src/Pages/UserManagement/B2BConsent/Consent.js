import React, { useEffect, useContext, useState } from 'react'
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Card,
  CardContent,
  Grid,
  Typography,
} from '@material-ui/core'
import { makeStyles } from '@material-ui/core/styles'
// import { AiTwotoneMedicineBox } from 'react-icons/ai';
import { RiArrowLeftRightFill } from 'react-icons/ri'
import { IoSettingsOutline } from 'react-icons/io5'
import { MdExpandMore } from 'react-icons/md'
import { AiOutlineEdit, AiOutlineCheck } from 'react-icons/ai'
import { useLocation, useHistory } from 'react-router-dom'
import { useSnackbar } from 'notistack'
import logo from '../../../Assets/Images/edvi-logo-blue.png'
import Controls from '../../../Components/Controls/Controls'
import { AuthContext } from '../../../Context/AuthContext'
import showErrorSnackbar from '../../../Components/Snackbar/errorSnackbar'
import showSuccessSnackbar from '../../../Components/Snackbar/successSnackbar'

export default function Consent() {
  const classes = useStyles()
  const location = useLocation()
  const history = useHistory()
  const { enqueueSnackbar } = useSnackbar()

  const { b2bLoginData, AuthorizeUserGrant } = useContext(AuthContext)

  console.log('b2bLoginData', b2bLoginData)
  const [authorizationCode, setAuthorizationCode] = useState('')
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
    const scopes = new URLSearchParams(search).get('scopes').split(',')

    if (client_id && redirect_uri && scopes) {
      setb2bData({
        isB2B: true,
        client_id,
        redirect_uri,
        scopes,
      })
    } else {
      showErrorSnackbar(enqueueSnackbar, 'Please Login Again')
      history.push('/auth/login')
    }
  }, [])

  useEffect(() => {
    if (b2bLoginData === undefined) {
      showErrorSnackbar(
        enqueueSnackbar,
        'Something went wrong, please login again',
      )
      history.push('/auth/login')
    }
  })
  const sendMessageToParent = (code) => {
    window.opener.postMessage({ code }, '*')

    window.close()
  }

  const handleDecline = () => {
    showSuccessSnackbar(enqueueSnackbar, 'Request Successfully Declined')
    history.push('/auth/login')
  }

  const handleAuthorize = async () => {
    console.log(b2bData)
    const payload = {
      client_id: b2bLoginData.client_id,
      consent: true,
      redirect_uri: b2bLoginData.redirect_uri,
      scopes: ['batch:read', 'batch:write'],
      token: b2bLoginData.access,
    }

    const res = await AuthorizeUserGrant(payload, b2bLoginData.access)
    console.log('res-data', res)
    if (res.status === 200) {
      setAuthorizationCode(
        `${res.data.redirect_uri}?authorization_code=${res.data.authorization_code}`,
      )
      sendMessageToParent(res.data.authorization_code)
    }
  }

  return (
    <div className={classes.container}>
      <Card variant="outlined" className={classes.card}>
        <CardContent className={classes.card_content}>
          {authorizationCode === '' ? (
            <>
              <div className={classes.icon_box}>
                <div className={classes.icon_div}>
                  <IoSettingsOutline size={32} color="#355aa4" />
                </div>

                <RiArrowLeftRightFill
                  size={26}
                  className={classes.marginHorizontal}
                />

                <div className={classes.icon_div}>
                  <img src={logo} alt="edvi logo" width="70px" height="30px" />
                </div>
              </div>

              <div className={classes.marginVertical}>
                <Typography align="center" className={classes.text}>
                  Gmail is requesting access to your
                </Typography>
                <Typography align="center" className={classes.text}>
                  edvi Account
                </Typography>
              </div>

              {b2bLoginData !== undefined && (
                <div className={classes.marginVertical}>
                  {b2bLoginData.scopes.map((scope) => (
                    <Accordion
                      variant="outlined"
                      className={classes.marginVertical}
                    >
                      <AccordionSummary
                        expandIcon={<MdExpandMore />}
                        classes={{
                          content: classes.accordionSummary,
                        }}
                      >
                        <AiOutlineEdit className={classes.icon} />
                        <Typography>{Object.keys(scope)[0]}</Typography>
                      </AccordionSummary>

                      <AccordionDetails>
                        <div>
                          <div className={classes.accordianDetail}>
                            <AiOutlineCheck
                              className={classes.icon}
                              size={18}
                              color="green"
                            />
                            <Typography>{Object.values(scope)[0]}</Typography>
                          </div>
                        </div>
                      </AccordionDetails>
                    </Accordion>
                  ))}
                </div>
              )}

              <div>
                <Typography variant="subtitle2" className={classes.line1}>
                  Make Sure you trust Google OAuth 2.0 Playground
                </Typography>

                <Typography variant="subtitle2" className={classes.line2}>
                  You may be sharing sensitive info with this site or app. You
                  can always see or remove access in your{' '}
                  <span style={{ color: '#6483e4' }}>Google Account</span>.
                </Typography>

                <Typography variant="subtitle2" className={classes.line3}>
                  See Google OAuth 2.0 Playground{' '}
                  <span className={classes.span}>Privacy Policy</span> and{' '}
                  <span className={classes.span}>Terms and Service.</span>
                </Typography>
              </div>

              <Grid container spacing={3}>
                <Grid item xs={6}>
                  <Controls.Button
                    fullWidth
                    variant="outlined"
                    className={classes.decline_btn}
                    onClick={handleDecline}
                  >
                    Decline
                  </Controls.Button>
                </Grid>
                <Grid item xs={6}>
                  <Controls.Button
                    disableElevation
                    fullWidth
                    variant="contained"
                    className={classes.authorize_btn}
                    onClick={handleAuthorize}
                  >
                    Authorize
                  </Controls.Button>
                </Grid>
              </Grid>
            </>
          ) : (
            <div>
              <h2> {authorizationCode} </h2>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

const useStyles = makeStyles({
  container: {
    padding: '20px',
  },
  card: {
    borderRadius: '8px',
  },
  card_content: {
    padding: '40px',
  },
  icon_box: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    fontSize: '24px',
    fontWeight: 'bold',
    lineHeight: 1,
  },
  icon_div: {
    backgroundColor: '#f2f5ff',
    padding: '15px',
    borderRadius: '4px',
  },
  accordionSummary: {
    margin: '0px',
    display: 'flex',
    alignItems: 'center',
  },
  span: {
    color: '#6483e4',
  },
  line1: {
    fontSize: '15px',
    fontWeight: 'bold',
  },
  line2: {
    fontSize: '14px',
    margin: '20px 0px',
    lineHeight: 1.2,
  },
  line3: {
    fontSize: '14px',
    margin: '20px 0px',
  },
  accordianDetail: {
    display: 'flex',
    alignItems: 'center',
    margin: '10px 0px',
  },
  marginVertical: {
    margin: '20px 0px',
  },
  marginHorizontal: {
    margin: '0px 20px',
  },
  icon: {
    margin: '0px 20px 0px 0px',
  },
})
