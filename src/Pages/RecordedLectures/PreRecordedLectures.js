import { Grid, IconButton, makeStyles, createStyles } from '@material-ui/core'
import React, { useContext, useEffect } from 'react'
import { IoChevronBack, IoChevronForward } from 'react-icons/io5'
import PreRecordedVideoCard from '../../Components/Cards/PreRecordedVideoCard'
import RecordingNotFound from '../../Components/Cards/RecordingNotFound'
import Spinner from '../../Components/Progress/Spinner'
import { BatchContext } from '../../Context/BatchContext'

const PreRecordedLectures = ({ id, subId, searchedData }) => {
  const classes = useStyles()
  const {
    GetFoldersContentsForLectures,
    recordingsLoading,
    filesInRecordingFolder,
  } = useContext(BatchContext)
  const getRecordings = async (url) => {
    await GetFoldersContentsForLectures(id, subId, url)
  }

  const handleForward = () => {
    getRecordings(filesInRecordingFolder.next)
  }

  const handleBack = () => {
    getRecordings(filesInRecordingFolder.previous)
  }

  useEffect(() => {
    getRecordings()
  }, [])

  return (
    <>
      {recordingsLoading && <Spinner />}
      {!recordingsLoading && filesInRecordingFolder.count > 0 && (
        <div className={classes.pageBtnDiv}>
          <IconButton
            onClick={handleBack}
            disabled={!filesInRecordingFolder.previous}
          >
            <IoChevronBack />
          </IconButton>
          <IconButton
            onClick={handleForward}
            disabled={!filesInRecordingFolder.next}
          >
            <IoChevronForward />
          </IconButton>
        </div>
      )}
      {searchedData === null &&
        !recordingsLoading &&
        filesInRecordingFolder.count > 0 && (
          <div>
            <Grid container alignItems="center" spacing={4}>
              {filesInRecordingFolder.results.map((recording, idx) => (
                <Grid
                  item
                  xs={12}
                  sm={6}
                  md={4}
                  xl={3}
                  key={`${recording.id}-${recording.filename}`}
                >
                  <PreRecordedVideoCard
                    link={recording.file_link}
                    filename={recording.title}
                    index={idx}
                    updatedAt={recording.updated_at}
                    id={recording.id}
                    folderId={subId}
                  />
                </Grid>
              ))}
            </Grid>
          </div>
        )}
      {searchedData === null &&
        !recordingsLoading &&
        filesInRecordingFolder.count === 0 && <RecordingNotFound folder />}
      {searchedData !== null && !recordingsLoading && searchedData.length > 0 && (
        <div>
          <Grid container alignItems="center" spacing={4}>
            {searchedData.map((recording, idx) => (
              <Grid
                item
                xs={12}
                sm={6}
                md={4}
                xl={3}
                key={`${recording.id}-${recording.filename}`}
              >
                <PreRecordedVideoCard
                  link={recording.file_link}
                  filename={recording.title}
                  index={idx}
                  updatedAt={recording.updated_at}
                  id={recording.id}
                  folderId={subId}
                />
              </Grid>
            ))}
          </Grid>
        </div>
      )}
      {searchedData !== null &&
        !recordingsLoading &&
        searchedData.length === 0 && (
          <p className="fine-text secondary-text">No recordings found</p>
        )}
    </>
  )
}

export default PreRecordedLectures

const useStyles = makeStyles(() =>
  createStyles({
    pageBtnDiv: {
      width: '100%',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'flex-end',
      marginTop: '-2rem',
    },
  }),
)
