import React, { useContext, useState, useEffect } from 'react'
import Grid from '@material-ui/core/Grid'
import {
  Breadcrumbs,
  Typography,
  makeStyles,
  AppBar,
  Tabs,
  Tab,
  InputAdornment,
  IconButton,
} from '@material-ui/core'
import {
  IoIosArrowForward,
  IoIosSearch,
  IoMdClose,
  IoIosArrowBack,
} from 'react-icons/io'
import { FiPlus } from 'react-icons/fi'
import { Link, useHistory } from 'react-router-dom'
import { TiWarning } from 'react-icons/ti'
import { HiBadgeCheck } from 'react-icons/hi'
import { MdError } from 'react-icons/md'
import Spinner from '../../../Components/Progress/Spinner'
import { BatchContext } from '../../../Context/BatchContext'
import AssignmentAboutCard from '../../../Components/Cards/AssignmentAboutCard'
import Controls from '../../../Components/Controls/Controls'
import AssignmentSubmitCard from '../../../Components/Cards/AssignmentSubmitCard'
import { AuthContext } from '../../../Context/AuthContext'
import AssignmentSectionDialog from '../../../Components/Dialogs/AssignmentSectionDialog'
import StudentAssignmentSubmission from './StudentAssignmentSubmission'
import { CheckDueDate } from '../../../Global/Functions'

