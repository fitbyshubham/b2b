import { FormControlLabel, makeStyles, Switch } from '@material-ui/core'
import React, { useContext } from 'react'
import { CommandContext } from '../../Context/CommandContext'
import { AuthContext } from '../../Context/AuthContext'

const ManageChatPermission = ({ mode }) => {
  const { disableChatForClass, setDisableChatForClass } =
    useContext(CommandContext)

  const { authState } = useContext(AuthContext)
  const classes = useStyles()

  const setPermission = () => {
    setDisableChatForClass((perm) => !perm)
  }
  return (
    <div className={classes.permissionPanel}>
      {authState.role === 'T' && (
        <FormControlLabel
          className={
            mode !== 'controls'
              ? classes.formControl
              : classes.formControlSettings
          }
          control={
            <Switch
              checked={!disableChatForClass}
              onChange={setPermission}
              name="ChatPermission"
              color="primary"
            />
          }
          label="Allow chat in class"
          labelPlacement="start"
        />
      )}
    </div>
  )
}

export default ManageChatPermission

const useStyles = makeStyles({
  permissionPanel: {
    backgroundColor: '#ebebeb',
  },
  formControl: {
    marginRight: 'unset',
    padding: '0 1.5rem',
  },
  formControlSettings: {
    marginRight: 'unset',
    padding: '0 0',
  },
})
