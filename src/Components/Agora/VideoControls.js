import {
  AppBar,
  Chip,
  Grid,
  IconButton,
  List,
  ListItem,
  ListItemText,
  makeStyles,
  Popover,
  Toolbar,
  Divider,
} from '@material-ui/core'
import React, { useContext, useEffect, useState } from 'react'
import ScreenShareIcon from '@material-ui/icons/ScreenShare'
import { useBeforeunload } from 'react-beforeunload'
// ENABLE WHEN STUDENT SCREN SHARE IS DEPLOYED
// import StopScreenShareIcon from '@material-ui/icons/StopScreenShare'
import MicIcon from '@material-ui/icons/Mic'
import MicOffIcon from '@material-ui/icons/MicOff'
import VideocamIcon from '@material-ui/icons/Videocam'
import VideocamOffIcon from '@material-ui/icons/VideocamOff'
import AccessTimeIcon from '@material-ui/icons/AccessTime'
import { MdContentCopy } from 'react-icons/md'
import VolumeUpIcon from '@material-ui/icons/VolumeUp'
import CallEndOutlinedIcon from '@material-ui/icons/CallEndOutlined'
import TvIcon from '@material-ui/icons/Tv'
import SettingsIcon from '@material-ui/icons/Settings'
import { IoIosClose } from 'react-icons/io'
import CopyToClipboard from 'react-copy-to-clipboard'
import { useSnackbar } from 'notistack'
import ConfirmDialog from '../Dialogs/ConfirmDialog'
import Controls from '../Controls/Controls'
import showSuccessSnackbar from '../Snackbar/successSnackbar'
import { AuthContext } from '../../Context/AuthContext'
import { BatchContext } from '../../Context/BatchContext'
import { AgoraContext } from '../../Context/AgoraContext'
import Spinner from '../Progress/Spinner'
import showErrorSnackbar from '../Snackbar/errorSnackbar'
import RegularTooltip from '../Tooltips/RegularTooltip'
import ExcellentNetwork from '../../Assets/Images/excellent-network.svg'
import GoodNetwork from '../../Assets/Images/good-network.svg'
import PoorNetwork from '../../Assets/Images/poor-network.svg'
import UnknownNetwork from '../../Assets/Images/unknown-network.svg'
import ManagePermission from './ManagePermission'
import { CommandContext } from '../../Context/CommandContext'
import CallTestDialog from '../Dialogs/CallTestDialog'
import recordIcon from '../../Assets/Images/record.svg'

const useStyles = makeStyles({
  appBar: {
    backgroundColor: '#fff',
    color: '#333333',
    bottom: 0,
    top: 'auto',
    boxShadow:
      '0px -2px 4px -1px rgb(0 0 0 / 20%), 0px -4px 5px 0px rgb(0 0 0 / 14%), 0px -1px 10px 0px rgb(0 0 0 / 12%)',
    zIndex: 1250,
  },
  iconLabel: {
    marginTop: 'unset',
    color: '#333',
    textAlign: 'center',
    fontSize: '0.875rem',
  },
  navIcons: {
    padding: 4,
    color: '#333',
  },
  iconBorderLeft: {
    borderLeft: '1px solid #d8d8d8',
  },
  settingHeading: {
    fontWeight: 'bold',
    paddingLeft: 20,
    fontSize: 18,
  },
  popover: {
    '& .MuiPopover-paper': {
      borderRadius: 12,
      paddingTop: 30,
    },
  },
  batchCode: {
    padding: 6,
    backgroundColor: 'rgba(216,216,216,0.5)',
    '& p': {
      fontSize: 14,
      textAlign: 'center',
    },
  },
  chipTime: {
    width: '96px',
    borderRadius: '4px',
    border: 'solid 1px rgba(0, 0, 0, 0.4)',
    backgroundColor: 'unset',
  },
  chip: {
    backgroundColor: 'unset',
  },
  closeEdviBoardBtn: {
    backgroundImage: 'unset',
    backgroundColor: '#f44236',
    '&:hover': {
      backgroundColor: '#f44236',
    },
  },
  padding1: {
    padding: '5px',
  },
  horizontalCenter: {
    left: '50%',
    transform: 'translateX(-50%)',
  },
  closeBtn: {
    position: 'absolute',
    top: 0,
    right: 0,
    padding: 6,
  },
  activeBtn: {
    border: 'solid 1px #999999',
  },
  videoIcon: {
    margin: '0px 18px',
  },
  networkGrid: {
    marginRight: 16,
  },
  iconButton: {
    backgroundColor: '#fc0303',
    '&.MuiIconButton-root.Mui-disabled': {
      backgroundColor: '#fd6464',
    },
    '&:hover': {
      backgroundColor: '#fc0303',
    },
  },
  listItem: {
    padding: '8px 2.5rem',
  },
})
let s

