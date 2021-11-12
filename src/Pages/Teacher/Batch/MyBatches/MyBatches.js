import React, { useContext, useState } from 'react'
import { AppBar, Grid, makeStyles, Tab, Tabs } from '@material-ui/core'
import Add from '@material-ui/icons/Add'
import BatchCard from '../../../../Components/Cards/BatchCard'
import Controls from '../../../../Components/Controls/Controls'
import CreateBatchMessage from '../CreateBatchMessage/CreateBatchMessage'
import ArchiveBatchMessage from '../../../ArchiveBatchMessage/ArchiveBatchMessage'
import { AuthContext } from '../../../../Context/AuthContext'
import CreateBatchDialog from '../../../../Components/Dialogs/CreateBatchDialog/CreateBatchDialog'
import { BatchContext } from '../../../../Context/BatchContext'
import RefreshCard from '../../../../Components/Refresh/RefreshCard'
import Spinner from '../../../../Components/Progress/Spinner'

const MyBatches = ({ batches, openBatchMenu, setBatches }) => {
  const classes = useStyles()

  const { authState } = useContext(AuthContext)
  const { GetTeacherBatches, archiveBatches, batchesLoading, GetArchiveBatch } =
    useContext(BatchContext)

  const [createBatchDialog, setCreateBatchDialog] = useState(false)
  const [selectedTab, setSelectedTab] = useState(0)

  const handleRefresh = () => {
    GetTeacherBatches()
    GetArchiveBatch()
  }

  const openCreateDialog = () => {
    setCreateBatchDialog(true)
  }

  const handleChange = (event, newValue) => {
    setSelectedTab(newValue)
  }

  return (
    <>
      <CreateBatchDialog
        open={createBatchDialog}
        setOpen={setCreateBatchDialog}
      />
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
                  label={`Active Batches (${batches.length})`}
                  className={classes.capitalizeText}
                />
                <Tab
                  label={`Archived Batches (${archiveBatches.length})`}
                  className={classes.capitalizeText}
                />
              </Tabs>
              <Controls.Button
                startIcon={<Add />}
                text="Create Batch"
                onClick={openCreateDialog}
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
          <Grid
            container
            alignItems="center"
            className="mg-bottom-1rem"
            spacing={2}
          >
            <Grid item xs={12}>
              <>
                {authState.is_email_verified && selectedTab === 0 && (
                  <>
                    {batches.length > 0 && (
                      <Grid
                        container
                        spacing={4}
                        justifyContent="flex-start"
                        alignItems="stretch"
                        className="mg-top-1rem"
                      >
                        {batches.map((batch) => (
                          <Grid
                            item
                            xs={12}
                            sm={12}
                            md={6}
                            lg={4}
                            xl={3}
                            key={batch.id}
                          >
                            <BatchCard
                              batch={batch}
                              openBatchMenu={openBatchMenu}
                              setBatches={setBatches}
                              batches={batches}
                            />
                          </Grid>
                        ))}
                      </Grid>
                    )}
                    {batches.length === 0 && <CreateBatchMessage />}
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
                        {archiveBatches.map((batch) => (
                          <Grid
                            item
                            xs={12}
                            sm={12}
                            md={6}
                            lg={4}
                            xl={3}
                            key={batch.id}
                          >
                            <BatchCard
                              batch={batch}
                              openBatchMenu={openBatchMenu}
                              setBatches={setBatches}
                              batches={batches}
                            />
                          </Grid>
                        ))}
                      </Grid>
                    ) : (
                      <ArchiveBatchMessage role={authState.role} />
                    )}
                  </>
                )}
              </>
            </Grid>
          </Grid>
        </div>
      )}
      <RefreshCard
        msg="Please click on refresh to check if new students have requested to join the batch"
        onRefresh={handleRefresh}
      />
    </>
  )
}

export default MyBatches

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
  padding: {
    padding: '0.5rem 2rem 2rem',
  },
})
