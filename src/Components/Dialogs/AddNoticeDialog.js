/* eslint-disable no-unused-vars */
import {
  Collapse,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  Grid,
  IconButton,
  makeStyles,
  Radio,
  TextField,
} from '@material-ui/core'
import React, { useContext, useEffect, useState } from 'react'
import { IoIosClose } from 'react-icons/io'
import { withStyles } from '@material-ui/core/styles'
import {
  MuiPickersUtilsProvider,
  KeyboardDatePicker,
} from '@material-ui/pickers'
import DateFnsUtils from '@date-io/date-fns'
import Controls from '../Controls/Controls'
import Dialog from './Dialog'
import { BatchContext } from '../../Context/BatchContext'
import {
  HoursMinutesToObject,
  ObjToHoursMinutes,
  ConvertTime,
  isDateInPast,
  isTimeInPast,
} from '../../Global/Functions'

const AddNoticeDialog = ({
  open,
  setOpen,
  batchId,
  mode,
  notice,
  noticeTime,
  noticeId,
  fetchData,
}) => {
  const classes = useStyles()

  const defaultDate = new Date()

  const [messageValue, setMessageValue] = useState(mode === 'Add' ? '' : notice)
  const [msgError, setMsgError] = useState('')
  const [dueDateError, setDueDateError] = useState('')
  const [dueTimeError, setDueTimeError] = useState('')
  const [selectedDate, setSelectedDate] = useState(defaultDate)
  const [selectedTime, setSelectedTime] = useState(defaultDate)
  const [radio, setRadio] = useState(mode === 'Add' ? 'now' : 'later')
  const [allowSubmit, setAllowSubmit] = useState(false)

  const { SendBatchNotice, UpdateBatchNotice } = useContext(BatchContext)

  const StyledRadio = withStyles({
    root: {
      color: '#638FE5',
      '&$checked': {
        color: '#638FE5',
      },
    },
    checked: {},
  })((props) => <Radio color="default" {...props} />)

  const handleDateChange = (date) => {
    setSelectedDate(date)
  }

  const handleTimeChange = (t) => {
    const time = HoursMinutesToObject(t.target.value)
    setSelectedTime(time)
  }

  const handleRadioChange = (e) => {
    setRadio(e.target.value)
    setTimeout(() => {
      setSelectedDate(defaultDate)
      setSelectedTime(defaultDate)
    }, 500)
  }

  const validate = () => {
    if (selectedDate === null || selectedDate.toString() === 'Invalid Date') {
      setDueDateError('Please select a valid date')
    } else if (isDateInPast(selectedDate)) {
      setDueDateError('Date cannot be in past')
    } else {
      setDueDateError('')
    }
    if (radio === 'now') {
      setDueTimeError('')
    } else if (selectedTime.toString() === 'Invalid Date') {
      setDueTimeError('Please select a valid Time')
    } else if (!isDateInPast(selectedDate)) {
      const tempDate = new Date()
      tempDate.setTime(selectedTime.getTime())
      tempDate.setDate(selectedDate.getDate())
      tempDate.setMonth(selectedDate.getMonth())
      tempDate.setFullYear(selectedDate.getFullYear())

      if (isTimeInPast(tempDate)) {
        setDueTimeError('Time cannot be in past')
      } else {
        setDueTimeError('')
      }
    } else {
      setDueTimeError('')
    }

    if (messageValue.trim().length === 0) {
      setMsgError('Please enter a notice')
    } else if (messageValue.trim().length > 300) {
      setMsgError('Too Long')
    } else {
      setMsgError('')
    }
  }

  useEffect(() => {
    if (mode === 'Add') {
      setSelectedDate(defaultDate)
      setSelectedTime(defaultDate)
    } else {
      const tempDate = new Date(ConvertTime(noticeTime))
      setSelectedDate(tempDate)
      setSelectedTime(tempDate)
    }
  }, [])

  useEffect(() => {
    validate()
  }, [selectedTime, selectedDate, messageValue])

  useEffect(() => {
    if (dueDateError.length !== 0) {
      setAllowSubmit(false)
    } else if (dueTimeError.length !== 0) {
      setAllowSubmit(false)
    } else if (msgError.length !== 0) {
      setAllowSubmit(false)
    } else {
      setAllowSubmit(true)
    }
  })

  const handleClose = () => {
    setOpen(false)
    setTimeout(() => {
      setMessageValue('')
      setRadio('now')
      setSelectedTime(defaultDate)
      setSelectedDate(defaultDate)
    }, 500)
  }

  const handlePostNotice = async () => {
    const tempDueDate = new Date(0)
    tempDueDate.setTime(selectedTime.getTime())
    tempDueDate.setDate(selectedDate.getDate())
    tempDueDate.setFullYear(selectedDate.getFullYear())
    tempDueDate.setMonth(selectedDate.getMonth())

    const dueDate = Math.floor(tempDueDate.getTime() / 1000)

    const res = await SendBatchNotice({
      batch: batchId,
      message: messageValue,
      schedule_time: dueDate,
    })

    if (res === 201) {
      handleClose()
      fetchData()
    }
  }

  const handleUpdateNotice = async () => {
    const tempDueDate = new Date(0)
    tempDueDate.setTime(selectedTime.getTime())
    tempDueDate.setDate(selectedDate.getDate())
    tempDueDate.setFullYear(selectedDate.getFullYear())
    tempDueDate.setMonth(selectedDate.getMonth())

    const dueDate = Math.floor(tempDueDate.getTime() / 1000)

    const res = await UpdateBatchNotice({
      id: noticeId,
      batch: batchId,
      message: messageValue,
      schedule_time: dueDate,
    })

    if (res === 200) {
      handleClose()
      fetchData()
    }
  }

  return (
    <>
      <Dialog open={open} onClose={handleClose} className={classes.root}>
        <IconButton className={classes.closeBtn} onClick={handleClose}>
          <IoIosClose />
        </IconButton>
        <DialogTitle>
          <p className="sub-text bold text-align-center">
            {mode === 'Add' ? 'Add Notice' : 'Edit Notice'}
          </p>
        </DialogTitle>
        <Divider />
        <DialogContent>
          <Grid container>
            <Grid item xs={12}>
              <div className="form-control width-100">
                <div className="form-control-label bold text-align-left">
                  Notice
                </div>
                <Controls.Input
                  placeholder="Enter your notice here....."
                  multiline
                  rows={4}
                  value={messageValue}
                  onChange={(e) => setMessageValue(e.target.value)}
                  error={msgError}
                  fullWidth
                />
              </div>
            </Grid>
            <Grid item xs={12}>
              <div className="form-control width-100">
                <div className="form-control-label bold text-align-left">
                  Post
                </div>
                <div className={classes.radioDiv}>
                  <div className={classes.radio}>
                    <StyledRadio
                      value="now"
                      name="now"
                      onChange={handleRadioChange}
                      checked={radio === 'now'}
                    />
                    <p>Now</p>
                  </div>
                  <div className={classes.radio}>
                    <StyledRadio
                      value="later"
                      name="later"
                      onChange={handleRadioChange}
                      checked={radio === 'later'}
                    />
                    <p>Schedule for Later</p>
                  </div>
                </div>
              </div>
            </Grid>
            <Collapse in={radio === 'later'} className="width-100">
              <Grid item xs={12}>
                <div className="form-control width-100">
                  <div className="form-control-label bold text-align-left">
                    Post Date/Time
                  </div>
                  <div className={classes.scheduleDiv}>
                    <MuiPickersUtilsProvider utils={DateFnsUtils}>
                      <Grid container spacing={3}>
                        <Grid item xs={6}>
                          <KeyboardDatePicker
                            disableToolbar
                            inputVariant="outlined"
                            format="dd/MM/yyyy"
                            value={selectedDate}
                            id="date-picker"
                            onChange={handleDateChange}
                            KeyboardButtonProps={{
                              'aria-label': 'change date',
                            }}
                            error={dueDateError}
                            helperText={dueDateError}
                          />
                        </Grid>
                        <Grid item xs={6}>
                          <TextField
                            id="time"
                            type="time"
                            variant="outlined"
                            value={ObjToHoursMinutes(selectedTime)}
                            onChange={handleTimeChange}
                            InputLabelProps={{
                              shrink: true,
                            }}
                            inputProps={{
                              step: 300, // 5 min
                            }}
                            error={dueTimeError}
                            helperText={dueTimeError}
                            fullWidth
                          />
                        </Grid>
                      </Grid>
                    </MuiPickersUtilsProvider>
                  </div>
                </div>
              </Grid>
            </Collapse>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Controls.Button
            size="large"
            onClick={mode === 'Add' ? handlePostNotice : handleUpdateNotice}
            className={classes.btn}
            text={mode === 'Add' ? 'Done' : 'Update'}
            disabled={!allowSubmit}
          />
        </DialogActions>
      </Dialog>
    </>
  )
}

export default AddNoticeDialog

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
  radioDiv: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '70%',
  },
  radio: {
    display: 'flex',
    alignItems: 'center',
    marginRight: 20,
  },
  scheduleDiv: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  btn: {
    margin: '0 auto 1rem',
    width: '70%',
  },
})
