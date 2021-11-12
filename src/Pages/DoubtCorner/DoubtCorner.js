import React, { useContext, useState, useEffect } from 'react'
import {
  AppBar,
  Grid,
  Breadcrumbs,
  Typography,
  Link,
  InputAdornment,
  IconButton,
} from '@material-ui/core'
import { makeStyles, createStyles } from '@material-ui/core/styles'
import { IoIosArrowForward, IoIosSearch, IoMdClose } from 'react-icons/io'
import { IoChevronBack, IoChevronForward } from 'react-icons/io5'
import Controls from '../../Components/Controls/Controls'
import { BatchContext } from '../../Context/BatchContext'
import BatchDoubtCard from '../../Components/Cards/BatchDoubtCard'
import Spinner from '../../Components/Progress/Spinner'
import { DisplayDate } from '../../Global/Functions'
import doubtPlaceholder from '../../Assets/Images/doubtPlaceholder.webp'

const DoubtCorner = ({ id }) => {
  const [loading, setLoading] = useState(false)
  const { batchByCode, FindBatchWithCode, GetLectures } =
    useContext(BatchContext)

  const [lectures, setLectures] = useState({
    results: [],
    next: undefined,
    count: undefined,
    previous: undefined,
  })

  const [searchQuery, setSearchQuery] = useState('')
  const [searchedData, setSearchedData] = useState([])

  const fetchLectures = async (url) => {
    setLoading(true)
    let res
    if (!url) {
      res = await GetLectures(id)
    } else {
      res = await GetLectures(id, url)
    }
    setLectures({
      results: res.data.results,
      next: res.data.next,
      count: res.data.count,
      previous: res.data.previous,
    })
    setLoading(false)
  }

  const fetchData = async () => {
    setLoading(true)
    await FindBatchWithCode(id)
    await fetchLectures()
    setLoading(false)
  }

  useEffect(() => {
    fetchData()
  }, [])

  const search = (searchToken) => {
    setSearchedData(() =>
      lectures.results.filter((val) =>
        DisplayDate(val.starts * 1000)
          .toLowerCase()
          .includes(searchToken.toLowerCase()),
      ),
    )
  }

  useEffect(() => {
    search(searchQuery)
  }, [searchQuery])

  const classes = useStyles()

  const handleForward = async () => {
    await fetchLectures(lectures.next)
  }

  const handleBack = async () => {
    await fetchLectures(lectures.previous)
  }

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
          <Grid item sm={6} lg={8}>
            <div className="height-100 flex-row align-items-center">
              <p className="bolder route-heading">Doubt Corner</p>
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
              <Typography color="textPrimary">Doubt Corner</Typography>
            </Breadcrumbs>
          </Grid>
        </Grid>
        <div>
          <div className={classes.appBarContainer}>
            <AppBar position="static" className={classes.appBar}>
              <Controls.Input
                placeholder="Search by lecture date or time..."
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
          {loading && <Spinner />}
          {!loading && (
            <Grid container className={classes.gridContainer}>
              {lectures.results.length > 0 && (
                <div className={classes.pageBtnDiv}>
                  <IconButton
                    onClick={handleBack}
                    disabled={!lectures.previous}
                  >
                    <IoChevronBack />
                  </IconButton>
                  <IconButton onClick={handleForward} disabled={!lectures.next}>
                    <IoChevronForward />
                  </IconButton>
                </div>
              )}
              {!searchQuery &&
                lectures.results.length > 0 &&
                lectures.results.map((lecture) => (
                  <Grid
                    item
                    xs={12}
                    sm={6}
                    md={4}
                    xl={3}
                    style={{ padding: '12px' }}
                  >
                    <BatchDoubtCard
                      id={lecture.id}
                      startTime={lecture.starts}
                      batchId={id}
                    />
                  </Grid>
                ))}
              {!searchQuery && lectures.results.length === 0 && (
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
                      No Lectures yet!
                    </p>
                    <p className={`text-align-center ${classes.subText}`}>
                      No lectures have been conducted for this batch
                    </p>
                  </div>
                </div>
              )}
              {searchQuery &&
                searchedData.length > 0 &&
                searchedData.map((lecture) => (
                  <Grid
                    item
                    xs={12}
                    sm={6}
                    md={4}
                    xl={3}
                    style={{ padding: '12px' }}
                  >
                    <BatchDoubtCard
                      id={lecture.id}
                      startTime={lecture.starts}
                      batchId={id}
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
                      No Lectures yet!
                    </p>
                    <p className={`text-align-center ${classes.subText}`}>
                      No lectures found for this date or time
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
      width: '35%',
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
    pageBtnDiv: {
      width: '100%',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'flex-end',
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
  }),
)

export default DoubtCorner
