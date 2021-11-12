import React, { useContext, useEffect, useState } from 'react'
import Grid from '@material-ui/core/Grid'
import { Breadcrumbs, Link, Typography } from '@material-ui/core'
import { IoIosArrowForward } from 'react-icons/io'
import { makeStyles, createStyles } from '@material-ui/core/styles'
import { FiPlus } from 'react-icons/fi'
import { BatchContext } from '../../../../Context/BatchContext'
import Spinner from '../../../../Components/Progress/Spinner'
import Controls from '../../../../Components/Controls/Controls'
import AddNoticeDialog from '../../../../Components/Dialogs/AddNoticeDialog'
import NoticeCard from '../../../../Components/Cards/NoticeCard'

const NoticeBoard = ({ id, role }) => {
  const [activeNotices, setActiveNotices] = useState([])
  const [scheduledNotices, setScheduledNotices] = useState([])
  const [openAddNotice, setOpenAddNotice] = useState(false)

  const classes = useStyles()

  const currentDate = new Date()
  const currentTime = Math.floor(currentDate.getTime() / 1000)

  const {
    loading,
    batchByCode,
    FindBatchWithCode,
    GetCurrentBatchNotices,
    batchNotices,
    setLoading,
  } = useContext(BatchContext)

  const fetchData = async () => {
    setLoading(true)
    await FindBatchWithCode(id)
    await GetCurrentBatchNotices(id)
    setLoading(false)
  }

  useEffect(() => {
    fetchData()
  }, [])

  useEffect(() => {
    const active = batchNotices.filter(
      (notice) => notice.schedule_time < currentTime,
    )

    const scheduled = batchNotices.filter(
      (notice) => notice.schedule_time > currentTime,
    )

    setScheduledNotices(scheduled.sort((a, b) => b.id - a.id))
    setActiveNotices(active.sort((a, b) => b.id - a.id))
  }, [batchNotices])

  const handleOpenNotice = () => {
    setOpenAddNotice(true)
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
            <Grid item sm={6} lg={8}>
              <div className="height-100 flex-row align-items-center">
                <p className="bolder route-heading">Notice Board</p>
              </div>
            </Grid>
            <Grid item sm={4} lg={4}>
              {batchByCode.status === 'D' ? (
                <Controls.Button onClick={handleOpenNotice}>
                  <FiPlus className="margin-right-smallest" /> Add Notice
                </Controls.Button>
              ) : null}
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
                <Typography color="textPrimary">Notice Board</Typography>
              </Breadcrumbs>
            </Grid>
          </Grid>

          <Grid container className={classes.notice_container}>
            <Typography variant="h6" className={classes.heading}>
              Scheduled Notices
            </Typography>
            {scheduledNotices.map((notice) => (
              <Grid
                item
                xs={12}
                className={classes.notice_grid}
                key={notice.id}
              >
                <NoticeCard
                  id={notice.id}
                  notice={notice.message}
                  noticeTime={notice.schedule_time}
                  role={role}
                  batchId={id}
                  fetchData={fetchData}
                  status={batchByCode.status}
                  type="scheduled"
                />
              </Grid>
            ))}
            {scheduledNotices.length === 0 && (
              <Grid item xs={12} className={classes.notice_grid}>
                <Typography>No Scheduled Notices</Typography>
              </Grid>
            )}
          </Grid>

          <Grid container className={classes.notice_container}>
            <Typography variant="h6" className={classes.heading}>
              Active Notices
            </Typography>
            {activeNotices.map((notice) => (
              <Grid
                item
                xs={12}
                className={classes.notice_grid}
                key={notice.id}
              >
                <NoticeCard
                  id={notice.id}
                  notice={notice.message}
                  noticeTime={notice.schedule_time}
                  role={role}
                  batchId={id}
                  fetchData={fetchData}
                  status={batchByCode.status}
                  type="active"
                />
              </Grid>
            ))}
            {activeNotices.length === 0 && (
              <Grid item xs={12} className={classes.notice_grid}>
                <Typography>No Active Notices</Typography>
              </Grid>
            )}
          </Grid>
        </div>
      )}
      {openAddNotice && (
        <AddNoticeDialog
          open={openAddNotice}
          setOpen={setOpenAddNotice}
          batchId={id}
          fetchData={fetchData}
          mode="Add"
        />
      )}
    </>
  )
}

const useStyles = makeStyles(() =>
  createStyles({
    container: {
      padding: '20px',
      backgroundColor: '#fff',
    },
    gridContainer: {
      padding: '20px',
    },
    input: {
      width: 'calc(100% - 2rem)',
    },
    btn: {
      marginTop: '8%',
    },
    notice_container: {
      padding: '0rem 2.5rem 2rem',
    },
    notice_grid: {
      marginBottom: '1rem',
    },
    heading: {
      margin: '10px 0px',
      fontWeight: 'bold',
    },
  }),
)

export default NoticeBoard
