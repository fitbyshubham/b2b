/* eslint-disable no-underscore-dangle */
import { IconButton, makeStyles, Popover } from '@material-ui/core'
import React, { useContext, useEffect, useRef, useState } from 'react'
import MicIcon from '@material-ui/icons/Mic'
import MicOffIcon from '@material-ui/icons/MicOff'
import { Rnd } from 'react-rnd'
import { AgoraContext } from '../../Context/AgoraContext'
import { AuthContext } from '../../Context/AuthContext'
import { BatchContext } from '../../Context/BatchContext'
import { CommandContext } from '../../Context/CommandContext'
import useWindowDimensions from '../../Hooks/useWindowDimensions'
import GrantAVPermissionStudent from './GrantAVPermissionStudent'
import MediaPlayer from './MediaPlayer'
import WaitForTeacher from './WaitForTeacher'
import minimize from '../../Assets/Images/minimize.svg'
import maximize from '../../Assets/Images/maximize.svg'
import RegularTooltip from '../Tooltips/RegularTooltip'

const useStyles = makeStyles({
  videoContainer: {
    width: '100%',
    height: '100%',
    display: 'flex',
    flexWrap: 'wrap',
    overflow: 'hidden',
    position: 'relative',
  },
  nullElement: {
    position: 'absolute',
    bottom: 170,
    left: 16,
  },
  minMaxContainer: {
    backgroundColor: '#424242',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 4,
    borderBottomLeftRadius: 8,
    borderBottomRightRadius: 8,
  },
  maxMinIcon: {
    padding: 0,
    zIndex: 9999999999,
    backgroundColor: '#e5e5e5',
  },
  heightTransition: {
    transition: 'height ease-out 0.2s',
  },
  chip: {
    display: 'flex',
    justifyContent: 'flex-start',
    alignItems: 'center',
    flexWrap: 'nowrap',
    marginRight: 8,
  },
  videoName: {
    color: '#fff',
    fontSize: '0.8rem',
  },
})

