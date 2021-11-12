import React, { useContext, useEffect, useState } from 'react'
import { makeStyles, createStyles } from '@material-ui/core/styles'
import { GrFormClose, GrFormRefresh } from 'react-icons/gr'
import { IconButton } from '@material-ui/core'
import StudentAdmissionList from './StudentAdmissionList'
import { BatchContext } from '../../Context/BatchContext'
import Spinner from '../Progress/Spinner'

export default function PendingStudentList({ batchId, handleClose }) {
  const classes = useStyles()
  const { studentRequestByBatchId, GetStudentRequestsForBatch } =
    useContext(BatchContext)
  const [isLoading, setIsLoading] = useState(true)

  const getPendingRequests = async () => {
    setIsLoading(true)
    await GetStudentRequestsForBatch(batchId)
    setIsLoading(false)
  }

  useEffect(() => {
    getPendingRequests()
  }, [])

  return (
    <>
      {studentRequestByBatchId.filter((request) => request.status === 'D')
        .length === 0 ? null : (
        <>
          <div
            style={{
              backgroundColor: '#f2f5ff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            <p className={classes.heading}>Pending Requests</p>
            <div>
              <IconButton
                style={{ padding: 6 }}
                onClick={() => {
                  getPendingRequests()
                }}
              >
                <GrFormRefresh />
              </IconButton>
              <IconButton
                style={{ padding: 6 }}
                onClick={() => {
                  handleClose()
                }}
              >
                <GrFormClose />
              </IconButton>
            </div>
          </div>
          {isLoading && <Spinner size={32} style={{ marginBottom: '2rem' }} />}
          {!isLoading && (
            <StudentAdmissionList
              items={studentRequestByBatchId.filter(
                (request) => request.status === 'D',
              )}
            />
          )}
        </>
      )}
    </>
  )
}

const useStyles = makeStyles(() =>
  createStyles({
    heading: {
      backgroundColor: '#f2f5ff',
      color: '#333',
      fontSize: '1.25rem',
      padding: '0.5rem 1.125rem',
      fontWeight: 500,
      height: 44,
    },
  }),
)
