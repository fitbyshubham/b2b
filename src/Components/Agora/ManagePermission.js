import { FormControlLabel, makeStyles, Switch } from '@material-ui/core'
import React, { useContext } from 'react'
import { AgoraContext } from '../../Context/AgoraContext'
import { AuthContext } from '../../Context/AuthContext'

const ManagePermission = ({ mode }) => {
  const { giveAVPermissionToStudent, setGiveAVPermissionToStudent } =
    useContext(AgoraContext)

  const { authState } = useContext(AuthContext)
  const classes = useStyles()

  const setPermission = () => {
    setGiveAVPermissionToStudent((perm) => !perm)
  }
  return (
    <div className={mode !== 'controls' ? classes.permissionPanel : null}>
      {authState.role === 'T' && (
        <FormControlLabel
          className={
            mode !== 'controls'
              ? classes.formControl
              : classes.formControlSettings
          }
          control={
            <Switch
              checked={giveAVPermissionToStudent}
              onChange={setPermission}
              name="AVpermission"
              color="primary"
            />
          }
          label="Allow students to manage mic & camera"
          labelPlacement="start"
        />
      )}
    </div>
  )
}

export default ManagePermission

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
    padding: '0 0.5rem',
  },
})