const VideoControls = ({
  isScreenShared = false,
  shareScreen,
  stopShareScreen,
  isAudioMuted,
  isVideoMuted,
  leaveVideoAndChat,
  sendCommandToChannel,
  RTMJoined,
  isLoading,
  batchId,
  audioLoading,
  videoLoading,
  screenShareLoading,
  classStartTime,
  networkQuality,
  studentShareScreen,
  // ENABLE WHEN STUDENT SCREN SHARE IS DEPLOYED
  // stopStudentShareScreen,
  switchAudioInput,
  switchVideoInput,
  lectureId,
  clientUID,
  screenShareUID,
}) => {
  const classes = useStyles()
  const {
    batchByCode,
    EndBatchLecture,
    FindBatchWithCode,
    allBatchStudents,
    GenerateLiveboardPDF,
    StartRecording,
    isRecording,
    StopRecording,
    loadingRecording,
    UpdateRecordingLayout,
  } = useContext(BatchContext)
  const {
    setIsLiveBoardActive,
    isLiveBoardActive,
    giveAVPermissionToStudent,
    hasCameraPermissions,
    speakerUid,
    inputDeviceIds,
  } = useContext(AgoraContext)
  const {
    AVState,
    setAVState,
    isDeviceControlsWithUser,
    teacherDoubts,
    studentHasScreenSharePermission,
    disableChatForClass,
    isRecordingEnabled,
  } = useContext(CommandContext)
  const { authState } = useContext(AuthContext)
  const [confirmLeave, setConfirmLeave] = useState(false)
  const [anchorEl, setAnchorEl] = useState(false)
  const [openSwitchDevice, setOpenSwitchDevice] = useState(false)
  const [timeOfClassStart, setTimeOfClassStart] = useState({
    hrs: 0,
    min: 0,
    sec: 0,
  })
  // student record knowledge
  const [localRecordingStatus, setLocalRecordingStatus] = useState(false)
  const [liveboardDialog, setLiveboardDialog] = useState(false)
  const [firstLoad, setFirstLoad] = useState(true)
  const { enqueueSnackbar } = useSnackbar()

  useEffect(() => {
    startTime()
    return () => {
      clearInterval(s)
    }
  }, [])

  function startTime() {
    let hrs = 0
    let min = 0
    let sec = 0

    if (classStartTime) {
      classStartTime = Math.ceil(Date.now() / 1000) - classStartTime
      sec = classStartTime
      while (sec >= 60) {
        min += 1
        sec -= 60
      }
      while (min >= 60) {
        hrs += 1
        min -= 60
      }
    }

    s = setInterval(() => {
      sec += 1
      while (sec >= 60) {
        min += 1
        sec -= 60
      }
      while (min >= 60) {
        hrs += 1
        min -= 60
      }
      setTimeOfClassStart({ hrs, min, sec })
    }, 1000)
  }

  useEffect(() => {
    if (authState.role !== 'T' || !RTMJoined) return
    if (giveAVPermissionToStudent) {
      sendCommandToChannel('AGORA', 'CONTROLS_GRANTED')
    } else {
      sendCommandToChannel('AGORA', 'CONTROLS_REVOKED')
    }
  }, [RTMJoined, giveAVPermissionToStudent])

  useEffect(() => {
    if (authState.role !== 'T' || !RTMJoined) return
    if (disableChatForClass) {
      sendCommandToChannel('CHAT', 'DISABLED')
    } else {
      sendCommandToChannel('CHAT', 'ENABLED')
    }
  }, [RTMJoined, disableChatForClass])

  useEffect(() => {
    if (authState.role !== 'T' || !RTMJoined) return
    if (isRecording) {
      sendCommandToChannel('RECORDING', 'STARTED')
      setLocalRecordingStatus(true)
    } else if (!isRecording && localRecordingStatus) {
      sendCommandToChannel('RECORDING', 'STOPPED')
      setLocalRecordingStatus(false)
    }
  }, [RTMJoined, isRecording])

  const handleCloseSwitchDeviceDialog = () => {
    setOpenSwitchDevice(false)
    if (inputDeviceIds.cameraId !== '' || inputDeviceIds.cameraId !== undefined)
      switchVideoInput(inputDeviceIds.cameraId)
    if (
      inputDeviceIds.microphoneId !== '' ||
      inputDeviceIds.microphoneId !== undefined
    )
      switchAudioInput(inputDeviceIds.microphoneId)
  }

  const handleShareScreen = async () => {
    if (authState.role === 'T') {
      shareScreen()
    } else if (authState.role === 'S') studentShareScreen()
  }

  const updateLayout = async (
    uid,
    auid = undefined,
    rid = undefined,
    sid = undefined,
  ) => {
    await UpdateRecordingLayout(lectureId, uid, auid, rid, sid)
  }

  useEffect(() => {
    if (authState.role !== 'T') return
    if (firstLoad) {
      setFirstLoad(false)
      return
    }
    if (isScreenShared === true && isRecording) updateLayout(screenShareUID)
    else if (isScreenShared === false && isRecording) updateLayout(clientUID)
  }, [isScreenShared])

  const handleLeaveClass = () => {
    if (authState.role === 'S') {
      leaveVideoAndChat.current()
    } else if (authState.role === 'T') {
      setConfirmLeave(true)
    }
  }

  const handleWhiteBoard = () => {
    if (authState.role === 'T' && !isLiveBoardActive && !isScreenShared) {
      handleShareScreen()
    } else if (authState.role === 'T' && isLiveBoardActive && isScreenShared) {
      stopShareScreen()
    }
    setIsLiveBoardActive((isActive) => !isActive)
  }

  const getSpeakerName = () => {
    if (speakerUid === batchByCode.owner) {
      if (authState.role === 'T') {
        return `You - ${authState.name}`
      }
      return `Teacher`
    }
    const val = allBatchStudents.find((student) => student.id === speakerUid)
    if (val) {
      return val.name
    }

    return 'Guest'
  }

  const openSettingMenu = (event) => {
    setAnchorEl(event.currentTarget)
  }

  const closeSettingMenu = () => {
    setAnchorEl(null)
  }

  const showNotification = () => {
    showSuccessSnackbar(enqueueSnackbar, 'Copied to Clipboard')
  }

  const updateAVState = (key, value) => {
    setAVState({
      ...AVState,
      [key]: value,
    })
  }

  const isVideoButtonDisabled = () => {
    if (isDeviceControlsWithUser) {
      if (videoLoading || (isScreenShared && authState.role === 'S'))
        return true
      return false
    }
    return true
  }
  const isAudioButtonDisabled = () => {
    if (isDeviceControlsWithUser) {
      if (audioLoading) return true
      return false
    }

    return true
  }

  const getBackgroundColor = () => {
    if (networkQuality === 1 || networkQuality === 2) return '#079178'
    if (networkQuality === 3 || networkQuality === 4) return '#eeb41f'
    if (networkQuality === 5 || networkQuality === 6) return '#e92c2c'
    return '#606060'
  }

  const getTooltipText = () => {
    if (networkQuality === 1 || networkQuality === 2)
      return 'High network speed'
    if (networkQuality === 3 || networkQuality === 4)
      return 'Average network speed'
    if (networkQuality === 5 || networkQuality === 6)
      return 'Poor network speed'
    return 'Unknown network speed'
  }

  const handleStartRecording = async () => {
    const res = await StartRecording(lectureId, clientUID)
    if (isScreenShared)
      await updateLayout(screenShareUID, res.uid, res.resourceId, res.sid)
  }

  const handleStopRecording = async () => {
    await StopRecording(lectureId)
  }

  useBeforeunload(async (e) => {
    if (authState.role === 'S') return
    e.preventDefault()
    if (isRecording) {
      await handleStopRecording()
    }
  })

  return (
    <>
      <AppBar position="fixed" className={classes.appBar}>
        <Toolbar>
          {!isLoading && (
            <>
              <ConfirmDialog
                open={confirmLeave}
                setOpen={setConfirmLeave}
                title="End Live Class?"
                content={
                  teacherDoubts.filter((doubt) => doubt.state === 0).length > 0
                    ? `You still have ${
                        teacherDoubts.filter((doubt) => doubt.state === 0)
                          .length
                      } pending doubts. Do you still want to end live class?`
                    : 'Do you want to end live class?'
                }
                acceptButton="Yes, End class for all"
                rejectButton="No, I want to Refresh/Rejoin"
                videoControl
                yesAction={async () => {
                  sendCommandToChannel('CALL', 'END')
                  await EndBatchLecture(batchId)
                  await FindBatchWithCode(batchId)
                  leaveVideoAndChat.current()
                }}
                noAction={() => {}}
              />
              <ConfirmDialog
                open={liveboardDialog}
                setOpen={setLiveboardDialog}
                title="Save whiteboard notes as PDF"
                content="Do you want to save?"
                acceptButton="Yes, save to Notes"
                rejectButton="No, don't save to Notes"
                yesAction={async () => {
                  await GenerateLiveboardPDF()
                  handleWhiteBoard()
                }}
                noAction={handleWhiteBoard}
              />
              <CallTestDialog
                open={openSwitchDevice}
                handleClose={handleCloseSwitchDeviceDialog}
                dialogName="Change Mic or Camera"
              />
              <Grid container alignItems="center">
                <Grid item xs={4}>
                  <Grid
                    container
                    alignItems="center"
                    justifyContent="flex-start"
                  >
                    <Grid item className={classes.networkGrid}>
                      <RegularTooltip
                        placement="right"
                        title={getTooltipText()}
                      >
                        <IconButton
                          disableRipple
                          style={{
                            backgroundColor: getBackgroundColor(),
                            borderRadius: 4,
                            padding: 5,
                          }}
                        >
                          {(networkQuality === 1 || networkQuality === 2) && (
                            <img
                              src={ExcellentNetwork}
                              alt="Excellent network conditions"
                              width="13.5px"
                              height="auto"
                            />
                          )}
                          {(networkQuality === 3 || networkQuality === 4) && (
                            <img
                              src={GoodNetwork}
                              alt="Good network conditions"
                              width="13.5px"
                              height="auto"
                            />
                          )}
                          {(networkQuality === 5 || networkQuality === 6) && (
                            <img
                              src={PoorNetwork}
                              alt="Poor network conditions"
                              width="13.5px"
                              height="auto"
                            />
                          )}
                          {networkQuality !== 1 &&
                            networkQuality !== 2 &&
                            networkQuality !== 3 &&
                            networkQuality !== 4 &&
                            networkQuality !== 5 &&
                            networkQuality !== 6 && (
                              <img
                                src={UnknownNetwork}
                                alt="Unknown network conditions"
                                width="15px"
                                height="auto"
                              />
                            )}
                        </IconButton>
                      </RegularTooltip>
                    </Grid>
                    {authState.role === 'S' && isRecordingEnabled && (
                      <Grid item>
                        <RegularTooltip
                          placement="right"
                          title="This class is being recorded"
                        >
                          <IconButton style={{ padding: 0, marginRight: 16 }}>
                            <img
                              src={recordIcon}
                              alt="record"
                              height="24"
                              width="24"
                            />
                          </IconButton>
                        </RegularTooltip>
                      </Grid>
                    )}
                    <Grid item xs={12} sm={4}>
                      <Chip
                        label={`${
                          timeOfClassStart.hrs.toString().length < 2
                            ? `0${timeOfClassStart.hrs.toString()}`
                            : timeOfClassStart.hrs.toString()
                        }:${
                          timeOfClassStart.min.toString().length < 2
                            ? `0${timeOfClassStart.min.toString()}`
                            : timeOfClassStart.min.toString()
                        }:${
                          timeOfClassStart.sec.toString().length < 2
                            ? `0${timeOfClassStart.sec.toString()}`
                            : timeOfClassStart.sec.toString()
                        }`}
                        icon={<AccessTimeIcon />}
                        size="small"
                        className={classes.chipTime}
                      />
                    </Grid>
                    {speakerUid && (
                      <Grid item xs={12} sm={4}>
                        <Chip
                          label={
                            speakerUid === batchByCode.owner
                              ? authState.user_id === speakerUid
                                ? `You - ${authState.name}`
                                : 'Teacher'
                              : getSpeakerName()
                          }
                          size="small"
                          icon={<VolumeUpIcon />}
                          className={classes.chip}
                        />
                      </Grid>
                    )}
                  </Grid>
                </Grid>
                <Grid item xs={4}>
                  <Grid container alignItems="center" justifyContent="center">
                    {!isAudioMuted && (
                      <Grid item className="text-align-right">
                        <IconButton
                          disabled={isAudioButtonDisabled()}
                          onClick={() => {
                            updateAVState('audio', false)
                          }}
                          className={`${classes.navIcons} ${classes.activeBtn}`}
                        >
                          {audioLoading ? (
                            <Spinner
                              size={24}
                              style={{ marginLeft: 'unset', position: 'unset' }}
                              color="inherit"
                            />
                          ) : (
                            <MicIcon />
                          )}
                        </IconButton>
                      </Grid>
                    )}
                    {isAudioMuted && (
                      <Grid item className="text-align-right">
                        <IconButton
                          disabled={isAudioButtonDisabled()}
                          onClick={() => {
                            updateAVState('audio', true)
                          }}
                          className={classes.iconButton}
                          style={{
                            padding: 6,
                          }}
                        >
                          {audioLoading ? (
                            <Spinner
                              size={24}
                              style={{ marginLeft: 'unset', position: 'unset' }}
                              color="inherit"
                            />
                          ) : (
                            <MicOffIcon htmlColor="#fff" />
                          )}
                        </IconButton>
                      </Grid>
                    )}
                    {!isVideoMuted && (
                      <Grid
                        item
                        className={`${classes.videoIcon} text-align-center`}
                      >
                        <IconButton
                          disabled={isVideoButtonDisabled()}
                          onClick={() => {
                            updateAVState('video', false)
                          }}
                          className={`${classes.navIcons} ${classes.activeBtn}`}
                        >
                          {videoLoading ? (
                            <Spinner
                              size={24}
                              style={{ marginLeft: 'unset', position: 'unset' }}
                              color="inherit"
                            />
                          ) : (
                            <VideocamIcon />
                          )}
                        </IconButton>
                      </Grid>
                    )}
                    {isVideoMuted && (
                      <Grid
                        item
                        className={`${classes.videoIcon} text-align-center`}
                      >
                        <IconButton
                          disabled={isVideoButtonDisabled()}
                          onClick={() => {
                            if (!hasCameraPermissions) {
                              showErrorSnackbar(
                                enqueueSnackbar,
                                "We cannot access your system's camera!",
                              )
                              return
                            }
                            updateAVState('video', true)
                          }}
                          className={classes.iconButton}
                          style={{
                            padding: 6,
                          }}
                        >
                          {videoLoading ? (
                            <Spinner
                              size={24}
                              style={{ marginLeft: 'unset', position: 'unset' }}
                              color="inherit"
                            />
                          ) : (
                            <VideocamOffIcon htmlColor="#fff" />
                          )}
                        </IconButton>
                      </Grid>
                    )}
                    <Grid item className="text-align-left">
                      <IconButton
                        style={{ backgroundColor: '#fc0303', padding: 6 }}
                        onClick={() => {
                          handleLeaveClass()
                        }}
                      >
                        <CallEndOutlinedIcon htmlColor="#fff" />
                      </IconButton>
                    </Grid>
                  </Grid>
                </Grid>
                <Grid item xs={4}>
                  <Grid container alignItems="center" justifyContent="flex-end">
                    {authState.role === 'T' && !isRecording && (
                      <Grid item sm={3}>
                        <IconButton
                          onClick={async () => {
                            await handleStartRecording()
                          }}
                          disabled={loadingRecording}
                          className={`${classes.navIcons} ${classes.horizontalCenter}`}
                        >
                          {!loadingRecording && (
                            <img
                              src={recordIcon}
                              alt="record"
                              height="24"
                              width="24"
                            />
                          )}
                          {loadingRecording && (
                            <Spinner
                              size={24}
                              style={{ marginLeft: 'unset', position: 'unset' }}
                              color="inherit"
                            />
                          )}
                        </IconButton>
                        <Grid item sm={12}>
                          <div>
                            <p className={classes.iconLabel}>Start Recording</p>
                          </div>
                        </Grid>
                      </Grid>
                    )}

                    {authState.role === 'T' && isRecording && (
                      <Grid item sm={3} className={` ${classes.padding1}`}>
                        <Controls.Button
                          text="Stop Recording"
                          onClick={() => {
                            handleStopRecording()
                          }}
                          disabled={loadingRecording}
                          size="small"
                          className={classes.closeEdviBoardBtn}
                        />
                      </Grid>
                    )}
                    {authState.role === 'T' && !isLiveBoardActive && (
                      <Grid item sm={3} className={classes.iconBorderLeft}>
                        <IconButton
                          onClick={() => {
                            handleWhiteBoard()
                          }}
                          className={`${classes.navIcons} ${classes.horizontalCenter}`}
                        >
                          <TvIcon />
                        </IconButton>
                        <Grid item sm={12}>
                          <div>
                            <p className={classes.iconLabel}>edvi Board</p>
                          </div>
                        </Grid>
                      </Grid>
                    )}

                    {authState.role === 'T' && isLiveBoardActive && (
                      <Grid
                        item
                        sm={3}
                        className={`${classes.iconBorderLeft} ${classes.padding1}`}
                      >
                        <Controls.Button
                          text="Close edvi Board"
                          onClick={() => {
                            // handleWhiteBoard()
                            setLiveboardDialog(true)
                          }}
                          size="small"
                          className={classes.closeEdviBoardBtn}
                        />
                      </Grid>
                    )}
                    {/* REMOVE ROLE CHECK WHEN STUDENT SCREEN SHARE IS ACTIVE */}
                    {!isScreenShared && authState.role === 'T' && (
                      <Grid item sm={3} className={classes.iconBorderLeft}>
                        <IconButton
                          disabled={
                            authState.role === 'T'
                              ? screenShareLoading
                              : !studentHasScreenSharePermission ||
                                screenShareLoading
                          }
                          onClick={() => {
                            handleShareScreen()
                          }}
                          className={`${classes.navIcons} ${classes.horizontalCenter}`}
                        >
                          {screenShareLoading ? (
                            <Spinner
                              size={24}
                              style={{ marginLeft: 'unset', position: 'unset' }}
                              color="inherit"
                            />
                          ) : (
                            <ScreenShareIcon />
                          )}
                        </IconButton>
                        <Grid item sm={12}>
                          <div>
                            <p className={classes.iconLabel}>Present Screen</p>
                          </div>
                        </Grid>
                      </Grid>
                    )}
                    {isScreenShared && authState.role === 'T' && (
                      <Grid item sm={3} className={classes.iconBorderLeft}>
                        <IconButton
                          disabled
                          className={`${classes.navIcons} ${classes.horizontalCenter}`}
                        >
                          <ScreenShareIcon />
                        </IconButton>
                        <Grid item sm={12}>
                          <div>
                            <p className={classes.iconLabel}>
                              You are presenting
                            </p>
                          </div>
                        </Grid>
                      </Grid>
                    )}
                    {/* UNCOMMENT WHEN STUDENT SCREEN SHARE IS ACTIVE */}
                    {/* {isScreenShared && authState.role === 'S' && (
                      <Grid item sm={4} className={classes.iconBorderLeft}>
                        <IconButton
                          className={`${classes.navIcons} ${classes.horizontalCenter}`}
                          onClick={stopStudentShareScreen}
                        >
                          <StopScreenShareIcon />
                        </IconButton>
                        <Grid item sm={12}>
                          <div>
                            <p className={classes.iconLabel}>
                              Stop Screen Share
                            </p>
                          </div>
                        </Grid>
                      </Grid>
                    )} */}
                    <Popover
                      open={Boolean(anchorEl)}
                      anchorEl={anchorEl}
                      anchorOrigin={{
                        vertical: 'top',
                        horizontal: 'center',
                      }}
                      transformOrigin={{
                        vertical: 'center',
                        horizontal: 'center',
                      }}
                      className={classes.popover}
                      onClose={closeSettingMenu}
                    >
                      <IconButton
                        onClick={closeSettingMenu}
                        className={classes.closeBtn}
                      >
                        <IoIosClose />
                      </IconButton>

                      <List>
                        {authState.role === 'T' && (
                          <ListItem>
                            <ManagePermission mode="controls" />
                          </ListItem>
                        )}
                        {authState.role === 'T' && <Divider />}
                        <ListItem
                          button
                          onClick={() => {
                            setOpenSwitchDevice(true)
                          }}
                          className={classes.listItem}
                        >
                          <ListItemText primary="Change Mic or Camera" />
                        </ListItem>
                      </List>
                      <div className={classes.batchCode}>
                        <p>
                          Batch Code:{' '}
                          <span className="bold">
                            {batchByCode.id ? batchByCode.id.toUpperCase() : ''}
                          </span>
                          <CopyToClipboard
                            text={
                              batchByCode.id ? batchByCode.id.toUpperCase() : ''
                            }
                          >
                            <IconButton
                              onClick={showNotification}
                              color="inherit"
                            >
                              <MdContentCopy size={16} />
                            </IconButton>
                          </CopyToClipboard>
                        </p>
                      </div>
                    </Popover>

                    <Grid item sm={3} className={classes.iconBorderLeft}>
                      <IconButton
                        onClick={openSettingMenu}
                        className={`${classes.navIcons} ${classes.horizontalCenter}`}
                      >
                        <SettingsIcon />
                      </IconButton>
                      <Grid item sm={12}>
                        <div>
                          <p className={classes.iconLabel}>Settings</p>
                        </div>
                      </Grid>
                    </Grid>
                  </Grid>
                </Grid>
              </Grid>
            </>
          )}
        </Toolbar>
      </AppBar>
    </>
  )
}

export default VideoControls
