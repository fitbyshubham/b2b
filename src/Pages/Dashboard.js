import React, { useContext, useEffect, Suspense, lazy, useState } from 'react'
import { Route, Switch } from 'react-router-dom'
import Spinner from '../Components/Progress/Spinner'
import { AuthContext } from '../Context/AuthContext'
import { BatchContext } from '../Context/BatchContext'
import AgoraContextProvider from '../Context/AgoraContext'
import CommandContextProvider from '../Context/CommandContext'

const VerifyEmailDialog = lazy(() =>
  import('../Components/Dialogs/VerifyEmailDialog'),
)
const ClassPage = lazy(() => import('./Class/ClassPage'))
const Batch = lazy(() => import('./Teacher/Batch/Batch'))
const Student = lazy(() => import('./Student/Student'))

const Dashboard = () => {
  const { authState } = useContext(AuthContext)
  const {
    GetTeacherBatches,
    getAllReqAndBatches,
    setTeacherBatches,
    GetArchiveBatch,
  } = useContext(BatchContext)

  const [openVerifyEmailDialog, setOpenVerifyEmailDialog] = useState(false)

  const handleOpenVerifyEmailDialog = () => {
    setOpenVerifyEmailDialog(true)
  }

  const handleCloseVerifyEmailDialog = () => {
    setOpenVerifyEmailDialog(false)
  }

  useEffect(() => {
    if (!authState.is_email_verified) {
      handleOpenVerifyEmailDialog()
    }
  }, [])

  useEffect(() => {
    if (authState.role === 'S' && authState.is_email_verified) {
      getAllReqAndBatches()
      GetArchiveBatch()
    } else if (authState.role === 'T') {
      if (authState.is_email_verified) {
        GetTeacherBatches()
        GetArchiveBatch()
      } else {
        setTeacherBatches([])
      }
    }
  }, [authState.role])

  return (
    <>
      {authState.role === 'T' ? (
        <Suspense fallback={<Spinner />}>
          <CommandContextProvider>
            <AgoraContextProvider>
              <Switch>
                <Route
                  exact
                  path="/dashboard/class/:id"
                  component={ClassPage}
                />
                <Route
                  exact
                  path="/dashboard/:subroute/:id"
                  component={Batch}
                />
                <Route
                  exact
                  path="/dashboard/:subroute/:id/:subId"
                  component={Batch}
                />
                <Route exact path="/dashboard/:subroute" component={Batch} />
                <Route exact path="/dashboard" component={() => <Batch />} />
              </Switch>
            </AgoraContextProvider>
          </CommandContextProvider>
        </Suspense>
      ) : (
        <Suspense fallback={<Spinner />}>
          <CommandContextProvider>
            <AgoraContextProvider>
              <Switch>
                <Route
                  exact
                  path="/dashboard/class/:id"
                  component={ClassPage}
                />
                <Route
                  exact
                  path="/dashboard/:subroute/:id/:subId"
                  component={Student}
                />
                <Route
                  exact
                  path="/dashboard/:subroute/:id"
                  component={Student}
                />
                <Route exact path="/dashboard/:subroute" component={Student} />
                <Route exact path="/dashboard" component={Student} />+
              </Switch>
            </AgoraContextProvider>
          </CommandContextProvider>
        </Suspense>
      )}
      {openVerifyEmailDialog && (
        <VerifyEmailDialog
          open={openVerifyEmailDialog}
          close={handleCloseVerifyEmailDialog}
          email={authState.email}
          sendOTP
        />
      )}
    </>
  )
}

export default Dashboard
