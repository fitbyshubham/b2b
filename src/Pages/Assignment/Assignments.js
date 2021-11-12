/* eslint-disable no-unused-vars */
import React, { useContext, useState, useEffect } from 'react'
import Grid from '@material-ui/core/Grid'
import {
  makeStyles,
  Breadcrumbs,
  Link,
  Typography,
  AppBar,
  Tabs,
  Tab,
  InputAdornment,
} from '@material-ui/core'
import { FiPlus } from 'react-icons/fi'
import { IoIosArrowForward, IoIosSearch, IoMdClose } from 'react-icons/io'
import AssignmentSectionDialog from '../../Components/Dialogs/AssignmentSectionDialog'
import { BatchContext } from '../../Context/BatchContext'
import Controls from '../../Components/Controls/Controls'
import Spinner from '../../Components/Progress/Spinner'
import AssignmentCard from '../../Components/Cards/AssignmentCard'
import RefreshCard from '../../Components/Refresh/RefreshCard'
import { AuthContext } from '../../Context/AuthContext'
import { CheckDueDate } from '../../Global/Functions'

const Assignments = ({ id }) => {
  const classes = useStyles()
  const [searchQuery, setSearchQuery] = useState('')
  const [searchedData, setSearchedData] = useState([])
  const [selectedTab, setSelectedTab] = useState(0)
  const [liveAssignments, setLiveAssignments] = useState([])
  const [pendingAssignments, setPendingAssignments] = useState([])
  const [completedAssignments, setCompletedAssignments] = useState([])
  const { authState } = useContext(AuthContext)
  const [open, setOpen] = useState(false)
  const { role } = authState
  const {
    loading,
    batchByCode,
    setLoading,
    GetAllBatchAssignments,
    assignments,
    FindBatchWithCode,
    DeleteAssignment,
    MarkAssignmentAsCompleted,
    MarkAssignmentAsPending,
  } = useContext(BatchContext)

  const clearSearchBar = () => {
    setSearchQuery('')
    setSelectedTab(0)
  }

  const search = (searchToken) => {
    setSearchedData(
      assignments.filter((val) =>
        val.title.toLowerCase().includes(searchToken.toLowerCase()),
      ),
    )
  }

  const handleTabChange = (event, newValue) => {
    setSelectedTab(newValue)
  }

  const handleOpen = () => {
    setOpen(true)
  }

  const handleClose = () => {
    setOpen(false)
  }

  const differentiateAssignments = () => {
    const tempLiveAssignments = []
    const tempCompletedAssignments = []
    const tempPendingAssignments = []

    if (role === 'T') {
      assignments.forEach((element) => {
        if (Object.keys(element.stats).length !== 0) {
          if (element.marked_as_completed) {
            tempCompletedAssignments.push(element)
          } else if (
            element.stats.total !== 0 &&
            element.stats.total === element.stats.evaluated
          ) {
            tempCompletedAssignments.push(element)
          } else if (
            CheckDueDate(element.due_date) &&
            element.stats.total !== element.stats.evaluated
          ) {
            tempPendingAssignments.push(element)
          } else if (CheckDueDate(element.due_date)) {
            tempPendingAssignments.push(element)
          } else if (!CheckDueDate(element.due_date)) {
            tempLiveAssignments.push(element)
          }
        }
      })
    }

    if (role === 'S') {
      assignments.forEach((element) => {
        if (Object.keys(element.submission).length !== 0) {
          if (element.submission.status === 'E') {
            tempCompletedAssignments.push(element)
          } else if (element.submission.status === 'S') {
            tempPendingAssignments.push(element)
          }
        } else if (!CheckDueDate(element.due_date)) {
          tempLiveAssignments.push(element)
        } else if (CheckDueDate(element.due_date)) {
          tempCompletedAssignments.push(element)
        }
      })
    }

    setLiveAssignments(tempLiveAssignments)
    setPendingAssignments(tempPendingAssignments)
    setCompletedAssignments(tempCompletedAssignments)
  }

  const fetchData = async () => {
    setLoading(true)
    await FindBatchWithCode(id)
    await GetAllBatchAssignments(id)
    setLoading(false)
  }

  useEffect(() => {
    differentiateAssignments()
  }, [assignments, selectedTab])

  useEffect(() => {
    fetchData()
  }, [selectedTab])

  useEffect(() => {
    if (searchQuery === '') {
      setSelectedTab(0)
      return
    }
    setSelectedTab(null)
    search(searchQuery)
  }, [searchQuery])

  return (
    <>
      {/* {!loading && ( */}
      <div className="full-height">
        <Grid
          container
          justifyContent="space-between"
          className={classes.gridContainer}
        >
          <Grid item xs={12} sm={6} lg={6} className={classes.header}>
            <div className="height-100 flex-row align-items-center">
              <p
                className="bolder"
                style={{ fontSize: '24px', color: '#6481e4' }}
              >
                Assignments
              </p>
            </div>
          </Grid>
          {role === 'T' && (
            <Grid item xs={12} sm={4} lg={4}>
              <div>
                <Controls.Button className={classes.btn} onClick={handleOpen}>
                  <FiPlus className="margin-right-smallest" />
                  <p>Create New Assignment</p>
                </Controls.Button>
              </div>
            </Grid>
          )}
          <Grid item xs={12} className={classes.header}>
            <Breadcrumbs
              separator={<IoIosArrowForward />}
              aria-label="breadcrumb"
            >
              <Link color="inherit" href="/dashboard">
                Dashboard
              </Link>
              <Link color="inherit" href={`/dashboard/view/${id}`}>
                {batchByCode.name}
              </Link>
              <Typography color="textPrimary">Assignments</Typography>
            </Breadcrumbs>
          </Grid>
        </Grid>

        <div className={classes.appBarContainer}>
          <AppBar position="static" className={classes.appBar}>
            <Tabs
              value={selectedTab}
              onChange={handleTabChange}
              classes={{
                indicator: classes.indicator,
              }}
              TabIndicatorProps={{ children: <span /> }}
            >
              <Tab
                disableRipple
                label="Live Assignments"
                className={classes.capitalizeText}
                classes={{
                  root: classes.tab,
                }}
              />
              <Tab
                disableRipple
                label="Pending Assignments"
                className={classes.capitalizeText}
                classes={{
                  root: classes.tab,
                }}
              />
              <Tab
                disableRipple
                label="Completed Assignments"
                className={classes.capitalizeText}
                classes={{
                  root: classes.tab,
                }}
              />
            </Tabs>
            <Controls.Input
              placeholder="Search assignments by title......"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value)
              }}
              className={classes.searchBar}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <IoIosSearch />
                  </InputAdornment>
                ),
                endAdornment:
                  searchQuery !== '' ? (
                    <InputAdornment
                      position="end"
                      onClick={clearSearchBar}
                      className="cursor-pointer"
                    >
                      <IoMdClose />
                    </InputAdornment>
                  ) : null,
              }}
            />
          </AppBar>
        </div>
        {!loading ? (
          <div className={classes.content}>
            {searchQuery === '' && (
              <>
                {selectedTab === 2 && (
                  <>
                    {completedAssignments.length === 0 ? (
                      <div>
                        <p className="fine-text secondary-text margin-top-small">
                          No completed assignments
                        </p>
                      </div>
                    ) : (
                      <Grid
                        className={classes.assignmentGridContainer}
                        container
                        spacing={3}
                        direction="row"
                        justifyContent="flex-start"
                        alignItems="stretch"
                      >
                        {completedAssignments.map((item) => (
                          <Grid
                            xs={12}
                            sm={12}
                            md={6}
                            lg={4}
                            key={item.id}
                            item
                          >
                            <AssignmentCard
                              data={item}
                              batchId={id}
                              assignmentId={item.id}
                              DeleteAssignment={DeleteAssignment}
                              MarkAssignmentAsPending={MarkAssignmentAsPending}
                              purpose="completed"
                              refresh={fetchData}
                            />
                          </Grid>
                        ))}
                      </Grid>
                    )}
                  </>
                )}
                {selectedTab === 1 && (
                  <>
                    {pendingAssignments.length === 0 ? (
                      <div>
                        <p className="fine-text secondary-text margin-top-small">
                          No Pending assignments
                        </p>
                      </div>
                    ) : (
                      <Grid
                        className={classes.assignmentGridContainer}
                        container
                        spacing={3}
                        direction="row"
                        justifyContent="flex-start"
                        alignItems="stretch"
                      >
                        {pendingAssignments.map((item) => (
                          <Grid
                            xs={12}
                            sm={12}
                            md={6}
                            lg={4}
                            key={item.id}
                            item
                            justifyContent="center"
                          >
                            <AssignmentCard
                              data={item}
                              batchId={id}
                              assignmentId={item.id}
                              DeleteAssignment={DeleteAssignment}
                              MarkAssignmentAsCompleted={
                                MarkAssignmentAsCompleted
                              }
                              purpose="pending"
                              refresh={fetchData}
                            />
                          </Grid>
                        ))}
                      </Grid>
                    )}
                  </>
                )}
                {selectedTab === 0 && (
                  <>
                    {liveAssignments.length === 0 ? (
                      <div>
                        <p className="fine-text secondary-text margin-top-small">
                          No Live assignments
                        </p>
                      </div>
                    ) : (
                      <Grid
                        className={classes.assignmentGridContainer}
                        container
                        spacing={3}
                        direction="row"
                        justifyContent="flex-start"
                        alignItems="stretch"
                      >
                        {liveAssignments.map((item) => (
                          <Grid
                            xs={12}
                            sm={12}
                            md={6}
                            lg={4}
                            key={item.id}
                            item
                            justifyContent="center"
                          >
                            <AssignmentCard
                              data={item}
                              batchId={id}
                              assignmentId={item.id}
                              DeleteAssignment={DeleteAssignment}
                              MarkAssignmentAsCompleted={
                                MarkAssignmentAsCompleted
                              }
                              purpose="live"
                              refresh={fetchData}
                            />
                          </Grid>
                        ))}
                      </Grid>
                    )}
                  </>
                )}
              </>
            )}
            {searchQuery !== '' && (
              <Grid
                className={classes.assignmentGridContainer}
                container
                spacing={3}
                direction="row"
                justifyContent="flex-start"
                alignItems="stretch"
              >
                {searchedData.map((item) => (
                  <Grid xs={12} sm={12} md={6} lg={4} key={item.id} item>
                    <AssignmentCard
                      data={item}
                      batchId={id}
                      assignmentId={item.id}
                      DeleteAssignment={DeleteAssignment}
                      MarkAssignmentAsCompleted={MarkAssignmentAsCompleted}
                      refresh={fetchData}
                    />
                  </Grid>
                ))}
              </Grid>
            )}
          </div>
        ) : (
          <Spinner />
        )}
        {role === 'T' && (
          <>
            {open && (
              <AssignmentSectionDialog
                open={open}
                closeDialog={handleClose}
                batchId={id}
                fetchData={fetchData}
              />
            )}
          </>
        )}
      </div>
      {/* )} */}
      <RefreshCard
        msg="Please click on refresh to check if new assignments have been added."
        onRefresh={fetchData}
      />
    </>
  )
}

