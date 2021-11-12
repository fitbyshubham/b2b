import React, { useState } from 'react'
import {
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  IconButton,
} from '@material-ui/core'
import { makeStyles, createStyles } from '@material-ui/core/styles'
import { IoCloseSharp } from 'react-icons/io5'
import { MdContentCopy } from 'react-icons/md'
import { CopyToClipboard } from 'react-copy-to-clipboard/lib/Component'
import { useSnackbar } from 'notistack'
import Controls from '../Controls/Controls'
import Dialog from './Dialog'
import showSuccessSnackbar from '../Snackbar/successSnackbar'
import InviteStudentsDialog from './InviteStudentsDialog'

const BatchCreatedDialog = ({ open, close, batchId }) => {
  const classes = useStyles()

  const { enqueueSnackbar } = useSnackbar()

  const [openInviteStudentsDialog, setOpenInviteStudentsDialog] =
    useState(false)

  const handleOpenInviteStudentsDialog = () => {
    setOpenInviteStudentsDialog(true)
  }

  const handleCloseInviteStudentsDialog = () => {
    setOpenInviteStudentsDialog(false)
    close()
  }

  const showNotification = () => {
    showSuccessSnackbar(enqueueSnackbar, 'Copied to clipboard')
  }

  return (
    <Dialog open={open} fullWidth onClose={close}>
      <DialogTitle>
        <div className={classes.header}>
          <p className="sub-text bold text-align-center">
            Share Batch code with Students
          </p>
          <IconButton className={classes.close} onClick={close}>
            <IoCloseSharp />
          </IconButton>
        </div>
      </DialogTitle>
      <Divider />
      <DialogContent>
        <div className={`${classes.input_div} text-align-center`}>
          <p className={classes.message}>
            Please share the below batch code with your students & <br />
            ask them to send a joining request.
          </p>
          <div className={`${classes.batch_code_box} margin-top-small`}>
            <h3 className={classes.message}>Batch Code: </h3>
            <div className={classes.batch_code}>
              <h3 className={`${classes.message} bolder`}>
                {batchId ? batchId.toUpperCase() : ''}
              </h3>
            </div>
            <CopyToClipboard text={batchId ? batchId.toUpperCase() : ''}>
              <IconButton onClick={showNotification} color="inherit">
                <MdContentCopy size={24} />
              </IconButton>
            </CopyToClipboard>
          </div>
        </div>
      </DialogContent>
      <Divider />
      <DialogActions>
        <div className={classes.btn_div}>
          <Controls.Button
            text="Bulk Upload List"
            className={classes.invite_btn}
            color="#585858"
            onClick={handleOpenInviteStudentsDialog}
          />
        </div>
        <div className={classes.btn_div}>
          <Controls.Button
            text="Close"
            className={classes.btn}
            onClick={close}
          />
        </div>
      </DialogActions>
      {openInviteStudentsDialog && (
        <InviteStudentsDialog
          open={openInviteStudentsDialog}
          close={handleCloseInviteStudentsDialog}
          batch_id={batchId}
          fetchData={close}
        />
      )}
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
      paddingLeft: 20,
      justifyContent: 'center',
      alignItems: 'center',
    },
    input_div: {
      padding: '20px 0',
    },
    message: {
      fontSize: '1rem',
    },
    btn: {
      backgroundColor: '#6481e4',
      '&:hover': {
        backgroundColor: '#6481e4',
      },
      margin: '0 10px',
      alignSelf: 'center',
    },
    invite_btn: {
      backgroundColor: '#585858',
      '&:hover': {
        backgroundColor: '#585858',
      },
      color: '#fff',
      margin: '0 10px',
      alignSelf: 'center',
    },
    btn_div: {
      width: '100%',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '15px 0',
    },
    batch_code_box: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
    },
    batch_code: {
      padding: '8px 12px 7px',
      marginLeft: '5px',
      borderRadius: '4px',
      border: 'solid 1px #cdcdcd',
      backgroundColor: '#e9ecf5',
    },
  }),
)

export default BatchCreatedDialog
