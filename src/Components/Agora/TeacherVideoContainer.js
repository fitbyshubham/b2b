import React, { useContext, useEffect, useState } from 'react'
import {
  Grid,
  makeStyles,
  useMediaQuery,
  Drawer,
  IconButton,
} from '@material-ui/core'
import { Rnd } from 'react-rnd'
import clsx from 'clsx'
import { IoIosArrowBack, IoIosArrowForward, IoIosClose } from 'react-icons/io'
import { useSnackbar } from 'notistack'
import MediaPlayer from './MediaPlayer'
import useWindowDimensions from '../../Hooks/useWindowDimensions'
import { BatchContext } from '../../Context/BatchContext'
import { AuthContext } from '../../Context/AuthContext'
import { AgoraContext } from '../../Context/AgoraContext'
import showVideoIcon from '../../Assets/Images/showVideoIcon.svg'
import RegularTooltip from '../Tooltips/RegularTooltip'
import showErrorSnackbar from '../Snackbar/errorSnackbar'

const useStyles = makeStyles((theme) => ({
  videoContainer: {
    width: '100%',
    height: '100%',
    display: 'flex',
    overflow: 'hidden',
  },
  drawer: {
    width: '25%',
    flexShrink: 0,
    zIndex: 99,
    height: '100%',
    position: 'relative',
  },
  drawerPaper: {
    width: '100%',
    height: '100%',
    maxHeight: '100%',
    position: 'absolute',
    backgroundColor: '#202124',
  },
  content: {
    position: 'relative',
    flexGrow: 1,
    transition: theme.transitions.create('margin', {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.leavingScreen,
    }),
    marginRight: '-25%',
  },
  contentShift: {
    transition: theme.transitions.create('margin', {
      easing: theme.transitions.easing.easeOut,
      duration: theme.transitions.duration.enteringScreen,
    }),
    marginRight: 0,
  },
  toggleBtn: {
    position: 'absolute',
    width: '2.5rem',
    height: '2.5rem',
    top: 13,
    right: 0,
    zIndex: 999,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 0,
    backgroundImage: 'linear-gradient(101deg, #638ee4 7%, #6480e4 92%)',
    backgroundColor: '#638ee4',
    borderTopLeftRadius: '0.4rem',
    borderTopRightRadius: 0,
    borderBottomLeftRadius: '0.4rem',
    borderBottomRightRadius: 0,
    border: 'none',
    outline: 'none',
    cursor: 'pointer',
    boxShadow:
      '0px 3px 1px -2px rgb(0 0 0 / 20%), 0px 2px 2px 0px rgb(0 0 0 / 14%), 0px 1px 5px 0px rgb(0 0 0 / 12%)',
  },
  changePageBtn: {
    '&.MuiIconButton-root.Mui-disabled': {
      backgroundImage: 'unset',
      backgroundColor: 'rgba(0, 0, 0, 0.26)',
    },
    width: 'unset',
    borderRadius: 4,
    backgroundImage: 'linear-gradient(101deg, #638ee4 7%, #6480e4 92%)',
    backgroundColor: '#638ee4',
  },
  drawerHeader: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    ...theme.mixins.toolbar,
    backgroundColor: '#d6dfff',
    padding: '6px 6px',
    minHeight: '48px !important',
  },
  select: {
    backgroundColor: 'rgba(66,66,66,0.3)',
    '& .MuiOutlinedInput-input': {
      padding: '6px 48px',
    },
    '& .MuiSelect-icon': {
      color: '#fff',
    },
    color: '#fff',
  },
  drawerOpenIcon: {
    width: 24,
    height: 'auto',
    marginLeft: 2,
    marginTop: 2,
  },
}))
const TeacherVideoContainer = ({
  remoteUsers,
  localAudioTrack,
  localVideoTrack,
  isAudioMuted,
  isVideoMuted,
  sendCommandToSpecificUser,
  isScreenShared,
  stopScreenShare,
  screenShareVideoTrack,
}) => {
  const classes = useStyles()
  const { height, width } = useWindowDimensions()
  const matches = useMediaQuery('(min-width:600px)')
  const [videoHeight, setVideoHeight] = useState('100%')
  const [videoWidth, setVideoWidth] = useState('100%')
  const [localVideoDimensions, setLocalVideoDimensions] = useState({
    height: 180,
    width: 320,
  })
  const [videoDrawerOpen, setVideoDrawerOpen] = useState(false)

  const [isVideoPinned, setIsVideoPinned] = useState(false)

  const [pinnedUser, setPinnedUser] = useState({
    data: undefined,
    idx: undefined,
  })

  const pageSize = 8

  const [currentPage, setCurrentPage] = useState(1)

  const [totalPages, setTotalPages] = useState(1)

  const [paginatedUsers, setPaginatedUsers] = useState([[]])

  const { batchByCode, allBatchStudents } = useContext(BatchContext)
  const { authState } = useContext(AuthContext)

  const { currentSpeakers } = useContext(AgoraContext)

  const { enqueueSnackbar } = useSnackbar()

  // check if first user - on join open video panel
  const [firstUser, setFirstUser] = useState(true)

  useEffect(() => {
    if (isScreenShared && isVideoPinned) unpinVideo()
  }, [isScreenShared])

  useEffect(() => {
    if (
      videoDrawerOpen &&
      (paginatedUsers[currentPage - 1] === undefined ||
        paginatedUsers[currentPage - 1].length === 0)
    )
      toggleDrawer()
  }, [paginatedUsers[currentPage - 1]?.length])

  useEffect(() => {
    if (
      remoteUsers.find((user) => user.uid === pinnedUser.data?.uid) ===
      undefined
    ) {
      setPinnedUser({
        data: undefined,
        idx: undefined,
      })
      setIsVideoPinned(false)
    }
    setPaginatedUsers(() => {
      let i
      const temp = []
      const users = remoteUsers.filter(
        (user) => user.uid !== `${batchByCode.owner}-screen-share`,
      )
      for (i = 0; i < users.length; i += pageSize)
        temp.push(users.slice(i, i + pageSize))
      setTotalPages(temp.length)
      if (isVideoPinned && temp[pinnedUser.idx]) {
        const others = temp[pinnedUser.idx].filter(
          (user) => user.uid !== pinnedUser.data.uid,
        )
        temp[pinnedUser.idx] = others
      }
      return temp
    })
    if (
      firstUser &&
      remoteUsers.filter(
        (user) => user.uid !== `${batchByCode.owner}-screen-share`,
      ).length > 0
    ) {
      setFirstUser(false)
      setVideoDrawerOpen(true)
    }
    if (
      !firstUser &&
      remoteUsers.filter(
        (user) => user.uid !== `${batchByCode.owner}-screen-share`,
      ).length === 0
    ) {
      setFirstUser(true)
    }
  }, [remoteUsers])

  useEffect(() => {
    if (videoDrawerOpen) {
      const temp = remoteUsers.filter(
        (user) =>
          !paginatedUsers[currentPage - 1]?.includes(user) &&
          user.uid !== pinnedUser.data?.uid,
      )
      temp.forEach((user) => {
        sendCommandToSpecificUser(user.uid, 'AGORA', 'VIDEO_UNPUBLISH')
      })
      paginatedUsers[currentPage - 1]?.forEach((user) => {
        sendCommandToSpecificUser(user.uid, 'AGORA', 'VIDEO_PUBLISH')
      })
    }
  }, [paginatedUsers[currentPage - 1], videoDrawerOpen, currentPage])

  const pinVideo = (uid) => {
    if (isScreenShared) {
      showErrorSnackbar(enqueueSnackbar, 'You cannot pin during screenshare')
      return
    }
    if (isVideoPinned) {
      unpinVideo()
    }
    const userToPin = paginatedUsers[currentPage - 1].find(
      (user) => user.uid === uid,
    )
    const others = paginatedUsers[currentPage - 1].filter(
      (user) => user.uid !== uid,
    )
    paginatedUsers[currentPage - 1] = others
    setPinnedUser({ data: userToPin, idx: currentPage - 1 })
    setIsVideoPinned(true)
  }

  const unpinVideo = () => {
    paginatedUsers[pinnedUser.idx].push(pinnedUser.data)
    setIsVideoPinned(false)
    setPinnedUser({
      data: undefined,
      idx: undefined,
    })
    if (!videoDrawerOpen) toggleDrawer()
  }

  const toggleDrawer = () => {
    setVideoDrawerOpen((open) => !open)
  }

  const goToNextPage = () => {
    if (currentPage + 1 <= totalPages) setCurrentPage(currentPage + 1)
  }

  const goToPreviousPage = () => {
    if (currentPage - 1 > 0) setCurrentPage(currentPage - 1)
  }

  const localVideoBoxResize = (e, direction, ref) => {
    setLocalVideoDimensions({
      width: ref.offsetWidth,
      height: ref.offsetHeight,
    })
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

  const setHeight = () => {
    const usersInCall = paginatedUsers[currentPage - 1]?.length || 0
    const heightWithoutNavAndControls = matches
      ? height - 64 - 64 - 48 - 12
      : height - 56 - 56 - 48 - 12
    const internalWidth = 3 * (width / 12)
    if (usersInCall <= 1) {
      setVideoHeight(internalWidth - 12)
    } else if (usersInCall <= 2) {
      setVideoHeight(heightWithoutNavAndControls / 2)
    } else if (usersInCall <= 3) {
      setVideoHeight(heightWithoutNavAndControls / 3)
    } else if (usersInCall <= 4) {
      setVideoHeight(heightWithoutNavAndControls / 4)
    } else if (usersInCall <= 6) {
      setVideoHeight(heightWithoutNavAndControls / 3)
    } else if (usersInCall <= 8) {
      setVideoHeight(heightWithoutNavAndControls / 4)
    } else if (usersInCall <= 12) {
      setVideoWidth(heightWithoutNavAndControls / 3)
    } else if (usersInCall <= 16) {
      setVideoWidth(heightWithoutNavAndControls / 4)
    }
  }

  const setWidth = () => {
    const usersInCall = paginatedUsers[currentPage - 1]?.length || 0
    const internalWidth = 3 * (width / 12) - 12
    if (usersInCall <= 4) {
      setVideoWidth(internalWidth)
    } else if (usersInCall <= 8) {
      setVideoWidth(internalWidth / 2)
    } else if (usersInCall <= 12) {
      setVideoWidth(internalWidth / 3)
    } else {
      setVideoWidth(internalWidth / 4)
    }
  }

  useEffect(() => {
    setHeight()
    setWidth()
  }, [paginatedUsers, paginatedUsers[currentPage - 1]?.length, width, height])

  const getMainDisplayContent = () => (
    <div className={classes.videoContainer}>
      <Grid
        container
        className={clsx(classes.content, {
          [classes.contentShift]: videoDrawerOpen,
        })}
      >
        {paginatedUsers.length > 0 &&
        (isVideoPinned ? paginatedUsers[currentPage - 1].length > 0 : true) ? (
          <RegularTooltip
            title={!videoDrawerOpen ? 'Show Videos' : 'Hide Videos'}
            aria-label="Show Videos"
            placement="left"
          >
            <button
              type="button"
              onClick={toggleDrawer}
              className={classes.toggleBtn}
            >
              {!videoDrawerOpen ? (
                <img
                  src={showVideoIcon}
                  alt="Show Student Videos"
                  className={classes.drawerOpenIcon}
                />
              ) : (
                <IoIosClose size={36} color="#fff" />
              )}
            </button>
          </RegularTooltip>
        ) : null}
        <Grid item xs={12}>
          {isScreenShared || isVideoPinned ? (
            <>
              {isScreenShared && (
                <MediaPlayer
                  videoTrack={screenShareVideoTrack}
                  trackType="local"
                  profilePic={authState.avatar}
                  stopScreenShare={stopScreenShare}
                  isScreenShared={isScreenShared}
                  name={authState.name}
                  key={authState.user_id}
                  isVideoEnabled={isScreenShared}
                  isAudioEnabled={!isAudioMuted}
                  style={{
                    width: '100%',
                    height: '100%',
                    position: 'relative',
                    margin: 'auto auto',
                  }}
                />
              )}
              {isVideoPinned && (
                <MediaPlayer
                  videoTrack={pinnedUser.data.videoTrack}
                  audioTrack={pinnedUser.data.audioTrack}
                  trackType="remote"
                  profilePic={
                    allBatchStudents.find(
                      (student) => student.id === pinnedUser.data.uid,
                    ).avatar
                  }
                  name={getName(pinnedUser.data.uid)}
                  key={pinnedUser.data.uid}
                  isVideoEnabled={pinnedUser.data.hasVideo}
                  isAudioEnabled={pinnedUser.data.hasAudio}
                  style={{
                    width: '100%',
                    height: '100%',
                    position: 'relative',
                    margin: 'auto auto',
                  }}
                  unpinVideo={unpinVideo}
                  pinnedUserUid={pinnedUser.data.uid}
                  uid={pinnedUser.data.uid}
                  role={authState.role}
                  sendCommandToSpecificUser={sendCommandToSpecificUser}
                />
              )}
              {!isVideoMuted && (
                <Rnd
                  size={{
                    width: localVideoDimensions.width,
                    height: localVideoDimensions.height,
                  }}
                  position={{
                    x: 8,
                    y: 8,
                  }}
                  bounds="parent"
                  lockAspectRatio
                  onResize={localVideoBoxResize}
                  disableDragging
                >
                  <MediaPlayer
                    videoTrack={localVideoTrack}
                    audioTrack={localAudioTrack}
                    trackType="local"
                    profilePic={authState.avatar}
                    name={authState.name}
                    key={authState.user_id}
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
            </>
          ) : (
            <MediaPlayer
              videoTrack={localVideoTrack}
              audioTrack={localAudioTrack}
              trackType="local"
              profilePic={authState.avatar}
              name={authState.name}
              key={authState.user_id}
              isVideoEnabled={!isVideoMuted}
              isAudioEnabled={!isAudioMuted}
              style={{
                width: '100%',
                height: '100%',
                position: 'relative',
                margin: 'auto auto',
              }}
            />
          )}
        </Grid>
      </Grid>
      <Drawer
        variant="persistent"
        anchor="right"
        open={videoDrawerOpen}
        className={classes.drawer}
        classes={{
          paper: classes.drawerPaper,
        }}
      >
        <div
          className={classes.videoContainer}
          style={{
            justifyContent: 'space-evenly',
            alignItems: 'center',
            flexWrap: 'wrap',
            height: 'calc(100% - 48px)',
          }}
        >
          {paginatedUsers.length > 0 &&
            paginatedUsers[currentPage - 1].map((user) => (
              <MediaPlayer
                videoTrack={user.videoTrack}
                audioTrack={user.audioTrack}
                trackType="remote"
                name={getName(user.uid)}
                uid={user.uid}
                profilePic={
                  allBatchStudents.find((student) => student.id === user.uid)
                    .avatar
                }
                key={user.uid}
                sendCommandToSpecificUser={sendCommandToSpecificUser}
                isVideoEnabled={user.hasVideo}
                isAudioEnabled={user.hasAudio}
                role={authState.role}
                style={{
                  width: videoWidth,
                  height: videoHeight,
                  position: 'relative',
                  display: 'inherit',
                }}
                pinVideo={pinVideo}
                pinnedUserUid={pinnedUser.data?.uid}
                showName={false}
              />
            ))}
          {remoteUsers
            .filter(
              (user) =>
                !paginatedUsers[currentPage - 1]?.includes(user) &&
                user.uid !== pinnedUser.data?.uid,
            )
            .map(
              (user) =>
                currentSpeakers.includes(user.uid) && (
                  <MediaPlayer
                    videoTrack={user.videoTrack}
                    audioTrack={user.audioTrack}
                    trackType="remote"
                    name={getName(user.uid)}
                    uid={user.uid}
                    key={user.uid}
                    sendCommandToSpecificUser={sendCommandToSpecificUser}
                    isVideoEnabled={user.hasVideo}
                    isAudioEnabled={user.hasAudio}
                    role={authState.role}
                    style={{
                      width: 0,
                      height: 0,
                      position: 'relative',
                      display: 'none',
                    }}
                    pinVideo={pinVideo}
                  />
                ),
            )}
        </div>
        <div className={classes.drawerHeader}>
          <IconButton
            size="small"
            onClick={() => {
              goToPreviousPage()
            }}
            className={classes.changePageBtn}
            disableRipple
            disabled={currentPage - 1 <= 0}
          >
            <IoIosArrowBack size={20} color="#fff" />
          </IconButton>
          <p style={{ fontWeight: 600 }}>
            {currentPage} of {totalPages}
          </p>
          <IconButton
            size="small"
            onClick={() => {
              goToNextPage()
            }}
            className={classes.changePageBtn}
            disableRipple
            disabled={currentPage + 1 > totalPages}
          >
            <IoIosArrowForward size={20} color="#fff" />
          </IconButton>
        </div>
      </Drawer>
    </div>
  )
  return <>{getMainDisplayContent()}</>
}

export default TeacherVideoContainer
