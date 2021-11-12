/* eslint-disable no-underscore-dangle */
import {
  Avatar,
  Badge,
  Divider,
  Grid,
  IconButton,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  makeStyles,
  Typography,
} from '@material-ui/core'
import React, { useContext, Fragment, useState, useEffect } from 'react'
import { GrFormClose } from 'react-icons/all'
import { useSnackbar } from 'notistack'
import MicOffOutlinedIcon from '@material-ui/icons/MicOffOutlined'
import MicNoneOutlinedIcon from '@material-ui/icons/MicNoneOutlined'
import { BatchContext } from '../../Context/BatchContext'
import Spinner from '../Progress/Spinner'
import Controls from '../Controls/Controls'
import BootstrapTooltip from '../Tooltips/BootstrapTooltip'
import showErrorSnackbar from '../Snackbar/errorSnackbar'
import { CommandContext } from '../../Context/CommandContext'
import profilePlaceholder from '../../Assets/Images/profilePlaceholder.svg'

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
  gridContainer: {
    height: '100%',
    width: 350,
  },
  gridItem: {
    overflow: 'auto',
    height: 'calc(100% - 64px)',
  },
  heading: {
    color: '#333',
    fontSize: '1.25rem',
    padding: '0.5rem 1.125rem',
    fontWeight: 500,
    height: 44,
  },
  doubt: {
    padding: '0 0.5rem',
  },
  micIcon: {
    padding: 6,
  },
  resolveButton: {
    width: 'unset',
    backgroundImage: 'unset',
    border: '1px solid #979797',
  },
}))

