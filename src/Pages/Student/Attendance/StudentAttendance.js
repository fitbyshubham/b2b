import React, { useContext, useEffect } from 'react'
import { Grid, Link, Breadcrumbs, Typography, Paper } from '@material-ui/core'
import { makeStyles, createStyles } from '@material-ui/core/styles'
import { IoIosArrowForward } from 'react-icons/io'
import { BatchContext } from '../../../Context/BatchContext'
import Spinner from '../../../Components/Progress/Spinner'
import {
  DisplayDate,
  ConvertTimeTo24Hours,
  ConvertTime,
} from '../../../Global/Functions'
import AttendanceNotFound from '../../Teacher/Batch/Attendance/AttendanceNotFound'

const TimeDuration = (start, end) => {
  const startDate = ConvertTime(start)
  const endDate = ConvertTime(end)

  return `${ConvertTimeTo24Hours(
    startDate.toTimeString().slice(0, 5),
  )} - ${ConvertTimeTo24Hours(endDate.toTimeString().slice(0, 5))}`
}

const AttendanceCard = ({ title, time, percent }) => {
  const classes = useStyles()
  return (
    <Paper className={classes.card}>
      <div>
        <p className={classes.title}>{title}</p>
        <p className={classes.date}>{time}</p>
      </div>
      <div>
        <p className={classes.percent}>
          {percent ? `${parseFloat(percent).toFixed(0)}%` : 'N/A'}
        </p>
      </div>
    </Paper>
  )
}

const StudentAttendance = ({ id }) => {
  const classes = useStyles()

  const {
    loading,
    batchByCode,
    FindBatchWithCode,
    GetAttendance,
    attendance,
    GetLectures,
    lectures,
    setLoading,
  } = useContext(BatchContext)

  const fetchData = async () => {
    setLoading(true)
    await FindBatchWithCode(id)
    await GetLectures(id)
    await GetAttendance(id)
    setLoading(false)
  }

  useEffect(() => {
    fetchData()
  }, [])

  return (
    <>
      {loading ? (
        <Spinner />
      ) : (
        <div className={`${classes.divWrapper} full-height`}>
          <Grid container className={classes.gridContainer}>
            <Grid item xs={6} sm={9}>
              <div className="height-100 flex-row align-items-center">
                <p
                  className={`${classes.heading} bolder`}
                  style={{ fontSize: '24px', color: '#6481e4' }}
                >
                  My Attendance
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
                <Link
                  color="inherit"
                  href={`/dashboard/view/${batchByCode.id}`}
                >
                  {batchByCode.name}
                </Link>
                <Typography color="textPrimary">Attendance</Typography>
              </Breadcrumbs>
            </Grid>
          </Grid>
          {lectures.length === 0 ? (
            <div style={{ padding: '0 2rem' }}>
              <AttendanceNotFound />
            </div>
          ) : (
            <Grid container spacing={2} alignItems="stretch">
              {lectures.map((item) => (
                <Grid item xs={12} sm={6} md={4} lg={3}>
                  <AttendanceCard
                    title={DisplayDate(ConvertTime(item.starts), true)}
                    time={TimeDuration(item.starts, item.ends)}
                    percent={attendance[item.id]}
                    key={item.id}
                  />
                </Grid>
              ))}
            </Grid>
          )}
        </div>
      )}
    </>
  )
}

const useStyles = makeStyles(() =>
  createStyles({
    card: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '20px',
      borderRadius: 8,
      boxShadow: '2px 4px 6px 2px rgba(0, 0, 0, 0.06)',
    },
    title: {
      fontWeight: 'bold',
    },
    date: {
      fontSize: '0.8rem',
      color: '#888888',
    },
    percent: {
      fontWeight: 'bold',
    },
    divWrapper: {
      padding: '2rem',
    },
    gridContainer: {
      padding: '0 0 2rem 0',
    },
    heading: {
      fontSize: '24px',
      color: '#6481e4',
    },
  }),
)

export default StudentAttendance
