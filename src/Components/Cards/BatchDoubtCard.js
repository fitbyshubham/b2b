import React from 'react'
import { useHistory } from 'react-router-dom'
import { CardContent, IconButton, makeStyles } from '@material-ui/core'
import ArrowForwardIosIcon from '@material-ui/icons/ArrowForwardIos'
import Card from './Card'
import { DisplayDate } from '../../Global/Functions'

const BatchDoubtCard = ({ batchId, id, startTime }) => {
  const classes = useStyles()
  const history = useHistory()

  const handleNavigationToLecture = () => {
    history.push(`/dashboard/doubt-list/${batchId}/${id}`)
  }

  return (
    <>
      <Card>
        <CardContent
          className={classes.cardContent}
          onClick={handleNavigationToLecture}
        >
          <div>
            <h3 className="bolder">
              Live Class on {DisplayDate(startTime * 1000, true)}
            </h3>
            <p className={`${classes.date} finest-text`}>
              {DisplayDate(startTime * 1000)}
            </p>
          </div>
          <IconButton>
            <ArrowForwardIosIcon />
          </IconButton>
        </CardContent>
      </Card>
    </>
  )
}

const useStyles = makeStyles(() => ({
  cardContent: {
    width: '100%',
    padding: '20px !important',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    cursor: 'pointer',
  },
  date: {
    color: '#666666',
  },
}))

export default BatchDoubtCard
