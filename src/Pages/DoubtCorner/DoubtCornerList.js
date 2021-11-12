import React, { useContext, useEffect, useState } from 'react'
import {
  AppBar,
  Grid,
  Breadcrumbs,
  Typography,
  Link,
  InputAdornment,
  IconButton,
} from '@material-ui/core'
import { useHistory } from 'react-router-dom'
import { makeStyles, createStyles } from '@material-ui/core/styles'
import {
  IoIosArrowBack,
  IoIosArrowForward,
  IoIosSearch,
  IoMdClose,
} from 'react-icons/io'
import Controls from '../../Components/Controls/Controls'
import { BatchContext } from '../../Context/BatchContext'
import StudentDoubtCard from '../../Components/Cards/StudentDoubtCard'
import { CommandContext } from '../../Context/CommandContext'
import Spinner from '../../Components/Progress/Spinner'
import { DisplayDate } from '../../Global/Functions'
import doubtPlaceholder from '../../Assets/Images/doubtPlaceholder.webp'
import useWindowDimensions from '../../Hooks/useWindowDimensions'

const DoubtCornerList = ({ id, subId }) => {
  const classes = useStyles()
  const history = useHistory()

  const {
    batchByCode,
    FindBatchWithCode,
    GetEnrolledStudentsInBatch,
    allBatchStudents,
    GetLectureData,
  } = useContext(BatchContext)
  const { GetAllQueriesInALecture } = useContext(CommandContext)
  const [doubts, setDoubts] = useState([])
  const [loading, setLoading] = useState(true)
  const [lectureData, setLectureData] = useState({ starts: undefined })
  const [searchQuery, setSearchQuery] = useState('')
  const [searchedData, setSearchedData] = useState([])
  const [resolvedDoubts, setResolvedDoubts] = useState([])
  const [unresolvedDoubts, setUnresolvedDoubts] = useState([])
  const [filterType, setFilterType] = useState('A')
  const { width } = useWindowDimensions()

  const types = [
    {
      id: 'A',
      title: 'All Doubts',
    },
    {
      id: 'D',
      title: 'Unresolved Doubts',
    },
    {
      id: 'R',
      title: 'Resolved Doubts',
    },
  ]

  const handleOnChangeFilter = (e) => {
    setFilterType(e.target.value)
  }

  const fetchData = async () => {
    await FindBatchWithCode(id)
    await GetEnrolledStudentsInBatch(id)
    setLoading(true)
    const data = await GetLectureData(subId)
    setLectureData(data)
    const res = await GetAllQueriesInALecture(subId)
    setDoubts(res.data.filter((doubt) => doubt.status !== 'U'))
    setResolvedDoubts(res.data.filter((doubt) => doubt.status === 'R'))
    setUnresolvedDoubts(res.data.filter((doubt) => doubt.status === 'D'))
    setLoading(false)
  }

  useEffect(() => {
    fetchData()
  }, [])

  const search = (searchToken) => {
    setSearchedData(() =>
      doubts.filter((val) =>
        allBatchStudents
          .find((student) => student.id === val.student_id)
          .name.toLowerCase()
          .includes(searchToken.toLowerCase()),
      ),
    )
  }

  useEffect(() => {
    search(searchQuery)
  }, [searchQuery])
  const clearSearchBar = () => {
    setSearchQuery('')
  }

  return (
    <>
      <div className="full-height">
        <Grid
          container
          justifyContent="space-between"
          className={classes.gridContainer}
        >
          <Grid item xs={12}>
            <div className="height-100 flex-row align-items-center">
              <IconButton
                onClick={() => history.push(`/dashboard/doubt-corner/${id}`)}
              >
                <IoIosArrowBack size={25} />
              </IconButton>
              <p className="bolder route-heading mg-left-10">
                {!loading
                  ? `Live Class on ${DisplayDate(
                      lectureData.starts * 1000,
                      true,
                    )}`
                  : 'Live Class'}
              </p>
            </div>
          </Grid>
          <Grid item xs={12}>
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
              <Link color="inherit" href="/dashboard/doubt-corner">
                Doubt Corner
              </Link>
              <Typography color="textPrimary">Live Class 4</Typography>
            </Breadcrumbs>
          </Grid>
        </Grid>
        <div>
          <div className={classes.appBarContainer}>
            <AppBar position="static" className={classes.appBar}>
              <div
                className={`${
                  width > 600 ? 'flex-row' : 'flex-column'
                } align-items-center ${classes.dataBar}`}
              >
                <div className={`flex-row align-items-center ${classes.count}`}>
                  <div
                    className={`flex-row align-items-center ${
                      width > 600 && classes.paddingRight
                    } ${width > 600 && classes.bar}`}
                  >
                    <span className="sub-text bold margin-right-smallest">
                      {doubts.length}
                    </span>
                    <span> Doubts Raised</span>
                  </div>

                  <div
                    className={`flex-row align-items-center ${
                      classes.paddingRight
                    } ${width > 600 && 'mg-left-10'} ${
                      width > 600 && classes.bar
                    }`}
                  >
                    <span className="sub-text bold margin-right-smallest">
                      {resolvedDoubts.length}
                    </span>
                    <span> Resolved Doubts</span>
                  </div>

                  <div
                    className={`flex-row align-items-center ${
                      width > 600 && 'mg-left-10'
                    }`}
                  >
                    <span className="sub-text bold margin-right-smallest">
                      {unresolvedDoubts.length}
                    </span>
                    <span> Unresolved Doubts</span>
                  </div>
                </div>
                <div
                  className={
                    width > 600
                      ? classes.searchBarContainer
                      : classes.fullSearchBarContainer
                  }
                >
                  <Controls.Input
                    placeholder="Search by student name..."
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
                </div>
              </div>
            </AppBar>
          </div>
          {loading && <Spinner />}
          {!loading && (
            <Grid container className={classes.gridContainer}>
              {doubts.length > 0 && (
                <Grid item xs={12}>
                  <div className={classes.filterDiv}>
                    <p className="fine-text secondary-text">
                      {doubts.length} Doubts
                    </p>
                    <Controls.Select
                      name="doubt-filter"
                      value={filterType}
                      options={types}
                      onChange={handleOnChangeFilter}
                      variant="standard"
                      className={classes.select}
                      disableUnderline
                    />
                  </div>
                </Grid>
              )}
              {!searchQuery &&
                (filterType === 'A' || filterType === 'D') &&
                unresolvedDoubts.length > 0 &&
                unresolvedDoubts.map((doubt) => (
                  <Grid
                    item
                    xs={12}
                    sm={6}
                    md={4}
                    xl={3}
                    style={{ padding: '12px' }}
                  >
                    <StudentDoubtCard
                      status={doubt.status}
                      name={
                        allBatchStudents.find(
                          (student) => student.id === doubt.student_id,
                        ).name
                      }
                      avatar={
                        allBatchStudents.find(
                          (student) => student.id === doubt.student_id,
                        ).avatar
                      }
                    />
                  </Grid>
                ))}
              {!searchQuery &&
                (filterType === 'A' || filterType === 'R') &&
                resolvedDoubts.length > 0 &&
                resolvedDoubts.map((doubt) => (
                  <Grid
                    item
                    xs={12}
                    sm={6}
                    md={4}
                    xl={3}
                    style={{ padding: '12px' }}
                  >
                    <StudentDoubtCard
                      status={doubt.status}
                      name={
                        allBatchStudents.find(
                          (student) => student.id === doubt.student_id,
                        ).name
                      }
                      avatar={
                        allBatchStudents.find(
                          (student) => student.id === doubt.student_id,
                        ).avatar
                      }
                    />
                  </Grid>
                ))}

              {!searchQuery &&
                (doubts.length === 0 ||
                  (filterType === 'D' && unresolvedDoubts.length === 0) ||
                  (filterType === 'R' && resolvedDoubts.length === 0)) && (
                  <div className={classes.doubtPlaceholder}>
                    <div className={classes.image}>
                      <img
                        src={doubtPlaceholder}
                        alt="No doubts"
                        width="333"
                        height="267"
                      />
                    </div>
                    <div className={classes.text}>
                      <p className="text-align-center bolder sub-text">
                        No Doubt yet!
                      </p>
                      <p className={`text-align-center ${classes.subText}`}>
                        {filterType === 'D'
                          ? 'No doubts were left unresolved'
                          : filterType === 'R'
                          ? 'No doubts were resolved during class'
                          : 'No student has raised doubt till now'}
                      </p>
                    </div>
                  </div>
                )}
              {searchQuery &&
                searchedData.length > 0 &&
                (filterType === 'A' || filterType === 'D') &&
                searchedData
                  .filter((data) => data.status === 'D')
                  .map((doubt) => (
                    <Grid
                      item
                      xs={12}
                      sm={6}
                      md={4}
                      xl={3}
                      style={{ padding: '12px' }}
                    >
                      <StudentDoubtCard
                        status={doubt.status}
                        name={
                          allBatchStudents.find(
                            (student) => student.id === doubt.student_id,
                          ).name
                        }
                        avatar={
                          allBatchStudents.find(
                            (student) => student.id === doubt.student_id,
                          ).avatar
                        }
                      />
                    </Grid>
                  ))}
              {searchQuery &&
                searchedData.length > 0 &&
                (filterType === 'A' || filterType === 'R') &&
                searchedData
                  .filter((data) => data.status === 'R')
                  .map((doubt) => (
                    <Grid
                      item
                      xs={12}
                      sm={6}
                      md={4}
                      xl={3}
                      style={{ padding: '12px' }}
                    >
                      <StudentDoubtCard
                        status={doubt.status}
                        name={
                          allBatchStudents.find(
                            (student) => student.id === doubt.student_id,
                          ).name
                        }
                        avatar={
                          allBatchStudents.find(
                            (student) => student.id === doubt.student_id,
                          ).avatar
                        }
                      />
                    </Grid>
                  ))}

              {searchQuery && searchedData.length === 0 && (
                <div className={classes.doubtPlaceholder}>
                  <div className={classes.image}>
                    <img
                      src={doubtPlaceholder}
                      alt="No doubts"
                      width="333"
                      height="267"
                    />
                  </div>
                  <div className={classes.text}>
                    <p className="text-align-center bolder sub-text">
                      No Doubt yet!
                    </p>
                    <p className={`text-align-center ${classes.subText}`}>
                      No doubts found for this name
                    </p>
                  </div>
                </div>
              )}
            </Grid>
          )}
        </div>
      </div>
    </>
  )
}

