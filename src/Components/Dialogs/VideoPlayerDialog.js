import {
  DialogContent,
  DialogTitle,
  Divider,
  IconButton,
  makeStyles,
} from '@material-ui/core'
import React from 'react'
import { IoIosClose } from 'react-icons/io'
import Dialog from './Dialog'

const VideoPlayerDialog = ({ open, onClose, URL, title }) => {
  const classes = useStyles()

  return (
    <>
      <Dialog open={open} className={classes.root} maxWidth="md" fullWidth>
        <IconButton className={classes.closeBtn} onClick={onClose}>
          <IoIosClose />
        </IconButton>
        <DialogTitle>{title}</DialogTitle>
        <DialogContent>
          <video
            src={URL}
            alt={title}
            className={classes.video}
            autoPlay
            controls
            controlsList="nodownload"
          />
        </DialogContent>
        <Divider />
      </Dialog>
    </>
  )
}

export default VideoPlayerDialog

const useStyles = makeStyles({
  root: {
    '& .MuiTypography-h6': {
      fontSize: '1.5rem',
      fontWeight: 600,
      textAlign: 'center',
    },
    '& .MuiDialogContent-root': {
      color: '#333',
      fontSize: '1.125rem',
      textAlign: 'center',
    },
  },
  closeBtn: {
    position: 'absolute',
    right: 12,
    top: 12,
  },
  video: {
    maxWidth: '100%',
    width: 'auto',
    height: '100%',
    margin: '0px auto',
  },
})
