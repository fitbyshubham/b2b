import React, { useContext, useEffect, useRef, useState } from 'react'
import AgoraRTC from 'agora-rtc-sdk-ng'
import AgoraRTM from 'agora-rtm-sdk'
import { makeStyles } from '@material-ui/core'
import Alert from '@material-ui/lab/Alert'
import Collapse from '@material-ui/core/Collapse'
import { useHistory } from 'react-router-dom'
import useAgoraRTC from '../../Hooks/Agora/useAgoraRTC'
import useAgoraRTM from '../../Hooks/Agora/useAgoraRTM'
import ClassNavbar from '../Navbar/ClassNavbar'
import { AuthContext } from '../../Context/AuthContext'
import { AgoraContext } from '../../Context/AgoraContext'
import { BatchContext } from '../../Context/BatchContext'
import VideoControls from '../Agora/VideoControls'
import Whiteboard from '../Whiteboard/Whiteboard'
import Notifications from '../Agora/Notifications'
import TeacherVideoContainer from '../Agora/TeacherVideoContainer'
import StudentVideoContainer from '../Agora/StudentVideoContainer'
import ClassLoader from './ClassLoader'
import GrantPermission from './GrantPermission'
import { CommandContext } from '../../Context/CommandContext'

const useStyles = makeStyles({
  root: {
    width: '100%',
    height: '100%',
    '& .MuiGrid-item': {
      height: '100%',
    },
  },
  alert: {
    position: 'absolute',
    top: 70,
    left: '50%',
    transform: 'translateX(-50%)',
    zIndex: 999,
  },
  container: {
    width: '100%',
    height: '100%',
    position: 'relative',
  },
})
let attendanceInterval

