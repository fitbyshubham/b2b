import { makeStyles } from '@material-ui/styles'
import React, { useContext } from 'react'
import { CountdownCircleTimer } from 'react-countdown-circle-timer'
import { BatchContext } from '../../Context/BatchContext'
import { CommandContext } from '../../Context/CommandContext'
import Controls from '../Controls/Controls'

const GrantAVPermissionStudent = ({ mode, sendCommandToSpecificUser }) => {
  const { batchByCode } = useContext(BatchContext)
  const { setAVState, setPermissionRequest } = useContext(CommandContext)
  const classes = useStyles()

  const yesAction = () => {
    if (mode === 'mic') {
      setAVState((devices) => ({ ...devices, audio: true }))
      sendCommandToSpecificUser(
        batchByCode.owner,
        'AGORA',
        'MIC_ACCESS_GRANTED',
      )
      setPermissionRequest((permissions) => ({
        ...permissions,
        audio: false,
      }))
    } else if (mode === 'cam') {
      setAVState((devices) => ({ ...devices, video: true }))
      sendCommandToSpecificUser(
        batchByCode.owner,
        'AGORA',
        'CAM_ACCESS_GRANTED',
      )
      setPermissionRequest((permissions) => ({
        ...permissions,
        video: false,
      }))
    }
  }

  const noAction = () => {
    if (mode === 'mic') {
      sendCommandToSpecificUser(batchByCode.owner, 'AGORA', 'MIC_ACCESS_DENIED')
      setPermissionRequest((permissions) => ({
        ...permissions,
        audio: false,
      }))
    } else if (mode === 'cam') {
      sendCommandToSpecificUser(batchByCode.owner, 'AGORA', 'CAM_ACCESS_DENIED')
      setPermissionRequest((permissions) => ({
        ...permissions,
        video: false,
      }))
    }
  }

  return (
    <div className={classes.outerContainer}>
      <div className={classes.container}>
        <div className={classes.innerContainer}>
          <CountdownCircleTimer
            isPlaying
            duration={10}
            colors={[
              ['#6483E4', 0.5],
              ['#F7B801', 0.25],
              ['#A30000', 0.25],
            ]}
            size={50}
            strokeWidth={4}
            onComplete={noAction}
          >
            {({ remainingTime }) => remainingTime}
          </CountdownCircleTimer>
          <div>
            <p className={classes.text}>Teacher requested</p>
            <p className={classes.text}>
              {`for your ${mode === 'cam' ? 'Video' : 'Audio'} Access`}
            </p>
          </div>
        </div>
        <div className={classes.btnContainer}>
          <Controls.Button
            text="Accept"
            onClick={yesAction}
            style={{ width: '47%' }}
          />
          <Controls.Button
            text="Reject"
            style={{
              width: '47%',
              backgroundImage: 'none',
              backgroundColor: '#626262',
            }}
            onClick={noAction}
          />
        </div>
      </div>
    </div>
  )
}

export default GrantAVPermissionStudent

const useStyles = makeStyles({
  outerContainer: {
    zIndex: 999999,
  },
  container: {
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    padding: '1rem',
  },
  innerContainer: {
    display: 'flex',
    alignItems: 'center',
  },
  text: {
    color: '#333',
    fontWeight: 600,
    marginLeft: '1rem',
    lineHeight: '1.25',
  },
  btnContainer: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: '1rem',
  },
})
