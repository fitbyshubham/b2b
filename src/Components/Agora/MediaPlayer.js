import { Avatar, Chip } from '@material-ui/core'
import React, { useRef, useEffect, useState, useLayoutEffect } from 'react'

import MicIcon from '@material-ui/icons/Mic'
import MicOffIcon from '@material-ui/icons/MicOff'
import TeacherVideoAdminControls from './TeacherVideoAdminControls'
import ScreenShareDisplay from './ScreenShareDisplay'
import profilePlaceholder from '../../Assets/Images/profilePlaceholder.svg'
import { debounce } from '../../Global/Functions'

const MediaPlayer = ({
  videoTrack,
  audioTrack,
  trackType,
  style,
  uid,
  sendCommandToSpecificUser,
  role,
  isVideoEnabled,
  isAudioEnabled,
  name,
  stopScreenShare,
  isScreenShared,
  profilePic,
  pinVideo,
  unpinVideo,
  pinnedUserUid,
  showName = true,
  showChip = true,
}) => {
  const container = useRef(null)
  const targetRef = useRef()
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 })
  const [showScreenSharePanel, setShowScreenSharePanel] =
    useState(isScreenShared)

  const updateDimension = () => {
    if (targetRef.current) {
      setDimensions({
        width: targetRef.current.offsetWidth,
        height: targetRef.current.offsetHeight,
      })
    }
  }

  useEffect(() => {
    updateDimension()
  }, [style.width])

  useLayoutEffect(() => {
    updateDimension()
  }, [])

  window.addEventListener('resize', () => {
    debounce(() => updateDimension())
  })

  useEffect(() => {
    setShowScreenSharePanel(isScreenShared)
  }, [isScreenShared])

  useEffect(() => {
    if (!container.current) return
    videoTrack?.play(container.current)
    return () => {
      videoTrack?.stop()
    }
  }, [container, videoTrack])
  useEffect(() => {
    if (trackType !== 'local') audioTrack?.play()
    return () => {
      audioTrack?.stop()
    }
  }, [audioTrack, trackType])

  return (
    <div
      ref={targetRef}
      style={{
        width: style.width !== undefined ? style.width : '100%',
        height: style.height !== undefined ? style.height : '100%',
      }}
    >
      {!isVideoEnabled && (
        <div
          style={{ ...style, backgroundColor: '#424242' }}
          className="media-player"
        >
          <TeacherVideoAdminControls
            role={role}
            trackType={trackType}
            isAudioEnabled={isAudioEnabled}
            isVideoEnabled={isVideoEnabled}
            sendCommandToSpecificUser={sendCommandToSpecificUser}
            uid={uid}
            pinVideo={pinVideo}
            unpinVideo={unpinVideo}
            pinnedUserUid={pinnedUserUid}
          />
          <div
            style={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              width: '20%',
            }}
          >
            <Avatar
              src={profilePic || profilePlaceholder}
              style={{
                width:
                  dimensions.width < 900
                    ? dimensions.width < 500
                      ? dimensions.width < 200
                        ? 40
                        : 80
                      : 100
                    : 180,
                height:
                  dimensions.width < 900
                    ? dimensions.width < 500
                      ? dimensions.width < 200
                        ? 40
                        : 80
                      : 100
                    : 180,
                maxWidth: 180,
                objectFit: 'cover',
              }}
            />
            {showName && (
              <p
                style={{
                  fontWeight: 600,
                  fontSize: '1.25rem',
                  color: '#fff',
                  marginTop: '1rem',
                  textAlign: 'center',
                }}
              >
                {name}
              </p>
            )}
          </div>
          {showChip && (
            <Chip
              label={
                trackType === 'local'
                  ? `You - ${name}`
                  : pinnedUserUid === uid
                  ? `${name} - Pinned`
                  : name
              }
              icon={
                isAudioEnabled ? (
                  <MicIcon style={{ color: '#fff' }} />
                ) : (
                  <MicOffIcon style={{ color: '#fff' }} />
                )
              }
              size="small"
              style={{
                backgroundColor: '#424242',
                borderRadius: 4,
                position: 'absolute',
                left: 15,
                bottom: 3,
                zIndex: 999,
                color: '#fff',
                maxWidth: 'calc(100% - 30px)',
              }}
            />
          )}
        </div>
      )}

      {isVideoEnabled && showScreenSharePanel && (
        <div style={{ ...style }}>
          <ScreenShareDisplay
            stopScreenShare={stopScreenShare}
            dimensions={dimensions}
          />
        </div>
      )}

      <div
        ref={container}
        style={isVideoEnabled && !showScreenSharePanel ? style : { height: 0 }}
        className="media-player"
      >
        {isVideoEnabled && !showScreenSharePanel && (
          <TeacherVideoAdminControls
            role={role}
            trackType={trackType}
            isAudioEnabled={isAudioEnabled}
            isVideoEnabled={isVideoEnabled}
            sendCommandToSpecificUser={sendCommandToSpecificUser}
            uid={uid}
            pinVideo={pinVideo}
            unpinVideo={unpinVideo}
            pinnedUserUid={pinnedUserUid}
          />
        )}
        {showChip && (
          <Chip
            label={
              trackType === 'local'
                ? `You - ${name}`
                : pinnedUserUid === uid
                ? `${name} - Pinned`
                : name
            }
            icon={
              isAudioEnabled ? (
                <MicIcon style={{ color: '#fff' }} />
              ) : (
                <MicOffIcon style={{ color: '#fff' }} />
              )
            }
            size="small"
            style={
              isVideoEnabled
                ? {
                    backgroundColor: '#424242',
                    borderRadius: 4,
                    position: 'absolute',
                    left: 15,
                    bottom: 3,
                    zIndex: 999,
                    color: '#fff',
                    maxWidth: 'calc(100% - 30px)',
                  }
                : { display: 'none' }
            }
          />
        )}
      </div>
    </div>
  )
}

export default MediaPlayer
