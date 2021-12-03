import React, { useContext, useEffect, useState, lazy, Suspense } from 'react'
import { useHistory, useLocation, useParams } from 'react-router-dom'
import Spinner from '../../../Components/Progress/Spinner'
import { BatchContext } from '../../../Context/BatchContext'
import Utilities from '../../Utitlities/Utitlities'
import { AuthContext } from '../../../Context/AuthContext'
import Navbar from '../../../Components/Navbar/Navbar'
import SideNav from '../../../Components/Navbar/SideNav/SideNav'
const DoubtCornerList = lazy(() => import('../../DoubtCorner/DoubtCornerList'))
const DashboardProfileCard = lazy(() =>
  import('../../../Components/Cards/DashboardProfileCard'),
)
const MiniSideNav = lazy(() =>
  import('../../../Components/Navbar/SideNav/MiniSideNav/MiniSideNav'),
)
const MyBatches = lazy(() => import('./MyBatches/MyBatches'))
const BatchDetail = lazy(() => import('./BatchDetail/BatchDetail'))
const StudentManagement = lazy(() =>
  import('./StudentManagement/StudentManagement'),
)
const Attendance = lazy(() => import('./Attendance/Attendance'))
const ManageTimings = lazy(() => import('../../ManageTimings/ManageTimings'))
const MeetingLeftDialog = lazy(() =>
  import('../../../Components/Dialogs/MeetingLeftDialog'),
)
const EditProfile = lazy(() =>
  import('../../UserManagement/EditProfile/EditProfile'),
)
const NoticeBoard = lazy(() => import('./NoticeBoard/NoticeBoard'))
const GrantPermissionDialog = lazy(() =>
  import('../../../Components/Dialogs/GrantPermissionDialog'),
)
const Ebooks = lazy(() => import('../../Ebooks/Ebooks'))
const Assignments = lazy(() => import('../../Assignment/Assignments'))
const AssignmentAbout = lazy(() =>
  import('../../Assignment/AssignmentAbout/AssignmentAbout'),
)
const DoubtCorner = lazy(() => import('../../DoubtCorner/DoubtCorner'))
const ClassRecordings = lazy(() => import('../../RecordedLectures/Recordings'))

const Batch = () => {
  const history = useHistory()
  const { subroute, id, subId } = useParams()
  const { isLoggedIn, authState } = useContext(AuthContext)
  const location = useLocation()

  const [teacherFeedbackData, setTeacherFeedbackData] = useState({
    open: false,
    lectureId: null,
    openPermissions: false,
  })

  const { teacherBatches, setTeacherBatches, loading } =
    useContext(BatchContext)

  useEffect(() => {
    if (!isLoggedIn) {
      history.push({
        pathname: '/auth/login',
      })
    }
  }, [isLoggedIn, history])

  useEffect(() => {
    if (
      location.state === undefined ||
      location.state.feedback === undefined ||
      location.state.lectureId === undefined ||
      location.state.batchId === undefined ||
      location.state.showPermissions === undefined
    )
      return
    setTeacherFeedbackData({
      open: location.state.feedback,
      lectureId: location.state.lectureId,
      batchId: location.state.batchId,
      openPermissions: location.state.showPermissions,
    })
  }, [location.state])

  useEffect(() => {
    if (
      subroute !== undefined &&
      subroute !== 'view' &&
      subroute !== 'notes' &&
      subroute !== 'ebooks' &&
      subroute !== 'students' &&
      subroute !== 'attendance' &&
      subroute !== 'editprofile' &&
      subroute !== 'timings' &&
      subroute !== 'notice' &&
      subroute !== 'assignment' &&
      subroute !== 'assignmentAbout' &&
      subroute !== 'doubt-corner' &&
      subroute !== 'doubt-list' &&
      subroute !== 'recordings'
    ) {
      history.push('/')
    }
    if (
      subroute !== undefined &&
      subroute !== 'editprofile' &&
      id === undefined
    ) {
      history.push('/')
    }
  }, [history, id, subroute])

  const getContent = () => {
    switch (subroute) {
      case undefined:
        if (loading || teacherBatches === undefined) {
          return <Spinner />
        }
        return (
          <>
            <Suspense fallback={<Spinner />}>
              <DashboardProfileCard />
              <MyBatches
                setBatches={setTeacherBatches}
                batches={teacherBatches.results}
                batchesCount={teacherBatches.count}
                nextSetString={teacherBatches.next}
              />
            </Suspense>
          </>
        )

      case 'view':
        return (
          <Suspense fallback={<Spinner />}>
            <BatchDetail id={id} setBatches={setTeacherBatches} />
          </Suspense>
        )

      case 'notes':
        return (
          <Suspense fallback={<Spinner />}>
            <Utilities title="Notes" id={id} />
          </Suspense>
        )
      case 'ebooks':
        return (
          <Suspense fallback={<Spinner />}>
            <Ebooks id={id} />
          </Suspense>
        )
      case 'students':
        return (
          <Suspense fallback={<Spinner />}>
            <StudentManagement id={id} />
          </Suspense>
        )
      case 'attendance':
        return (
          <Suspense fallback={<Spinner />}>
            <Attendance id={id} />
          </Suspense>
        )
      case 'editprofile':
        return (
          <Suspense fallback={<Spinner />}>
            <EditProfile />
          </Suspense>
        )
      case 'timings':
        return (
          <Suspense fallback={<Spinner />}>
            <ManageTimings id={id} />
          </Suspense>
        )
      case 'notice':
        return (
          <Suspense fallback={<Spinner />}>
            <NoticeBoard id={id} role={authState.role} />
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
      case 'doubt-corner':
        return (
          <Suspense fallback={<Spinner />}>
            <DoubtCorner id={id} />
          </Suspense>
        )
      case 'doubt-list':
        return (
          <Suspense fallback={<Spinner />}>
            <DoubtCornerList id={id} subId={subId} />
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
      {subroute === undefined || subroute === 'editprofile' ? (
        <>
          <Navbar />
          {getContent()}
        </>
      ) : (
        <>
          <SideNav batchId={id} route={subroute} />
          <Suspense fallback={<Spinner />}>
            <MiniSideNav batchId={id} route={subroute} />
          </Suspense>
          <div className="student__content">
            <Navbar />
            {getContent()}
          </div>
        </>
      )}
      <MeetingLeftDialog
        open={teacherFeedbackData.open}
        close={() => {
          setTeacherFeedbackData({ ...teacherFeedbackData, open: false })
          location.state.feedback = false
        }}
        lectureId={teacherFeedbackData.lectureId}
        batchId={teacherFeedbackData.batchId}
      />
      <GrantPermissionDialog
        open={teacherFeedbackData.openPermissions}
        handleClose={() => {
          setTeacherFeedbackData({
            ...teacherFeedbackData,
            openPermissions: false,
          })
          location.state.showPermissions = false
        }}
      />
    </>
  )
}

export default Batch