const AssignmentAbout = ({ id, subId }) => {
  const classes = useStyles()
  const history = useHistory()
  const { authState } = useContext(AuthContext)
  const {
    loading,
    batchByCode,
    setLoading,
    GetAssignmentById,
    GetAssignmmentSubmissions,
    GetEnrolledStudentsInBatch,
    FindBatchWithCode,
  } = useContext(BatchContext)
  const { role } = authState
  const [assignment, setAssignment] = useState({})
  const [mySubmission, setMySubmission] = useState({})
  const [submissions, setSubmissions] = useState([])
  const [pendingSubmissions, setPendingSubmissions] = useState([])
  const [stats, setStats] = useState({})
  const [open, setOpen] = useState(false)

  const GetSubmittedStudents = (submissionRes, allEnrolledStudentsRes) => {
    submissionRes.forEach((item) => {
      item.avatar = allEnrolledStudentsRes.find(
        (element) => element.name === item.student,
      ).avatar
    })
  }

  const GetPendingSubmissions = async (batchId, submissionRes) => {
    const allEnrolledStudentsRes = await GetEnrolledStudentsInBatch(batchId)

    const enrolledStudents = allEnrolledStudentsRes.map((a) => a.name)

    const submittedStudents = submissionRes.map((a) => a.student)
    GetSubmittedStudents(submissionRes, allEnrolledStudentsRes)

    const pendingStudents = []

    enrolledStudents.forEach((element, index) => {
      if (!submittedStudents.includes(element)) {
        pendingStudents.push({ student: enrolledStudents[index] })
      }
    })

    pendingStudents.forEach((item) => {
      item.avatar = allEnrolledStudentsRes.find(
        (element) => element.name === item.student,
      ).avatar
    })

    return pendingStudents
  }

  const fetchData = async () => {
    setLoading(true)
    const assignmentRes = await GetAssignmentById(subId)
    const submissionRes = await GetAssignmmentSubmissions(subId)

    const pendingSubmissionRes = await GetPendingSubmissions(
      assignmentRes.batch,
      submissionRes,
    )
    await FindBatchWithCode(assignmentRes.batch)
    setAssignment(assignmentRes)
    setSubmissions(submissionRes)
    if (submissionRes.length !== 0) {
      setMySubmission(submissionRes[0])
    }
    setPendingSubmissions(pendingSubmissionRes)
    setStats(assignmentRes.stats)
    setLoading(false)
  }

  useEffect(() => {
    fetchData()
  }, [])

  const [searchQuery, setSearchQuery] = useState('')
  const [searchedData, setSearchedData] = useState([])
  const [selectedTab, setSelectedTab] = useState(0)

  const search = (searchToken) => {
    setSearchedData(
      submissions.filter((val) =>
        val.student.toLowerCase().includes(searchToken.toLowerCase()),
      ),
    )
  }

  useEffect(() => {
    if (searchQuery === '') {
      setSelectedTab(0)
      return
    }
    setSelectedTab(null)
    search(searchQuery)
  }, [searchQuery])

  const handleOpen = () => {
    setOpen(true)
  }

  const handleClose = () => {
    setOpen(false)
  }

  const clearSearchBar = () => {
    setSearchQuery('')
    setSelectedTab(0)
  }
  const handleTabChange = (event, newValue) => {
    setSelectedTab(newValue)
  }

  return (
    <>
      {loading && <Spinner />}
      {!loading && (
        <div className="full-height">
          <Grid
            container
            justifyContent="space-between"
            className={classes.gridContainer}
          >
            <Grid item xs={12} sm={8}>
              <div className="height-100 flex-row align-items-center">
                <IconButton
                  onClick={() => history.push(`/dashboard/assignment/${id}`)}
                >
                  <IoIosArrowBack size={25} />
                </IconButton>
                <p className={`${classes.assignmentHeading} bolder`}>
                  {assignment.title}
                </p>
              </div>
            </Grid>
            <Grid item xs={12} sm={4} className={classes.status_div}>
              {role === 'S' && (
                <>
                  {Object.keys(mySubmission).length === 0 ? (
                    <>
                      {CheckDueDate(assignment.due_date) ? (
                        <div className={classes.expiredStatusBox}>
                          <MdError
                            size={24}
                            color="#e53935"
                            className={classes.icon}
                          />{' '}
                          Due Date Expired
                        </div>
                      ) : (
                        <div>
                          {batchByCode.status === 'D' ? (
                            <Controls.Button
                              className={classes.btn}
                              onClick={handleOpen}
                              text="Submit Submission"
                              startIcon={<FiPlus />}
                            />
                          ) : null}
                        </div>
                      )}
                    </>
                  ) : (
                    <div>
                      {mySubmission.status === 'E' && (
                        <div className={classes.evaluatedStatusBox}>
                          <HiBadgeCheck
                            size={24}
                            color="#43a047"
                            className={classes.icon}
                          />{' '}
                          Evaluation Done
                        </div>
                      )}
                      {mySubmission.status === 'S' && (
                        <div className={classes.pendingStatusBox}>
                          <TiWarning
                            size={24}
                            color="#f9a825"
                            className={classes.icon}
                          />{' '}
                          Evaluation Pending
                        </div>
                      )}
                    </div>
                  )}
                </>
              )}
            </Grid>
            <Grid item xs={12} className={classes.breadcrumbs}>
              <Breadcrumbs
                separator={<IoIosArrowForward />}
                aria-label="breadcrumb"
              >
                <Link className={classes.link} to="/dashboard">
                  Dashboard
                </Link>
                <Link
                  className={classes.link}
                  color="inherit"
                  to={`/dashboard/view/${id}`}
                >
                  {batchByCode.name}
                </Link>
                <Link
                  className={classes.link}
                  color="inherit"
                  to={`/dashboard/assignment/${id}`}
                >
                  Assignments
                </Link>
                <Typography color="textPrimary">{assignment.title}</Typography>
              </Breadcrumbs>
            </Grid>
          </Grid>
          <AssignmentAboutCard
            due_date={assignment.due_date}
            instructions={assignment.instructions}
            links={assignment.links}
            files={assignment.attachments}
            created_at={assignment.created_at}
            stats={stats}
          />
          {role === 'T' && (
            <Grid container className={classes.gridContainer}>
              <Grid item xs={12}>
                <h2 className={`${classes.submitHeading} bolder`}>
                  Submissions
                </h2>
              </Grid>
            </Grid>
          )}
          {role === 'T' ? (
            <>
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
                      label="Submissions"
                      classes={{ root: classes.tab }}
                    />
                    <Tab
                      disableRipple
                      label="Pending Submissions"
                      classes={{ root: classes.tab }}
                    />
                  </Tabs>
                  <Controls.Input
                    placeholder="Search Submissions"
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
              <div>
                {searchQuery === '' && (
                  <>
                    {selectedTab === 1 && (
                      <>
                        {pendingSubmissions.length === 0 ? (
                          <div className="padding-left-small">
                            <p className="fine-text secondary-text margin-top-small">
                              No Submissions
                            </p>
                          </div>
                        ) : (
                          <Grid container className={classes.gridContainer}>
                            {pendingSubmissions.map((item) => (
                              <Grid
                                item
                                xs={12}
                                sm={12}
                                md={6}
                                lg={4}
                                key={item.id}
                              >
                                <div className={classes.submitCard}>
                                  <AssignmentSubmitCard data={item} />
                                </div>
                              </Grid>
                            ))}
                          </Grid>
                        )}
                      </>
                    )}
                    {selectedTab === 0 && (
                      <>
                        {submissions.length === 0 ? (
                          <div className="padding-left-small">
                            <p className="fine-text secondary-text margin-top-small">
                              No Submissions
                            </p>
                          </div>
                        ) : (
                          <Grid container className={classes.gridContainer}>
                            {submissions.map((item) => (
                              <Grid
                                item
                                xs={12}
                                sm={12}
                                md={6}
                                lg={4}
                                key={item.id}
                              >
                                <div className={classes.submitCard}>
                                  <AssignmentSubmitCard
                                    data={item}
                                    refresh={fetchData}
                                    status={batchByCode.status}
                                  />
                                </div>
                              </Grid>
                            ))}
                          </Grid>
                        )}
                      </>
                    )}
                  </>
                )}
                {searchQuery !== '' && (
                  <Grid className={classes.gridContainer} container>
                    {searchedData.length === 0 ? (
                      <div className="padding-left-small">
                        <p className="fine-text secondary-text margin-top-small">
                          No Submissions
                        </p>
                      </div>
                    ) : (
                      <>
                        {searchedData.map((item) => (
                          <Grid
                            item
                            xs={12}
                            sm={12}
                            md={6}
                            lg={4}
                            key={item.id}
                          >
                            <div className={classes.submitCard}>
                              <AssignmentSubmitCard
                                data={item}
                                refresh={fetchData}
                              />
                            </div>
                          </Grid>
                        ))}
                      </>
                    )}
                  </Grid>
                )}
              </div>
            </>
          ) : (
            <StudentAssignmentSubmission data={mySubmission} />
          )}
          {role === 'S' && (
            <>
              {open && (
                <AssignmentSectionDialog
                  open={open}
                  closeDialog={handleClose}
                  batchId={id}
                  fetchData={fetchData}
                  assignmentId={subId}
                  assignmentName={assignment.title}
                />
              )}
            </>
          )}
        </div>
      )}
    </>
  )
}

