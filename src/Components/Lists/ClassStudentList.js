import {
  Avatar,
  Badge,
  Divider,
  Grid,
  IconButton,
  List,
  ListItem,
  ListItemAvatar,
  /* ENABLE WHEN STUDENT SCREEN SHARE IS ACTIVE */
  // ListItemSecondaryAction,
  ListItemText,
  makeStyles,
  Menu,
  MenuItem,
  MenuList,
  Typography,
} from '@material-ui/core'
import React, { Fragment, useContext, useEffect, useState } from 'react'
import VideocamOutlinedIcon from '@material-ui/icons/VideocamOutlined'
import MicNoneOutlinedIcon from '@material-ui/icons/MicNoneOutlined'
import VideocamOffOutlinedIcon from '@material-ui/icons/VideocamOffOutlined'
import MicOffOutlinedIcon from '@material-ui/icons/MicOffOutlined'
import { GrFormClose, GrFormRefresh } from 'react-icons/gr'
/* ENABLE WHEN STUDENT SCREEN SHARE IS ACTIVE */
// import { FiMoreVertical } from 'react-icons/fi'
import ScreenShareIcon from '@material-ui/icons/ScreenShare'
import StopScreenShareIcon from '@material-ui/icons/StopScreenShare'
import { useSnackbar } from 'notistack'
import PendingStudentList from './PendingStudentList'
import Spinner from '../Progress/Spinner'
import { BatchContext } from '../../Context/BatchContext'
import { AuthContext } from '../../Context/AuthContext'
import profilePlaceholder from '../../Assets/Images/profilePlaceholder.svg'
import { getOnlineAndOfflineUsers } from '../../Global/Functions'
import { CommandContext } from '../../Context/CommandContext'
import showErrorSnackbar from '../Snackbar/errorSnackbar'

