/* eslint-disable jsx-a11y/aria-role */
import React, { useContext, useState, useEffect } from 'react'
import { Grid, AppBar, Tabs, Tab, makeStyles } from '@material-ui/core'
import Add from '@material-ui/icons/Add'
import Controls from '../../Components/Controls/Controls'
import { AuthContext } from '../../Context/AuthContext'
import { BatchContext } from '../../Context/BatchContext'
import ApprovedCard from '../../Components/Cards/ApprovedCard'
import PendingCard from '../../Components/Cards/PendingCard'
import CreateBatchMessage from '../Teacher/Batch/CreateBatchMessage/CreateBatchMessage'
import JoinBatchDialog from '../../Components/Dialogs/JoinBatchDialog'
import RefreshCard from '../../Components/Refresh/RefreshCard'
import ArchiveBatchMessage from '../ArchiveBatchMessage/ArchiveBatchMessage'
import Spinner from '../../Components/Progress/Spinner'

const StudentBatches = ({ allReqAndBatches, setBatchByCode }) => {
  const classes = useStyles()

  const { authState } = useContext(AuthContext)
  const {
    getAllReqAndBatches,
    archiveBatches,
    batchesLoading,
    GetArchiveBatch,
  } = useContext(BatchContext)

  const [openJoinBatchDialog, setOpenJoinBatchDialog] = useState(false)
  const [selectedTab, setSelectedTab] = useState(0)

  const { batch, request } = allReqAndBatches

  const cardCount = batch.length + request.length

  useEffect(() => {}, [cardCount])

  const handleRefresh = () => {
    getAllReqAndBatches()
    GetArchiveBatch()
  }

  const handleChange = (event, newValue) => {
    setSelectedTab(newValue)
  }

  const handleJoinBatchDialogOpen = () => {
    setOpenJoinBatchDialog(true)
  }

  const handleJoinBatchDialogClose = () => {
    setOpenJoinBatchDialog(false)
  }

  return (
    <>
      <Grid container>
        <Grid item xs={12}>
          <div className={`${classes.appBarContainer} margin-top-medium`}>
            <AppBar position="static" className={classes.appBar}>
              <Tabs
                value={selectedTab}
                onChange={handleChange}
                className={classes.tabContainer}
              >
                <Tab
                  label={`Active Batches (${batch.length})`}
                  className={classes.capitalizeText}
                />
                <Tab
                  label={`Archived Batches (${archiveBatches.length})`}
                  className={classes.capitalizeText}
                />
              </Tabs>
              <Controls.Button
                startIcon={<Add />}
                text="Join Batch"
                onClick={handleJoinBatchDialogOpen}
                color="secondary"
                style={{ width: 'unset', marginLeft: 'auto' }}
                disabled={!authState.is_email_verified}
              />
            </AppBar>
          </div>
        </Grid>
      </Grid>
      {batchesLoading && <Spinner />}
      {!batchesLoading && (
        <div className={`bg-unset ${classes.padding}`}>
          {/* {authState.is_email_verified ? ( */}
          <>
            {authState.is_email_verified && selectedTab === 0 && (
              <>
                {cardCount > 0 ? (
                  <Grid
                    container
                    spacing={2}
                    alignItems="stretch"
                    className="mg-top-1rem"
                  >
                    {batch.map((item) => (
                      <Grid
                        item
                        xs={12}
                        sm={12}
                        md={6}
                        lg={4}
                        xl={3}
                        key={item.id}
                      >
                        <ApprovedCard
                          batchName={item.name}
                          batchId={item.id}
                          subject={item.subject}
                          nextLectureTiming={item.next_lecture_timing}
                          lecture={item.lecture}
                          teacherName={item.owner_name}
                          batchStatus={item.status}
                        />
                      </Grid>
                    ))}
                    {request.map((item) => (
                      <Grid
                        item
                        xs={12}
                        sm={12}
                        md={6}
                        lg={4}
                        xl={3}
                        key={item.batch_id}
                      >
                        <PendingCard
                          batchName={item.batch_name}
                          batchId={item.batch_id}
                          subject={item.subject}
                          standard={item.standard}
                          teacherName={item.teacher}
                          status={item.status}
                        />
                      </Grid>
                    ))}
                  </Grid>
                ) : (
                  <CreateBatchMessage role="S" />
                )}
              </>
            )}
            {authState.is_email_verified && selectedTab === 1 && (
              <>
                {archiveBatches.length > 0 ? (
                  <Grid
                    container
                    spacing={4}
                    justifyContent="flex-start"
                    alignItems="stretch"
                    className="mg-top-1rem"
                  >
                    {archiveBatches.map((batches) => (
                      <Grid
                        item
                        xs={12}
                        sm={12}
                        md={6}
                        lg={4}
                        xl={3}
                        key={batches.id}
                      >
                        <ApprovedCard
                          batchName={batches.name}
                          batchId={batches.id}
                          subject={batches.subject}
                          nextLectureTiming={batches.next_lecture_timing}
                          lecture={batches.lecture}
                          teacherName={batches.owner_name}
                        />
                      </Grid>
                    ))}
                  </Grid>
                ) : (
                  <ArchiveBatchMessage role={authState.role} />
                )}
              </>
            )}
            {openJoinBatchDialog && (
              <JoinBatchDialog
                open={openJoinBatchDialog}
                onClose={handleJoinBatchDialogClose}
                allReqAndBatches={allReqAndBatches}
                setBatchByCode={setBatchByCode}
              />
            )}
          </>
          {/* ) : ( */}
          {/*  <CreateBatchMessage role="S" /> */}
          {/* )} */}
        </div>
      )}
      <RefreshCard
        msg="Please click on refresh to check if your join request is accepted or live class has started"
        onRefresh={handleRefresh}
      />
    </>
  )
}

export default StudentBatches

const useStyles = makeStyles({
  appBar: {
    backgroundColor: '#fff',
    color: '#999',
    flexDirection: 'row',
    boxShadow: 'none',
    padding: '0px 1.5rem',
    '& .Mui-selected': {
      color: '#6484e4',
    },
    '& .MuiTabs-indicator': {
      backgroundColor: '#6484e4',
      marginBottom: 5,
      width: '30%',
    },
  },
  appBarContainer: {
    padding: '10px',
    backgroundColor: '#fff',
  },
  capitalizeText: {
    textTransform: 'capitalize',
  },
  info: {
    color: '#999',
  },
  tabContainer: {
    width: 'fit-content',
  },
  tabContent: {
    paddingTop: 6,
  },
  padding: {
    padding: '0.5rem 2rem 2rem',
  },
})