const StudentVideoContainer = ({
  remoteUsers,
  localAudioTrack,
  localVideoTrack,
  isAudioMuted,
  isVideoMuted,
  sendCommandToSpecificUser,
  isScreenShared,
  stopScreenShare,
}) => {
  const classes = useStyles()
  const { width } = useWindowDimensions()
  const [studentVideoDimensions, setStudentVideoDimensions] = useState({
    height: 180,
    width: 180,
    prevHeight: 0,
  })
  const [teacherVideoDimensions, setTeacherVideoDimensions] = useState({
    height: 180,
    width: 320,
    prevHeight: 0,
  })
  const [studentPosition] = useState({
    x: 0,
    y: 0,
  })
  const [teacherPosition] = useState({
    x: width - teacherVideoDimensions.width,
    y: 0,
  })
  const anchor = useRef()
  const { batchByCode, allBatchStudents } = useContext(BatchContext)
  const { authState } = useContext(AuthContext)
  const { currentSpeakers } = useContext(AgoraContext)

  const {
    permissionRequest,
    setPermissionRequest,
    studentHasScreenSharePermission,
  } = useContext(CommandContext)

  useEffect(() => {
    if (!studentHasScreenSharePermission) stopScreenShare()
  }, [studentHasScreenSharePermission])

  useEffect(() => {
    const user = remoteUsers.find((u) => u.uid === batchByCode.owner)
    if (user === undefined) setPermissionRequest(false)
  }, [remoteUsers])

  const isMinimized = (role) => {
    if (role === 'T') {
      if (teacherVideoDimensions.height === 0) return true
      return false
    }
    if (role === 'S') {
      if (studentVideoDimensions.height === 0) return true
      return false
    }
  }

  const minimizeVideo = (role) => {
    if (role === 'T') {
      setTeacherVideoDimensions((dim) => ({
        ...dim,
        height: 0,
        prevHeight: dim.height,
      }))
    } else if (role === 'S') {
      setStudentVideoDimensions((dim) => ({
        ...dim,
        height: 0,
        prevHeight: dim.height,
      }))
    }
  }

  const maximizeVideo = (role) => {
    if (role === 'T') {
      setTeacherVideoDimensions((dim) => ({
        ...dim,
        height: dim.prevHeight,
      }))
    } else if (role === 'S') {
      setStudentVideoDimensions((dim) => ({
        ...dim,
        height: dim.prevHeight,
      }))
    }
  }

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

  const getMainDisplayContent = () => {
    const screenVal = remoteUsers.find(
      (user) => user.uid === `${batchByCode.owner}-screen-share`,
    )
    const val = remoteUsers.find((user) => user.uid === batchByCode.owner)
    if (screenVal && screenVal.hasVideo) {
      return (
        <div className={classes.videoContainer}>
          {/* Main Video - ScreenShare */}
          <MediaPlayer
            videoTrack={screenVal.videoTrack}
            trackType="remote"
            name={`${batchByCode.owner_name} - Screenshare`}
            key={`${batchByCode.owner}-screen-share`}
            uid={`${batchByCode.owner}-screen-share`}
            isVideoEnabled={screenVal.hasVideo}
            isAudioEnabled={screenVal.hasAudio}
            style={{
              width: '100%',
              height: '100%',
              position: 'relative',
              margin: 'auto auto',
            }}
          />
          {/* Student's video */}
          {localVideoTrack._enabled && !isScreenShared && (
            <Rnd
              default={{
                width: studentVideoDimensions.width,
                height: studentVideoDimensions.height,

                x: studentPosition.x,
                y: studentPosition.y,
              }}
              size={{
                width: studentVideoDimensions.width,
                height: studentVideoDimensions.height,
              }}
              bounds="parent"
              lockAspectRatio
              onResizeStop={(e, dir, ref) => {
                setStudentVideoDimensions({
                  width: ref.style.width,
                  height: ref.style.height,
                })
              }}
              enableResizing={!isMinimized('S')}
              className={classes.heightTransition}
            >
              <MediaPlayer
                videoTrack={localVideoTrack}
                audioTrack={localAudioTrack}
                trackType="local"
                profilePic={authState.avatar}
                name={authState.name}
                key={authState.user_id}
                uid={authState.user_id}
                isVideoEnabled={isScreenShared ? true : !isVideoMuted}
                isAudioEnabled={!isAudioMuted}
                style={{
                  width: '100%',
                  height: '100%',
                  boxShadow: '2px 4px 6px 2px rgb(0 0 0 / 6%)',
                  position: 'relative',
                }}
                showName={false}
                showChip={false}
              />
              <div className={classes.minMaxContainer}>
                <p className={classes.chip}>
                  {localAudioTrack._enabled ? (
                    <MicIcon
                      style={{ color: '#fff', marginRight: 8, marginLeft: 4 }}
                      fontSize="small"
                    />
                  ) : (
                    <MicOffIcon
                      style={{ color: '#fff', marginRight: 8, marginLeft: 4 }}
                      fontSize="small"
                    />
                  )}
                  <span
                    className={classes.videoName}
                  >{`You - ${authState.name}`}</span>
                </p>
                {!isMinimized('S') && (
                  <RegularTooltip placement="right" title="Minimize Video">
                    <IconButton
                      className={classes.maxMinIcon}
                      onClick={() => minimizeVideo('S')}
                    >
                      <img
                        src={minimize}
                        alt="minimize"
                        width="32"
                        height="32"
                      />
                    </IconButton>
                  </RegularTooltip>
                )}
                {isMinimized('S') && (
                  <RegularTooltip placement="right" title="Maximize Video">
                    <IconButton
                      className={classes.maxMinIcon}
                      onClick={() => maximizeVideo('S')}
                    >
                      <img
                        src={maximize}
                        alt="maximize"
                        width="32"
                        height="32"
                      />
                    </IconButton>
                  </RegularTooltip>
                )}
              </div>
            </Rnd>
          )}
          {/* Teacher's video */}
          {val && (val.hasAudio || val.hasVideo) && (
            <Rnd
              default={{
                x: teacherPosition.x,
                y: teacherPosition.y,
                width: teacherVideoDimensions.width,
                height: teacherVideoDimensions.height,
              }}
              bounds="parent"
              lockAspectRatio
              size={{
                width: teacherVideoDimensions.width,
                height: teacherVideoDimensions.height,
              }}
              onResizeStop={(e, dir, ref) => {
                setTeacherVideoDimensions({
                  width: ref.style.width,
                  height: ref.style.height,
                })
              }}
              enableResizing={!isMinimized('T')}
              className={classes.heightTransition}
            >
              <MediaPlayer
                videoTrack={val.videoTrack}
                audioTrack={val.audioTrack}
                trackType="remote"
                name={batchByCode.owner_name}
                key={batchByCode.owner}
                profilePic={batchByCode.owner_avatar}
                isVideoEnabled={val.hasVideo}
                isAudioEnabled={val.hasAudio}
                uid={batchByCode.owner}
                style={{
                  width: '100%',
                  height: '100%',
                  boxShadow: '2px 4px 6px 2px rgb(0 0 0 / 6%)',
                  position: 'relative',
                }}
                showName={false}
                showChip={false}
              />
              <div className={classes.minMaxContainer}>
                <p className={classes.chip}>
                  {val.hasAudio ? (
                    <MicIcon
                      style={{ color: '#fff', marginRight: 8, marginLeft: 4 }}
                      fontSize="small"
                    />
                  ) : (
                    <MicOffIcon
                      style={{ color: '#fff', marginRight: 8, marginLeft: 4 }}
                      fontSize="small"
                    />
                  )}
                  <span
                    className={classes.videoName}
                  >{`${batchByCode.owner_name}`}</span>
                </p>
                {!isMinimized('T') && (
                  <RegularTooltip placement="right" title="Minimize Video">
                    <IconButton
                      className={classes.maxMinIcon}
                      onClick={() => minimizeVideo('T')}
                    >
                      <img
                        src={minimize}
                        alt="minimize"
                        width="32"
                        height="32"
                      />
                    </IconButton>
                  </RegularTooltip>
                )}
                {isMinimized('T') && (
                  <RegularTooltip placement="right" title="Maximize Video">
                    <IconButton
                      className={classes.maxMinIcon}
                      onClick={() => maximizeVideo('T')}
                    >
                      <img
                        src={maximize}
                        alt="maximize"
                        width="32"
                        height="32"
                      />
                    </IconButton>
                  </RegularTooltip>
                )}
              </div>
            </Rnd>
          )}

          {remoteUsers.map((user) => {
            if (
              currentSpeakers.includes(user.uid) &&
              user.uid !== `${batchByCode.owner}-screen-share` &&
              user.uid !== batchByCode.owner
            ) {
              return (
                <MediaPlayer
                  videoTrack={user.videoTrack}
                  audioTrack={user.audioTrack}
                  trackType="remote"
                  name={getName(user.uid)}
                  uid={user.uid}
                  key={user.uid}
                  sendCommandToSpecificUser={sendCommandToSpecificUser}
                  isVideoEnabled={false}
                  isAudioEnabled={user.hasAudio}
                  role={authState.role}
                  style={{
                    width: 0,
                    height: 0,
                    position: 'relative',
                    margin: 'auto auto',
                    display: 'none',
                  }}
                />
              )
            }
            return <></>
          })}
          {remoteUsers.map(
            (user) =>
              user.hasAudio &&
              user.uid !== `${batchByCode.owner}-screen-share` &&
              user.uid !== batchByCode.owner &&
              !currentSpeakers.includes(user.uid) && (
                <MediaPlayer
                  videoTrack={user.videoTrack}
                  audioTrack={user.audioTrack}
                  trackType="remote"
                  name={getName(user.uid)}
                  uid={user.uid}
                  key={user.uid}
                  sendCommandToSpecificUser={sendCommandToSpecificUser}
                  isVideoEnabled={false}
                  isAudioEnabled={user.hasAudio}
                  role={authState.role}
                  style={{
                    width: 0,
                    height: 0,
                    position: 'relative',
                    margin: 'auto auto',
                    display: 'none',
                  }}
                />
              ),
          )}
        </div>
      )
    }
    if (val) {
      return (
        <div className={classes.videoContainer}>
          <MediaPlayer
            videoTrack={val.videoTrack}
            audioTrack={val.audioTrack}
            trackType="remote"
            name={batchByCode.owner_name}
            key={batchByCode.owner}
            uid={batchByCode.owner}
            profilePic={batchByCode.owner_avatar}
            isVideoEnabled={val.hasVideo}
            isAudioEnabled={val.hasAudio}
            style={{
              width: '100%',
              height: '100%',
              position: 'relative',
              margin: 'auto auto',
            }}
          />
          {localVideoTrack._enabled && !isScreenShared && (
            <Rnd
              default={{
                width: studentVideoDimensions.width,
                height: studentVideoDimensions.height,

                x: studentPosition.x,
                y: studentPosition.y,
              }}
              bounds="parent"
              lockAspectRatio
            >
              <MediaPlayer
                videoTrack={localVideoTrack}
                audioTrack={localAudioTrack}
                trackType="local"
                profilePic={authState.avatar}
                isScreenShared={isScreenShared}
                name={authState.name}
                key={authState.user_id}
                uid={authState.user_id}
                isVideoEnabled={isScreenShared ? true : !isVideoMuted}
                isAudioEnabled={!isAudioMuted}
                style={{
                  width: '100%',
                  height: '100%',
                  boxShadow: '2px 4px 6px 2px rgb(0 0 0 / 6%)',
                }}
              />
            </Rnd>
          )}

          {remoteUsers.map((user) => {
            if (
              currentSpeakers.includes(user.uid) &&
              user.uid !== batchByCode.owner &&
              user.uid !== `${batchByCode.owner}-screen-share`
            ) {
              return (
                <MediaPlayer
                  videoTrack={user.videoTrack}
                  audioTrack={user.audioTrack}
                  trackType="remote"
                  name={getName(user.uid)}
                  uid={user.uid}
                  key={user.uid}
                  sendCommandToSpecificUser={sendCommandToSpecificUser}
                  isVideoEnabled={false}
                  isAudioEnabled={user.hasAudio}
                  role={authState.role}
                  style={{
                    width: 0,
                    height: 0,
                    position: 'relative',
                    margin: 'auto auto',
                    display: 'none',
                  }}
                />
              )
            }
            return <></>
          })}
          {remoteUsers.map(
            (user) =>
              user.hasAudio &&
              user.uid !== batchByCode.owner &&
              user.uid !== `${batchByCode.owner}-screen-share` &&
              !currentSpeakers.includes(user.uid) && (
                <MediaPlayer
                  videoTrack={user.videoTrack}
                  audioTrack={user.audioTrack}
                  trackType="remote"
                  name={getName(user.uid)}
                  uid={user.uid}
                  key={user.uid}
                  sendCommandToSpecificUser={sendCommandToSpecificUser}
                  isVideoEnabled={false}
                  isAudioEnabled={user.hasAudio}
                  role={authState.role}
                  style={{
                    width: 0,
                    height: 0,
                    position: 'relative',
                    margin: 'auto auto',
                    display: 'none',
                  }}
                />
              ),
          )}
        </div>
      )
    }
    return (
      <div className={classes.videoContainer}>
        {localVideoTrack._enabled && !isScreenShared && (
          <Rnd
            default={{
              width: studentVideoDimensions.width,
              height: studentVideoDimensions.height,

              x: studentPosition.x,
              y: studentPosition.y,
            }}
            bounds="parent"
            lockAspectRatio
          >
            <MediaPlayer
              videoTrack={localVideoTrack}
              audioTrack={localAudioTrack}
              trackType="local"
              profilePic={authState.avatar}
              isScreenShared={isScreenShared}
              name={authState.name}
              key={authState.user_id}
              uid={authState.user_id}
              isVideoEnabled={!isVideoMuted}
              isAudioEnabled={!isAudioMuted}
              style={{
                width: '100%',
                height: '100%',
                boxShadow: '2px 4px 6px 2px rgb(0 0 0 / 6%)',
              }}
            />
          </Rnd>
        )}

        <WaitForTeacher />
        {remoteUsers.map(
          (user) =>
            user.hasAudio &&
            user.uid !== `${batchByCode.owner}-screen-share` &&
            user.uid !== batchByCode.owner && (
              <MediaPlayer
                videoTrack={user.videoTrack}
                audioTrack={user.audioTrack}
                trackType="remote"
                name={getName(user.uid)}
                uid={user.uid}
                key={user.uid}
                sendCommandToSpecificUser={sendCommandToSpecificUser}
                isVideoEnabled={false}
                isAudioEnabled={user.hasAudio}
                role={authState.role}
                style={{
                  width: 0,
                  height: 0,
                  position: 'relative',
                  margin: 'auto auto',
                  display: 'none',
                }}
              />
            ),
        )}
      </div>
    )
  }

  return (
    <>
      {getMainDisplayContent()}
      <div className={classes.nullElement} ref={anchor}></div>
      <Popover open={permissionRequest.audio} anchorEl={anchor.current}>
        <GrantAVPermissionStudent
          mode="mic"
          sendCommandToSpecificUser={sendCommandToSpecificUser}
        />
      </Popover>
      <Popover open={permissionRequest.video} anchorEl={anchor.current}>
        <GrantAVPermissionStudent
          mode="cam"
          sendCommandToSpecificUser={sendCommandToSpecificUser}
        />
      </Popover>
    </>
  )
}

export default StudentVideoContainer