const useStyles = makeStyles(() => ({
  onlineBadge: {
    '& .MuiBadge-badge': {
      backgroundColor: '#5dd01a',
      bottom: 8,
      right: 4,
      boxShadow: '0px 0px 0px 1px rgba(255,255,255,1)',
      '-webkit-box-shadow': '0px 0px 0px 1px rgba(255,255,255,1)',
      '-moz-box-shadow': '0px 0px 0px 1px rgba(255,255,255,1)',
    },
  },
  offlineBadge: {
    '& .MuiBadge-badge': {
      backgroundColor: '#ff0000',
      bottom: 8,
      right: 4,
      boxShadow: '0px 0px 0px 1px rgba(255,255,255,1)',
      '-webkit-box-shadow': '0px 0px 0px 1px rgba(255,255,255,1)',
      '-moz-box-shadow': '0px 0px 0px 1px rgba(255,255,255,1)',
    },
  },
  teacherControls: {
    backgroundColor: '#f2f5ff',
    boxShadow: '0 -1px 4px 0 rgba(0, 0, 0, 0.1)',
    padding: '6px 0',
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    zIndex: 9999,
  },
  controlText: {
    cursor: 'pointer',
    '&:hover': {
      textDecoration: 'underline',
    },
  },
  gridContainer: {
    height: '100%',
    width: 350,
  },
  heading: {
    color: '#333',
    fontSize: '1.25rem',
    padding: '0.5rem 1.125rem',
    fontWeight: 500,
    height: 44,
  },
  message: {
    padding: '0 0.5rem',
  },
  onlinePanelIcon: {
    padding: 6,
    margin: '0 6px',
  },
  studentBoxIcon: {
    padding: 6,
    margin: '0 6px 0 12px',
  },
  headingContainer: {
    backgroundColor: '#f2f5ff',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
}))

const ClassStudentList = ({
  id,
  remoteUsers,
  sendCommandToChannel,
  sendCommandToSpecificUser,
  handleClose,
  isAudioMuted,
}) => {
  const classes = useStyles()
  const [isStudentLoading, setIsStudentLoading] = useState(false)
  const [isError, setIsError] = useState(null)
  const [onlineUsers, setOnlineUsers] = useState([])
  const [offlineUsers, setOfflineUsers] = useState([])
  const [studentMenu, setStudentMenu] = useState({
    menu: undefined,
    uid: undefined,
  })
  const { enqueueSnackbar } = useSnackbar()
  const {
    GetEnrolledStudentsInBatch,
    studentRequestByBatchId,
    allBatchStudents,
    GetStudentRequestsForBatch,
  } = useContext(BatchContext)
  const { authState } = useContext(AuthContext)
  const {
    resolveAVRequest,
    permissionResolution,
    studentsWithScreenSharePermissions,
    setStudentsWithScreenSharePermissions,
  } = useContext(CommandContext)

  /* ENABLE WHEN STUDENT SCREEN SHARE IS ACTIVE */
  // const handleOpenStudentMenu = (event, uid) => {
  //   setStudentMenu({ uid, menu: event.currentTarget })
  // }

  const handleCloseStudentMenu = () => {
    setStudentMenu({ menu: undefined, uid: undefined })
  }

  const allowScreenShare = () => {
    if (!studentMenu.uid)
      showErrorSnackbar(enqueueSnackbar, 'Cannot send permission!')
    sendCommandToSpecificUser(studentMenu.uid, 'AGORA', 'SHARE_SCREEN')
    studentsWithScreenSharePermissions.push(studentMenu.uid)
    handleCloseStudentMenu()
  }

  const revokeScreenShare = () => {
    if (!studentMenu.uid)
      showErrorSnackbar(enqueueSnackbar, 'Cannot send permission!')
    sendCommandToSpecificUser(studentMenu.uid, 'AGORA', 'STOP_SHARE_SCREEN')
    setStudentsWithScreenSharePermissions(
      studentsWithScreenSharePermissions.filter(
        (uid) => uid !== studentMenu.uid,
      ),
    )
    handleCloseStudentMenu()
  }

  const hasScreenSharePermission = () => {
    if (
      studentsWithScreenSharePermissions.find((uid) => uid === studentMenu.uid)
    )
      return true
    return false
  }

  async function getStudents() {
    setIsStudentLoading(true)
    const enrolledStudents = await GetEnrolledStudentsInBatch(id)
    setIsStudentLoading(false)
    if (!enrolledStudents) {
      setIsError('Cannot load enrolled students')
    }
  }

  const getPendingRequests = async () => {
    setIsStudentLoading(true)
    await GetStudentRequestsForBatch(id)
    setIsStudentLoading(false)
  }

  useEffect(() => {
    if (authState.role === 'S') {
      getStudents()
    }
  }, [])

  useEffect(() => {
    getOnlineAndOfflineUsersInClass()
  }, [allBatchStudents, remoteUsers])

  const getOnlineAndOfflineUsersInClass = () => {
    const data = getOnlineAndOfflineUsers(
      allBatchStudents,
      remoteUsers,
      authState,
      permissionResolution,
    )
    setOnlineUsers(data.onlineStudents)
    setOfflineUsers(data.offlineStudents)
  }

  const isStudentMicOn = (userId) => {
    if (authState.user_id === userId) return !isAudioMuted
    const result = remoteUsers.find((remoteUser) => remoteUser.uid === userId)
    if (result) return result.hasAudio
    return false
  }

  const isStudentCamOn = (userId) => {
    const result = remoteUsers.find((remoteUser) => remoteUser.uid === userId)
    if (result) return result.hasVideo
    return false
  }

  const turnStudentMicOn = (uid) => {
    if (!authState.role === 'T') return
    sendCommandToSpecificUser(uid, 'AGORA', 'MIC_ON')
    resolveAVRequest(uid, 'mic', 'pending')
  }

  const turnStudentCamOn = (uid) => {
    if (!authState.role === 'T') return
    sendCommandToSpecificUser(uid, 'AGORA', 'CAM_ON')
    resolveAVRequest(uid, 'cam', 'pending')
  }

  const turnStudentMicOff = (uid) => {
    if (!authState.role === 'T') return
    sendCommandToSpecificUser(uid, 'AGORA', 'MIC_OFF')
    resolveAVRequest(uid, 'mic', true)
  }

  const turnStudentCamOff = (uid) => {
    if (!authState.role === 'T') return
    sendCommandToSpecificUser(uid, 'AGORA', 'CAM_OFF')
    resolveAVRequest(uid, 'cam', true)
  }

  const turnOffAllCameras = () => {
    sendCommandToChannel('AGORA', 'CAM_OFF')
  }

  const turnOffAllMics = () => {
    sendCommandToChannel('AGORA', 'MIC_OFF')
  }

  const getSecondaryAudioText = (uid) => {
    if (!permissionResolution || !permissionResolution[uid]) return ''
    const audio = permissionResolution[uid]?.audio
    if (
      (audio === 'pending' || audio === 'unresponsive') &&
      isStudentMicOn(uid)
    )
      return 'Audio Access Granted'
    if (audio === 'pending' && !isStudentMicOn(uid))
      return 'Audio Access Requested'
    if (audio === 'unresponsive' && !isStudentMicOn(uid))
      return "Couldn't get audio access, try again!"
    if (audio === false && !isStudentMicOn(uid)) return 'Audio Access Declined'
    if (audio === true && isStudentMicOn(uid)) return 'Audio Access Accepted'
  }

  const getSecondaryVideoText = (uid) => {
    if (!permissionResolution || !permissionResolution[uid]) return ''
    const video = permissionResolution[uid]?.video
    if (
      (video === 'pending' || video === 'unresponsive') &&
      isStudentCamOn(uid)
    )
      return 'Video Access Granted'
    if (video === 'pending' && !isStudentCamOn(uid))
      return 'Video Access Requested'
    if (video === 'unresponsive' && !isStudentCamOn(uid))
      return "Couldn't get video access, try again!"
    if (video === false && !isStudentCamOn(uid)) return 'Video Access Declined'
    if (video === true && isStudentCamOn(uid)) return 'Video Access Accepted'
  }

  return (
    <>
      {authState.role === 'T' && (
        <PendingStudentList batchId={id} handleClose={handleClose} />
      )}
      <>
        <Grid container className={classes.gridContainer}>
          <Grid
            item
            style={{
              overflow: 'auto',
              height:
                remoteUsers.filter((user) => user.hasAudio || user.hasVideo)
                  .length === 0 ||
                remoteUsers.filter((user) => user.hasAudio || user.hasVideo)
                  .length > 16 ||
                authState.role === 'S'
                  ? '100%'
                  : 'calc(100% - 64px)',
            }}
            xs={12}
          >
            <div className={classes.headingContainer}>
              <p className={classes.heading}>Students</p>
              <div>
                <IconButton
                  style={{ padding: 6 }}
                  onClick={
                    authState.role === 'T' ? getPendingRequests : getStudents
                  }
                >
                  <GrFormRefresh />
                </IconButton>
                {studentRequestByBatchId.filter(
                  (request) => request.status === 'D',
                ).length === 0 && (
                  <IconButton
                    style={{ padding: 6 }}
                    onClick={() => {
                      handleClose()
                    }}
                  >
                    <GrFormClose />
                  </IconButton>
                )}
              </div>
            </div>
            {isStudentLoading && <Spinner />}
            {Boolean(isError) && (
              <p
                className={`${classes.message} secondary-text bold fine-text text-align-center`}
              >
                {isError}
              </p>
            )}
            {!isError && allBatchStudents.length === 0 && (
              <p
                className={`${classes.message} secondary-text bold fine-text text-align-center`}
              >
                No students enrolled in this batch
              </p>
            )}
            {!isError && !isStudentLoading && allBatchStudents.length > 0 && (
              <List>
                {onlineUsers.map((student) => (
                  <Fragment key={student.id}>
                    <ListItem
                      style={{
                        backgroundColor:
                          permissionResolution &&
                          permissionResolution?.[student.id]
                            ? (permissionResolution?.[student.id]?.audio ===
                                false &&
                                !isStudentMicOn(student.id)) ||
                              (permissionResolution?.[student.id]?.video ===
                                false &&
                                !isStudentCamOn(student.id))
                              ? '#ffeff0'
                              : (permissionResolution?.[student.id]?.audio ===
                                  true &&
                                  isStudentMicOn(student.id)) ||
                                (permissionResolution?.[student.id]?.video ===
                                  true &&
                                  isStudentCamOn(student.id))
                              ? '#f2fced'
                              : '#f2f5ff'
                            : 'inherit',
                      }}
                    >
                      <ListItemAvatar>
                        <Badge
                          className={classes.onlineBadge}
                          variant="dot"
                          anchorOrigin={{
                            horizontal: 'right',
                            vertical: 'bottom',
                          }}
                        >
                          <Avatar src={student.avatar || profilePlaceholder} />
                        </Badge>
                      </ListItemAvatar>
                      <ListItemText
                        primary={
                          <Typography
                            style={{
                              color: '#333',
                              fontWeight: 500,
                              fontSize: 16,
                            }}
                          >
                            {student.name}
                          </Typography>
                        }
                        secondary={
                          <>
                            <Typography
                              style={{
                                color:
                                  permissionResolution &&
                                  permissionResolution?.[student.id]
                                    ? permissionResolution?.[student.id]
                                        ?.audio === false
                                      ? '#ff2d43'
                                      : permissionResolution?.[student.id]
                                          ?.audio === true
                                      ? '#5dd01a'
                                      : '#666'
                                    : '#666',
                                fontSize: 11,
                              }}
                            >
                              {getSecondaryAudioText(student.id)}
                            </Typography>
                            <Typography
                              style={{
                                color:
                                  permissionResolution &&
                                  permissionResolution?.[student.id]
                                    ? permissionResolution?.[student.id]
                                        ?.video === false
                                      ? '#ff2d43'
                                      : permissionResolution?.[student.id]
                                          ?.video === true
                                      ? '#5dd01a'
                                      : '#666'
                                    : '#666',
                                fontSize: 11,
                              }}
                            >
                              {getSecondaryVideoText(student.id)}
                            </Typography>
                          </>
                        }
                      />
                      {!isStudentMicOn(student.id) && (
                        <IconButton
                          className={classes.onlinePanelIcon}
                          onClick={() => {
                            turnStudentMicOn(student.id)
                          }}
                          disabled={
                            (permissionResolution &&
                              permissionResolution?.[student.id] &&
                              permissionResolution?.[student.id]?.audio ===
                                'pending') ||
                            authState.role === 'S'
                          }
                        >
                          {(!permissionResolution ||
                            !permissionResolution?.[student.id] ||
                            permissionResolution?.[student.id]?.audio !==
                              'pending') && <MicOffOutlinedIcon />}
                          {permissionResolution?.[student.id] &&
                            permissionResolution?.[student.id]?.audio ===
                              'pending' && (
                              <Spinner
                                size={18}
                                className="margin-left-unset position-unset"
                                color="primary"
                              />
                            )}
                        </IconButton>
                      )}
                      {isStudentMicOn(student.id) && (
                        <IconButton
                          className={classes.onlinePanelIcon}
                          onClick={() => {
                            turnStudentMicOff(student.id)
                          }}
                          disabled={authState.role === 'S'}
                        >
                          <MicNoneOutlinedIcon />
                        </IconButton>
                      )}
                      {authState.role === 'T' && !isStudentCamOn(student.id) && (
                        <IconButton
                          className={classes.onlinePanelIcon}
                          onClick={() => {
                            turnStudentCamOn(student.id)
                          }}
                          disabled={
                            permissionResolution &&
                            permissionResolution?.[student.id] &&
                            permissionResolution?.[student.id]?.video ===
                              'pending'
                          }
                        >
                          {(!permissionResolution ||
                            !permissionResolution?.[student.id] ||
                            permissionResolution?.[student.id]?.video !==
                              'pending') && <VideocamOffOutlinedIcon />}
                          {permissionResolution?.[student.id] &&
                            permissionResolution?.[student.id]?.video ===
                              'pending' && (
                              <Spinner
                                size={18}
                                className="margin-left-unset position-unset"
                                color="primary"
                              />
                            )}
                        </IconButton>
                      )}
                      {authState.role === 'T' && isStudentCamOn(student.id) && (
                        <IconButton
                          className={classes.onlinePanelIcon}
                          onClick={() => {
                            turnStudentCamOff(student.id)
                          }}
                        >
                          <VideocamOutlinedIcon />
                        </IconButton>
                      )}
                      {/* ENABLE WHEN STUDENT SCREEN SHARE IS ACTIVE */}
                      {/* {authState.role === 'T' && (
                        <ListItemSecondaryAction>
                          <IconButton
                            className={classes.onlinePanelIcon}
                            style={{ margin: 0 }}
                            onClick={(e) =>
                              handleOpenStudentMenu(e, student.id)
                            }
                          >
                            <FiMoreVertical />
                          </IconButton>
                        </ListItemSecondaryAction>
                      )} */}
                    </ListItem>
                    <Divider />
                  </Fragment>
                ))}
                {offlineUsers.map((student) => (
                  <Fragment key={student.id}>
                    <ListItem>
                      <ListItemAvatar>
                        <Badge
                          className={classes.offlineBadge}
                          variant="dot"
                          anchorOrigin={{
                            horizontal: 'right',
                            vertical: 'bottom',
                          }}
                        >
                          <Avatar src={student.avatar || profilePlaceholder} />
                        </Badge>
                      </ListItemAvatar>
                      <ListItemText primary={student.name} />
                    </ListItem>
                    <Divider />
                  </Fragment>
                ))}
              </List>
            )}
          </Grid>
          {authState.role === 'T' &&
            remoteUsers.filter((user) => user.hasAudio || user.hasVideo)
              .length > 0 && (
              <Grid item xs={12}>
                <Grid
                  container
                  alignItems="center"
                  justifyContent="space-evenly"
                  className={classes.teacherControls}
                >
                  <Grid item xs={7}>
                    <>
                      <IconButton
                        className={classes.studentBoxIcon}
                        onClick={turnOffAllCameras}
                      >
                        <VideocamOutlinedIcon />
                      </IconButton>
                      <span
                        role="button"
                        tabIndex="0"
                        className={`${classes.controlText} finer-text`}
                        onClick={turnOffAllCameras}
                        onKeyDown={turnOffAllCameras}
                      >
                        Turn off Camera for all
                      </span>
                    </>
                  </Grid>
                  <Grid item xs={5}>
                    <>
                      <IconButton
                        className={classes.studentBoxIcon}
                        onClick={turnOffAllMics}
                      >
                        <MicNoneOutlinedIcon />
                      </IconButton>
                      <span
                        role="button"
                        tabIndex="0"
                        className={`${classes.controlText} finer-text`}
                        onClick={turnOffAllMics}
                        onKeyDown={turnOffAllMics}
                      >
                        Mute all
                      </span>
                    </>
                  </Grid>
                </Grid>
              </Grid>
            )}
        </Grid>
        <Menu
          id="batch-menu"
          anchorEl={studentMenu.menu}
          keepMounted
          open={Boolean(studentMenu.menu)}
          onClose={handleCloseStudentMenu}
        >
          <MenuList>
            <div>
              {!hasScreenSharePermission() && (
                <MenuItem onClick={allowScreenShare}>
                  <ScreenShareIcon style={{ marginRight: 5 }} />
                  Allow Screen Share
                </MenuItem>
              )}
              {hasScreenSharePermission() && (
                <MenuItem onClick={revokeScreenShare}>
                  <StopScreenShareIcon style={{ marginRight: 5 }} />
                  Revoke Screen Share
                </MenuItem>
              )}
            </div>
          </MenuList>
        </Menu>
      </>
    </>
  )
}

export default ClassStudentList
