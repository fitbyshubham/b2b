import { useSnackbar } from 'notistack'
import { React, createContext, useState, useEffect, useContext } from 'react'
import { AuthContext } from './AuthContext'
import axiosPost from '../Global/Axios/axiosPost'
import handleError from '../Global/HandleError/handleError'
import axiosGet from '../Global/Axios/axiosGet'

export const CommandContext = createContext()

const CommandContextProvider = (props) => {
  const { authState } = useContext(AuthContext)
  const { getAuthHeader } = useContext(AuthContext)
  const { enqueueSnackbar } = useSnackbar()
  const [isNewMessage, setIsNewMessage] = useState(false)
  const [poll, setPoll] = useState(undefined)
  const [isQuickPollOpen, setIsQuickPollOpen] = useState(false)
  const [studentPollId, setStudentPollId] = useState(undefined)
  const [teacherDoubts, setTeacherDoubts] = useState([])
  const [studentDoubt, setStudentDoubt] = useState(false)
  const [teacherLeft, setTeacherLeft] = useState(false)
  // Initial value of publish video should be false, otherwise all students joining will publish their feed. Problem for large class. Setting true because Android app not working.
  const [publishVideo, setPublishVideo] = useState(true)
  const [notificationState, setNotificationState] = useState({
    open: true,
    uid: '',
    type: '',
    content: '',
  })
  const [AVState, setAVState] = useState({
    video: false,
    audio: false,
  })
  const [isDeviceControlsWithUser, setIsDeviceControlsWithUser] = useState(true)
  const [permissionRequest, setPermissionRequest] = useState({
    audio: false,
    video: false,
  })
  const [permissionResolution, setPermissionResolution] = useState({})
  // eslint-disable-next-line no-unused-vars
  const [permissionTimeouts, setPermissionTimeouts] = useState({})

  const [studentHasScreenSharePermission, setStudentHasScreenSharePermission] =
    useState(false)

  const [
    studentsWithScreenSharePermissions,
    setStudentsWithScreenSharePermissions,
  ] = useState([])

  // teacher's control for disabling chat for entire class
  const [disableChatForClass, setDisableChatForClass] = useState(false)

  // student's knowledge for chat
  const [isChatEnabled, setIsChatEnabled] = useState(true)

  // student's knowledge for recording
  const [isRecordingEnabled, setIsRecordingEnabled] = useState(false)

  let timeout

  useEffect(() => {
    if (authState.role === 'T') {
      setPoll('teacherfirstpoll')
      setIsDeviceControlsWithUser(true)
    } else {
      setPoll('studentfirstpoll')
    }
  }, [authState.role])

  const RaiseQuery = async (lecture_id) => {
    if (!lecture_id) return
    try {
      const res = await axiosPost(`/query/`, {
        data: {
          lecture_id,
        },
        headers: getAuthHeader(),
      })
      return res
    } catch (err) {
      return false
    }
  }

  const GetAllQueriesInALecture = async (lecture_id) => {
    if (!lecture_id) return
    try {
      const res = await axiosGet(`/query/?lecture=${lecture_id}`, {
        headers: getAuthHeader(),
      })
      setTeacherDoubts(() =>
        res.data.map((data) => ({
          id: data.id,
          senderId: data.student_id,
          state: data.status === 'D' ? 0 : 2,
        })),
      )
      return res
    } catch (err) {
      setTeacherDoubts([])
      handleError(enqueueSnackbar, err)
    }
  }

  const ResolveQuery = async (query_id) => {
    if (!query_id) return
    try {
      const res = await axiosPost(`/query/${query_id}/resolve/`, {
        data: {},
        headers: getAuthHeader(),
      })
      return res
    } catch (err) {
      return false
    }
  }

  function releaseNotification() {
    if (timeout) {
      clearTimeout(timeout)
    }
    timeout = setTimeout(() => {
      setNotificationState({
        open: false,
        uid: null,
        type: null,
        content: null,
      })
    }, 3500)
  }

  const setNotification = (uid, type, content) => {
    setNotificationState({
      open: true,
      uid,
      type,
      content,
    })
    releaseNotification()
  }

  const resolveAVRequest = (uid, deviceType, state) => {
    let device
    if (deviceType === 'mic') device = 'audio'
    else if (deviceType === 'cam') device = 'video'
    else return
    setPermissionResolution((permissions) => {
      const data = permissions?.[uid]
      if (data) {
        return {
          ...permissions,
          [uid]: {
            ...data,
            [device]: state,
          },
        }
      }
      return {
        ...permissions,
        [uid]: {
          [device]: state,
        },
      }
    })
    if (state === 'pending') {
      const t = setTimeout(() => {
        setPermissionResolution((permissions) => {
          const data = permissions?.[uid]
          if (data?.[device] === 'pending')
            return {
              ...permissions,
              [uid]: {
                ...data,
                [device]: 'unresponsive',
              },
            }
        })
      }, 10000)
      setPermissionTimeouts((timeouts) => {
        const timedata = timeouts?.[uid]
        if (timedata && timedata?.[device]) {
          clearTimeout(timedata?.[device])
        }
        return {
          ...timeouts,
          [uid]: { ...timedata, [device]: t },
        }
      })
    }
  }

  const HandleCommand = async (
    command_category,
    command_method,
    body,
    senderId,
    sendCommandToSpecificUser,
  ) => {
    switch (command_category) {
      case 'AGORA': {
        switch (command_method) {
          case 'MIC_ON': {
            setPermissionRequest((permissions) => ({
              ...permissions,
              audio: true,
            }))
            break
          }
          case 'CAM_ON': {
            setPermissionRequest((permissions) => ({
              ...permissions,
              video: true,
            }))
            break
          }
          case 'MIC_OFF': {
            setAVState((devices) => ({ ...devices, audio: false }))
            setNotification(
              null,
              'AGORA_MIC_OFF',
              'Your microphone has been turned off by the Teacher',
            )
            break
          }
          case 'CAM_OFF': {
            setAVState((devices) => ({ ...devices, video: false }))
            setNotification(
              null,
              'AGORA_CAM_OFF',
              'Your camera has been turned off by the Teacher',
            )
            break
          }
          case 'CONTROLS_GRANTED': {
            setIsDeviceControlsWithUser((control) => {
              if (!control) {
                setNotification(
                  null,
                  'AGORA_CAM_ON',
                  'Teacher has given you access for mic and video',
                )
              }
              return true
            })
            break
          }
          case 'CONTROLS_REVOKED': {
            setIsDeviceControlsWithUser((control) => {
              if (control) {
                setNotification(
                  null,
                  'AGORA_CAM_OFF',
                  'Teacher has the control to your mic and video',
                )
              }
              return false
            })
            break
          }
          case 'MIC_ACCESS_GRANTED': {
            resolveAVRequest(senderId, 'mic', true)
            break
          }
          case 'CAM_ACCESS_GRANTED': {
            resolveAVRequest(senderId, 'cam', true)
            break
          }
          case 'MIC_ACCESS_DENIED': {
            resolveAVRequest(senderId, 'mic', false)
            break
          }
          case 'CAM_ACCESS_DENIED': {
            resolveAVRequest(senderId, 'cam', false)
            break
          }
          case 'VIDEO_PUBLISH': {
            setPublishVideo(true)
            break
          }
          case 'VIDEO_UNPUBLISH': {
            setPublishVideo(false)
            break
          }
          case 'SHARE_SCREEN': {
            setStudentHasScreenSharePermission(true)
            setNotification(
              null,
              'SHARE_SCREEN',
              'Teacher has allowed screen share',
            )
            break
          }
          case 'STOP_SHARE_SCREEN': {
            setStudentHasScreenSharePermission(false)
            setNotification(
              null,
              'STOP_SHARE_SCREEN',
              'Teacher has disallowed screen share',
            )

            break
          }
          default:
            break
        }
        break
      }
      case 'CHAT': {
        switch (command_method) {
          case 'ENABLED': {
            setIsChatEnabled(true)
            setNotification(
              null,
              'CHAT_ENABLED',
              'Chat has been enabled by teacher',
            )
            break
          }
          case 'DISABLED': {
            setIsChatEnabled(false)
            setNotification(
              null,
              'CHAT_DISABLED',
              'Chat has been disabled by teacher',
            )
            break
          }
          default:
            break
        }
        break
      }
      case 'QUICK_POLL': {
        switch (command_method) {
          case 'STARTED': {
            const id = parseInt(body, 10)
            if (Number.isInteger(id)) {
              setStudentPollId(id)
              setPoll('studentpoll')
              setIsQuickPollOpen(true)
            }
            break
          }
          case 'EXPIRED': {
            setPoll('studentendpoll')
            break
          }
          default:
            break
        }
        break
      }
      case 'DOUBT': {
        switch (command_method) {
          case 'ASK': {
            const search = teacherDoubts.find(
              (doubt) => doubt.senderId === senderId,
            )
            if (search === undefined) {
              teacherDoubts.push({ id: body, senderId, state: 0 })
              sendCommandToSpecificUser(senderId, 'DOUBT', 'RECEIVED')
            } else if (search.state === 2) {
              search.state = 0
              const others = teacherDoubts.filter(
                (tDoubt) => tDoubt.senderId !== senderId,
              )
              setTeacherDoubts([...others, search])
              sendCommandToSpecificUser(senderId, 'DOUBT', 'RECEIVED')
            } else {
              sendCommandToSpecificUser(senderId, 'DOUBT', 'RECEIVED')
            }
            setNotification(senderId, 'DOUBT_RAISED', null)
            break
          }
          case 'UNRAISE': {
            const temp = teacherDoubts.find(
              (tDoubt) => tDoubt.senderId === senderId,
            )
            setTeacherDoubts((tDoubts) => {
              const others = tDoubts.filter(
                (tDoubt) => tDoubt.senderId !== senderId,
              )
              temp.state = 2
              return [...others, temp]
            })
            setNotification(senderId, 'DOUBT_UNRAISED', null)
            break
          }
          case 'RECEIVED': {
            setNotification(
              senderId,
              'DOUBT_ASKED',
              'Your doubt is raised. Wait for your Teacher to accept it',
            )
            setStudentDoubt(true)
            break
          }
          case 'ACCEPTED': {
            setNotification(
              null,
              'DOUBT_ACCEPTED',
              'Your doubt is accepted. You may speak now',
            )
            break
          }
          case 'CLEAR': {
            setStudentDoubt(false)
            setNotification(
              null,
              'DOUBT_RESOLVED',
              'Your doubt has been resolved',
            )
            break
          }
          default:
            break
        }
        break
      }
      case 'CALL': {
        switch (command_method) {
          case 'END': {
            setTeacherLeft(true)
            setNotification(
              null,
              'CLASS_END',
              'Teacher has left, class will end now',
            )
            break
          }
          default:
            break
        }
        break
      }
      case 'RECORDING': {
        switch (command_method) {
          case 'STARTED': {
            setIsRecordingEnabled(true)
            setNotification(
              null,
              'RECORDING_STARTED',
              'Teacher has started to record class',
            )
            break
          }
          case 'STOPPED': {
            setNotification(
              null,
              'RECORDING_STOPPED',
              'Teacher has stopped recording the class',
            )

            setIsRecordingEnabled(false)
            break
          }
          default:
            break
        }
        break
      }
      default:
        break
    }
  }
  return (
    <CommandContext.Provider
      value={{
        HandleCommand,
        AVState,
        setAVState,
        poll,
        setPoll,
        studentPollId,
        notificationState,
        setNotificationState,
        isDeviceControlsWithUser,
        setIsDeviceControlsWithUser,
        setNotification,
        teacherLeft,
        permissionRequest,
        setPermissionRequest,
        resolveAVRequest,
        permissionResolution,
        isQuickPollOpen,
        setIsQuickPollOpen,
        teacherDoubts,
        setTeacherDoubts,
        studentDoubt,
        setStudentDoubt,
        RaiseQuery,
        ResolveQuery,
        GetAllQueriesInALecture,
        publishVideo,
        isNewMessage,
        setIsNewMessage,
        studentHasScreenSharePermission,
        studentsWithScreenSharePermissions,
        setStudentsWithScreenSharePermissions,
        disableChatForClass,
        setDisableChatForClass,
        isChatEnabled,
        setIsChatEnabled,
        isRecordingEnabled,
      }}
    >
      {props.children}
    </CommandContext.Provider>
  )
}
export default CommandContextProvider
