import React, { useState, useContext, useEffect } from 'react'
import {
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  Divider,
} from '@material-ui/core'
import { IoCloseSharp } from 'react-icons/io5'
import { makeStyles, createStyles } from '@material-ui/core/styles'
import { useSnackbar } from 'notistack'
import Controls from '../Controls/Controls'
import { BatchContext } from '../../Context/BatchContext'
import Dialog from './Dialog'
import showErrorSnackbar from '../Snackbar/errorSnackbar'

const UpdateRecordedVideoName = ({
  open,
  setOpen,
  title,
  id,
  handleCloseMenu,
  type,
  folderId,
  batch_id,
}) => {
  const classes = useStyles()
  const [recordingTitle, setRecordingTitle] = useState('')
  const [errors, setErrors] = useState({
    title: '',
  })

  const { UpdateRecordingName, UpdatePreRecordedLectureName } =
    useContext(BatchContext)
  const { enqueueSnackbar } = useSnackbar()

  useEffect(() => {
    setRecordingTitle(title)
  }, [])

  const onClose = () => {
    setOpen(false)
    setRecordingTitle('')
  }

  const handleRecordingTitleChange = (event) => {
    setRecordingTitle(event.target.value)
  }

  const validate = () => {
    if (recordingTitle.trim().length < 1) {
      setErrors({ ...errors, title: 'Please provide the title' })
    } else if (recordingTitle.trim().length > 80) {
      setErrors({ ...errors, title: 'Name cannot be more than 80 characters' })
    } else {
      setErrors({ ...errors, title: '' })
    }
  }

  useEffect(() => {
    validate()
  }, [recordingTitle])

  const handleSubmission = async () => {
    if (recordingTitle === title) {
      showErrorSnackbar(enqueueSnackbar, 'You need to make changes to title')
      return
    }
    if (type === 'pre') {
      await UpdatePreRecordedLectureName(id, recordingTitle, folderId)
    } else {
      await UpdateRecordingName(id, recordingTitle, batch_id)
    }
    setOpen(false)
    handleCloseMenu()
  }

  return (
    <Dialog open={open}>
      <DialogTitle>
        <div className={classes.header}>
          <p className="sub-text bold text-align-center">
            Edit {type === 'pre' ? 'Lecture' : 'Recording'} Title
          </p>
          <IconButton className={classes.close} onClick={onClose}>
            <IoCloseSharp />
          </IconButton>
        </div>
      </DialogTitle>
      <Divider />
      <DialogContent>
        <div>
          <p className={classes.infoText}>Title</p>
          <Controls.Input
            className={classes.input}
            placeholder={`Enter ${title} Title`}
            value={recordingTitle}
            autoFocus
            onChange={handleRecordingTitleChange}
            error={errors.title}
            inputProps={{
              maxlength: 80,
            }}
          />
        </div>
      </DialogContent>
      <Divider />
      <DialogActions className={classes.actions}>
        <Controls.Button variant="outlined" onClick={onClose}>
          Cancel
        </Controls.Button>
        <Controls.Button
          disabled={recordingTitle === title || Boolean(errors.title)}
          onClick={handleSubmission}
          text="Save"
        />
      </DialogActions>
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
      padding: '0 0 0 20px',
      justifyContent: 'center',
      alignItems: 'center',
    },

    input: {
      width: '100%',
      paddingBlock: 10,
    },
    infoText: {
      fontWeight: 'bold',
    },

    actions: {
      margin: '1rem',
    },
  }),
)

export default UpdateRecordedVideoName