const useStyles = makeStyles(() =>
  createStyles({
    gridContainer: {
      padding: '20px',
    },
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
      padding: '0 2rem',
      backgroundColor: '#fff',
    },
    searchBar: {
      marginLeft: 'auto',
      padding: '10px',
      width: '100%',
      '& .MuiInputBase-root': {
        borderRadius: 15.5,
        height: 34,
        margin: 'auto 0',
        '& .MuiInputBase-input': {
          fontSize: '0.9rem',
        },
      },
    },
    doubtPlaceholder: {
      margin: '0 auto',
    },
    image: {
      marginTop: '1.5rem',
    },
    text: {
      marginTop: '1.5rem',
    },
    subText: {
      lineHeight: '1.44',
    },
    filterDiv: {
      width: '100%',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      flexWrap: 'wrap',
      padding: '0 0.75rem',
    },
    dataBar: {
      color: '#333',
      width: '100%',
      justifyContent: 'space-between',
      flexWrap: 'wrap',
    },
    select: {
      marginTop: '0px !important',
    },
    count: {
      width: '70%',
      flexWrap: 'wrap',
    },
    bar: {
      borderRight: '1px solid #999',
    },
    paddingRight: {
      paddingRight: 10,
    },
    searchBarContainer: {
      width: '30%',
    },
    fullSearchBarContainer: {
      width: '100%',
    },
  }),
)

export default DoubtCornerList
