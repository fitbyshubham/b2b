import React, { useState, useContext } from 'react'
import {
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  IconButton,
  makeStyles,
  Typography,
} from '@material-ui/core'
import { IoIosClose } from 'react-icons/io'
import { AiOutlineDownload } from 'react-icons/ai'
import Controls from '../Controls/Controls'
import Dialog from './Dialog'
import { BatchContext } from '../../Context/BatchContext'
import { OpenFileInNewTab } from '../../Global/Functions'

const InviteStudentsDialog = ({ open, close, batch_id, fetchData }) => {
  const classes = useStyles()

  const { UploadBulkList } = useContext(BatchContext)

  const [files, setFiles] = useState({ isSelected: false, data: [] })

  const changeHandler = (e) => {
    setFiles({ isSelected: true, data: e.target.files })
  }

  const handleUpload = async () => {
    await UploadBulkList(files.data, batch_id)
    fetchData()
    close()
  }

  return (
    <>
      <Dialog open={open} onClose={close} className={classes.root}>
        <IconButton className={classes.closeBtn} onClick={close}>
          <IoIosClose />
        </IconButton>
        <DialogTitle>Invite Students</DialogTitle>
        <Divider />
        <DialogContent className={classes.dialogContent}>
          <div className={classes.content}>
            <p className="bold">Step 1 - Download CSV Template</p>
            <Controls.Button
              text="Download Template"
              startIcon={<AiOutlineDownload />}
              variant="outlined"
              color="#fff"
              className={classes.download_btn}
              onClick={() => {
                OpenFileInNewTab(
                  'https://storage.googleapis.com/edvi-develop-media/edvi-templates/bulk-upload-template.csv',
                )
              }}
            />
          </div>

          <Divider />

          <div className={classes.content}>
            <p className="bold">Step 2 - Add user info in CSV template</p>
            <Typography variant="subtitle1">
              Fill in the required fields
            </Typography>
          </div>

          <Divider />

          <div className={classes.content}>
            <p className="bold">Step 3 - Upload CSV</p>
            <input
              className={classes.upload}
              id="upload"
              onChange={changeHandler}
              type="file"
              accept=".csv"
            />

            {files.isSelected ? (
              <div className={classes.upload_box}>{files.data[0].name}</div>
            ) : (
              <label htmlFor="upload">
                <div className={classes.upload_box}>+ Click to upload file</div>
              </label>
            )}
          </div>
        </DialogContent>
        <Divider />
        <DialogActions className={classes.actionStyle}>
          <Controls.Button
            size="large"
            text="UPLOAD FILE"
            className={classes.upload_btn}
            onClick={handleUpload}
          />
        </DialogActions>
      </Dialog>
    </>
  )
}

export default InviteStudentsDialog

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
  actionStyle: {
    margin: '1rem',
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    padding: '10px 30px',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
  },
  dialogContent: {
    padding: '0px',
  },
  download_btn: {
    backgroundColor: '#fff',
    width: '50%',
    margin: '10px',

    '&:hover': {
      backgroundColor: '#fff',
    },
  },
  upload_box: {
    boxShadow: '0px 0px 0px 0.6px rgba(40, 42, 54, 0.5)',
    padding: '7px 21px',
    margin: '10px 0px 0px 0px',
    borderRadius: '4px',
    userSelect: 'none',
    WebkitUserSelect: 'none',
    MozUserSelect: 'none',
    msUserSelect: 'none',
    cursor: 'pointer',
  },
  upload_btn: {
    width: '60%',
  },
  upload: {
    display: 'none',
  },
})