const useStyles = makeStyles(() => ({
  gridContainer: {
    padding: '15px',
  },
  assignmentHeading: {
    fontSize: '24px',
    color: '#6481e4',
  },
  submitHeading: {
    fontSize: '24px',
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
  searchBar: {
    marginLeft: 'auto',
    '& .MuiInputBase-root': {
      borderRadius: 15.5,
      height: 34,
      margin: 'auto 0',
      '& .MuiInputBase-input': {
        fontSize: '0.9rem',
      },
    },
  },
  submitCard: {
    width: '95%',
    margin: '0 0 20px 0',
  },
  assignmentWrapper: {
    marginTop: '16.7px',
    width: '20%',
  },
  assignments: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  assignment: {
    display: 'flex',
    alignItems: 'center',
    padding: '10px',
    borderRadius: '4px',
    border: 'solid 0.5px #818181',
    backgroundColor: '#fff',
  },
  assignmentName: {
    fontSize: '14px',
    marginLeft: '3px',
  },
  documents: {
    display: 'flex',
    flexDirection: 'column',
    width: '100%',
  },
  document: {
    margin: '10px 0px',
  },
  files_container: {
    display: 'flex',
  },
  status: {
    display: 'flex',
    margin: '10px 0px',
  },
  subStatus: {
    margin: '0px 20px',
  },
  statusContent: {
    fontSize: '14px',
    color: '#666666',
  },
  heading: {
    fontSize: '14px',
    color: '#333333',
  },
  status_div: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'flex-end',
    padding: '0px 20px',
  },
  pendingStatusBox: {
    border: '1px solid #f9a825',
    padding: '10px 20px',
    borderRadius: '2px',
    fontSize: '0.9rem',
    fontWeight: 'bold',
    backgroundColor: 'rgba(255, 176, 49, 0.1)',
    height: '50px',
    display: 'flex',
    alignItems: 'center',
  },
  expiredStatusBox: {
    border: '1px solid #e53935',
    padding: '10px 20px',
    borderRadius: '2px',
    fontSize: '0.9rem',
    fontWeight: 'bold',
    backgroundColor: 'rgba(229, 57, 53, 0.1)',
    height: '50px',
    display: 'flex',
    alignItems: 'center',
  },
  evaluatedStatusBox: {
    border: '1px solid #43a047',
    padding: '10px 20px',
    borderRadius: '2px',
    fontSize: '0.9rem',
    fontWeight: 'bold',
    backgroundColor: 'rgba(67, 160, 71, 0.1)',
    height: '50px',
    display: 'flex',
    alignItems: 'center',
  },
  link: {
    textDecoration: 'none',
    color: 'rgba(0, 0, 0, 0.54)',

    '&:hover': {
      textDecoration: 'underline',
    },
  },
  breadcrumbs: {
    margin: '0px 0px 0px 50px',
  },
  icon: {
    margin: '0px 10px 0px 0px',
  },
}))

export default AssignmentAbout
