/* eslint-disable no-underscore-dangle */
import { useState, useEffect, useContext } from 'react'
import AgoraRTC from 'agora-rtc-sdk-ng'
import { useSnackbar } from 'notistack'
import { AuthContext } from '../../Context/AuthContext'
import { BatchContext } from '../../Context/BatchContext'
import { CommandContext } from '../../Context/CommandContext'
import showErrorSnackbar from '../../Components/Snackbar/errorSnackbar'
// import { getSecretAndSalt } from '../../Global/Functions'

export default function useAgoraRTC(
  client,
  AVState = {
    audio: true,
    video: true,
  },
  inputDeviceIds,
  appId,
  lectureId,
  RTCToken,
  screenShareToken,
  uid,
  // secret,
  // salt,
) {
  AgoraRTC.setLogLevel(process.env.REACT_APP_AGORA_RTC_LOG_LEVEL)
  const { authState } = useContext(AuthContext)
  const { batchByCode } = useContext(BatchContext)
  const { publishVideo } = useContext(CommandContext)
  const { enqueueSnackbar } = useSnackbar()

  const [localVideoTrack, setLocalVideoTrack] = useState(undefined)
  const [localAudioTrack, setLocalAudioTrack] = useState(undefined)

  const [joinState, setJoinState] = useState(false)

  const [isAudioMuted, setIsAudioMuted] = useState(false)

  const [isVideoMuted, setIsVideoMuted] = useState(false)

  const [isScreenShared, setIsScreenShared] = useState(false)

  const [remoteUsers, setRemoteUsers] = useState([])

  const [screenShareClient, setScreenShareClient] = useState(undefined)

  const [screenShareVideoTrack, setScreenShareVideoTrack] = useState(undefined)

  const [audioLoading, setAudioLoading] = useState(undefined)

  const [videoLoading, setVideoLoading] = useState(undefined)

  const [screenShareLoading, setScreenShareLoading] = useState(undefined)

  const [cameraPermission, setCameraPermission] = useState(true)

  // student video view

  const [networkQuality, setNetworkQuality] = useState(1)

  // UID
  const [clientUID, setClientUID] = useState('')
  const [screenShareUID, setScreenShareUID] = useState('')

  useEffect(() => {
    if (!joinState || authState.role === 'T') return
    if (!publishVideo) client.unpublish(localVideoTrack)
    else if (publishVideo && localVideoTrack._enabled)
      client.publish(localVideoTrack)
  }, [joinState, publishVideo, localVideoTrack?._enabled])

  async function createLocalVideoTrack(id = undefined) {
    const cameraTrack = await AgoraRTC.createCameraVideoTrack({
      encoderConfig:
        authState.role === 'T'
          ? {
              width: {
                ideal: 854,
                min: 640,
                max: 900,
              },
              height: {
                ideal: 480,
                min: 360,
                max: 506,
              },
              frameRate: 15,
              bitrateMax: 700,
              bitrateMin: 100,
            }
          : '180p_3',
      cameraId: id || inputDeviceIds.cameraId,
    })
    cameraTrack.on('track-ended', async () => {
      const cam = await AgoraRTC.getCameras()
      if (cam.length > 0 && !isVideoMuted) {
        const track = await createLocalVideoTrack(cam[0].id)
        setLocalVideoTrack(track)
      } else {
        setLocalVideoTrack(
          AgoraRTC.createCustomVideoTrack({
            mediaStreamTrack: createDummyStream().getVideoTracks()[0],
          }),
        )
        setIsVideoMuted(true)
      }
    })
    return cameraTrack
  }

  async function createLocalAudioTrack(id = undefined) {
    const microphoneTrack = await AgoraRTC.createMicrophoneAudioTrack({
      microphoneId: id || inputDeviceIds.microphoneId,
      AEC: true,
      ANS: true,
    })
    microphoneTrack.on('track-ended', async () => {
      const mic = await AgoraRTC.getMicrophones()
      if (mic.length > 0 && !isAudioMuted) {
        const track = await createLocalAudioTrack(mic[0].id)
        setLocalAudioTrack(track)
      } else {
        setLocalAudioTrack(
          AgoraRTC.createCustomAudioTrack({
            mediaStreamTrack: createDummyStream().getAudioTracks()[0],
          }),
        )
        setIsAudioMuted(true)
      }
    })
    return microphoneTrack
  }

  function createDummyCameraTrack(width = 640, height = 480) {
    const canvas = Object.assign(document.createElement('canvas'), {
      width,
      height,
    })
    canvas.getContext('2d').fillRect(0, 0, width, height)
    const stream = canvas.captureStream()
    return Object.assign(stream.getVideoTracks()[0], { enabled: false })
  }

  function createDummyAudioTrack() {
    const ctx = new AudioContext()
    const oscillator = ctx.createOscillator()
    const dst = oscillator.connect(ctx.createMediaStreamDestination())
    oscillator.start()
    return Object.assign(dst.stream.getAudioTracks()[0], { enabled: false })
  }

  function createDummyStream() {
    return new MediaStream([createDummyCameraTrack(), createDummyAudioTrack()])
  }

  function setLocalTracks(cameraTrack, microphoneTrack) {
    setLocalVideoTrack(cameraTrack)
    setLocalAudioTrack(microphoneTrack)
  }

  function switchVideoInput(deviceId) {
    if (!localVideoTrack) return
    localVideoTrack.setDevice(deviceId)
  }

  function switchAudioInput(deviceId) {
    if (!localAudioTrack) return
    localAudioTrack.setDevice(deviceId)
  }

  async function join() {
    if (!client) return
    let cameraTrack
    const microphoneTrack = await createLocalAudioTrack()
    try {
      cameraTrack = await createLocalVideoTrack()
      setLocalTracks(cameraTrack, microphoneTrack)
    } catch (err) {
      if (process.env.REACT_APP_MESSAGE_LOG_ENABLED) console.log(err, err.code)
      if (
        err.code === 'PERMISSION_DENIED' ||
        err.code === 'DEVICE_NOT_FOUND' ||
        err.code === 'UNEXPECTED_ERROR' ||
        err.code === 'NotReadableError'
      ) {
        cameraTrack = AgoraRTC.createCustomVideoTrack({
          mediaStreamTrack: createDummyStream().getVideoTracks()[0],
        })
        setLocalTracks(cameraTrack, microphoneTrack)
        setCameraPermission(false)
      }
    }

    if (!AVState.video || !cameraPermission) {
      setIsVideoMuted(true)
    }

    if (!AVState.audio) {
      setIsAudioMuted(true)
    }

    cameraTrack.on('track-ended', () => {
      cameraTrack.stop()
      cameraTrack.close()
    })

    microphoneTrack.on('track-ended', () => {
      microphoneTrack.stop()
      microphoneTrack.close()
    })
    // const [decodedSecret, decodedSalt] = getSecretAndSalt(secret, salt)
    // client.setEncryptionConfig('aes-256-gcm2', decodedSecret, decodedSalt)
    await client.join(appId, lectureId, RTCToken, uid)
    setClientUID(client._joinInfo.uid)
    await client.publish([microphoneTrack, cameraTrack])

    if (!AVState.audio) microphoneTrack.setEnabled(false)
    if (!AVState.video || !cameraPermission) cameraTrack.setEnabled(false)
    setJoinState(true)
    setAudioLoading(false)
    setVideoLoading(false)
    setScreenShareLoading(false)
  }

  async function leave() {
    if (!joinState) return
    if (localAudioTrack) {
      localAudioTrack.stop()
      localAudioTrack.close()
    }
    if (localVideoTrack) {
      localVideoTrack.stop()
      localVideoTrack.close()
    }
    setRemoteUsers([])
    setJoinState(false)
    if (screenShareClient) {
      await screenShareClient.leave()
    }
    await client.leave()
  }

  async function muteAudio() {
    setAudioLoading(true)
    if (!localAudioTrack) return
    await localAudioTrack.setEnabled(false)
    setAudioLoading(false)
    setIsAudioMuted(true)
  }

  async function hideVideo() {
    setVideoLoading(true)
    if (localVideoTrack === undefined || localVideoTrack === null) return
    await localVideoTrack.setEnabled(false)
    setInterval(() => {
      setVideoLoading(false)
    }, 400)
    setIsVideoMuted(true)
  }

  async function unmuteAudio() {
    setAudioLoading(true)
    if (localAudioTrack === undefined || localAudioTrack === null) return
    localAudioTrack.setEnabled(true)
    setAudioLoading(false)
    setIsAudioMuted(false)
  }

  async function showVideo() {
    setVideoLoading(true)
    if (!localVideoTrack) return
    localVideoTrack.setEnabled(true)
    setInterval(() => {
      setVideoLoading(false)
    }, 400)
    setIsVideoMuted(false)
  }

  async function studentShareScreen() {
    if (!client) return
    const screenVideoTrack = await AgoraRTC.createScreenVideoTrack(
      { optimizationMode: 'balanced', encoderConfig: '720p_3' },
      'disable',
    )
    if (localVideoTrack) {
      localVideoTrack.setEnabled(false)
      setIsVideoMuted(true)
    }
    await client.unpublish(localVideoTrack)
    setLocalVideoTrack(screenVideoTrack)
    await client.publish(screenVideoTrack)
    setIsScreenShared(true)
    // Handles toolbar stop event
    screenVideoTrack.on('track-ended', async () => {
      const cameraTrack = await createLocalVideoTrack()
      setLocalVideoTrack(cameraTrack)
      await client.unpublish(screenVideoTrack)
      await client.publish(cameraTrack)
      if (isVideoMuted) {
        cameraTrack.setEnabled(false)
      }
      screenVideoTrack.stop()
      screenVideoTrack.close()
      setIsScreenShared(false)
    })
  }

  async function stopStudentShareScreen() {
    if (!client) return
    const cameraTrack = await createLocalVideoTrack()
    cameraTrack.on('track-ended', () => {
      cameraTrack.stop()
      cameraTrack.close()
    })
    await client.unpublish(localVideoTrack)
    await client.publish(cameraTrack)
    if (isVideoMuted) {
      cameraTrack.setEnabled(false)
    }
    await localVideoTrack.stop()
    await localVideoTrack.close()
    setLocalVideoTrack(cameraTrack)
    setIsScreenShared(false)
  }

  async function shareScreen() {
    setScreenShareLoading(true)
    if (!screenShareClient) {
      const screenClient = AgoraRTC.createClient({
        mode: 'rtc',
        codec: 'vp8',
      })
      setScreenShareClient(screenClient)
      // const [decodedSecret, decodedSalt] = getSecretAndSalt(secret, salt)
      // screenClient.setEncryptionConfig(
      //   'aes-256-gcm2',
      //   decodedSecret,
      //   decodedSalt,
      // )
      await screenClient.join(
        appId,
        lectureId,
        screenShareToken,
        `${uid}-screen-share`,
      )
      setScreenShareUID(screenClient._joinInfo.uid)
      AgoraRTC.createScreenVideoTrack(
        {
          optimizationMode: 'balanced',
          encoderConfig: {
            width: {
              ideal: 1280,
              max: 1920,
            },
            height: {
              ideal: 720,
              max: 1080,
            },
            frameRate: 15,
            bitrateMax: 700,
            bitrateMin: 100,
          },
        },
        'disable',
      )
        .then(async (screenVideoTrack) => {
          setScreenShareVideoTrack(screenVideoTrack)
          await screenClient.publish(screenVideoTrack)
          setIsScreenShared(true)
          setScreenShareLoading(false)
          // Handles toolbar stop event
          screenVideoTrack.on('track-ended', async () => {
            await screenClient.unpublish(screenVideoTrack)
            screenVideoTrack.stop()
            screenVideoTrack.close()
            setIsScreenShared(false)
          })
        })
        .catch((err) => {
          if (err.code === 'PERMISSION_DENIED') {
            showErrorSnackbar(
              enqueueSnackbar,
              'You need to select a window for screenshare!',
            )
          }
          setScreenShareLoading(false)
        })
    } else {
      AgoraRTC.createScreenVideoTrack(
        { optimizationMode: 'balanced', encoderConfig: '720p_3' },
        'disable',
      )
        .then(async (screenVideoTrack) => {
          setScreenShareVideoTrack(screenVideoTrack)
          await screenShareClient.publish(screenVideoTrack)
          setIsScreenShared(true)
          setScreenShareLoading(false)
          // Handles toolbar stop event
          screenVideoTrack.on('track-ended', async () => {
            await screenShareClient.unpublish(screenVideoTrack)
            screenVideoTrack.stop()
            screenVideoTrack.close()
            setIsScreenShared(false)
          })
        })
        .catch((err) => {
          if (err.code === 'PERMISSION_DENIED') {
            showErrorSnackbar(
              enqueueSnackbar,
              'You need to select a window for screenshare!',
            )
          }
          setScreenShareLoading(false)
        })
    }
  }

  async function stopShareScreen() {
    if (!screenShareClient) return
    await screenShareClient.unpublish(screenShareVideoTrack)
    await screenShareVideoTrack.stop()
    await screenShareVideoTrack.close()
    setIsScreenShared(false)
  }

  useEffect(() => {
    if (!client) return
    setRemoteUsers(client.remoteUsers)

    const handleUserPublished = async (user, mediaType) => {
      switch (authState.role) {
        case 'T': {
          if (
            user.uid !== `${batchByCode.owner}-screen-share` &&
            user.uid !== batchByCode.owner
          )
            await client.subscribe(user, mediaType)
          break
        }
        case 'S': {
          if (
            batchByCode.owner === user.uid ||
            user.uid === `${batchByCode.owner}-screen-share`
          ) {
            await client.subscribe(user, mediaType)
          } else {
            await client.subscribe(user, 'audio')
          }
          break
        }
        default:
          break
      }
      setRemoteUsers(() => Array.from(client.remoteUsers))
    }
    const handleUserUnpublished = () => {
      setRemoteUsers(() => Array.from(client.remoteUsers))
    }
    const handleUserJoined = () => {
      setRemoteUsers(() => Array.from(client.remoteUsers))
    }
    const handleUserLeft = () => {
      setRemoteUsers(() => Array.from(client.remoteUsers))
    }
    const handleNetworkQualityChange = ({
      uplinkNetworkQuality,
      downlinkNetworkQuality,
    }) => {
      setNetworkQuality(
        uplinkNetworkQuality > downlinkNetworkQuality
          ? uplinkNetworkQuality
          : downlinkNetworkQuality,
      )
    }
    client.on('user-published', handleUserPublished)
    client.on('user-unpublished', handleUserUnpublished)
    client.on('user-joined', handleUserJoined)
    client.on('user-left', handleUserLeft)
    client.on('network-quality', handleNetworkQualityChange)

    return () => {
      client.off('user-published', handleUserPublished)
      client.off('user-unpublished', handleUserUnpublished)
      client.off('user-joined', handleUserJoined)
      client.off('user-left', handleUserLeft)
      client.off('network-quality', handleNetworkQualityChange)
    }
  }, [client, batchByCode])

  return {
    localAudioTrack,
    localVideoTrack,
    joinState,
    leave,
    join,
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
    createLocalAudioTrack,
    createLocalVideoTrack,
    screenShareVideoTrack,
    audioLoading,
    videoLoading,
    screenShareLoading,
    createDummyStream,
    networkQuality,
    studentShareScreen,
    stopStudentShareScreen,
    switchVideoInput,
    switchAudioInput,
    clientUID,
    screenShareUID,
  }
}
