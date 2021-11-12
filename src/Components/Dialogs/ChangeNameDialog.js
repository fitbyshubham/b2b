import React, { useContext, useState } from 'react'
import {
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  IconButton,
} from '@material-ui/core'
import { createStyles, makeStyles } from '@material-ui/core/styles'
import { IoCloseSharp } from 'react-icons/io5'
import { useSnackbar } from 'notistack'
import Controls from '../Controls/Controls'
import Dialog from './Dialog'
import useForm from '../../Hooks/useForm'
import ConfirmDialog from './ConfirmDialog'
import { AuthContext } from '../../Context/AuthContext'
import showSuccessSnackbar from '../Snackbar/successSnackbar'
import Form from '../Form/Form'

const ChangeNameDialog = ({ open, close, role }) => {
  const [openConfirmationDialog, setOpenConfirmationDialog] = useState(false)

  const classes = useStyles()

  const { enqueueSnackbar } = useSnackbar()

  const { UpdateProfile } = useContext(AuthContext)

  const initialState = {
    name: '',
  }

  const validate = (fieldValues = values) => {
    const temp = { ...errors }
    if ('name' in fieldValues)
      temp.name = fieldValues.name ? '' : 'This field is required'
    setErrors({
      ...temp,
    })

    if (fieldValues === values)
      return Object.values(temp).every((x) => x === '')
  }

  const { values, errors, setErrors, handleInputChange } = useForm(
    initialState,
    true,
    validate,
  )

  const handleOpenConfirmDialog = (e) => {
    e.preventDefault()
    if (validate()) {
      close()
      if (role === 'T') handleSubmit()
      else if (role === 'S') setOpenConfirmationDialog(true)
    }
  }

  const handleClose = () => {
    setOpenConfirmationDialog(false)
  }

  const handleSubmit = async () => {
    const res = await UpdateProfile({ name: values.name })
    if (res.success) {
      handleClose()
      showSuccessSnackbar(enqueueSnackbar, 'Name Updated!')
    }
  }

  const confirmDialogContent = () => (
    <div className="text-align-center">
      <p>You can only change your name once. </p>
      <p>
        Change name to{' '}
        <span className="bold">&quot;{`${values.name}`}&quot;</span>?
      </p>
    </div>
  )

  return (
    <>
      <Dialog open={open} fullWidth onClose={close}>
        <DialogTitle>
          <div className={classes.header}>
            <p className="sub-text bold text-align-center">Change Name</p>
            <IconButton className={classes.close} onClick={close}>
              <IoCloseSharp />
            </IconButton>
          </div>
        </DialogTitle>
        <Divider />
        <DialogContent>
          <Form onSubmit={handleOpenConfirmDialog}>
            <div className="form-control width-100">
              <Controls.Input
                type="text"
                name="name"
                value={values.name}
                onChange={handleInputChange}
                autoFocus
                placeholder="Name"
                error={errors.name}
              />
            </div>
          </Form>
        </DialogContent>
        <Divider />
        <DialogActions>
          <div className={classes.btn_div}>
            <Controls.Button
              text="Save Name"
              type="submit"
              className={classes.btn}
              onClick={handleOpenConfirmDialog}
            />
          </div>
        </DialogActions>
      </Dialog>
      <ConfirmDialog
        open={openConfirmationDialog}
        setOpen={handleClose}
        title="Change Name"
        content={confirmDialogContent()}
        yesAction={handleSubmit}
        noAction={handleClose}
      />
    </>
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
    message: {
      fontSize: '1rem',
    },
    btn: {
      backgroundColor: '#6481e4',
      '&:hover': {
        backgroundColor: '#6481e4',
      },
      margin: '0 20px',
      alignSelf: 'center',
      width: '50%',
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

export default ChangeNameDialog
