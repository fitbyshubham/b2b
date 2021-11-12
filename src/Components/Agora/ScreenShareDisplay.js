import React from 'react'
import { makeStyles } from '@material-ui/core/styles'
import { Typography } from '@material-ui/core'
import screenShare from '../../Assets/Images/screenshare.svg'
import Controls from '../Controls/Controls'
const useStyles = makeStyles({
  imageGrid: {
    width: '100%',
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    backgroundColor: '#424242',
  },
  title: {
    color: '#fff',
    fontWeight: 600,
    textAlign: 'center',
  },
  marginTop: {
    marginTop: '1rem',
  },
  btn: {
    width: 'unset',
  },
})

const ScreenShareDisplay = ({ stopScreenShare, dimensions }) => {
  const classes = useStyles()

  const handleStopScreenShare = async () => {
    stopScreenShare()
  }
  return (
    <div className={classes.imageGrid}>
      <div className="text-align-center">
        <img
          src={screenShare}
          style={{ width: 'auto', height: dimensions.height > 180 ? 100 : 50 }}
          alt="Screen shared"
        />
      </div>
      <div className={classes.marginTop}>
        <Typography
          className={classes.title}
          style={{ fontSize: dimensions.height > 180 ? 22 : 12 }}
        >
          You&apos;re presenting to everyone
        </Typography>
      </div>
      <div className={`text-align-center ${classes.marginTop}`}>
        <Controls.Button
          text="Stop Presenting"
          onClick={() => {
            handleStopScreenShare()
          }}
          className={classes.btn}
          size={dimensions.height > 180 ? 'large' : 'small'}
        />
      </div>
    </div>
  )
}

export default ScreenShareDisplay
