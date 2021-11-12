import React from 'react'
import { createStyles, makeStyles } from '@material-ui/core/styles'
import Card from './Card'
import noLectureFound from '../../Assets/Images/noLectureFound.svg'

export default function RecordingNotFound({ type = 'pre', folder }) {
  const classes = useStyles()
  return (
    <div>
      <Card>
        <div className={classes.cardContent}>
          <img src={noLectureFound} alt="Alert" height="350" width="458" />
          <p className={classes.text}>
            There are no{' '}
            {type === 'pre' ? 'pre-recorded lectures' : 'live class recordings'}{' '}
            available for this {folder ? 'folder' : 'batch'}
          </p>
        </div>
      </Card>
    </div>
  )
}

const useStyles = makeStyles(() =>
  createStyles({
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
