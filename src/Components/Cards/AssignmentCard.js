import React, { useContext, useState } from 'react'
import { makeStyles } from '@material-ui/core/styles'
import CardContent from '@material-ui/core/CardContent'
import Grid from '@material-ui/core/Grid'
import Divider from '@material-ui/core/Divider'
import IconButton from '@material-ui/core/IconButton'
import Menu from '@material-ui/core/Menu'
import MenuItem from '@material-ui/core/MenuItem'
import MenuList from '@material-ui/core/MenuList'
import { useHistory } from 'react-router-dom'
import useMediaQuery from '@material-ui/core/useMediaQuery'
import { TiWarning } from 'react-icons/ti'
import { HiBadgeCheck } from 'react-icons/hi'
import { MdError } from 'react-icons/md'
import { CgMore } from 'react-icons/cg'
import Card from './Card'
import ConfirmDialog from '../Dialogs/ConfirmDialog'
import { AuthContext } from '../../Context/AuthContext'
import Controls from '../Controls/Controls'
import AssignmentSectionDialog from '../Dialogs/AssignmentSectionDialog'
import { DisplayDate, ConvertTime, CheckDueDate } from '../../Global/Functions'

const useStyles = makeStyles({
  gridContainer: {
    padding: '10px',
  },
  header: {
    padding: '5px 10px 0px 10px',
    display: 'flex',
    alignItems: 'center',
  },
  cardContent: {
    padding: '5px 10px 0px 10px !important',
  },
  dueDate: {
    fontSize: 12,
    opacity: 0.8,
    fontWeight: '500',
    color: '#666666',
    margin: '10px 0px 0px 0px',
  },
  dateHeading: {
    fontSize: 12,
    opacity: 0.8,
    fontWeight: '500',
    color: '#666666',
    margin: '5px 0px 0px 0px',
  },
  dateValue: {
    fontSize: 14,
    fontWeight: '500',
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
    cursor: 'pointer',
  },
  responseStyle: {
    fontSize: 12,
    opacity: 0.8,
    fontWeight: '500',
    color: '#666666',
  },
  btn: {
    width: '100%',
    height: '30px',
  },
  responseNumber: {
    fontSize: 12,
    fontWeight: '500',
    color: '#000',
    margin: '0 0 0 3px',
  },
  optionIcon: {
    float: 'right',
    backgroundColor: '#f2f5ff',
    borderRadius: '50%',
    padding: 4,
  },
  link: {
    textDecoration: 'none',
  },
  evaluatedDiv: {
    display: 'flex',
    justifyContent: 'flex-end',
  },
  dateDiv: {
    display: 'flex',
    padding: '0px 10px 10px 10px',
    position: 'relative',
  },
  menu: {
    borderRadius: '8px',
  },
  studentBottomDiv: {
    padding: '10px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  evaluated: {
    fontSize: 12,
    fontWeight: '500',
    color: '#43a047',
    margin: '5px 0px 0px 0px',
    display: 'flex',
    alignItems: 'center',
  },
  pending: {
    fontSize: 12,
    fontWeight: '500',
    color: '#f9a825',
    margin: '5px 0px 0px 0px',
    display: 'flex',
    alignItems: 'center',
  },
  expired: {
    fontSize: 12,
    fontWeight: '500',
    color: '#e53935',
    margin: '5px 0px 0px 0px',
    display: 'flex',
    alignItems: 'center',
  },
  expiredT: {
    fontSize: 12,
    fontWeight: '500',
    color: '#e53935',
    margin: '5px 0px 0px 0px',
    position: 'absolute',
    right: 10,
    bottom: 10,
    display: 'flex',
    alignItems: 'center',
  },
  icon: {
    margin: '0px 3px 0px 0px',
  },
  divider: {
    margin: '0px 20px',
    padding: '8px 0px',
  },
})

