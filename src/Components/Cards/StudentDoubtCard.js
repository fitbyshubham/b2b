import React from 'react'
import { Avatar, CardContent, makeStyles, CardHeader } from '@material-ui/core'
import Card from './Card'
import profilePlaceholder from '../../Assets/Images/profilePlaceholder.svg'
// import { DisplayDate } from '../../Global/Functions'

const StudentDoubtCard = ({
  name,
  status,
  avatar,
  // time
}) => {
  const classes = useStyles()

  return (
    <>
      <Card>
        <CardHeader
          avatar={
            !avatar ? (
              <Avatar src={profilePlaceholder} />
            ) : (
              <Avatar src={avatar} />
            )
          }
          title={
            <p className={`fine-text bold ${classes.name}`}>
              {name || 'Student'}
            </p>
          }
          // subheader={
          //   <p className={`${classes.date} finest-text`}>
          //     {DisplayDate(time * 1000)}
          //   </p>
          // }
          className={classes.header}
        />
        <CardContent className={classes.cardContent}>
          <div
            className={
              status === 'R' ? classes.resolvedStatus : classes.pendingStatus
            }
          >
            <p className={`${classes.statusText} finer-text`}>
              {status === 'R' ? 'Resolved' : 'Unresolved'}
            </p>
          </div>
        </CardContent>
      </Card>
    </>
  )
}

const useStyles = makeStyles(() => ({
  header: {
    maxWidth: 'calc(100% - 86px)',
    '& .MuiCardHeader-content': {
      maxWidth: 'calc(100% - 40px - 16px)',
    },
  },
  name: {
    maxWidth: '100%',
    wordBreak: 'break-all',
  },
  cardContent: {
    width: 'max-content',
    position: 'absolute',
    top: '50%',
    right: 0,
    transform: 'translateY(-50%)',
  },
  date: {
    color: '#666666',
  },
  pendingStatus: {
    padding: '0 0.5rem',
    backgroundColor: '#c84444',
  },
  resolvedStatus: {
    padding: '0 0.5rem',
    backgroundColor: '#12b012',
  },
  statusText: {
    padding: '5px',
    color: '#fff',
  },
}))

export default StudentDoubtCard
