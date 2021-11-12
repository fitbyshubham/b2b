import { Grid } from '@material-ui/core'
import React, { useContext, useEffect } from 'react'
import RecordedVideoCard from '../../Components/Cards/RecordedVideoCard'
import RecordingNotFound from '../../Components/Cards/RecordingNotFound'
import Spinner from '../../Components/Progress/Spinner'
import { BatchContext } from '../../Context/BatchContext'

const ClassRecordings = ({ id, searchedData }) => {
  const { GetListOfRecordings, recordingsLoading, recordings } =
    useContext(BatchContext)

  const getRecordings = async () => {
    await GetListOfRecordings(id)
  }

  useEffect(() => {
    getRecordings()
  }, [])
  return (
    <>
      {recordingsLoading && <Spinner />}
      {searchedData === null && !recordingsLoading && recordings.length > 0 && (
        <div>
          <Grid container alignItems="center" spacing={4}>
            {recordings.map((recording, idx) => (
              <Grid
                item
                xs={12}
                sm={6}
                md={4}
                xl={3}
                key={`${recording.filename}-${recording.started_at}`}
              >
                <RecordedVideoCard
                  filename={recording.filename}
                  startedAt={recording.started_at}
                  endedAt={recording.ended_at}
                  title={recording.title}
                  index={idx}
                  id={recording.id}
                  batch_id={id}
                />
              </Grid>
            ))}
          </Grid>
        </div>
      )}
      {searchedData === null &&
        !recordingsLoading &&
        recordings.length === 0 && <RecordingNotFound type="live" />}
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
                key={`${recording.filename}-${recording.started_at}`}
              >
                <RecordedVideoCard
                  filename={recording.filename}
                  startedAt={recording.started_at}
                  endedAt={recording.ended_at}
                  title={recording.title}
                  index={idx}
                  id={recording.id}
                />
              </Grid>
            ))}
          </Grid>
        </div>
      )}
    </>
  )
}

export default ClassRecordings