const useStyles = makeStyles({
  gridContainer: {
    padding: '20px',
  },
  assignmentGridContainer: {
    padding: '20px 0px',
  },
  assignmentDialog: {
    width: 788,
  },
  appBar: {
    backgroundColor: '#fff',
    color: '#999',
    flexDirection: 'row',
    boxShadow: 'none',
    '& .Mui-selected': {
      color: '#000',
    },
  },
  appBarContainer: {
    padding: '0 2rem',
    backgroundColor: '#fff',
  },
  capitalizeText: {
    textTransform: 'capitalize',
  },
  content: {
    padding: '0 2rem',
  },
  searchBar: {
    marginLeft: 'auto',
    '& .MuiInputBase-root': {
      borderRadius: 15.5,
      height: 34,
      margin: 'auto 0',
      '& .MuiInputBase-input': {
        fontSize: '0.9rem',
      },
      '& input::placeholder': {
        fontSize: '12px',
      },
    },
  },
  btn: {
    backgroundColor: '#568ae1',
    '&:hover': {
      backgroundColor: '#568ae1',
    },
  },
  tab: {
    margin: '0px 50px 0px 0px',
  },
  indicator: {
    display: 'flex',
    justifyContent: 'center',
    backgroundColor: 'transparent !important',
    margin: '0px 0px 5px 0px',

    '& > span': {
      maxWidth: 70,
      width: '100%',
      backgroundColor: '#6484e4',
    },
  },
  header: {
    margin: '0px 0px 0px 20px',
  },
})

export default Assignments
