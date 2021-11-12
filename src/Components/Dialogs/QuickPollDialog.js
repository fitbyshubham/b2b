import React, { useContext, useEffect, useState } from 'react'
import {
  Avatar,
  DialogTitle,
  Divider,
  IconButton,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Typography,
} from '@material-ui/core'
import { makeStyles, createStyles } from '@material-ui/core/styles'
import { IoCloseSharp } from 'react-icons/io5'
import Dialog from './Dialog'
import profilePlaceholder from '../../Assets/Images/profilePlaceholder.svg'
import { getOnlineAndOfflineUsers } from '../../Global/Functions'
import { BatchContext } from '../../Context/BatchContext'

const QuickPollDialog = ({
  open,
  onClose,
  pollResult,
  noResponse,
  remoteUsers,
  authState,
  allBatchStudent,
  permissionResolution,
  pollId,
}) => {
  const classes = useStyles()

  const [pollList, setPollList] = useState([])
  const [loading, setLoading] = useState(false)
  const [noResponseList, setNoResponseList] = useState([])
  const [responseList, setResponseList] = useState([])

  useEffect(() => {
    getOnlineAndOfflineUsersInClass()
  }, [remoteUsers, allBatchStudent])

  useEffect(() => {
    getQuickPollList()
  }, [])

  useEffect(() => {
    getResponseList()
    getNoResponseList()
  }, [pollList])

  const { GetQuickPollList } = useContext(BatchContext)

  const getQuickPollList = async () => {
    setLoading(true)
    const data = await GetQuickPollList(pollId)
    if (data.success) {
      setPollList(data.data)
    }
    setLoading(false)
  }

  const totalResponse = () => pollResult.yes + pollResult.no + noResponse()

  const getOnlineAndOfflineUsersInClass = () => {
    const data = getOnlineAndOfflineUsers(
      allBatchStudent,
      remoteUsers,
      authState,
      permissionResolution,
    )
    return data.onlineStudents
  }

  const getNoResponseList = () => {
    const noResponseArr = getOnlineAndOfflineUsersInClass().filter(
      (userObj) => !pollList.some((list) => list.student_id === userObj.id),
    )
    setNoResponseList(noResponseArr)
  }

  const getResponseList = () => {
    const arr = getOnlineAndOfflineUsersInClass().filter((userObj) =>
      pollList.some((list) => list.student_id === userObj.id),
    )
    setResponseList(arr)
  }

  return (
    <Dialog open={open} fullWidth maxWidth="xs">
      <DialogTitle>
        <div className={classes.header}>
          <p className="sub-text bold text-align-center">Poll Results</p>
          <IconButton className={classes.close} onClick={() => onClose()}>
            <IoCloseSharp />
          </IconButton>
        </div>
      </DialogTitle>
      <Divider />
      <div className={classes.response}>
        <div>
          <p>Total Response</p>
          <p className="bolder">{totalResponse()}</p>
        </div>
        <Divider
          orientation="vertical"
          variant="fullWidth"
          className={classes.divider}
        />
        <div>
          <p>Yes</p>
          <p className="bolder">{pollResult.yes}</p>
        </div>
        <Divider
          orientation="vertical"
          variant="fullWidth"
          className={classes.divider}
        />
        <div>
          <p>No</p>
          <p className="bolder">{pollResult.no}</p>
        </div>
        <Divider
          orientation="vertical"
          variant="fullWidth"
          className={classes.divider}
        />
        <div>
          <p>No Response</p>
          <p className="bolder">{noResponse()}</p>
        </div>
      </div>
      <div className={classes.responseList}>
        {!loading && (
          <>
            {responseList.map((list) => (
              <ListItem>
                <ListItemAvatar>
                  <Avatar src={list.avatar || profilePlaceholder} />
                </ListItemAvatar>
                <div className={classes.studentResponse}>
                  <ListItemText
                    primary={
                      <Typography
                        style={{
                          color: '#333',
                          fontWeight: 500,
                          fontSize: 16,
                        }}
                      >
                        {list.name}
                      </Typography>
                    }
                  />
                  <p className="bolder">
                    {pollList
                      .find((userObj) => userObj.student_id === list.id)
                      .response.toUpperCase()}
                  </p>
                </div>
              </ListItem>
            ))}
            {noResponseList.map((list) => (
              <ListItem>
                <ListItemAvatar>
                  <Avatar src={list.avatar || profilePlaceholder} />
                </ListItemAvatar>
                <div className={classes.studentResponse}>
                  <ListItemText
                    primary={
                      <Typography
                        style={{
                          color: '#333',
                          fontWeight: 500,
                          fontSize: 16,
                        }}
                      >
                        {list.name}
                      </Typography>
                    }
                  />
                  <p className="bolder">No Response</p>
                </div>
              </ListItem>
            ))}
          </>
        )}
      </div>
    </Dialog>
  )
}

const useStyles = makeStyles(() =>
  createStyles({
    close: {
      position: 'absolute',
      right: 10,
    },
    header: {
      display: 'flex',
      flexDirection: 'row',
      paddingLeft: 20,
      justifyContent: 'center',
      alignItems: 'center',
    },
    response: {
      width: '100%',
      backgroundColor: '#ececec',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-around',
    },
    divider: {
      marginRight: 10,
    },
    responseList: {
      padding: '10px 5px',
      overflowY: 'scroll',
      height: '240px',
    },
    studentResponse: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      width: '100%',
    },
  }),
)

export default QuickPollDialog
