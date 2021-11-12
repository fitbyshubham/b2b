import { useSnackbar } from 'notistack'
import React, { useContext, useEffect, useState } from 'react'
import { useHistory } from 'react-router-dom'
import Grid from '@material-ui/core/Grid'
import { Breadcrumbs, Link, Typography, useMediaQuery } from '@material-ui/core'
import { IoIosArrowForward } from 'react-icons/io'
import { makeStyles, createStyles } from '@material-ui/core/styles'
import Controls from '../../../../Components/Controls/Controls'
import Spinner from '../../../../Components/Progress/Spinner'
import AVDialog from '../../../../Components/Dialogs/AVDialog'
import PRDialog from '../../../../Components/Dialogs/PRDialog'
import { BatchContext } from '../../../../Context/BatchContext'
import BatchDetailCard from '../../../../Components/Cards/BatchDetailCard'
import RefreshCard from '../../../../Components/Refresh/RefreshCard'
import showErrorSnackbar from '../../../../Components/Snackbar/errorSnackbar'

const BatchDetail = ({ id }) => {
  const { enqueueSnackbar } = useSnackbar()
  const classes = useStyles()
  const [continueButtonLoading, setContinueButtonLoading] = useState(false)
  const matches = useMediaQuery('(min-width:1280px)')
  const history = useHistory()
  const {
    FindBatchWithCode,
    loading,
    batchByCode,
    GetStudentRequestsForBatch,
    studentRequestByBatchId,
    StartBatchLecture,
    EndBatchLecture,
    ResumeBatchLecture,
    setLoading,
    GenerateAttendance,
  } = useContext(BatchContext)

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

  // Dialog
  const [openAVDialog, setOpenAVDialog] = useState(false)
  const [openPRDialog, setOpenPRDialog] = useState(false)
  const handleAVDialogOpen = () => {
    setOpenAVDialog(true)
  }

  const handleAVDialogClose = () => {
    setOpenAVDialog(false)
  }

  const handlePRDialogOpen = () => {
    setOpenPRDialog(true)
  }

  const handlePRDialogClose = () => {
    setOpenPRDialog(false)
  }

  const handleGoToClass = async () => {
    setContinueButtonLoading(true)
    try {
      const res = await StartBatchLecture(id)
      const {
        app_id,
        rtc_token,
        rtm_token,
        started_at,
        liveboard_url,
        lecture_id,
        screen_share_token,
        secret,
        salt,
      } = res
      history.push({
        pathname: `/dashboard/class/${lecture_id}`,
        state: {
          startClass: true,
          appId: app_id,
          RTCToken: rtc_token,
          RTMToken: rtm_token,
          classStartTime: started_at,
          liveboard_url,
          role: 'T',
          batchId: id,
          screenShareToken: screen_share_token,
          secret,
          salt,
        },
      })
      setContinueButtonLoading(false)
    } catch (err) {
      setContinueButtonLoading(false)
    }
  }

  const handleResumeLecture = async () => {
    setContinueButtonLoading(true)
    try {
      const res = await ResumeBatchLecture(batchByCode.lecture.id)
      const {
        app_id,
        rtc_token,
        rtm_token,
        started_at,
        liveboard_url,
        screen_share_token,
        secret,
        salt,
      } = res.data
      history.push({
        pathname: `/dashboard/class/${batchByCode.lecture.id}`,
        state: {
          startClass: true,
          appId: app_id,
          RTCToken: rtc_token,
          RTMToken: rtm_token,
          classStartTime: started_at,
          liveboard_url,
          role: 'T',
          batchId: id,
          screenShareToken: screen_share_token,
          secret,
          salt,
        },
      })
      setContinueButtonLoading(false)
    } catch (err) {
      setContinueButtonLoading(false)
    }
  }

  const handleEndLecture = async () => {
    await GenerateAttendance(batchByCode.lecture.id)
    await EndBatchLecture(batchByCode.id)
    FindBatchWithCode(batchByCode.id)
  }

  const displayCondition = (lecture) => {
    const { starts, ends } = lecture
    const now = new Date().getTime() / 1000
    if (now > starts && now < ends) {
      return true
    }
    if (now > ends) {
      EndBatchLecture(batchByCode.id, false)
    }
    return false
  }

  return (
    <>
      {loading && <Spinner />}
      {!loading && (
        <div className="full-height">
          <Grid
            container
            justifyContent="space-between"
            className={classes.container}
          >
            <Grid item sm={6} lg={8}>
              <div className="height-100 flex-row align-items-center">
                <p className={`bolder route-heading ${classes.batchName}`}>
                  {batchByCode.name}
                </p>
              </div>
            </Grid>
            <Grid
              item
              sm={4}
              lg={4}
              className={matches ? classes.pd_0 : classes.pd}
            >
              {batchByCode.status === 'D' ? (
                <>
                  {batchByCode.lecture ? (
                    displayCondition(batchByCode.lecture) ? (
                      <>
                        <Grid container direction="row" spacing={2}>
                          <Grid item sm={6}>
                            {studentRequestByBatchId.filter(
                              (batch) => batch.status === 'D',
                            ).length <= 0 ? (
                              <Controls.Button
                                text="Join Class"
                                onClick={handleAVDialogOpen}
                              />
                            ) : (
                              <Controls.Button
                                text="Join Class"
                                onClick={handlePRDialogOpen}
                              />
                            )}
                          </Grid>
                          <Grid item sm={6}>
                            <Controls.Button
                              text="End Class"
                              onClick={handleEndLecture}
                              style={{
                                backgroundColor: '#f44236',
                                backgroundImage: 'unset',
                              }}
                            />
                          </Grid>
                        </Grid>
                      </>
                    ) : (
                      <>
                        {studentRequestByBatchId.filter(
                          (batch) => batch.status === 'D',
                        ).length <= 0 ? (
                          <div>
                            <Controls.Button
                              text="Start Live Class"
                              size="large"
                              onClick={handleAVDialogOpen}
                            />
                          </div>
                        ) : (
                          <div>
                            <Controls.Button
                              text="Start Live Class"
                              size="large"
                              onClick={handlePRDialogOpen}
                            />
                          </div>
                        )}
                      </>
                    )
                  ) : (
                    <>
                      {studentRequestByBatchId.filter(
                        (batch) => batch.status === 'D',
                      ).length <= 0 ? (
                        <div>
                          <Controls.Button
                            text="Start Live Class"
                            size="large"
                            onClick={handleAVDialogOpen}
                          />
                        </div>
                      ) : (
                        <div>
                          <Controls.Button
                            text="Start Live Class"
                            size="large"
                            onClick={handlePRDialogOpen}
                          />
                        </div>
                      )}
                    </>
                  )}
                </>
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
                  {batchByCode.name || ''}
                </Link>
                <Typography color="textPrimary">Batch Details</Typography>
              </Breadcrumbs>
            </Grid>
          </Grid>
          <BatchDetailCard
            batchCode={batchByCode.id}
            batchStatus={batchByCode.status}
            batchSubject={batchByCode.subject}
            batchStandard={batchByCode.standard}
            batchSchedule={batchByCode.schedule}
            batchName={batchByCode.name}
            batchBoard={batchByCode.board}
            nextLectureTiming={batchByCode.next_lecture_timing}
            fetchData={fetchData}
          />
        </div>
      )}
      {openAVDialog && (
        <AVDialog
          open={openAVDialog}
          onClose={handleAVDialogClose}
          batchId={id}
          handleGoToClass={
            batchByCode.lecture ? handleResumeLecture : handleGoToClass
          }
          isLoading={continueButtonLoading}
        />
      )}
      <PRDialog
        open={openPRDialog}
        goNext={handleAVDialogOpen}
        onClose={handlePRDialogClose}
        batchId={id}
        isLoading={continueButtonLoading}
      />
      <RefreshCard
        msg="Please click on refresh to check if new students have requested to join the batch"
        onRefresh={fetchData}
      />
    </>
  )
}

const useStyles = makeStyles(() =>
  createStyles({
    container: {
      padding: '20px',
    },
    pd_0: {
      padding: 0,
    },
    pd: {
      padding: '1rem 0',
    },
    batchName: {
      wordBreak: 'break-all',
    },
  }),
)

export default BatchDetail