const Doubts = ({
  sendCommandToSpecificUser,
  id,
  remoteUsers,
  handleClose,
}) => {
  const classes = useStyles()
  const {
    teacherDoubts,
    setTeacherDoubts,
    ResolveQuery,
    permissionResolution,
    resolveAVRequest,
  } = useContext(CommandContext)
  const { GetEnrolledStudentsInBatch } = useContext(BatchContext)
  const [isLoading, setIsLoading] = useState(true)
  const [students, setStudents] = useState([])
  const [isError, setIsError] = useState('')
  const { enqueueSnackbar } = useSnackbar()
  useEffect(() => {
    async function getStudents() {
      const enrolledStudents = await GetEnrolledStudentsInBatch(id)
      setIsLoading(false)
      if (enrolledStudents) {
        setStudents(enrolledStudents)
      } else {
        setIsError('Cannot load enrolled students')
      }
    }
    getStudents()
  }, [])

  const isStudentOnline = (userId) => {
    const result = remoteUsers.find((remoteUser) => remoteUser.uid === userId)
    if (result) return true
    return false
  }

  const doubtInProgress = (uid) => {
    if (!isStudentOnline(uid)) {
      showErrorSnackbar(enqueueSnackbar, 'Student has gone offline')
      return
    }
    sendCommandToSpecificUser(uid, 'AGORA', 'MIC_ON')
    resolveAVRequest(uid, 'mic', 'pending')
    sendCommandToSpecificUser(uid, 'DOUBT', 'ACCEPTED')
    setTeacherDoubts((tDoubts) => {
      const temp = tDoubts.find((tDoubt) => tDoubt.senderId === uid)
      const others = tDoubts.filter((tDoubt) => tDoubt.senderId !== uid)
      temp.state = 1
      return [...others, temp]
    })
  }

  const resolveDoubt = async (uid) => {
    const temp = teacherDoubts.find((tDoubt) => tDoubt.senderId === uid)
    await ResolveQuery(temp.id)
    sendCommandToSpecificUser(uid, 'AGORA', 'MIC_OFF')
    sendCommandToSpecificUser(uid, 'DOUBT', 'CLEAR')
    setTeacherDoubts((tDoubts) => {
      const others = tDoubts.filter((tDoubt) => tDoubt.senderId !== uid)
      temp.state = 2
      return [...others, temp]
    })
  }

  const isMicrophoneMuted = (uid) => {
    const temp = remoteUsers.find((user) => user.uid === uid)
    if (temp) {
      return temp._audio_muted_
    }
    return false
  }
  return (
    <>
      {isLoading && <Spinner />}
      {!isLoading && (
        <>
          <Grid container className={classes.gridContainer}>
            <Grid item className={classes.gridItem} xs={12}>
              <div
                style={{
                  backgroundColor: '#f2f5ff',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                }}
              >
                <p className={classes.heading}>Doubts</p>
                <IconButton
                  style={{ padding: 6 }}
                  onClick={() => {
                    handleClose()
                  }}
                >
                  <GrFormClose />
                </IconButton>
              </div>
              {Boolean(isError) && (
                <p
                  className={`${classes.doubt} secondary-text bold fine-text text-align-center`}
                >
                  {isError}
                </p>
              )}
              {!isError &&
                teacherDoubts.filter(
                  (doubt) => doubt.state === 0 || doubt.state === 1,
                ).length === 0 && (
                  <p
                    className={`${classes.doubt} secondary-text bold fine-text text-align-center`}
                  >
                    No students have raised a doubt
                  </p>
                )}
              {!isError && students.length > 0 && (
                <List>
                  {students.map((student) => {
                    const temp = teacherDoubts.find(
                      (tDoubt) => tDoubt.senderId === student.id,
                    )
                    if (temp !== undefined && temp.state !== 2) {
                      return (
                        <Fragment key={student.id}>
                          <ListItem>
                            <Grid container alignItems="center">
                              <Grid item xs={7}>
                                <Grid container alignItems="center">
                                  <Grid item xs={3}>
                                    <ListItemAvatar>
                                      <Badge
                                        className={classes.onlineBadge}
                                        variant="dot"
                                        invisible={!isStudentOnline(student.id)}
                                        anchorOrigin={{
                                          horizontal: 'right',
                                          vertical: 'bottom',
                                        }}
                                        badgeContent={2}
                                      >
                                        <Avatar
                                          src={
                                            student.avatar || profilePlaceholder
                                          }
                                        />
                                      </Badge>
                                    </ListItemAvatar>
                                  </Grid>
                                  <Grid item xs={9}>
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
                                    />
                                  </Grid>
                                </Grid>
                              </Grid>
                              <Grid item xs={5}>
                                <Grid
                                  container
                                  alignItems="center"
                                  justifyContent="flex-end"
                                >
                                  {temp.state === 0 && (
                                    <Grid item xs={8}>
                                      <Controls.Button
                                        text="Accept"
                                        color="primary"
                                        size="small"
                                        onClick={() =>
                                          doubtInProgress(student.id)
                                        }
                                      />
                                    </Grid>
                                  )}
                                  <Grid item>
                                    <Grid container alignItems="center">
                                      <Grid item xs={4}>
                                        {temp.state === 1 &&
                                          isMicrophoneMuted(student.id) && (
                                            <BootstrapTooltip
                                              title="Grant Microphone Permissions"
                                              placement="top"
                                            >
                                              <span>
                                                <IconButton
                                                  onClick={() => {
                                                    sendCommandToSpecificUser(
                                                      student.id,
                                                      'AGORA',
                                                      'MIC_ON',
                                                    )
                                                    resolveAVRequest(
                                                      student.id,
                                                      'mic',
                                                      'pending',
                                                    )
                                                  }}
                                                  disabled={
                                                    permissionResolution &&
                                                    permissionResolution?.[
                                                      student.id
                                                    ] &&
                                                    permissionResolution?.[
                                                      student.id
                                                    ]?.audio === 'pending'
                                                  }
                                                  className={classes.micIcon}
                                                >
                                                  {(!permissionResolution ||
                                                    !permissionResolution?.[
                                                      student.id
                                                    ] ||
                                                    permissionResolution?.[
                                                      student.id
                                                    ]?.audio !== 'pending') && (
                                                    <MicOffOutlinedIcon />
                                                  )}
                                                  {permissionResolution?.[
                                                    student.id
                                                  ] &&
                                                    permissionResolution?.[
                                                      student.id
                                                    ]?.audio === 'pending' && (
                                                      <Spinner
                                                        size={18}
                                                        className="margin-left-unset position-unset"
                                                        color="primary"
                                                      />
                                                    )}
                                                </IconButton>
                                              </span>
                                            </BootstrapTooltip>
                                          )}
                                        {temp.state === 1 &&
                                          !isMicrophoneMuted(student.id) && (
                                            <BootstrapTooltip
                                              title="Revoke Microphone Permissions"
                                              placement="top"
                                            >
                                              <IconButton
                                                onClick={() => {
                                                  sendCommandToSpecificUser(
                                                    student.id,
                                                    'AGORA',
                                                    'MIC_OFF',
                                                  )
                                                }}
                                                className={classes.micIcon}
                                              >
                                                <MicNoneOutlinedIcon />
                                              </IconButton>
                                            </BootstrapTooltip>
                                          )}
                                      </Grid>
                                      <Grid item xs={8}>
                                        {temp.state === 1 && (
                                          <Controls.Button
                                            text="Mark Resolved"
                                            color="primary"
                                            size="small"
                                            className={classes.resolveButton}
                                            onClick={() =>
                                              resolveDoubt(student.id)
                                            }
                                          />
                                        )}
                                      </Grid>
                                    </Grid>
                                  </Grid>
                                </Grid>
                              </Grid>
                            </Grid>
                          </ListItem>
                          <Divider />
                        </Fragment>
                      )
                    }
                    return <></>
                  })}
                </List>
              )}
            </Grid>
          </Grid>
        </>
      )}
    </>
  )
}

export default Doubts
