import AgoraRTC from 'agora-rtc-sdk-ng'
import React, { createContext, useEffect, useRef, useState } from 'react'
import useAgoraRTC from '../Hooks/Agora/useAgoraRTC'

export const AgoraContext = createContext()

const AgoraContextProvider = (props) => {
  const [inputDeviceIds, setInputDeviceIds] = useState({
    cameraId: '',
    microphoneId: '',
  })
  const { createLocalVideoTrack, createLocalAudioTrack } = useAgoraRTC(
    undefined,
    undefined,
    inputDeviceIds,
  )

  const [unreadMessage, setUnreadMessage] = useState(false)

  const [allCameras, setAllCameras] = useState([])
  const [allMicrophones, setAllMicrophones] = useState([])
  const [testVolumeLevel, setTestVolumeLevel] = useState(0)
  const [localMediaTrack, setLocalMediaTrack] = useState({
    localAudioTrack: undefined,
    localVideoTrack: undefined,
  })

  const [speakerUid, setSpeakerUid] = useState(undefined)
  const [isLiveBoardActive, setIsLiveBoardActive] = useState(false)

  const [hasAudioPermission, setHasAudioPermission] = useState(true)

  const [currentSpeakers, setCurrentSpeakers] = useState([])

  const [giveAVPermissionToStudent, setGiveAVPermissionToStudent] =
    useState(true)

  const [hasCameraPermissions, setHasCameraPermissions] = useState(true)

  const volTimeout = useRef(null)

  const clearResources = () => {
    if (localMediaTrack.localVideoTrack) {
      localMediaTrack.localVideoTrack.stop()
      localMediaTrack.localVideoTrack.close()
    }
    if (localMediaTrack.localAudioTrack) {
      localMediaTrack.localAudioTrack.stop()
      localMediaTrack.localAudioTrack.close()
    }
    clearTimeout(volTimeout.current)
  }

  useEffect(() => {
    try {
      if (localMediaTrack.localVideoTrack) {
        localMediaTrack.localVideoTrack.stop()
        localMediaTrack.localVideoTrack.close()
      }
    } catch (err) {
      // do something
    }
  }, [inputDeviceIds.cameraId])

  useEffect(() => {
    try {
      if (localMediaTrack.localAudioTrack) {
        localMediaTrack.localAudioTrack.stop()
        localMediaTrack.localAudioTrack.close()
      }
    } catch (err) {
      // do something
    }
  }, [inputDeviceIds.microphoneId])

  AgoraRTC.onMicrophoneChanged = async () => {
    await GetMicrophones()
  }

  AgoraRTC.onCameraChanged = async () => {
    await GetCameras()
  }

  const GetCameraStream = async (id = '') => {
    if (id !== '' || inputDeviceIds.cameraId !== '') {
      try {
        const videoTrack = await createLocalVideoTrack(
          id || inputDeviceIds.cameraId,
        )
        setLocalMediaTrack((mediaTracks) => ({
          ...mediaTracks,
          localVideoTrack: videoTrack,
        }))
      } catch (err) {
        if (err.code === 'UNEXPECTED_ERROR') {
          const cam = await GetCameras()
          setAllCameras(cam)
          const videoTrack = await createLocalVideoTrack(cam[0].id)
          setLocalMediaTrack((mediaTracks) => ({
            ...mediaTracks,
            localVideoTrack: videoTrack,
          }))
          SetCameraId(cam[0].id)
        }
      }
    }
  }

  const GetMicrophoneStream = async (id = '') => {
    if (id !== '' || inputDeviceIds.microphoneId !== '') {
      try {
        const audioTrack = await createLocalAudioTrack(
          id || inputDeviceIds.microphoneId,
        )
        volTimeout.current = setInterval(() => {
          if (audioTrack !== undefined) {
            const val = audioTrack.getVolumeLevel() * 100
            setTestVolumeLevel(val)
          } else {
            setTestVolumeLevel(0)
          }
        }, 250)
        setLocalMediaTrack((mediaTracks) => ({
          ...mediaTracks,
          localAudioTrack: audioTrack,
        }))
      } catch (err) {
        if (err.code === 'UNEXPECTED_ERROR') {
          const mic = await GetMicrophones()
          setAllMicrophones(mic)
          const audioTrack = await createLocalAudioTrack(mic[0].id)
          setLocalMediaTrack((mediaTracks) => ({
            ...mediaTracks,
            localVideoTrack: audioTrack,
          }))
          SetMicrophoneId(mic[0].id)
        }
      }
    }
  }

  const GetCameras = async () => {
    try {
      let cameras = await AgoraRTC.getCameras()
      cameras = cameras.map((camera) => ({
        ...camera,
        id: camera.deviceId,
        title: camera.label || 'No Name',
      }))
      setAllCameras(cameras)
      return cameras
    } catch (err) {
      if (
        err.code === 'PERMISSION_DENIED' ||
        err.code === 'ENUMERATE_DEVICES_FAILED' ||
        err.code === 'DEVICE_NOT_FOUND'
      )
        setHasCameraPermissions(false)
      return undefined
    }
  }

  const GetMicrophones = async () => {
    try {
      let microphones = await AgoraRTC.getMicrophones()
      microphones = microphones.map((microphone) => ({
        ...microphone,
        id: microphone.deviceId,
        title: microphone.label || 'No Name',
      }))
      setAllMicrophones(microphones)
      return microphones
    } catch (err) {
      if (err.code === 'PERMISSION_DENIED') setHasAudioPermission(false)
    }
  }

  const SetCameraId = (id) => {
    setInputDeviceIds({
      ...inputDeviceIds,
      cameraId: id,
    })
  }

  const SetMicrophoneId = (id) => {
    setInputDeviceIds({
      ...inputDeviceIds,
      microphoneId: id,
    })
  }

  return (
    <AgoraContext.Provider
      value={{
        GetCameras,
        GetMicrophones,
        SetCameraId,
        SetMicrophoneId,
        inputDeviceIds,
        setInputDeviceIds,
        allCameras,
        allMicrophones,
        testVolumeLevel,
        setTestVolumeLevel,
        localMediaTrack,
        setLocalMediaTrack,
        clearResources,
        GetCameraStream,
        GetMicrophoneStream,
        speakerUid,
        setSpeakerUid,
        isLiveBoardActive,
        setIsLiveBoardActive,
        volTimeout,
        hasAudioPermission,
        setHasAudioPermission,
        currentSpeakers,
        setCurrentSpeakers,
        unreadMessage,
        setUnreadMessage,
        giveAVPermissionToStudent,
        setGiveAVPermissionToStudent,
        hasCameraPermissions,
      }}
    >
      {props.children}
    </AgoraContext.Provider>
  )
}

export default AgoraContextProvider
