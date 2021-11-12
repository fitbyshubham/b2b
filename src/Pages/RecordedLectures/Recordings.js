import React, { useContext, useEffect, useState } from 'react'
import {
  AppBar,
  Breadcrumbs,
  Grid,
  InputAdornment,
  makeStyles,
  Tab,
  Tabs,
  Typography,
  Link,
  IconButton,
} from '@material-ui/core'
import {
  IoIosAdd,
  IoIosArrowBack,
  IoIosArrowForward,
  IoIosSearch,
  IoMdClose,
} from 'react-icons/io'
import { useHistory } from 'react-router-dom'
import Controls from '../../Components/Controls/Controls'
import { BatchContext } from '../../Context/BatchContext'
import ClassRecordings from './ClassRecordings'
import Spinner from '../../Components/Progress/Spinner'
import { AuthContext } from '../../Context/AuthContext'
import PreRecordedLecturesFolder from './PreRecordedLecturesFolder'
import PreRecordedLectures from './PreRecordedLectures'
import UploadPreRecordedLectureDialog from '../../Components/Dialogs/UploadPreRecordedLectureDialog'

const Recordings = ({ id, subId }) => {
  const classes = useStyles()
  const history = useHistory()
  const { authState } = useContext(AuthContext)
  const {
    batchByCode,
    FindBatchWithCode,
    loading,
    recordings,
    recordingFolders,
    filesInRecordingFolder,
  } = useContext(BatchContext)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedTab, setSelectedTab] = useState(0)
  const [searchedData, setSearchedData] = useState(null)
  const [openFileUploadDialog, setOpenFileUploadDialog] = useState(false)

  useEffect(() => {
    FindBatchWithCode(id)
  }, [])

  useEffect(() => {
    if (subId && selectedTab !== 1) setSelectedTab(1)
  }, [subId])

  useEffect(() => {
    if (selectedTab === 0 && subId) {
      history.push(`/dashboard/recordings/${id}`)
    }
  }, [selectedTab])

  useEffect(() => {
    if (searchQuery === '') {
      setSearchedData(null)
      return
    }
    search(searchQuery)
  }, [searchQuery])

  const clearSearchBar = () => {
    setSearchQuery('')
  }

  const search = (searchToken) => {
    if (selectedTab === 0) {
      setSearchedData(
        recordings.filter((val) =>
          val.title.toLowerCase().includes(searchToken.toLowerCase()),
        ),
      )
    } else if (selectedTab === 1) {
      if (subId) {
        setSearchedData(
          filesInRecordingFolder.results.filter((val) =>
            val.title.toLowerCase().includes(searchToken.toLowerCase()),
          ),
        )
      } else {
        setSearchedData(
          recordingFolders.results.filter((val) =>
            val.name.toLowerCase().includes(searchToken.toLowerCase()),
          ),
        )
      }
    }
  }

  const handleTabChange = (event, newValue) => {
    setSelectedTab(newValue)
  }

  const onOpenFileUploadDialog = () => {
    setOpenFileUploadDialog(true)
  }

  const onCloseFileUploadDialog = () => {
    setOpenFileUploadDialog(false)
  }

  return (
    <>
      <div className="full-height">
        {loading && <Spinner />}
        {openFileUploadDialog && (
          <UploadPreRecordedLectureDialog
            id={id}
            open={openFileUploadDialog}
            closeDialog={onCloseFileUploadDialog}
          />
        )}
        {!loading && (
          <>
            <Grid
              container
              justifyContent="space-between"
              className={classes.gridContainer}
            >
              <Grid item xs={12} sm={6} lg={8}>
                <div className="height-100 flex-row align-items-center">
                  {selectedTab === 1 && subId && (
                    <IconButton
                      style={{ marginRight: '1rem' }}
                      onClick={() => {
                        history.push(`/dashboard/recordings/${id}`)
                      }}
                    >
                      <IoIosArrowBack />
                    </IconButton>
                  )}
                  <p
                    className="bolder"
                    style={{ fontSize: '24px', color: '#6481e4' }}
                  >
                    Class Recordings
                  </p>
                </div>
              </Grid>
              {authState.role === 'T' && selectedTab === 1 && (
                <Grid item xs={12} sm={6} lg={4}>
                  <Controls.Button
                    text="Upload Lectures"
                    startIcon={<IoIosAdd />}
                    onClick={onOpenFileUploadDialog}
                  />
                </Grid>
              )}
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
                  {!subId && (
                    <Typography color="textPrimary">Class Recording</Typography>
                  )}
                  {subId && (
                    <Link color="inherit" href={`/dashboard/recordings/${id}`}>
                      Class Recordings
                    </Link>
                  )}
                  {subId && (
                    <Typography color="textPrimary">
                      {recordingFolders.results.find(
                        (recs) => recs.id === subId,
                      )?.name || subId}
                    </Typography>
                  )}
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
                    label="Live Class Recording"
                    className={classes.capitalizeText}
                    classes={{
                      root: classes.tab,
                    }}
                  />
                  <Tab
                    disableRipple
                    label="Pre-recorded Lectures"
                    className={classes.capitalizeText}
                    classes={{
                      root: classes.tab,
                    }}
                  />
                </Tabs>
                <Controls.Input
                  placeholder={
                    selectedTab === 0
                      ? 'Search recordings by title...'
                      : subId
                      ? 'Search recordings by title...'
                      : 'Search folders by title...'
                  }
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
              {selectedTab === 0 && (
                <ClassRecordings id={id} searchedData={searchedData} />
              )}
              {selectedTab === 1 && !subId && (
                <PreRecordedLecturesFolder
                  id={id}
                  searchedData={searchedData}
                />
              )}
              {selectedTab === 1 && subId && (
                <PreRecordedLectures
                  id={id}
                  subId={subId}
                  searchedData={searchedData}
                />
              )}
            </div>
          </>
        )}
      </div>
    </>
  )
}

export default Recordings

const useStyles = makeStyles({
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
  },
  appBarContainer: {
    padding: '0 2rem',
    backgroundColor: '#fff',
  },
  capitalizeText: {
    textTransform: 'capitalize',
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
  content: {
    padding: '2rem 2rem 0',
  },
})
