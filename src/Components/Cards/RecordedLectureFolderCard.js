import React from 'react'
import { makeStyles, createStyles } from '@material-ui/core/styles'
import { useHistory } from 'react-router-dom'
import { BsFolder } from 'react-icons/bs'
import Card from './Card'

const RecordedLectureFolderCard = ({ id, foldername, index, folderId }) => {
  const classes = useStyles()
  const history = useHistory()
  const handleClick = () => {
    history.push(`/dashboard/recordings/${id}/${folderId}`)
  }

  return (
    <Card variant="outlined" className={classes.infoCard} onClick={handleClick}>
      <BsFolder className={classes.cardIcon} />
      <span className={classes.link}>{foldername || `Folder ${index}`}</span>
    </Card>
  )
}

const useStyles = makeStyles(() =>
  createStyles({
    infoCard: {
      cursor: 'pointer',
      padding: '10px 10px',
      display: 'flex',
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      width: '100%',
      borderRadius: '8px',
    },
    cardIcon: {
      margin: '0px 10px',
      color: '#6480e4',
    },
    link: {
      color: '#6480e4',
    },
  }),
)

export default RecordedLectureFolderCard
