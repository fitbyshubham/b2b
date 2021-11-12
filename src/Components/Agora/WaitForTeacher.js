import { Avatar, makeStyles } from '@material-ui/core'
import React, { useContext } from 'react'
import { BatchContext } from '../../Context/BatchContext'
import profilePlaceholder from '../../Assets/Images/profilePlaceholder.svg'

const useStyles = makeStyles({
  waitForTeacher: {
    width: '100%',
    height: '100%',
    backgroundColor: '#424242',
    overflow: 'hidden',
  },
  wrapper: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
  },
  img: {
    width: '20%',
    height: 'auto',
  },
  text: {
    fontWeight: 600,
    fontSize: '1.25rem',
    color: '#fff',
    marginTop: '1rem',
  },
})

const WaitForTeacher = () => {
  const classes = useStyles()
  const { batchByCode } = useContext(BatchContext)
  return (
    <div className={classes.waitForTeacher}>
      <div className={classes.wrapper}>
        <Avatar
          src={batchByCode.owner_avatar || profilePlaceholder}
          className={classes.img}
        />
        <p className={classes.text}>Waiting for Teacher to Join..</p>
      </div>
    </div>
  )
}

export default WaitForTeacher
