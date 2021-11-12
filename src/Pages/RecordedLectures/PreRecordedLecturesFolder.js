import { Grid, IconButton, makeStyles, createStyles } from '@material-ui/core'
import React, { useContext, useEffect } from 'react'
import { IoChevronBack, IoChevronForward } from 'react-icons/io5'
import RecordedLectureFolderCard from '../../Components/Cards/RecordedLectureFolderCard'
import RecordingNotFound from '../../Components/Cards/RecordingNotFound'
import Spinner from '../../Components/Progress/Spinner'
import { BatchContext } from '../../Context/BatchContext'

const PreRecordedLecturesFolder = ({ id, searchedData }) => {
  const classes = useStyles()
  const { GetFoldersForLectures, recordingsLoading, recordingFolders } =
    useContext(BatchContext)
  const getPreRecordedLectureFolders = async (url) => {
    await GetFoldersForLectures(id, url)
  }

  const handleForward = () => {
    getPreRecordedLectureFolders(recordingFolders.next)
  }

  const handleBack = () => {
    getPreRecordedLectureFolders(recordingFolders.previous)
  }

  useEffect(() => {
    getPreRecordedLectureFolders()
  }, [])
  return (
    <>
      {recordingsLoading && <Spinner />}
      {!recordingsLoading && recordingFolders.count > 0 && (
        <div className={classes.pageBtnDiv}>
          <IconButton
            onClick={handleBack}
            disabled={!recordingFolders.previous}
          >
            <IoChevronBack />
          </IconButton>
          <IconButton onClick={handleForward} disabled={!recordingFolders.next}>
            <IoChevronForward />
          </IconButton>
        </div>
      )}
      {searchedData === null &&
        !recordingsLoading &&
        recordingFolders.count > 0 && (
          <div>
            <Grid container alignItems="center" spacing={4}>
              {recordingFolders.results.map((recording, idx) => (
                <Grid
                  item
                  xs={12}
                  sm={6}
                  md={4}
                  xl={3}
                  key={`${recording.foldername}-${Math.random()}`}
                >
                  <RecordedLectureFolderCard
                    folderId={recording.id}
                    foldername={recording.name}
                    index={idx}
                    id={id}
                  />
                </Grid>
              ))}
            </Grid>
          </div>
        )}
      {searchedData === null &&
        !recordingsLoading &&
        recordingFolders.count === 0 && <RecordingNotFound />}
      {searchedData !== null &&
        !recordingsLoading &&
        searchedData.length === 0 && (
          <p className="fine-text secondary-text">No recordings found</p>
        )}
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
                key={`${recording.foldername}-${Math.random()}`}
              >
                <RecordedLectureFolderCard
                  folderId={recording.id}
                  foldername={recording.name}
                  index={idx}
                  id={id}
                />
              </Grid>
            ))}
          </Grid>
        </div>
      )}
    </>
  )
}

export default PreRecordedLecturesFolder

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
