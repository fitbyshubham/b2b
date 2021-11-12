import React, { useContext, useState } from 'react'
import {
  Grid,
  DialogTitle,
  Divider,
  IconButton,
  makeStyles,
  DialogActions,
} from '@material-ui/core'
import { IoPersonCircle } from 'react-icons/io5'
import { IoIosClose } from 'react-icons/io'
import Controls from '../Controls/Controls'
import Dialog from './Dialog'
import { BatchContext } from '../../Context/BatchContext'
import FileInfoCard from '../Cards/FileInfoCard'
import { DisplayDate, ConvertTime } from '../../Global/Functions'

const AssignmentResponseDialog = ({
  open,
  setOpen,
  submission_id,
  data,
  name,
  submitted_on,
  refresh,
}) => {
  const classes = useStyles()
  const { EvaluateAssignment } = useContext(BatchContext)
  const [comment, setComment] = useState('')

  const handleClose = () => {
    setOpen(false)
    setComment('')
  }

  const handleCommentChange = (e) => {
    setComment(e.target.value)
  }

  const handleEvaluate = async () => {
    const res = await EvaluateAssignment(comment, submission_id)

    if (res === 204) {
      handleClose()
      refresh()
    }
  }

  return (
    <Dialog open={open} onClose={handleClose}>
      <Grid container className={classes.gridContainer}>
        <Grid item xs={12} className="text-align-center">
          <IconButton className={classes.closeBtn} onClick={handleClose}>
            <IoIosClose />
          </IconButton>
          <DialogTitle>Assignment Response</DialogTitle>
        </Grid>
      </Grid>
      <Divider orientation="horizontal" variant="fullWidth" />
      <Grid container className={classes.gridContainer}>
        <Grid item xs={12}>
          <div className={classes.user}>
            <IoPersonCircle color="#ffa92b" size={45} />
            <div>
              <p className={classes.userName}>{name}</p>
              <p className={classes.submitted}>
                Submitted on {DisplayDate(ConvertTime(submitted_on))}
              </p>
            </div>
          </div>
        </Grid>
      </Grid>
      <Divider orientation="horizontal" variant="fullWidth" />
      <Grid container className={classes.gridContainer}>
        <Grid item xs={12}>
          <div className={classes.documents}>
            {data.attachments.length !== 0 && (
              <div className={classes.document}>
                <p className="finer-text">Files</p>
                <Grid spacing={1} container>
                  {data.attachments.map((item, i) => (
                    <Grid item md={4}>
                      <FileInfoCard
                        type="file"
                        fileName={`File ${i + 1}`}
                        index={i}
                        data={item}
                        key={item.id}
                        dialog
                      />
                    </Grid>
                  ))}
                </Grid>
              </div>
            )}
            {data.links.length !== 0 && (
              <div className={classes.document}>
                <p className="finer-text">Links</p>
                <Grid spacing={1} container>
                  {data.links.map((item) => (
                    <Grid item md={4}>
                      <FileInfoCard type="link" link={item.link} dialog />
                    </Grid>
                  ))}
                </Grid>
              </div>
            )}
          </div>
          <div className={classes.comment}>
            <span className={classes.heading}>Student&apos;s Comment :</span>
            <span className={classes.text}> {data.student_comment}</span>
          </div>
          <p className={classes.heading}>Comment</p>
          <Controls.Input
            placeholder="Comments..."
            multiline
            rows={5}
            style={{ width: '100%', marginBottom: '20px' }}
            value={comment}
            onChange={handleCommentChange}
            error={
              comment === ''
                ? 'Please add a comment'
                : comment.trim().length === 0
                ? 'Please Remove Unnecessary Whitespaces'
                : false
            }
            autoFocus
          />
        </Grid>
      </Grid>
      <Divider orientation="horizontal" variant="fullWidth" />
      <Grid container className={classes.gridContainer}>
        <Grid item xs={12}>
          <DialogActions>
            <Controls.Button
              text="Send Feedback"
              className={classes.submitBtn}
              onClick={handleEvaluate}
              disabled={comment.trim().length === 0}
            />
          </DialogActions>
        </Grid>
      </Grid>
    </Dialog>
  )
}

AssignmentResponseDialog.defaultProps = {
  links: '',
  attachments: [],
}

const useStyles = makeStyles(() => ({
  gridContainer: {
    padding: '0 20px',
  },
  closeBtn: {
    position: 'absolute',
    right: 12,
    top: 12,
  },
  user: {
    display: 'flex',
    alignItems: 'center',
    padding: '20px 0',
  },
  userName: {
    fontSize: '16px',
    color: '#333333',
    fontWeight: '500',
  },
  submitted: {
    fontSize: '12px',
    color: '#333333',
  },
  heading: {
    fontSize: '14px',
    color: '#333333',
    padding: '20px 0 0 0',
  },
  submissionsWrapper: {
    display: 'flex',
    alignItems: 'center',
  },
  submissions: {
    display: 'flex',
    alignItems: 'center',
    width: '25%',
    border: 'solid 0.5px #818181',
  },
  submitBtn: {
    margin: '10px auto 10px',
    width: '45%',
  },
  documents: {
    display: 'flex',
    flexDirection: 'column',
  },
  document: {
    margin: '10px 0px',
  },
  files_container: {
    display: 'flex',
  },
  disable_styling: {
    textDecoration: 'none',
  },
  comment: {
    padding: '10px 0px 0px 0px',
  },
  // heading: {
  //   color: '#333333'
  // },
  text: {
    fontSize: '14px',
    color: '#666666',
  },
  instructions: {
    margin: '20px 0px 0px 0px',
  },
}))

export default AssignmentResponseDialog