const AssignmentCard = ({
  data,
  assignmentId,
  batchId,
  DeleteAssignment,
  MarkAssignmentAsCompleted,
  MarkAssignmentAsPending,
  purpose,
  refresh,
}) => {
  const history = useHistory()
  const classes = useStyles()
  const matches = useMediaQuery('(min-width:1420px)')
  const { authState } = useContext(AuthContext)
  const { role } = authState
  const [menu, setMenu] = useState(null)
  const [openConfirmDialog, setOpenConfirmDialog] = useState(false)
  const [confirmMarking, setConfirmMarking] = useState(false)
  const [openMoveToPending, setOpenMoveToPending] = useState(false)
  const [openAssignmentDialog, setOpenAssignmentDialog] = useState(false)

  const handleOpenAssignmentDialog = () => {
    setOpenAssignmentDialog(true)
  }

  const handleCloseAssignmentDialog = () => {
    setOpenAssignmentDialog(false)
  }

  const handleMenuOpen = (event) => {
    setMenu(event.currentTarget)
  }

  const handleMenuClose = () => {
    setMenu(null)
  }

  const handleListKeyDown = (event) => {
    if (event.key === 'Tab') {
      event.preventDefault()
      setMenu(null)
    }
  }

  const handleDelete = async () => {
    const res = await DeleteAssignment(assignmentId)
    if (res.success) {
      refresh()
    }
  }

  const handleMarkAsCompleted = async () => {
    const res = await MarkAssignmentAsCompleted(assignmentId)
    if (res.success) {
      refresh()
    }
  }

  const handleMarkAsPending = async () => {
    const res = await MarkAssignmentAsPending(assignmentId)

    if (res.success) {
      refresh()
    }
  }

  const NavigateToAssignment = () => {
    history.push(`/dashboard/assignmentAbout/${batchId}/${assignmentId}`)
  }

  return (
    <>
      <Card>
        <CardContent className={classes.cardContent}>
          <Grid container className={classes.header}>
            <Grid item xs={role === 'T' ? 11 : 10}>
              <p
                className={classes.title}
                onClick={NavigateToAssignment}
                onKeyDown={NavigateToAssignment}
              >
                {data.title}
              </p>
            </Grid>
            <Grid item xs={role === 'T' ? 1 : 2}>
              {role === 'T' ? (
                <>
                  <IconButton size="small" onClick={handleMenuOpen}>
                    <CgMore size={30} className={classes.optionIcon} />
                  </IconButton>
                  <Menu
                    anchorEl={menu}
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
                    open={Boolean(menu)}
                    onClose={handleMenuClose}
                    classes={{
                      paper: classes.menu,
                    }}
                  >
                    <MenuList
                      autoFocusItem={Boolean(menu)}
                      id="menu"
                      onKeyDown={handleListKeyDown}
                    >
                      {purpose !== 'completed' && (
                        <MenuItem
                          onClick={() => {
                            handleOpenAssignmentDialog()
                            handleMenuClose()
                          }}
                        >
                          Edit
                        </MenuItem>
                      )}

                      {purpose !== 'pending' && (
                        <MenuItem
                          onClick={() => {
                            setOpenConfirmDialog(true)
                            handleMenuClose()
                          }}
                        >
                          Delete
                        </MenuItem>
                      )}

                      {purpose === 'pending' && (
                        <MenuItem
                          onClick={() => {
                            setConfirmMarking(true)
                            handleMenuClose()
                          }}
                        >
                          Mark As Completed
                        </MenuItem>
                      )}

                      {purpose === 'completed' && (
                        <MenuItem
                          onClick={() => {
                            setOpenMoveToPending(true)
                            handleMenuClose()
                          }}
                        >
                          Mark as Pending
                        </MenuItem>
                      )}
                    </MenuList>
                  </Menu>
                </>
              ) : (
                <>
                  {matches && (
                    <Controls.Button
                      text="VIEW"
                      className={classes.btn}
                      onClick={() =>
                        history.push(
                          `/dashboard/assignmentAbout/${batchId}/${assignmentId}`,
                        )
                      }
                    />
                  )}
                </>
              )}
            </Grid>
          </Grid>
          <div className={classes.dateDiv}>
            {role === 'T' ? (
              <>
                <div>
                  <p className={classes.dateHeading}>Created On:</p>
                  <p className={classes.dateValue}>
                    {DisplayDate(ConvertTime(data.created_at), true)}
                  </p>
                </div>
                <div className={classes.divider}>
                  <Divider orientation="vertical" />
                </div>
                <div>
                  <p className={classes.dateHeading}>Due On:</p>
                  <p className={classes.dateValue}>
                    {DisplayDate(ConvertTime(data.due_date), true)}
                  </p>
                </div>
                {CheckDueDate(data.due_date) && (
                  <div className={classes.expiredT}>
                    <MdError className={classes.icon} /> Expired
                  </div>
                )}
              </>
            ) : (
              <div>
                <p className={classes.dateHeading}>
                  Due On: <span>{DisplayDate(ConvertTime(data.due_date))}</span>
                </p>
              </div>
            )}
          </div>

          <Divider orientation="horizontal" variant="fullWidth" />

          {role === 'T' ? (
            <Grid container className={classes.gridContainer}>
              <Grid item xs={6}>
                <div>
                  <p className={classes.responseStyle}>
                    Responses:{' '}
                    <span className={classes.responseNumber}>
                      {data.stats.completed}/{data.stats.total}
                    </span>
                  </p>
                </div>
              </Grid>
              <Grid item xs={6}>
                <div className={classes.evaluatedDiv}>
                  <p className={classes.responseStyle}>
                    Evaluated:{' '}
                    <span className={classes.responseNumber}>
                      {data.stats.evaluated}/{data.stats.completed}
                    </span>
                  </p>
                </div>
              </Grid>
            </Grid>
          ) : (
            <div className={classes.studentBottomDiv}>
              <p className={classes.dateHeading}>
                Created On: {DisplayDate(ConvertTime(data.created_at), true)}
              </p>
              {Object.keys(data.submission).length !== 0 ? (
                <>
                  {data.submission.status === 'E' ? (
                    <p className={classes.evaluated}>
                      <HiBadgeCheck className={classes.icon} /> Evaluated
                    </p>
                  ) : (
                    <p className={classes.pending}>
                      <TiWarning className={classes.icon} /> Not Evaluated
                    </p>
                  )}
                </>
              ) : (
                <>
                  {CheckDueDate(data.due_date) && (
                    <p className={classes.expired}>
                      <MdError className={classes.icon} /> Expired
                    </p>
                  )}
                </>
              )}
            </div>
          )}
        </CardContent>
        {openConfirmDialog && (
          <ConfirmDialog
            open={openConfirmDialog}
            setOpen={setOpenConfirmDialog}
            title="Delete Assignment"
            content="Are you sure you want to delete this assignment?"
            yesAction={handleDelete}
            noAction={() => setOpenConfirmDialog(false)}
          />
        )}

        {confirmMarking && (
          <ConfirmDialog
            open={confirmMarking}
            setOpen={setConfirmMarking}
            title="Mark As Completed"
            content="Are you sure you want to mark this assignment as completed"
            yesAction={handleMarkAsCompleted}
            noAction={() => setConfirmMarking(false)}
          />
        )}

        {openMoveToPending && (
          <ConfirmDialog
            open={openMoveToPending}
            setOpen={setOpenMoveToPending}
            title="Mark As pending"
            content="Are you sure you want to mark this assignment as pending"
            yesAction={handleMarkAsPending}
            noAction={() => setOpenMoveToPending(false)}
          />
        )}
      </Card>
      {role === 'T' && (
        <>
          {openAssignmentDialog && (
            <AssignmentSectionDialog
              open={openAssignmentDialog}
              closeDialog={handleCloseAssignmentDialog}
              assignmentId={assignmentId}
              id={data.batch}
              fetchData={refresh}
              editMode
            />
          )}
        </>
      )}
    </>
  )
}

export default AssignmentCard