const Class = ({
  lectureId,
  appId,
  RTCToken,
  RTMToken,
  classCleanup,
  classStartTime,
  liveboardUrl,
  batchId,
  screenShareToken,
  secret,
  salt,
}) => {
  const classes = useStyles()
  const history = useHistory()
  const [isLoading, setIsLoading] = useState(true)
  const [alert, setAlert] = useState(true)
  const [permissions, setPermissions] = useState(false)
  const [isTeacherPresent, setisTeacherPresent] = useState(true)
  const RTCClient = useRef()
  const RTMInstance = useRef()
  const leaveTimer = useRef()

  const {
    inputDeviceIds,
    setSpeakerUid,
    isLiveBoardActive,
    GetCameras,
    GetMicrophones,
    setInputDeviceIds,
    hasAudioPermission,
    setCurrentSpeakers,
  } = useContext(AgoraContext)
  const { AVState, setNotification, teacherLeft, GetAllQueriesInALecture } =
    useContext(CommandContext)

  const { authState } = useContext(AuthContext)
  const {
    batchByCode,
    GetEnrolledStudentsInBatch,
    FindBatchWithCode,
    studentRequestByBatchId,
    AddAttendance,
    GenerateAttendance,
    StopRecording,
    isRecording,
  } = useContext(BatchContext)
  const joinClass = useRef()
  const leaveVideoAndChat = useRef()

  useEffect(() => {
    if (!hasAudioPermission) {
      history.push('/dashboard')
    }
  }, [hasAudioPermission])

  // volume indicator
  useEffect(() => {
    RTCClient.current = AgoraRTC.createClient({
      codec: 'h264',
      mode: 'rtc',
    })
    RTCClient.current.enableAudioVolumeIndicator()
    RTCClient.current.on('volume-indicator', (volumes) => {
      volumes.sort((v1, v2) => v2.level - v1.level)
      if (volumes.length > 0) {
        setCurrentSpeakers(() => volumes.map((volume) => volume.uid))
      } else {
        setCurrentSpeakers([])
      }
      if (volumes[0] && volumes[0].level !== 0) {
        setSpeakerUid(volumes[0].uid)
      } else {
        setSpeakerUid(undefined)
      }
    })
    const RTMConfig = {
      logFilter: process.env.REACT_APP_AGORA_RTM_LOG_ENABLED
        ? AgoraRTM.LOG_FILTER_INFO
        : AgoraRTM.LOG_FILTER_OFF,
    }
    RTMInstance.current = AgoraRTM.createInstance(appId, RTMConfig)
  }, [])

  useEffect(() => {
    async function startClass() {
      await FindBatchWithCode(batchId)
      if (authState.role === 'T') {
        await GetAllQueriesInALecture(lectureId)
      }
      joinClass.current()
    }

    startClass()

    return () => {
      leaveVideoAndChat.current()
    }
  }, [])

  useEffect(() => {
    getStudents()
  }, [studentRequestByBatchId])

  useEffect(() => {
    if (authState.role === 'T') return
    if (!isTeacherPresent && !teacherLeft) {
      setNotification(
        null,
        'CLASS_END',
        "Teacher is offline, class will end in 10 minutes if Teacher doesn't rejoin",
      )
      leaveTimer.current = setTimeout(() => {
        leaveVideoAndChat.current()
      }, 600000)
    } else if (!isTeacherPresent && teacherLeft) {
      leaveTimer.current = setTimeout(() => {
        leaveVideoAndChat.current()
      }, 5000)
    } else if (leaveTimer.current) {
      clearTimeout(leaveTimer.current)
    }
  }, [isTeacherPresent])

  useEffect(() => {
    if (AVState.video) {
      showVideo()
    } else if (!AVState.video) {
      hideVideo()
    }
  }, [AVState.video])

  useEffect(() => {
    if (AVState.audio) {
      unmuteAudio()
    } else if (!AVState.audio) {
      muteAudio()
    }
  }, [AVState.audio])

  useEffect(() => {
    setTimeout(() => {
      setAlert(false)
    }, 15000)
  }, [])

  async function getStudents() {
    await GetEnrolledStudentsInBatch(batchId)
  }

  async function init() {
    const microphones = await GetMicrophones()
    setPermissions(true)
    const cameras = await GetCameras()
    if (cameras && cameras.length > 0) {
      setInputDeviceIds((devices) => ({ ...devices, cameraId: cameras[0].id }))
    }
    if (microphones && microphones.length > 0) {
      setInputDeviceIds((devices) => ({
        ...devices,
        microphoneId: microphones[0].id,
      }))
    }
  }

  async function startAttendance() {
    attendanceInterval = setInterval(async () => {
      const onlineStudents = remoteUsers
        .map((user) => user.uid)
        .filter((user) => user.split('-').length === 5)
      await AddAttendance(lectureId, onlineStudents)
    }, 150000)
  }

  async function generateAttendance() {
    await GenerateAttendance(lectureId)
  }

  joinClass.current = async () => {
    await init()
    join().then(() => {
      login(authState.user_id, RTMToken)
        .then(() => {
          createChannelAndJoin(lectureId).then(() => {
            setIsLoading(false)
            if (authState.role === 'T') {
              startAttendance()
            }
          })
        })
        .catch(() => {
          // handleerror
        })
    })
  }

  leaveVideoAndChat.current = async () => {
    if (authState.role === 'T') {
      clearInterval(attendanceInterval)
      await generateAttendance()
    }
    leave()
    leaveChannel()
      .then(() => {
        logout()
      })
      .then(async () => {
        classCleanup()
        if (isRecording) {
          await StopRecording(lectureId)
        }
      })
      .catch(async () => {
        classCleanup()
        if (isRecording) {
          await StopRecording(lectureId)
        }
      })
  }

  const {
    localAudioTrack,
    localVideoTrack,
    leave,
    join,
    joinState,
    remoteUsers,
    muteAudio,
    unmuteAudio,
    showVideo,
    hideVideo,
    shareScreen,
    stopShareScreen,
    isAudioMuted,
    isVideoMuted,
    isScreenShared,
    screenShareVideoTrack,
    audioLoading,
    videoLoading,
    screenShareLoading,
    networkQuality,
    studentShareScreen,
    stopStudentShareScreen,
    switchVideoInput,
    switchAudioInput,
    clientUID,
    screenShareUID,
  } = useAgoraRTC(
    RTCClient.current,
    AVState,
    inputDeviceIds,
    appId,
    lectureId,
    RTCToken,
    screenShareToken,
    authState.user_id,
    secret,
    salt,
  )

  const {
    login,
    logout,
    createChannelAndJoin,
    leaveChannel,
    sendMessage,
    channelMessages,
    sendCommandToSpecificUser,
    sendCommandToChannel,
    isJoined,
    multipleLogin,
  } = useAgoraRTM(RTMInstance.current)

  useEffect(() => {
    if (multipleLogin) {
      setTimeout(() => {
        leaveVideoAndChat.current()
      }, 5000)
    }
  }, [multipleLogin])

  useEffect(() => {
    if (authState.role !== 'S') return
    const val = remoteUsers.find((user) => user.uid === batchByCode.owner)
    if (val === undefined) {
      setisTeacherPresent(false)
    } else {
      setisTeacherPresent(true)
    }
  }, [remoteUsers])

  return (
    <>
      <div className={classes.alert}>
        <Collapse in={alert && !isLoading}>
          <Alert
            severity="info"
            onClose={() => {
              setAlert(false)
            }}
          >
            {authState.role === 'T'
              ? remoteUsers.length === 0
                ? 'Wait for students to join class!'
                : 'Students have joined, you can start class now!'
              : remoteUsers.find((user) => user.uid === batchByCode.owner)
              ? 'Your Teacher is here, class has started!'
              : 'Wait for your Teacher to join!'}
          </Alert>
        </Collapse>
      </div>
      <ClassNavbar
        remoteUsers={remoteUsers}
        sendMessage={sendMessage}
        channelMessages={channelMessages}
        role={authState.role}
        batchId={batchId}
        sendCommandToChannel={sendCommandToChannel}
        sendCommandToSpecificUser={sendCommandToSpecificUser}
        isLoading={isLoading && !joinState}
        isAudioMuted={isAudioMuted}
      />
      <div className="main-view">
        {isLoading && !joinState && !permissions && <GrantPermission />}
        {isLoading && !joinState && permissions && <ClassLoader />}
        {!isLoading && joinState && permissions && (
          <div className={classes.container}>
            {authState.role === 'T' ? (
              <TeacherVideoContainer
                remoteUsers={remoteUsers}
                localAudioTrack={localAudioTrack}
                localVideoTrack={localVideoTrack}
                isAudioMuted={isAudioMuted}
                isVideoMuted={isVideoMuted}
                sendCommandToSpecificUser={sendCommandToSpecificUser}
                isScreenShared={isScreenShared}
                stopScreenShare={stopShareScreen}
                screenShareVideoTrack={screenShareVideoTrack}
              />
            ) : (
              <StudentVideoContainer
                remoteUsers={remoteUsers}
                localAudioTrack={localAudioTrack}
                localVideoTrack={localVideoTrack}
                isAudioMuted={isAudioMuted}
                isVideoMuted={isVideoMuted}
                sendCommandToSpecificUser={sendCommandToSpecificUser}
                isScreenShared={isScreenShared}
                stopScreenShare={stopStudentShareScreen}
              />
            )}
          </div>
        )}
        {!isLoading && joinState && permissions && isLiveBoardActive && (
          <Whiteboard src={liveboardUrl} title={batchId} />
        )}
        {!isLoading && joinState && permissions && <Notifications />}
      </div>
      <VideoControls
        isScreenShared={isScreenShared}
        shareScreen={shareScreen}
        stopShareScreen={stopShareScreen}
        isAudioMuted={isAudioMuted}
        isVideoMuted={isVideoMuted}
        leaveVideoAndChat={leaveVideoAndChat}
        classStartTime={classStartTime}
        sendCommandToChannel={sendCommandToChannel}
        remoteUsers={remoteUsers}
        RTMJoined={isJoined}
        isLoading={isLoading && !joinState}
        batchId={batchId}
        audioLoading={audioLoading}
        videoLoading={videoLoading}
        screenShareLoading={screenShareLoading}
        networkQuality={networkQuality}
        studentShareScreen={studentShareScreen}
        stopStudentShareScreen={stopStudentShareScreen}
        switchVideoInput={switchVideoInput}
        switchAudioInput={switchAudioInput}
        lectureId={lectureId}
        clientUID={clientUID}
        screenShareUID={screenShareUID}
      />
    </>
  )
}

export default Class
