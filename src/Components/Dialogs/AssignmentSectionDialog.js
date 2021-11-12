import React, { useState, useContext, useEffect } from 'react'
import {
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  Divider,
  Grid,
  Menu,
  MenuItem,
  InputAdornment,
  MenuList,
} from '@material-ui/core'
import DateFnsUtils from '@date-io/date-fns'
import {
  MuiPickersUtilsProvider,
  KeyboardDatePicker,
} from '@material-ui/pickers'
import AttachFileIcon from '@material-ui/icons/AttachFile'
import { IoCloseSharp } from 'react-icons/io5'
import { makeStyles, createStyles } from '@material-ui/core/styles'
import CancelIcon from '@material-ui/icons/Cancel'
import { useHistory } from 'react-router-dom'
import Controls from '../Controls/Controls'
import { BatchContext } from '../../Context/BatchContext'
import AssignmentFileCard from '../Cards/AssignmentFileCard'
import { AuthContext } from '../../Context/AuthContext'
import Dialog from './Dialog'
import Spinner from '../Progress/Spinner'
import {
  HoursMinutesToObject,
  ObjToHoursMinutes,
  ConvertTime,
  CheckLink,
  OpenFileInNewTab,
} from '../../Global/Functions'

const AssignmentSectionDialog = ({
  open,
  closeDialog,
  batchId,
  fetchData,
  assignmentId,
  editMode,
  assignmentName,
}) => {
  const classes = useStyles()
  const history = useHistory()
  const defaultDate = new Date()
  const [files, setFiles] = useState({ selected: false, data: [] })
  const [links, setLinks] = useState({ selected: false, data: [] })
  const [editModeAttachments, setEditModeAttachments] = useState([])
  const [assignmentTitle, setAssignmentTitle] = useState('')
  const [assignmentInstructions, setAssignmentIsntructions] = useState('')
  const [batchMenu, setBatchMenu] = useState(null)
  const [titleError, setTitleError] = useState('')
  const [dueDateError, setDueDateError] = useState('')
  const [dueTimeError, setDueTimeError] = useState('')
  const [instructionsError, setInstructionsError] = useState('')
  const [studentCommentError, setStudentCommentError] = useState('')
  const [selectedDate, setSelectedDate] = useState(defaultDate)
  const [selectedTime, setSelectedTime] = useState(defaultDate)
  const [allowSubmit, setAllowSubmit] = useState(false)
  const [submitBtnLoading, setSubmitBtnLoading] = useState(false)
  const [studentComment, setStudentComment] = useState('')
  const { authState } = useContext(AuthContext)
  const { role } = authState

  const {
    CreateAssignments,
    SubmitAssignment,
    GetAssignmentById,
    UpdateAssignment,
  } = useContext(BatchContext)

  useEffect(async () => {
    if (editMode) {
      const res = await GetAssignmentById(assignmentId)
      setAssignmentTitle(res.title)
      setAssignmentIsntructions(res.instructions)
      setSelectedDate(ConvertTime(res.due_date))
      setSelectedTime(ConvertTime(res.due_date))
      if (res.links.length !== 0) {
        setLinks({ ...links, selected: true, data: res.links })
      }
      if (res.attachments.length !== 0) {
        setEditModeAttachments(res.attachments)
      }
    }
  }, [])

  const handleDateChange = (date) => {
    setSelectedDate(date)
  }

  const handleTimeChange = (t) => {
    const time = HoursMinutesToObject(t.target.value)
    setSelectedTime(time)
  }

  const onClose = () => {
    closeDialog()
    setAssignmentTitle('')
    setAssignmentIsntructions('')
    setFiles({ selected: false, data: [] })
    setLinks({ selected: false, data: [] })
  }

  const handleOpenBatchMenu = (event) => {
    setBatchMenu(event.currentTarget)
  }

  const handleCloseBatchMenu = () => {
    setBatchMenu(null)
  }

  const changeHandlerFile = (e) => {
    for (let i = 0; i < e.target.files.length; i += 1) {
      setFiles({ selected: true, data: files.data.concat(e.target.files[i]) })
    }
    handleCloseBatchMenu()
  }

  const changeHandlerLink = () => {
    setLinks({ selected: true, data: [...links.data, { link: '' }] })
    handleCloseBatchMenu()
  }

  const handleLinkChange = (e, i) => {
    const tempData = [...links.data]
    tempData[i].link = e.target.value
    setLinks({ ...links, data: tempData })
  }

  const handleNoteTitleChange = (event) => {
    setAssignmentTitle(event.target.value)
  }

  const handleInstructionsChange = (event) => {
    setAssignmentIsntructions(event.target.value)
  }

  const handleStudentCommentChange = (event) => {
    setStudentComment(event.target.value)
  }

  const clearEditModeAttachments = (index) => {
    const tempData = [...editModeAttachments]
    tempData.splice(index, 1)
    setEditModeAttachments(tempData)
  }

  const clearFiles = (index) => {
    const tempData = [...files.data]
    let isSelected = files.selected
    if (files.data.length === 1) {
      tempData.splice(index, 1)
      isSelected = false
    } else {
      tempData.splice(index, 1)
    }
    setFiles({ selected: isSelected, data: tempData })
  }

  const clearLinks = (index) => {
    const tempData = [...links.data]
    let isSelected = links.selected
    if (links.data.length === 1) {
      tempData.splice(index, 1)
      isSelected = false
    } else {
      tempData.splice(index, 1)
    }
    setLinks({ selected: isSelected, data: tempData })
  }

  const validate = () => {
    if (assignmentTitle.length < 1) {
      setTitleError('Please provide the title')
    } else {
      setTitleError('')
    }

    if (assignmentInstructions.length < 1) {
      setInstructionsError('Please provide instructions')
    } else {
      setInstructionsError('')
    }

    if (selectedDate === null || selectedDate.toString() === 'Invalid Date') {
      setDueDateError('Please select a valid date')
    } else {
      setDueDateError('')
    }

    if (selectedTime.toString() === 'Invalid Date') {
      setDueTimeError('Please select a valid Time')
    } else {
      setDueTimeError('')
    }

    if (studentComment.length < 1) {
      setStudentCommentError('Please Comment Something')
    } else {
      setStudentCommentError('')
    }
  }

  const ValidateLinks = () => {
    const tempArr = []
    if (links.selected) {
      links.data.forEach((element) => {
        if (CheckLink(element.link)) {
          tempArr.push(true)
        } else {
          tempArr.push(false)
        }
      })
    }
    return tempArr.every((v) => v === true)
  }

  useEffect(() => {
    validate()
  }, [
    assignmentTitle,
    assignmentInstructions,
    selectedDate,
    selectedTime,
    studentComment,
  ])

  useEffect(() => {
    if (role === 'T') {
      if (titleError.length !== 0) {
        setAllowSubmit(false)
      } else if (dueDateError.length !== 0) {
        setAllowSubmit(false)
      } else if (dueTimeError.length !== 0) {
        setAllowSubmit(false)
      } else if (instructionsError.length !== 0) {
        setAllowSubmit(false)
      } else if (
        files.selected === false &&
        links.selected === false &&
        editModeAttachments.length === 0
      ) {
        setAllowSubmit(false)
      } else if (submitBtnLoading) {
        setAllowSubmit(false)
      } else if (!ValidateLinks()) {
        setAllowSubmit(false)
      } else {
        setAllowSubmit(true)
      }
    } else if (files.selected === false && links.selected === false) {
      setAllowSubmit(false)
    } else if (submitBtnLoading) {
      setAllowSubmit(false)
    } else if (!ValidateLinks()) {
      setAllowSubmit(false)
    } else if (studentCommentError.length !== 0) {
      setAllowSubmit(false)
    } else {
      setAllowSubmit(true)
    }
  }, [
    titleError,
    dueDateError,
    dueTimeError,
    files,
    submitBtnLoading,
    links,
    studentCommentError,
    editModeAttachments,
    instructionsError,
  ])

  const handleSubmission = async () => {
    if (role === 'T') {
      setSubmitBtnLoading(true)
      const tempDueDate = new Date(0)
      tempDueDate.setTime(selectedTime.getTime())
      tempDueDate.setDate(selectedDate.getDate())
      tempDueDate.setFullYear(selectedDate.getFullYear())
      tempDueDate.setMonth(selectedDate.getMonth())

      const dueDate = Math.floor(tempDueDate.getTime() / 1000)

      const res = await CreateAssignments(
        assignmentTitle,
        assignmentInstructions,
        files.data,
        links.data,
        dueDate,
        batchId,
      )
      setSubmitBtnLoading(false)

      if (res === 201) {
        fetchData()
        onClose()
      }
    } else {
      setSubmitBtnLoading(true)

      const res = await SubmitAssignment(
        assignmentId,
        studentComment,
        files.data,
        links.data,
      )
      setSubmitBtnLoading(false)

      if (res === 201) {
        fetchData()
        onClose()
        history.push(`/dashboard/assignment/${batchId}`)
      }
    }
  }

  const handleUpdateAssignment = async () => {
    setSubmitBtnLoading(true)
    const tempDueDate = new Date(0)
    tempDueDate.setTime(selectedTime.getTime())
    tempDueDate.setDate(selectedDate.getDate())
    tempDueDate.setFullYear(selectedDate.getFullYear())
    tempDueDate.setMonth(selectedDate.getMonth())

    const dueDate = Math.floor(tempDueDate.getTime() / 1000)

    const existingPaths = []

    editModeAttachments.forEach((element) => {
      existingPaths.push({
        storage_path: element.file.split('?')[0],
      })
    })

    const res = await UpdateAssignment(
      assignmentId,
      assignmentTitle,
      assignmentInstructions,
      files.data,
      links.data,
      existingPaths,
      dueDate,
    )
    setSubmitBtnLoading(false)

    if (res === 201) {
      onClose()
      fetchData()
    }
  }

  return (
    <>
      <Dialog open={open} maxWidth={role === 'T' ? 'md' : 'sm'}>
        <Menu
          id="batch-menu"
          anchorEl={batchMenu}
          getContentAnchorEl={null}
          anchorOrigin={{
            vertical: 'bottom',
            horizontal: 'center',
          }}
          transformOrigin={{
            vertical: 'top',
            horizontal: 'center',
          }}
          keepMounted
          open={Boolean(batchMenu)}
          onClose={handleCloseBatchMenu}
        >
          <MenuList>
            <MenuItem onClick={changeHandlerLink}>Add Link</MenuItem>
            <Divider />
            <MenuItem>
              <input
                className={classes.upload}
                id="upload"
                onChange={changeHandlerFile}
                type="file"
                accept="image/jpeg,image/png,application/pdf,image/jpg, application/docx"
              />
              <label htmlFor="upload">Add File</label>
            </MenuItem>
          </MenuList>
        </Menu>
        <DialogTitle>
          <div className={classes.header}>
            <p className="bolder">
              {role === 'T' ? (
                <>{editMode ? 'Edit Assignment' : 'Upload Assignment'}</>
              ) : (
                assignmentName
              )}
            </p>
            <IconButton className={classes.close} onClick={onClose}>
              <IoCloseSharp />
            </IconButton>
          </div>
        </DialogTitle>
        <Divider />
        <DialogContent>
          {role === 'T' && (
            <Grid container spacing={2} className={classes.gridContainer}>
              <Grid item xs={6}>
                <div className="form-control-label">Assignment Title</div>
                <Controls.Input
                  className={classes.input}
                  placeholder="Enter Assignment Title"
                  value={assignmentTitle}
                  autoFocus
                  onChange={handleNoteTitleChange}
                  error={titleError}
                />
              </Grid>
              <Grid item xs={3}>
                <div className="form-control-label">Due Date</div>
                <MuiPickersUtilsProvider utils={DateFnsUtils}>
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
                    error={Boolean(dueDateError)}
                  />
                </MuiPickersUtilsProvider>
              </Grid>
              <Grid item xs={3}>
                <div className="form-control-label">Due Time</div>
                <Controls.Input
                  id="time"
                  type="time"
                  variant="outlined"
                  value={ObjToHoursMinutes(selectedTime)}
                  className={classes.input}
                  onChange={handleTimeChange}
                  InputLabelProps={{
                    shrink: true,
                  }}
                  inputProps={{
                    step: 300, // 5 min
                  }}
                  error={dueTimeError}
                />
              </Grid>
            </Grid>
          )}
          {role === 'T' && (
            <Grid container>
              <Grid item xs={12}>
                <div className="form-control-label">Instructions</div>
                <Controls.Input
                  id="outlined-textarea"
                  multiline
                  placeholder="Enter Instructions....."
                  value={assignmentInstructions}
                  className={classes.input}
                  onChange={handleInstructionsChange}
                  variant="outlined"
                  rows={4}
                  error={instructionsError}
                />
              </Grid>
            </Grid>
          )}
          <Grid
            container
            justifyContent={role === 'S' ? 'center' : 'flex-start'}
            className={classes.gridButton}
          >
            <Grid item style={{ width: '45%' }}>
              <Controls.Button
                variant="outlined"
                color="inherit"
                onClick={handleOpenBatchMenu}
                className={classes.statusBox}
                text="Add File or URL"
                startIcon={<AttachFileIcon />}
              />
            </Grid>
          </Grid>
          <div>
            {links.selected ? (
              <Grid spacing={1} container>
                <Grid item xs={12}>
                  <p className={classes.heading}>Links</p>
                </Grid>
                {links.data.map((item, i) => (
                  <Grid item xs={12}>
                    <Controls.Input
                      id="outlined-adornment-amount"
                      placeholder="Enter Link"
                      value={item.link}
                      onChange={(e) => handleLinkChange(e, i)}
                      autoFocus
                      InputProps={{
                        endAdornment: (
                          <InputAdornment position="end">
                            <CancelIcon
                              className={classes.cancel}
                              onClick={() => clearLinks(i)}
                            />
                          </InputAdornment>
                        ),
                      }}
                      error={!CheckLink(item.link)}
                      className={classes.input}
                    />
                  </Grid>
                ))}
              </Grid>
            ) : null}
          </div>
          <div>
            {editMode && (
              <>
                {editModeAttachments.length !== 0 && (
                  <Grid container spacing={1}>
                    <Grid item xs={12}>
                      <p className={classes.heading}>Uploaded Files</p>
                    </Grid>
                    {editModeAttachments.map((item, i) => (
                      <Grid item xs={role === 'T' ? 3 : 4}>
                        <AssignmentFileCard
                          name={`File ${i + 1}`}
                          clearFiles={clearEditModeAttachments}
                          index={i}
                          onNameClick={() => {
                            OpenFileInNewTab(item.file)
                          }}
                        />
                      </Grid>
                    ))}
                  </Grid>
                )}
              </>
            )}
            {files.selected ? (
              <Grid container spacing={1}>
                <Grid item xs={12}>
                  <p className={classes.heading}>New Files</p>
                </Grid>
                {Object.keys(files.data).map((item, i) => (
                  <Grid item xs={role === 'T' ? 3 : 4}>
                    <AssignmentFileCard
                      name={
                        files.data[item].name.length > 10
                          ? `${files.data[item].name.slice(0, 10)}...`
                          : files.data[item].name
                      }
                      clearFiles={clearFiles}
                      index={i}
                    />
                  </Grid>
                ))}
              </Grid>
            ) : null}
          </div>
          {role === 'S' && (
            <>
              <Divider variant="fullWidth" className={classes.divider} />
              <div className={classes.studentComment}>
                <div className="form-control-label">Comment</div>
                <Controls.Input
                  id="outlined-textarea"
                  multiline
                  value={studentComment}
                  className={classes.input}
                  onChange={handleStudentCommentChange}
                  variant="outlined"
                  rows={4}
                  error={studentCommentError}
                />
              </div>
            </>
          )}
        </DialogContent>
        <Divider />
        <DialogActions className={classes.actions}>
          <Controls.Button
            disabled={!allowSubmit}
            startIcon={
              submitBtnLoading && (
                <Spinner
                  size={20}
                  className="margin-left-unset position-unset"
                  color="inherit"
                />
              )
            }
            onClick={editMode ? handleUpdateAssignment : handleSubmission}
            style={{ width: '45%' }}
          >
            {role === 'T' ? (
              <>{editMode ? 'Update Assignment' : 'Upload Assignment'}</>
            ) : (
              'Submit Assignment'
            )}
          </Controls.Button>
        </DialogActions>
      </Dialog>
    </>
  )
}

const useStyles = makeStyles(() =>
  createStyles({
    gridContainer: {
      padding: '20px 0',
    },
    close: {
      position: 'absolute',
      right: 10,
    },
    header: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      margin: '20px 0px 0px 0px',
    },
    input: {
      width: '100%',
    },
    upload: {
      display: 'none',
    },
    actions: {
      padding: '1rem',
      display: 'flex',
      justifyContent: 'center',
    },
    gridButton: {
      margin: '2rem 0 1rem 0',
    },
    cancel: {
      cursor: 'pointer',
    },
    heading: {
      margin: '20px 0px 0px 0px',
    },
    statusBox: {
      border: '1px solid #ffb031',
      padding: '10px 20px',
      borderRadius: '2px',
      fontSize: '0.9rem',
      fontWeight: 'bold',
      backgroundColor: 'rgba(255, 176, 49, 0.1)',
    },
    studentComment: {
      margin: '25px 0px',
    },
    divider: {
      margin: '20px 0px',
    },
    note: {
      color: 'crimson',
      fontSize: '0.9rem',
      margin: '10px 0px 0px 0px',
    },
  }),
)

export default AssignmentSectionDialog
