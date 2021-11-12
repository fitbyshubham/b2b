import React, { useContext, useEffect, useState, lazy, Suspense } from 'react'
import { useHistory, useLocation, useParams } from 'react-router-dom'
import Spinner from '../../Components/Progress/Spinner'
import Navbar from '../../Components/Navbar/Navbar'
import { BatchContext } from '../../Context/BatchContext'
import DashboardProfileCard from '../../Components/Cards/DashboardProfileCard'
import { AuthContext } from '../../Context/AuthContext'
import SideNav from '../../Components/Navbar/SideNav/SideNav'
const StudentBatches = lazy(() => import('./StudentBatches'))
const StudentBatchDetail = lazy(() => import('./StudentBatchDetail'))
const Utilities = lazy(() => import('../Utitlities/Utitlities'))
const StudentAttendance = lazy(() => import('./Attendance/StudentAttendance'))
const MeetingLeftDialog = lazy(() =>
  import('../../Components/Dialogs/MeetingLeftDialog'),
)
const RateTeacherDialog = lazy(() =>
  import('../../Components/Dialogs/RateTeacherDialog'),
)
const EditProfile = lazy(() =>
  import('../UserManagement/EditProfile/EditProfile'),
)
const GrantPermissionDialog = lazy(() =>
  import('../../Components/Dialogs/GrantPermissionDialog'),
)
const MiniSideNav = lazy(() =>
  import('../../Components/Navbar/SideNav/MiniSideNav/MiniSideNav'),
)
const Ebooks = lazy(() => import('../Ebooks/Ebooks'))
const Assignments = lazy(() => import('../Assignment/Assignments'))
const AssignmentAbout = lazy(() =>
  import('../Assignment/AssignmentAbout/AssignmentAbout'),
)
const ClassRecordings = lazy(() => import('../RecordedLectures/Recordings'))

const Student = () => {
  const history = useHistory()
  const location = useLocation()
  const { subroute, id, subId } = useParams()
  const { isLoggedIn } = useContext(AuthContext)
  const { allReqAndBatches, loading, setBatchByCode } = useContext(BatchContext)
  const [studentFeedbackData, setStudentFeedbackData] = useState({
    open: false,
    lectureId: null,
    openPermissions: false,
  })

  const [rateTeacher, setRateTeacher] = useState(false)

  useEffect(() => {
    if (
      location.state === undefined ||
      location.state.feedback === undefined ||
      location.state.lectureId === undefined ||
      location.state.showPermissions === undefined
    ) {
      return
    }
    if (!location.state.feedback && !location.state.showPermissions) {
      setRateTeacher(true)
    }
    setStudentFeedbackData({
      open: location.state.feedback,
      lectureId: location.state.lectureId,
      batchId: location.state.batchId,
      openPermissions: location.state.showPermissions,
    })
  }, [location.state])

  useEffect(() => {
    if (!isLoggedIn) {
      history.push({
        pathname: '/auth/login',
      })
    }
  }, [isLoggedIn, history])

  useEffect(() => {
    if (
      subroute !== undefined &&
      subroute !== 'view' &&
      subroute !== 'notes' &&
      subroute !== 'ebooks' &&
      subroute !== 'editprofile' &&
      subroute !== 'attendance' &&
      subroute !== 'timings' &&
      subroute !== 'assignment' &&
      subroute !== 'assignmentAbout' &&
      subroute !== 'recordings'
    ) {
      history.push('/')
    }
    if (subroute === 'view' && !id) {
      history.push('/')
    }
  }, [history, id, subroute])

  const getContent = () => {
    switch (subroute) {
      case undefined:
        if (loading || allReqAndBatches === undefined) {
          return <Spinner />
        }
        return (
          <>
            <Suspense fallback={<Spinner />}>
              <DashboardProfileCard />
              <StudentBatches
                allReqAndBatches={allReqAndBatches}
                setBatchByCode={setBatchByCode}
              />
            </Suspense>
          </>
        )

      case 'view':
        return (
          <Suspense fallback={<Spinner />}>
            <StudentBatchDetail id={id} />
          </Suspense>
        )
      case 'notes':
        return (
          <Suspense fallback={<Spinner />}>
            <Utilities id={id} />
          </Suspense>
        )
      case 'ebooks':
        return (
          <Suspense fallback={<Spinner />}>
            <Ebooks id={id} />
          </Suspense>
        )
      case 'editprofile':
        return (
          <Suspense fallback={<Spinner />}>
            <EditProfile />
          </Suspense>
        )
      case 'attendance':
        return (
          <Suspense fallback={<Spinner />}>
            <StudentAttendance id={id} />
          </Suspense>
        )
      case 'assignment':
        return (
          <Suspense fallback={<Spinner />}>
            <Assignments id={id} />
          </Suspense>
        )
      case 'assignmentAbout':
        return (
          <Suspense fallback={<Spinner />}>
            <AssignmentAbout id={id} subId={subId} />
          </Suspense>
        )
      case 'recordings':
        return (
          <Suspense fallback={<Spinner />}>
            <ClassRecordings id={id} subId={subId} />
          </Suspense>
        )
      default:
        break
    }
  }

  return (
    <>
      {subroute === undefined ||
      subroute === 'join' ||
      subroute === 'editprofile' ? (
        <>
          <Navbar />
          {getContent()}
        </>
      ) : (
        <>
          <SideNav batchId={id} route={subroute} />
          <MiniSideNav batchId={id} route={subroute} />
          <div className="student__content">
            <Navbar />
            {getContent()}
          </div>
        </>
      )}
      <MeetingLeftDialog
        open={studentFeedbackData.open}
        close={() => {
          setStudentFeedbackData({ ...studentFeedbackData, open: false })
          location.state.feedback = false
          setRateTeacher(true)
        }}
        lectureId={studentFeedbackData.lectureId}
        batchId={studentFeedbackData.batchId}
      />
      <RateTeacherDialog
        open={rateTeacher}
        close={() => setRateTeacher(false)}
        lectureId={studentFeedbackData.lectureId}
      />
      <GrantPermissionDialog
        open={studentFeedbackData.openPermissions}
        handleClose={() => {
          setStudentFeedbackData({
            ...studentFeedbackData,
            openPermissions: false,
          })
          location.state.showPermissions = false
        }}
      />
    </>
  )
}

export default Student
