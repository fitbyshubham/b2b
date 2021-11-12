import React from 'react'
import { makeStyles, createStyles } from '@material-ui/core/styles'
import { BsFolder } from 'react-icons/bs'
import { ImAttachment } from 'react-icons/im'
import Card from './Card'
import { OpenFileInNewTab } from '../../Global/Functions'

const FileInfoCard = ({ type, link, fileName, data, dialog }) => {
  const classes = useStyles()

  const openLink = (url) => {
    let redirect_url = ''

    if (url.slice(0, 6) === 'http://') {
      redirect_url = url.slice(6)
    } else if (url.slice(0, 8) === 'https://') {
      redirect_url = url.slice(8)
    } else {
      redirect_url = url
    }

    const newWindow = window.open(
      `//${redirect_url}`,
      '_blank',
      'noopener,noreferrer',
    )
    if (newWindow) newWindow.opener = null
  }

  const handleClick = () => {
    if (type === 'file') {
      OpenFileInNewTab(data.file)
    }
    if (type === 'link') {
      openLink(link)
    }
  }
  return (
    <Card
      variant="outlined"
      className={dialog ? classes.infoCardWithinDialog : classes.infoCard}
      onClick={handleClick}
    >
      {type === 'file' && (
        <>
          <BsFolder className={classes.cardIcon} />
          <span className={classes.link}>{fileName}</span>
        </>
      )}
      {type === 'link' && (
        <>
          <ImAttachment className={classes.cardIcon} />
          <span className={classes.link}>
            {link.replace(/^(?:https?:\/\/)?(?:www\.)?/i, '').split('/')[0]}
          </span>
        </>
      )}
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
      margin: '0px 10px 0px 0px',
      width: '100%',
      borderRadius: '8px',
    },
    infoCardWithinDialog: {
      cursor: 'pointer',
      padding: '10px 10px',
      display: 'flex',
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      margin: '0px 10px 0px 0px',
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

FileInfoCard.defaultProps = {
  data: [],
  dialog: false,
}

export default FileInfoCard
