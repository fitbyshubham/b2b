import React, { useState, useContext, useEffect } from 'react'
import {
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  Divider,
  Grid,
} from '@material-ui/core'
import { IoCloseSharp } from 'react-icons/io5'
import { makeStyles, createStyles } from '@material-ui/core/styles'
import { useSnackbar } from 'notistack'
import Controls from '../Controls/Controls'
import { BatchContext } from '../../Context/BatchContext'
import Dialog from './Dialog'
import Spinner from '../Progress/Spinner'
import showSuccessSnackbar from '../Snackbar/successSnackbar'
import showErrorSnackbar from '../Snackbar/errorSnackbar'
import { isFileSizeValid } from '../../Global/Functions'

const UploadPreRecordedLectureDialog = ({ open, closeDialog, id }) => {
  const classes = useStyles()
  const [files, setFiles] = useState([])
  const [isSelected, setIsSelected] = useState(false)
  const [newFolderName, setNewFolderName] = useState('')
  const [errors, setErrors] = useState({
    newFolderName: '',
  })
  const [allowSubmit, setAllowSubmit] = useState(false)
  const [uploadBtnLoading, setUploadBtnLoading] = useState(false)
  const [options, setOptions] = useState([{ id: 'new', title: 'New Folder' }])
  const [folderSelected, setFolderSelected] = useState('new')

  const {
    UploadLectureVideos,
    GetFoldersForLectures,
    GetFoldersContentsForLectures,
    recordingsLoading,
    recordingFolders,
    CreateLectureFolder,
  } = useContext(BatchContext)
  const { enqueueSnackbar } = useSnackbar()

  useEffect(() => {
    init()
    return () => {
      setOptions([{ id: 'new', title: 'New Folder' }])
    }
  }, [])

  const init = async () => {
    await GetFoldersForLectures(id)
    const data = recordingFolders.results.map((folder) => ({
      id: folder.id,
      title: folder.name,
    }))
    setOptions([...options, ...data])
  }

  const onClose = () => {
    closeDialog()
    setIsSelected(false)
    setNewFolderName('')
    setFiles([])
  }

  const changeHandler = (e) => {
    for (let i = 0; i < e.target.files.length; i += 1) {
      if (
        e.target.files[i].type === 'video/mp4' ||
        e.target.files[i].type === 'video/x-m4v' ||
        e.target.files[i].type === 'video/quicktime'
      ) {
        if (!isFileSizeValid(e.target.files[i].size, 500)) {
          showErrorSnackbar(
            enqueueSnackbar,
            `Check the size of uploaded file ${e.target.files[i].name}`,
          )
          return
        }
        setFiles((file) => file.concat(e.target.files[i]))
      } else {
        showErrorSnackbar(
          enqueueSnackbar,
          `Check the format of uploaded file ${e.target.files[i].name}`,
        )
        return
      }
    }
    setIsSelected(true)
  }

  const handleFolderNameChange = (event, value) => {
    setNewFolderName(value || event.target.value || '')
  }

  const validate = () => {
    if (newFolderName.trim().length < 1 && folderSelected === 'new') {
      setErrors({ ...errors, newFolderName: 'Please enter folder name' })
    } else if (newFolderName.trim().length > 40) {
      setErrors({
        ...errors,
        newFolderName: 'Folder name should be less than 40 characters',
      })
    } else {
      setErrors({ ...errors, newFolderName: '' })
    }
  }

  useEffect(() => {
    validate()
  }, [newFolderName, folderSelected])

  useEffect(() => {
    if (
      (errors.newFolderName.length === 0 || folderSelected !== 'new') &&
      files.length !== 0
    ) {
      setAllowSubmit(true)
    } else {
      setAllowSubmit(false)
    }
    if (uploadBtnLoading) {
      setAllowSubmit(false)
    }
  }, [errors, files, uploadBtnLoading])

  const handleSubmission = async () => {
    setUploadBtnLoading(true)
    validate()
    if (folderSelected === 'new') {
      const createFolderRes = await CreateLectureFolder(id, newFolderName)
      if (!createFolderRes.success) return
      const res = await UploadLectureVideos(files, createFolderRes.data.id)
      setUploadBtnLoading(false)
      if (res.success) {
        showSuccessSnackbar(enqueueSnackbar, 'Lectures Uploaded Successfully')
      }
    } else {
      const res = await UploadLectureVideos(files, folderSelected)
      setUploadBtnLoading(false)
      if (res.success) {
        showSuccessSnackbar(enqueueSnackbar, 'Lectures Uploaded Successfully')
      }
    }
    if (folderSelected !== 'new') {
      GetFoldersContentsForLectures(id, folderSelected)
    }
    GetFoldersForLectures(id)
    onClose()
  }

  const getURL = (file) => {
    const URL = window.URL || window.webkitURL
    return URL.createObjectURL(file)
  }

  const handleFolderNameSelect = (e) => {
    setFolderSelected(e.target.value)
  }

  return (
    <Dialog open={open}>
      <DialogTitle>
        <div className={classes.header}>
          <p className="sub-text bold text-align-center">
            Upload Pre Recorded Lectures
          </p>
          <IconButton className={classes.close} onClick={onClose}>
            <IoCloseSharp />
          </IconButton>
        </div>
      </DialogTitle>
      <Divider />
      <DialogContent>
        {recordingsLoading && <Spinner />}
        {!recordingsLoading && (
          <>
            <div>
              <p className={classes.infoText}>
                Choose a new or an existing folder
              </p>
              <Controls.Select
                name="standard"
                value={folderSelected}
                onChange={handleFolderNameSelect}
                options={options}
                style={{
                  width: '100%',
                  textAlign: 'left',
                  marginBottom: folderSelected === 'new' ? 0 : '1rem',
                }}
              />
              {folderSelected === 'new' && (
                <Controls.Input
                  className={classes.input}
                  placeholder="Enter Folder Name"
                  value={newFolderName}
                  autoFocus
                  onChange={handleFolderNameChange}
                  error={errors.newFolderName}
                />
              )}
            </div>
            <div>
              <p className={classes.infoText}>Upload Lectures</p>
              <input
                className={classes.upload}
                id="upload"
                onChange={changeHandler}
                type="file"
                accept="video/mp4,video/x-m4v,video/quicktime,video/*"
                multiple
              />
              <label htmlFor="upload">
                <div className={classes.empty_upload_div}>
                  <p>+ Click to Upload Video </p>
                  <p>Only .mp4, .m4v and .mov files supported upto 500 MB</p>
                </div>
              </label>
              {isSelected && (
                <Grid container spacing={1} alignItems="stretch">
                  {files.map((item) => (
                    <Grid item xs={12}>
                      <video
                        src={getURL(item)}
                        style={{ width: '100%', height: 'auto' }}
                        controls
                      />
                    </Grid>
                  ))}
                </Grid>
              )}
            </div>
          </>
        )}
      </DialogContent>
      <Divider />
      <DialogActions className={classes.actions}>
        <Controls.Button variant="outlined" onClick={onClose} type="button">
          Cancel
        </Controls.Button>
        <Controls.Button
          type="button"
          disabled={!allowSubmit}
          onClick={handleSubmission}
          startIcon={
            uploadBtnLoading && (
              <Spinner
                size={20}
                className="margin-left-unset position-unset"
                color="inherit"
              />
            )
          }
          text="Upload"
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
    content: {
      display: 'flex',
      flexDirection: 'column',
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
    upload: {
      display: 'none',
    },
    empty_upload_div: {
      border: '1px dotted black',
      width: '100%',
      height: 160,
      margin: '10px 0',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center',
      borderRadius: '5px',
      '&:hover': {
        cursor: 'pointer',
      },
    },
    upload_div: {
      border: '1px dotted black',
      width: '100%',
      height: 160,
      padding: '10px 0',
      margin: '10px 0',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      borderRadius: '5px',
    },
    card: {
      height: 160,
      border: '1px solid grey',
      borderRadius: '5px',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      margin: '10px 0',
    },
    add: {
      height: 160,
      border: '1px solid grey',
      borderRadius: '5px',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      margin: '10px 0',
      '&:hover': {
        cursor: 'pointer',
      },
    },
    actions: {
      margin: '1rem',
    },
  }),
)

export default UploadPreRecordedLectureDialog
