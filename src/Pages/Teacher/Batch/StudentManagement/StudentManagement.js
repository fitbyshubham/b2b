import {
  AppBar,
  Breadcrumbs,
  Grid,
  InputAdornment,
  Link,
  makeStyles,
  Tab,
  Tabs,
  Typography,
} from '@material-ui/core'
import { useSnackbar } from 'notistack'
import React, { useContext, useEffect, useState } from 'react'
import { IoIosArrowForward, IoIosSearch, IoMdClose } from 'react-icons/io'
import { useHistory } from 'react-router-dom'
import StudentAdmissionList from '../../../../Components/Lists/StudentAdmissionList'
import StudentList from '../../../../Components/Lists/StudentList'
import Spinner from '../../../../Components/Progress/Spinner'
import showErrorSnackbar from '../../../../Components/Snackbar/errorSnackbar'
import { BatchContext } from '../../../../Context/BatchContext'
import Controls from '../../../../Components/Controls/Controls'
import RefreshCard from '../../../../Components/Refresh/RefreshCard'
import InvitedStudents from './InvitedStudents'
import InviteStudentsDialog from '../../../../Components/Dialogs/InviteStudentsDialog'

const StudentManagement = ({ id }) => {
  const classes = useStyles()
  const {
    loading,
    GetStudentRequestsForBatch,
    studentRequestByBatchId,
    FindBatchWithCode,
    batchByCode,
    setLoading,
  } = useContext(BatchContext)
  const history = useHistory()
  const { enqueueSnackbar } = useSnackbar()
  const [selectedTab, setSelectedTab] = useState(0)
  const [openInviteStudentsDialog, setOpenInviteStudentsDialog] =
    useState(false)

  const handleOpenInviteStudentsDialog = () => {
    setOpenInviteStudentsDialog(true)
  }

  const handleCloseInviteStudentsDialog = () => {
    setOpenInviteStudentsDialog(false)
  }

  const handleChange = (event, newValue) => {
    setSearchQuery('')
    setSelectedTab(newValue)
  }

  const [searchQuery, setSearchQuery] = useState('')
  const [searchedData, setSearchedData] = useState([])

  const search = (searchToken) => {
    setSearchedData(
      studentRequestByBatchId.filter((val) =>
        val.student_name.toLowerCase().includes(searchToken.toLowerCase()),
      ),
    )
  }

  const clearSearchBar = () => {
    setSearchQuery('')
    setSelectedTab(0)
  }

  useEffect(() => {
    if (searchQuery === '') {
      setSelectedTab(0)
      return
    }
    setSelectedTab(null)
    search(searchQuery)
  }, [searchQuery])

  // Pulled Out This function from useEffect to use it in RefreshCard Component at the Bottom
  async function fetchData() {
    setLoading(true)
    const res = await FindBatchWithCode(id)
    if (res) {
      await GetStudentRequestsForBatch(id)
    } else {
      showErrorSnackbar(enqueueSnackbar, 'This batch does not exist!')
      history.push('/dashboard')
    }
    setLoading(false)
  }

  useEffect(() => {
    fetchData()
  }, [id])
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
            <Grid item xs={9}>
              <div className="height-100 flex-column">
                <p className="bolder route-heading">Manage Students</p>
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
                  <Typography color="textPrimary">Manage Students</Typography>
                </Breadcrumbs>
              </div>
            </Grid>
            {selectedTab === 3 && (
              <Grid item xs={3}>
                <Controls.Button
                  text="INVITE STUDENTS"
                  onClick={handleOpenInviteStudentsDialog}
                />
              </Grid>
            )}
          </Grid>
          <div>
            <div className={classes.appBarContainer}>
              <AppBar position="static" className={classes.appBar}>
                <Tabs
                  value={selectedTab}
                  onChange={handleChange}
                  className={classes.tabContainer}
                >
                  <Tab
                    label="Active Students"
                    className={classes.capitalizeText}
                  />
                  <Tab
                    label="Pending Requests"
                    className={classes.capitalizeText}
                  />
                  <Tab
                    label="Rejected Requests"
                    className={classes.capitalizeText}
                  />
                  <Tab
                    label="Invited Students"
                    className={classes.capitalizeText}
                  />
                </Tabs>
                <Controls.Input
                  placeholder="Search for student"
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
            <div className={classes.content}>
              {searchQuery === '' && (
                <>
                  <div>
                    {selectedTab === 0 && (
                      <p className={classes.info}>
                        {
                          studentRequestByBatchId.filter(
                            (request) => request.status === 'A',
                          ).length
                        }{' '}
                        active{' '}
                        {studentRequestByBatchId.filter(
                          (request) => request.status === 'A',
                        ).length === 1
                          ? 'Student'
                          : 'students'}
                      </p>
                    )}
                    {selectedTab === 1 && (
                      <p className={classes.info}>
                        {
                          studentRequestByBatchId.filter(
                            (request) => request.status === 'D',
                          ).length
                        }{' '}
                        pending{' '}
                        {studentRequestByBatchId.filter(
                          (request) => request.status === 'D',
                        ).length === 1
                          ? 'request'
                          : 'requests'}
                      </p>
                    )}
                    {selectedTab === 2 && (
                      <p className={classes.info}>
                        {
                          studentRequestByBatchId.filter(
                            (request) => request.status === 'R',
                          ).length
                        }{' '}
                        rejected{' '}
                        {studentRequestByBatchId.filter(
                          (request) => request.status === 'R',
                        ).length === 1
                          ? 'request'
                          : 'requests'}
                      </p>
                    )}
                  </div>
                  <div className={classes.tabContent}>
                    {selectedTab === 0 && (
                      <StudentList
                        items={studentRequestByBatchId.filter(
                          (request) =>
                            request.status === 'A' ||
                            request.has_joined === true,
                        )}
                        fetchData={fetchData}
                      />
                    )}
                    {selectedTab === 1 && (
                      <StudentAdmissionList
                        items={studentRequestByBatchId.filter(
                          (request) => request.status === 'D',
                        )}
                        mode="card"
                      />
                    )}
                    {selectedTab === 2 && (
                      <StudentList
                        items={studentRequestByBatchId.filter(
                          (request) => request.status === 'R',
                        )}
                        fetchData={fetchData}
                      />
                    )}
                    {selectedTab === 3 && <InvitedStudents batch_id={id} />}
                  </div>
                </>
              )}
              {searchQuery !== '' && (
                <div className={classes.tabContent}>
                  <p className={classes.info}>Active or rejected students</p>
                  <StudentList
                    items={searchedData.filter((data) => data.status !== 'D')}
                    fetchData={fetchData}
                  />
                  <p className={classes.info}>Requests pending</p>
                  <StudentAdmissionList
                    items={searchedData.filter((data) => data.status === 'D')}
                    mode="card"
                  />
                </div>
              )}
            </div>
          </div>
        </div>
      )}
      <RefreshCard
        msg="Please click on refresh to check if new students have requested to join the batch"
        onRefresh={fetchData}
      />
      {openInviteStudentsDialog && (
        <InviteStudentsDialog
          open={openInviteStudentsDialog}
          close={handleCloseInviteStudentsDialog}
          fetchData={fetchData}
          batch_id={id}
        />
      )}
    </>
  )
}

export default StudentManagement

const useStyles = makeStyles({
  appBar: {
    backgroundColor: '#fff',
    color: '#999',
    flexDirection: 'row',
    boxShadow: 'none',
    '& .Mui-selected': {
      color: '#000',
    },
    '& .MuiTabs-indicator': {
      backgroundColor: '#6484e4',
      marginBottom: 5,
      width: '30%',
    },
  },
  appBarContainer: {
    padding: '0 20px',
    backgroundColor: '#fff',
  },
  gridContainer: {
    padding: '20px',
  },
  capitalizeText: {
    textTransform: 'capitalize',
  },
  content: {
    padding: '1rem 2rem 2rem 2rem',
  },
  info: {
    color: '#999',
    fontSize: '0.875rem',
  },
  tabContainer: {
    width: 'fit-content',
  },
  tabContent: {
    paddingTop: 6,
  },
  searchBar: {
    marginLeft: 'auto',
    '@media(max-width: 1024px)': {
      width: '30%',
    },
    '& .MuiInputBase-root': {
      borderRadius: 15.5,
      height: 34,
      margin: 'auto 0',
      '& .MuiInputBase-input': {
        fontSize: '0.9rem',
      },
    },
  },
})
