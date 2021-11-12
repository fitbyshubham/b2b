import React from 'react'
import { createStyles, makeStyles } from '@material-ui/core/styles'
import Card from '../../../../Components/Cards/Card'
import Alert_undraw from '../../../../Assets/Images/Alert_undraw.svg'

export default function AttendanceNotFound() {
  const classes = useStyles()
  return (
    <div className={classes.container}>
      <Card>
        <div className={classes.cardContent}>
          <img src={Alert_undraw} alt="Alert" height="400px" width="600px" />
          <p className={classes.text}>
            There is no attendance available for this batch.
          </p>
        </div>
      </Card>
    </div>
  )
}

const useStyles = makeStyles(() =>
  createStyles({
    container: {
      padding: '20px',
    },
    cardContent: {
      padding: 30,
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
    },
    text: {
      fontSize: 18,
    },
  }),
)
