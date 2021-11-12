import { Card, Grid, IconButton, makeStyles } from '@material-ui/core'
import React, { useContext } from 'react'
import { AiOutlinePoweroff, AiOutlineQuestionCircle } from 'react-icons/ai'
import { FiMic, FiMicOff, FiVideo, FiVideoOff } from 'react-icons/fi'
import ScreenShareIcon from '@material-ui/icons/ScreenShare'
import StopScreenShareIcon from '@material-ui/icons/StopScreenShare'
import TextsmsOutlinedIcon from '@material-ui/icons/TextsmsOutlined'
import ChatOutlinedIcon from '@material-ui/icons/ChatOutlined'
import SpeakerNotesOffOutlinedIcon from '@material-ui/icons/SpeakerNotesOffOutlined'
import recordIcon from '../../Assets/Images/record.svg'
import { BatchContext } from '../../Context/BatchContext'
import { CommandContext } from '../../Context/CommandContext'

const useStyles = makeStyles({
  card: {
    borderRadius: 8,
    boxShadow: '0 2px 4px 0 rgba(0, 0, 0, 0.5)',
    position: 'absolute',
    bottom: '2rem',
    left: '1rem',
    zIndex: 999,
    width: 'max-content',
  },
})

const Notifications = () => {
  const classes = useStyles()
  const { notificationState } = useContext(CommandContext)

  const { batchByCode, allBatchStudents } = useContext(BatchContext)

  const getName = (id) => {
    const result = allBatchStudents.find((student) => student.id === id)
    if (result) {
      return result.name
    }
    if (batchByCode.owner === id) {
      return 'Teacher'
    }
    return 'Guest'
  }
  return (
    <>
      {notificationState.open && (
        <Card className={classes.card}>
          <Grid container alignItems="center">
            {notificationState.type === 'TEXT' && (
              <>
                <Grid item xs={12}>
                  <Grid container alignItems="center">
                    <Grid item>
                      <IconButton>
                        <TextsmsOutlinedIcon />
                      </IconButton>
                    </Grid>
                    <Grid item>
                      <p style={{ fontWeight: 600, marginLeft: 6 }}>
                        {getName(notificationState.uid)}
                      </p>
                    </Grid>
                  </Grid>
                </Grid>
                <Grid item xs={12}>
                  <p
                    style={{
                      marginLeft: 12,
                      marginBottom: 6,
                      maxWidth: 'max-content',
                    }}
                  >
                    {notificationState.content.length > 20
                      ? `${notificationState.content.substring(0, 19)}...`
                      : notificationState.content}
                  </p>
                </Grid>
              </>
            )}
            {notificationState.type === 'DOUBT_RAISED' && (
              <>
                <Grid item xs={12}>
                  <Grid container alignItems="center">
                    <Grid item>
                      <IconButton>
                        <AiOutlineQuestionCircle />
                      </IconButton>
                    </Grid>
                    <Grid item>
                      <p
                        style={{
                          fontWeight: 500,
                          marginRight: 12,
                        }}
                      >
                        {`${getName(notificationState.uid)} raised a doubt`}
                      </p>
                    </Grid>
                  </Grid>
                </Grid>
              </>
            )}
            {notificationState.type === 'DOUBT_UNRAISED' && (
              <>
                <Grid item xs={12}>
                  <Grid container alignItems="center">
                    <Grid item>
                      <IconButton>
                        <AiOutlineQuestionCircle />
                      </IconButton>
                    </Grid>
                    <Grid item>
                      <p
                        style={{
                          fontWeight: 500,
                          marginRight: 12,
                        }}
                      >
                        {`${getName(
                          notificationState.uid,
                        )} un-raised their doubt`}
                      </p>
                    </Grid>
                  </Grid>
                </Grid>
              </>
            )}
            {(notificationState.type === 'DOUBT_ACCEPTED' ||
              notificationState.type === 'DOUBT_ASKED' ||
              notificationState.type === 'DOUBT_RESOLVED' ||
              notificationState.type === 'DOUBT_UNRAISED_STUDENT') && (
              <>
                <Grid item xs={12}>
                  <Grid container alignItems="center">
                    <Grid item>
                      <IconButton>
                        <AiOutlineQuestionCircle />
                      </IconButton>
                    </Grid>
                    <Grid item>
                      <p
                        style={{
                          fontWeight: 500,
                          marginRight: 12,
                        }}
                      >
                        {notificationState.content}
                      </p>
                    </Grid>
                  </Grid>
                </Grid>
              </>
            )}
            {notificationState.type === 'AGORA_CAM_ON' && (
              <>
                <Grid item xs={12}>
                  <Grid container alignItems="center">
                    <Grid item>
                      <IconButton>
                        <FiVideo />
                      </IconButton>
                    </Grid>
                    <Grid item>
                      <p
                        style={{
                          fontWeight: 500,
                          marginRight: 12,
                        }}
                      >
                        {`${notificationState.content}`}
                      </p>
                    </Grid>
                  </Grid>
                </Grid>
              </>
            )}
            {notificationState.type === 'AGORA_CAM_OFF' && (
              <>
                <Grid item xs={12}>
                  <Grid container alignItems="center">
                    <Grid item>
                      <IconButton>
                        <FiVideoOff />
                      </IconButton>
                    </Grid>
                    <Grid item>
                      <p
                        style={{
                          fontWeight: 500,
                          marginRight: 12,
                        }}
                      >
                        {`${notificationState.content}`}
                      </p>
                    </Grid>
                  </Grid>
                </Grid>
              </>
            )}
            {notificationState.type === 'AGORA_MIC_ON' && (
              <>
                <Grid item xs={12}>
                  <Grid container alignItems="center">
                    <Grid item>
                      <IconButton>
                        <FiMic />
                      </IconButton>
                    </Grid>
                    <Grid item>
                      <p
                        style={{
                          fontWeight: 500,
                          marginRight: 12,
                        }}
                      >
                        {`${notificationState.content}`}
                      </p>
                    </Grid>
                  </Grid>
                </Grid>
              </>
            )}
            {notificationState.type === 'AGORA_MIC_OFF' && (
              <>
                <Grid item xs={12}>
                  <Grid container alignItems="center">
                    <Grid item>
                      <IconButton>
                        <FiMicOff />
                      </IconButton>
                    </Grid>
                    <Grid item>
                      <p
                        style={{
                          fontWeight: 500,
                          marginRight: 12,
                        }}
                      >
                        {`${notificationState.content}`}
                      </p>
                    </Grid>
                  </Grid>
                </Grid>
              </>
            )}
            {notificationState.type === 'CLASS_END' && (
              <>
                <Grid item xs={12}>
                  <Grid container alignItems="center">
                    <Grid item>
                      <IconButton>
                        <AiOutlinePoweroff />
                      </IconButton>
                    </Grid>
                    <Grid item>
                      <p
                        style={{
                          fontWeight: 500,
                          marginRight: 12,
                        }}
                      >
                        {`${notificationState.content}`}
                      </p>
                    </Grid>
                  </Grid>
                </Grid>
              </>
            )}
            {notificationState.type === 'SHARE_SCREEN' && (
              <>
                <Grid item xs={12}>
                  <Grid container alignItems="center">
                    <Grid item>
                      <IconButton>
                        <ScreenShareIcon />
                      </IconButton>
                    </Grid>
                    <Grid item>
                      <p
                        style={{
                          fontWeight: 500,
                          marginRight: 12,
                        }}
                      >
                        {`${notificationState.content}`}
                      </p>
                    </Grid>
                  </Grid>
                </Grid>
              </>
            )}
            {notificationState.type === 'STOP_SHARE_SCREEN' && (
              <>
                <Grid item xs={12}>
                  <Grid container alignItems="center">
                    <Grid item>
                      <IconButton>
                        <StopScreenShareIcon />
                      </IconButton>
                    </Grid>
                    <Grid item>
                      <p
                        style={{
                          fontWeight: 500,
                          marginRight: 12,
                        }}
                      >
                        {`${notificationState.content}`}
                      </p>
                    </Grid>
                  </Grid>
                </Grid>
              </>
            )}
            {notificationState.type === 'CHAT_ENABLED' && (
              <>
                <Grid item xs={12}>
                  <Grid container alignItems="center">
                    <Grid item>
                      <IconButton>
                        <ChatOutlinedIcon />
                      </IconButton>
                    </Grid>
                    <Grid item>
                      <p
                        style={{
                          fontWeight: 500,
                          marginRight: 12,
                        }}
                      >
                        {`${notificationState.content}`}
                      </p>
                    </Grid>
                  </Grid>
                </Grid>
              </>
            )}
            {notificationState.type === 'CHAT_DISABLED' && (
              <>
                <Grid item xs={12}>
                  <Grid container alignItems="center">
                    <Grid item>
                      <IconButton>
                        <SpeakerNotesOffOutlinedIcon />
                      </IconButton>
                    </Grid>
                    <Grid item>
                      <p
                        style={{
                          fontWeight: 500,
                          marginRight: 12,
                        }}
                      >
                        {`${notificationState.content}`}
                      </p>
                    </Grid>
                  </Grid>
                </Grid>
              </>
            )}
            {notificationState.type === 'RECORDING_STARTED' && (
              <>
                <Grid item xs={12}>
                  <Grid container alignItems="center">
                    <Grid item>
                      <IconButton>
                        <img
                          src={recordIcon}
                          alt="record"
                          height="24"
                          width="24"
                        />
                      </IconButton>
                    </Grid>
                    <Grid item>
                      <p
                        style={{
                          fontWeight: 500,
                          marginRight: 12,
                        }}
                      >
                        {`${notificationState.content}`}
                      </p>
                    </Grid>
                  </Grid>
                </Grid>
              </>
            )}
            {notificationState.type === 'RECORDING_STOPPED' && (
              <>
                <Grid item xs={12}>
                  <Grid container alignItems="center">
                    <Grid item>
                      <IconButton>
                        <img
                          src={recordIcon}
                          alt="record"
                          height="24"
                          width="24"
                        />
                      </IconButton>
                    </Grid>
                    <Grid item>
                      <p
                        style={{
                          fontWeight: 500,
                          marginRight: 12,
                        }}
                      >
                        {`${notificationState.content}`}
                      </p>
                    </Grid>
                  </Grid>
                </Grid>
              </>
            )}
          </Grid>
        </Card>
      )}
    </>
  )
}

export default Notifications
