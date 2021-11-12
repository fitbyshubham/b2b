import { Grid, IconButton } from '@material-ui/core'
import React, { useContext } from 'react'

import MicIcon from '@material-ui/icons/Mic'
import MicOffIcon from '@material-ui/icons/MicOff'
import VideocamIcon from '@material-ui/icons/Videocam'
import VideocamOffIcon from '@material-ui/icons/VideocamOff'
import unpin from '../../Assets/Images/unpin.svg'
import pin from '../../Assets/Images/Pin.svg'
/* ENABLE WHEN STUDENT SCREEN SHARE IS ACTIVE */
// import ScreenShareIcon from '@material-ui/icons/ScreenShare'
// import StopScreenShareIcon from '@material-ui/icons/StopScreenShare'
import Spinner from '../Progress/Spinner'
import { CommandContext } from '../../Context/CommandContext'

const TeacherVideoAdminControls = ({
  role,
  trackType,
  isAudioEnabled,
  isVideoEnabled,
  sendCommandToSpecificUser,
  uid,
  pinVideo,
  unpinVideo,
  pinnedUserUid,
}) => {
  const {
    resolveAVRequest,
    permissionResolution,
    /* ENABLE WHEN STUDENT SCREEN SHARE IS ACTIVE */
    // studentsWithScreenSharePermissions,
    // setStudentsWithScreenSharePermissions,
  } = useContext(CommandContext)

  // const hasScreenSharePermission = () => {
  //   if (studentsWithScreenSharePermissions.find((sUid) => sUid === uid))
  //     return true
  //   return false
  // }
  // change grid size to 3 when screen share active

  return (
    <>
      {role === 'T' && trackType === 'remote' && (
        <Grid
          container
          alignItems="center"
          style={{
            backgroundColor: 'rgba(34,34,34,0.7)',
            borderRadius: 24,
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%,-50%)',
            zIndex: 999,
            padding: 0,
            boxShadow: '0 0 6px 2px rgba(255, 255, 255, 0.06)',
            maxWidth: 'max-content',
          }}
          id="admin-controls"
        >
          {!isAudioEnabled && (
            <Grid item xs={4}>
              <IconButton
                onClick={() => {
                  sendCommandToSpecificUser(uid, 'AGORA', 'MIC_ON')
                  resolveAVRequest(uid, 'mic', 'pending')
                }}
                disabled={
                  permissionResolution &&
                  permissionResolution?.[uid] &&
                  permissionResolution?.[uid]?.audio === 'pending'
                }
              >
                {(!permissionResolution ||
                  !permissionResolution?.[uid] ||
                  permissionResolution?.[uid]?.audio !== 'pending') && (
                  <MicOffIcon style={{ color: '#fff' }} />
                )}
                {permissionResolution?.[uid] &&
                  permissionResolution?.[uid]?.audio === 'pending' && (
                    <Spinner
                      size={20}
                      className="margin-left-unset position-unset"
                      color="primary"
                    />
                  )}
              </IconButton>
            </Grid>
          )}
          {isAudioEnabled && (
            <Grid item xs={4}>
              <IconButton
                onClick={() => {
                  sendCommandToSpecificUser(uid, 'AGORA', 'MIC_OFF')
                  resolveAVRequest(uid, 'mic', true)
                }}
              >
                <MicIcon style={{ color: '#fff' }} />
              </IconButton>
            </Grid>
          )}
          {!isVideoEnabled && (
            <Grid item xs={4}>
              <IconButton
                onClick={() => {
                  sendCommandToSpecificUser(uid, 'AGORA', 'CAM_ON')
                  resolveAVRequest(uid, 'cam', 'pending')
                }}
                disabled={
                  permissionResolution &&
                  permissionResolution?.[uid] &&
                  permissionResolution?.[uid]?.video === 'pending'
                }
              >
                {(!permissionResolution ||
                  !permissionResolution?.[uid] ||
                  permissionResolution?.[uid]?.video !== 'pending') && (
                  <VideocamOffIcon style={{ color: '#fff' }} />
                )}
                {permissionResolution?.[uid] &&
                  permissionResolution?.[uid]?.video === 'pending' && (
                    <Spinner
                      size={18}
                      className="margin-left-unset position-unset"
                      color="primary"
                    />
                  )}
              </IconButton>
            </Grid>
          )}
          {isVideoEnabled && (
            <Grid item xs={4}>
              <IconButton
                onClick={() => {
                  sendCommandToSpecificUser(uid, 'AGORA', 'CAM_OFF')
                  resolveAVRequest(uid, 'cam', true)
                  if (pinnedUserUid === uid) unpinVideo()
                }}
              >
                <VideocamIcon style={{ color: '#fff' }} />
              </IconButton>
            </Grid>
          )}
          {uid !== pinnedUserUid && (
            <Grid item xs={4}>
              <IconButton
                onClick={() => {
                  pinVideo(uid)
                }}
                disabled={!isVideoEnabled}
              >
                <img
                  src={pin}
                  alt="unpin"
                  width="21"
                  height="21"
                  style={{
                    filter: isVideoEnabled
                      ? ''
                      : 'invert(43%) sepia(4%) saturate(0%) hue-rotate(177deg) brightness(98%) contrast(84%)',
                  }}
                />
              </IconButton>
            </Grid>
          )}
          {uid === pinnedUserUid && (
            <Grid item xs={4}>
              <IconButton
                onClick={() => {
                  unpinVideo()
                }}
              >
                <img src={unpin} alt="unpin" width="22" height="22" />
              </IconButton>
            </Grid>
          )}
          {/* ENABLE WHEN STUDENT SCREEN SHARE IS ACTIVE */}
          {/* {!hasScreenSharePermission() && (
            <Grid item xs={3}>
              <IconButton
                onClick={() => {
                  sendCommandToSpecificUser(uid, 'AGORA', 'SHARE_SCREEN')
                  studentsWithScreenSharePermissions.push(uid)
                }}
              >
                <ScreenShareIcon htmlColor="#fff" />
              </IconButton>
            </Grid>
          )}
          {hasScreenSharePermission() && (
            <Grid item xs={3}>
              <IconButton
                onClick={() => {
                  sendCommandToSpecificUser(uid, 'AGORA', 'STOP_SHARE_SCREEN')
                  setStudentsWithScreenSharePermissions(
                    studentsWithScreenSharePermissions.filter(
                      (sUid) => sUid !== uid,
                    ),
                  )
                }}
              >
                <StopScreenShareIcon htmlColor="#fff" />
              </IconButton>
            </Grid>
          )} */}
        </Grid>
      )}
    </>
  )
}

export default TeacherVideoAdminControls
