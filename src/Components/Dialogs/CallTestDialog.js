import {
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  Grid,
} from '@material-ui/core'
import { makeStyles, createStyles } from '@material-ui/core/styles'
import React, { useContext, useEffect, useState } from 'react'
import { AgoraContext } from '../../Context/AgoraContext'
import useForm from '../../Hooks/useForm'
import Controls from '../Controls/Controls'
import Form from '../Form/Form'
import MediaPlayerCallTest from '../Agora/MediaPlayerCallTest'
import Spinner from '../Progress/Spinner'
import Loader from '../Progress/Loader'
import SpeakerTestAlert from '../../Assets/Sounds/speaker_test_alert.mp3'
import Dialog from './Dialog'

const CallTestDialog = ({ open, handleClose, dialogName }) => {
  const {
    GetCameras,
    GetMicrophones,
    allCameras,
    allMicrophones,
    testVolumeLevel,
    clearResources,
    localMediaTrack,
    inputDeviceIds,
    GetCameraStream,
    GetMicrophoneStream,
    SetCameraId,
    SetMicrophoneId,
    setInputDeviceIds,
  } = useContext(AgoraContext)
  const [loading, setLoading] = useState(true)
  const classes = useStyles()
  const initialDeviceData = {
    cameraId: inputDeviceIds.cameraId,
    microphoneId: inputDeviceIds.microphoneId,
  }
  const { values, errors, resetForm, setValues } = useForm(initialDeviceData)
  async function init() {
    const cameras = await GetCameras()
    const microphones = await GetMicrophones()
    return { cameras, microphones }
  }
  useEffect(() => {
    if (!open) {
      return
    }
    async function getStreams() {
      setLoading(true)
      const { cameras, microphones } = await init()
      if (
        cameras.find((camera) => camera.id === inputDeviceIds.cameraId) ===
        undefined
      ) {
        SetCameraId(cameras[0].id)
      }
      if (
        microphones.find((mic) => mic.id === inputDeviceIds.microphoneId) ===
        undefined
      ) {
        SetMicrophoneId(microphones[0].id)
      }
      if (inputDeviceIds.cameraId !== '') {
        await GetCameraStream(inputDeviceIds.cameraId)
      }
      if (inputDeviceIds.microphoneId !== '') {
        await GetMicrophoneStream(inputDeviceIds.microphoneId)
      }
      setLoading(false)
    }
    getStreams()
  }, [open])
  useEffect(() => {
    setValues((data) => ({ ...data, cameraId: inputDeviceIds.cameraId }))
  }, [inputDeviceIds.cameraId])
  useEffect(() => {
    setValues((data) => ({
      ...data,
      microphoneId: inputDeviceIds.microphoneId,
    }))
  }, [inputDeviceIds.microphoneId])
  const closeDialog = () => {
    clearResources()
    resetForm()
    handleClose()
  }
  const handleSubmit = () => {
    closeDialog()
  }
  const handleInputChange = (e) => {
    const { name, value } = e.target
    setValues({
      ...values,
      [name]: value,
    })
    setInputDeviceIds(() => {
      if (name === 'cameraId') {
        GetCameraStream(value)
      } else {
        GetMicrophoneStream(value)
      }
      return {
        ...inputDeviceIds,
        [name]: value,
      }
    })
  }

  return (
    <Dialog open={open} fullWidth maxWidth="xs">
      <DialogTitle>
        <p className="sub-text bold text-align-center">
          {dialogName || 'Select and Test Devices'}
        </p>
      </DialogTitle>
      <Divider />
      <DialogContent>
        {loading && <Spinner />}
        {!loading && (
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <Form>
                <div className="form-control width-100">
                  <div className="form-control-label bold">Select Camera</div>
                  <MediaPlayerCallTest
                    videoTrack={localMediaTrack.localVideoTrack}
                    className={classes.videoTrack}
                  />
                  <Controls.Select
                    label="Select Camera"
                    name="cameraId"
                    value={values.cameraId}
                    onChange={handleInputChange}
                    error={errors.cameraId}
                    options={allCameras}
                  />
                </div>
                <div className="form-control width-100">
                  <div className="form-control-label bold">
                    Select Microphone
                  </div>
                  <Loader value={testVolumeLevel} className={classes.loader} />
                  <Controls.Select
                    label="Select Microphone"
                    name="microphoneId"
                    value={values.microphoneId}
                    onChange={handleInputChange}
                    error={errors.microphoneId}
                    options={allMicrophones}
                  />
                </div>
                <div className="form-control width-100">
                  <div className="form-control-label bold">
                    Play Audio to Test Speakers
                  </div>
                  <audio controls className={classes.audio} loop preload="auto">
                    <source src={SpeakerTestAlert} />
                    <p className="fine-text bold">
                      Your browser does not support the audio element, you need
                      that to test your speakers
                    </p>
                  </audio>
                </div>
              </Form>
            </Grid>
          </Grid>
        )}
      </DialogContent>
      <Divider />
      <DialogActions>
        <Controls.Button
          text="Continue"
          onClick={handleSubmit}
          className={classes.btn}
        />
      </DialogActions>
    </Dialog>
  )
}
export default CallTestDialog

const useStyles = makeStyles(() =>
  createStyles({
    closeBtn: {
      position: 'absolute',
      right: 12,
      top: 12,
    },
    videoTrack: {
      width: '100%',
      height: '180px',
    },
    loader: {
      marginTop: '1rem',
      marginBottom: '0.7rem',
    },
    audio: {
      width: '100%',
      outline: 'none',
    },
    btn: {
      margin: '1rem',
    },
  }),
)
