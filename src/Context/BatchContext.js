/* eslint-disable no-await-in-loop */
import React, { createContext, useContext, useEffect, useState } from 'react'
// import axios from 'axios'
import { useSnackbar } from 'notistack'
import { AuthContext } from './AuthContext'
import handleError from '../Global/HandleError/handleError'
import axiosGet from '../Global/Axios/axiosGet'
import axiosPost from '../Global/Axios/axiosPost'
import showSuccessSnackbar from '../Components/Snackbar/successSnackbar'
import axiosDelete from '../Global/Axios/axiosDelete'
import axiosPatch from '../Global/Axios/axiosPatch'
import axiosPut from '../Global/Axios/axiosPut'
import showErrorSnackbar from '../Components/Snackbar/errorSnackbar'

export const BatchContext = createContext()

const BatchContextProvider = (props) => {
  const { getAuthHeader, isLoggedIn, authState } = useContext(AuthContext)

  const initialState = {
    batch: [],
    request: [],
  }

  const initialPollResult = {
    yes: 0,
    no: 0,
  }

  const [allReqAndBatches, setAllReqAndBatches] = useState(initialState)
  const [pollResult, setPollResult] = useState(initialPollResult)
  const [batchByCode, setBatchByCode] = useState('')
  const [loading, setLoading] = useState(false)
  const [showAlert, setShowAlert] = useState(false)
  const [noBatchFound, setNoBatchFound] = useState(false)
  const [teacherBatches, setTeacherBatches] = useState(undefined)
  const [archiveBatches, setArchiveBatches] = useState([])
  const [studentRequestByBatchId, setStudentRequestByBatchId] = useState([])
  const [notes, setNotes] = useState([])
  const [whiteboardNotes, setWhiteboardNotes] = useState([])
  const [allBatchStudents, setAllBatchStudents] = useState([])
  const [batchNotices, setBatchNotices] = useState([])
  const [assignments, setAssignments] = useState([])
  const [assignmentSubmission, setAssignmentSubmission] = useState({})
  const [attendance, setAttendance] = useState({})
  const [lectures, setLectures] = useState([])
  const [liveboardSessionId, setLiveboardSessionId] = useState(undefined)
  const [batchesLoading, setBatchesLoading] = useState(false)
  // Recordings
  const [uid, setUid] = useState('')
  const [resourceId, setResourceId] = useState('')
  const [sid, setSid] = useState('')
  const [recordingId, setRecordingId] = useState('')
  const [isRecording, setIsRecording] = useState(false)
  const [loadingRecording, setLoadingRecording] = useState(false)
  const [recordings, setRecordings] = useState([])
  const [recordingsLoading, setRecordingsLoading] = useState(false)

  // Pre - recorded lectures
  const [recordingFolders, setRecordingFolders] = useState({
    results: [],
    next: null,
    previous: null,
    count: 0,
  })
  const [filesInRecordingFolder, setFilesInRecordingFolder] = useState({
    count: 0,
    next: null,
    previous: null,
    results: [],
  })

  const { enqueueSnackbar } = useSnackbar()

  useEffect(() => {
    if (!isLoggedIn) {
      setAllReqAndBatches(initialState)
      setBatchByCode('')
      setTeacherBatches(undefined)
      setStudentRequestByBatchId([])
      setPollResult(initialPollResult)
      setNotes([])
      setWhiteboardNotes([])
      setAllBatchStudents([])
      setBatchNotices([])
      setAssignments([])
      setAssignmentSubmission({})
      setLectures([])
      setLiveboardSessionId(undefined)
      setUid('')
      setResourceId('')
      setSid('')
      setRecordingId('')
      setIsRecording(false)
      setLoadingRecording(false)
      setRecordings([])
      setRecordingsLoading(false)
      setRecordingFolders([])
      setFilesInRecordingFolder([])
    }
  }, [isLoggedIn])

  const getAllReqAndBatches = async () => {
    try {
      setBatchesLoading(true)
      const data = await axiosGet(`/request/`, {
        headers: getAuthHeader(),
      })
      const joinedBatches = await axiosGet(`/batch/`, {
        headers: getAuthHeader(),
      })
      setAllReqAndBatches({
        batch: joinedBatches.data,
        request: data.data.request,
      })
      setBatchesLoading(false)
    } catch (err) {
      handleError(enqueueSnackbar, err)
    }
  }

  const FindBatchWithCode = async (code) => {
    if (!code) return
    try {
      const data = await axiosGet(`/batch/${code}/`, {
        headers: getAuthHeader(),
      })
      setBatchByCode(data.data)
      return data.data
    } catch (err) {
      if (err.response.status === 404) {
        setNoBatchFound(true)
        setTimeout(() => setNoBatchFound(false), 4000)
      }
      return false
    }
  }

  const JoinBatchClass = (id) =>
    axiosPost(`/batch/${id}/join/`, { headers: getAuthHeader() })

  const RequestBatch = async (batchCode) => {
    try {
      await axiosPost(`/batch/${batchCode}/request/`, {
        headers: getAuthHeader(),
      })
      showSuccessSnackbar(enqueueSnackbar, 'Batch Requested')
    } catch (err) {
      handleError(enqueueSnackbar, err)
    }
  }

  const GetTeacherBatches = async (next) => {
    try {
      setBatchesLoading(true)
      const res = await axiosGet(next || `/batch/?page=1&page_size=12`, {
        headers: getAuthHeader(),
      })

      console.log('Batch Res', res)

      if (!next) {
        setTeacherBatches(res.data)
      } else {
        const temp = {
          count: res.data.count,
          next: res.data.next,
          previous: res.data.previous,
          results: [...teacherBatches.results, res.data.results],
        }
        setTeacherBatches(temp)
      }
      setBatchesLoading(false)
    } catch (err) {
      setBatchesLoading(false)
      handleError(enqueueSnackbar, err)
    }
  }

  const GetStudentRequestsForBatch = async (id) => {
    try {
      setLoading(true)
      const res = await axiosGet(`/batch/${id}/request/`, {
        headers: getAuthHeader(),
      })
      setStudentRequestByBatchId(res.data)
      setLoading(false)
    } catch (err) {
      setLoading(false)
      handleError(enqueueSnackbar, err)
    }
  }

  const CreateBatchTeacher = async (data) => {
    try {
      const res = await axiosPost('/batch/', {
        data,
        headers: getAuthHeader(),
      })
      return res.data
    } catch (err) {
      handleError(enqueueSnackbar, err)
    }
  }

  const DeleteBatchTeacher = async (id) => {
    try {
      await axiosDelete(`/batch/${id}/`, {
        headers: getAuthHeader(),
      })
      showSuccessSnackbar(enqueueSnackbar, 'Batch Deleted')
      return true
    } catch (err) {
      handleError(enqueueSnackbar, err)
      return false
    }
  }

  const AcceptStudentRequest = (id) =>
    axiosPatch(`/request/${id}/`, {
      data: {
        status: 'A',
      },
      headers: getAuthHeader(),
    })

  const RejectStudentRequest = (id) =>
    axiosPatch(`/request/${id}/`, {
      data: {
        status: 'R',
      },
      headers: getAuthHeader(),
    })

  const ChangeLocalStudentRequestStatus = (id, status) => {
    setStudentRequestByBatchId((students) => {
      const temp = students.filter((student) => student.id === id)
      const rest = students.filter((student) => student.id !== id)
      temp[0].status = status
      return [...rest, temp[0]]
    })
  }

  const EditBatchTeacher = async (id, data) => {
    if (!id) {
      return
    }
    try {
      const res = await axiosPatch(`/batch/${id}/`, {
        data,
        headers: getAuthHeader(),
      })
      showSuccessSnackbar(enqueueSnackbar, 'Batch Saved Successfully')
      return res.data
    } catch (err) {
      handleError(enqueueSnackbar, err)
      return false
    }
  }

  const ArchiveBatch = async (id) => {
    if (!id) {
      return
    }

    const data = {
      status: 'A',
    }
    try {
      const res = await axiosPatch(`/batch/${id}/`, {
        data,
        headers: getAuthHeader(),
      })
      showSuccessSnackbar(enqueueSnackbar, 'Batch Archived')
      return res.status
    } catch (err) {
      handleError(enqueueSnackbar, err)
      return false
    }
  }

  const UnArchiveBatch = async (id) => {
    if (!id) {
      return
    }

    const data = {
      status: 'D',
    }
    try {
      const res = await axiosPatch(`/batch/${id}/`, {
        data,
        headers: getAuthHeader(),
      })
      showSuccessSnackbar(enqueueSnackbar, 'Batch Unarchived')
      return res.status
    } catch (err) {
      handleError(enqueueSnackbar, err)
      return false
    }
  }

  const GetArchiveBatch = async () => {
    try {
      setBatchesLoading(true)
      const res = await axiosGet('/batch/?status=A', {
        headers: getAuthHeader(),
      })
      setArchiveBatches(res.data)
      setBatchesLoading(false)
    } catch (err) {
      handleError(enqueueSnackbar, err)
      setBatchesLoading(false)
    }
  }

  const GetEnrolledStudentsInBatch = async (id) => {
    try {
      const res = await axiosGet(`/batch/${id}/student/`, {
        headers: getAuthHeader(),
      })
      setAllBatchStudents(res.data)
      return res.data
    } catch (err) {
      return false
    }
  }

  const StartQuickPoll = async (payload) => {
    try {
      const res = await axiosPost(`/quick_poll/`, {
        data: payload,
        headers: getAuthHeader(),
      })
      return { pollId: res.data.id, pollEndTime: res.data.expiry }
    } catch (err) {
      handleError(enqueueSnackbar, err)
    }
  }

  const GetQuickPollResult = async (id) => {
    try {
      const res = await axiosGet(`/quick_poll/${id}/`, {
        headers: getAuthHeader(),
      })
      setPollResult({
        ...pollResult,
        yes: res.data.result.yes,
        no: res.data.result.no,
      })
    } catch (err) {
      handleError(enqueueSnackbar, err)
    }
  }

  const GetQuickPollList = async (id) => {
    try {
      const res = await axiosGet(`/quick_poll/${id}/quick_poll_list`, {
        headers: getAuthHeader(),
      })
      return {
        success: true,
        data: res.data,
      }
    } catch (err) {
      return {
        success: false,
      }
    }
  }

  const AnswerPoll = async (data, pollId) => {
    try {
      await axiosPost(`/quick_poll/${pollId}/answer/`, {
        data,
        headers: getAuthHeader(),
      })
    } catch (err) {
      handleError(enqueueSnackbar, err)
    }
  }

  const GetNotes = async (id, type) => {
    try {
      const res = await axiosGet(
        `/notes/?batch=${id}${type === 'W' ? '&notes_type=W' : ''}`,
        {
          headers: getAuthHeader(),
        },
      )
      if (type === 'W') setWhiteboardNotes(res.data)
      else setNotes(res.data)
    } catch (err) {
      handleError(enqueueSnackbar, err)
    }
  }

  const EditNotes = async (id, data) => {
    try {
      await axiosPatch(`/notes/${id}`, {
        headers: getAuthHeader(),
        data,
      })
      showSuccessSnackbar(enqueueSnackbar, 'Your note has been edited')
    } catch (err) {
      handleError(enqueueSnackbar, err)
    }
  }

  const DeleteNotes = async (id, type) => {
    try {
      await axiosDelete(`/notes/${id}/`, {
        headers: getAuthHeader(),
      })
      if (type === 'W') {
        setWhiteboardNotes(whiteboardNotes.filter((note) => note.id !== id))
      } else {
        setNotes(notes.filter((note) => note.id !== id))
      }
      showSuccessSnackbar(enqueueSnackbar, 'Note Deleted')
    } catch (err) {
      handleError(enqueueSnackbar, err)
    }
  }

  const UploadGCP = async (formData, filetype, file_format, content_type) => {
    const storageUrlRes = await axiosGet(
      `/get_storage_url/?filetype=${filetype}&file_format=${file_format}&api_version=2`,
      {
        headers: getAuthHeader(),
      },
    )
    const storageUrl = storageUrlRes.data.url
    const storage_path = storageUrl.split('?')[0]

    const customHeaders = {
      Authorization: `Bearer ${localStorage.getItem('access')}`,
      'Content-Type': content_type,
    }

    await axiosPut(storageUrl, {
      data: formData,
      headers: customHeaders,
    })
    return storage_path
  }

  const UploadNotes = async (file, payload) => {
    try {
      const file_format = file.type.split('/')[1]
      // Get Storage Path
      const storage_path = await UploadGCP(
        file,
        'whiteboard_note',
        file_format,
        file.type,
      )

      // Form Data to send to server
      const data = new FormData()
      data.append('batch', payload.batch)
      data.append('storage_path', storage_path)
      data.append('name', payload.name)

      // Send data to Server
      await axiosPost(`/notes/`, {
        data,
        headers: getAuthHeader(),
      })

      showSuccessSnackbar(enqueueSnackbar, 'Notes Uploaded')
      return {
        success: true,
      }
    } catch (err) {
      return {
        success: false,
      }
    }
  }

  const HelpAndSupport = async (
    attachments,
    subject,
    description,
    filetype = 'feedback',
  ) => {
    try {
      const paths = []

      for (let i = 0; i < attachments.length; i += 1) {
        const file_format = attachments[i].type.split('/')[1]

        // Get Signed URL from google Storage
        const storage_path = await UploadGCP(
          attachments[i],
          filetype,
          file_format,
          attachments[i].type,
        )

        paths.push({ storage_path })
      }

      // Send Data to Server
      const serverData = {
        subject,
        description,
        attachments: paths,
      }

      const res = await axiosPost(`/support/`, {
        data: serverData,
        headers: getAuthHeader(),
      })

      if (res.status === 201) {
        showSuccessSnackbar(enqueueSnackbar, 'Ticket Raised Successfully')
      }

      return {
        success: true,
      }
    } catch (err) {
      showErrorSnackbar(enqueueSnackbar, "Request Couldn't be Submitted")
      return {
        success: false,
      }
    }
  }

  const GetCurrentBatchStudents = async (id) => {
    try {
      const res = await axiosGet(`/batch/${id}/student/`, {
        headers: getAuthHeader(),
      })
      setAllBatchStudents(res.data)
    } catch (err) {
      handleError(enqueueSnackbar, err)
    }
  }

  const GetCurrentBatchNotices = async (id) => {
    try {
      const res = await axiosGet(`/notice/?batch=${id}`, {
        headers: getAuthHeader(),
      })
      setBatchNotices(res.data)
    } catch (err) {
      handleError(enqueueSnackbar, err)
    }
  }
  const UpdateBatchNotice = async (data) => {
    try {
      const res = await axiosPatch(`/notice/${data.id}`, {
        data,
        headers: getAuthHeader(),
      })

      if (res.status === 200) {
        showSuccessSnackbar(enqueueSnackbar, 'Notice Updated')
      }
      return res.status
    } catch (err) {
      handleError(enqueueSnackbar, err)
    }
  }

  const SendBatchNotice = async (data) => {
    try {
      const res = await axiosPost(`/notice/`, {
        data,
        headers: getAuthHeader(),
      })
      setBatchNotices((notices) => [...notices, res.data])

      if (res.status === 201) {
        showSuccessSnackbar(enqueueSnackbar, 'Notice Added')
      }

      return res.status
    } catch (err) {
      handleError(enqueueSnackbar, err)
    }
  }

  const DeleteNotice = async (id) => {
    try {
      await axiosDelete(`/notice/${id}`, {
        headers: getAuthHeader(),
      })
      showSuccessSnackbar(enqueueSnackbar, 'Notice Deleted')
      return true
    } catch (err) {
      handleError(enqueueSnackbar, err)
      return false
    }
  }

  const AddSchedule = async (data) => {
    try {
      await axiosPost(`/schedule/`, {
        data,
        headers: getAuthHeader(),
      })
    } catch (err) {
      handleError(enqueueSnackbar, err)
    }
  }

  const GetBatchSchedule = async (id) => {
    try {
      const res = await axiosGet(`/schedule/?batch=${id}`, {
        headers: getAuthHeader(),
      })

      if (res.data.length !== 0) {
        return {
          data: res.data[0].schedule,
          schedule_id: res.data[0].id,
        }
      }
      return res.data
    } catch (err) {
      handleError(enqueueSnackbar, err)
    }
  }

  const DeleteSchedule = async (id) => {
    try {
      await axiosDelete(`/schedule/${id}/`, {
        headers: getAuthHeader(),
      })
      showSuccessSnackbar(enqueueSnackbar, 'Schedule Deleted')
    } catch (err) {
      handleError(enqueueSnackbar, err)
    }
  }

  const UpdateScheduleWithId = async (id, data) => {
    try {
      await axiosPut(`/schedule/${id}/`, {
        data,
        headers: getAuthHeader(),
      })
      showSuccessSnackbar(enqueueSnackbar, 'Schedule Updated')
    } catch (err) {
      handleError(enqueueSnackbar, err)
    }
  }

  const VerifyEmailWithOtp = async (data) => {
    try {
      const res = await axiosPost(`/verify_otp/`, {
        data,
        headers: getAuthHeader(),
      })
      if (res.status === 200) {
        showSuccessSnackbar(enqueueSnackbar, res.data.message)
      }
      return res.status
    } catch (err) {
      handleError(enqueueSnackbar, err)
    }
  }

  const ResendEmailVerify = async (data) => {
    try {
      return await axiosPatch('/profile/', {
        data,
        headers: getAuthHeader(),
      })
    } catch (err) {
      return err.response
    }
  }

  const StartBatchLecture = async (id) => {
    if (id === null || id === undefined) {
      showErrorSnackbar(
        enqueueSnackbar,
        'Something went wrong, please refresh and try again!',
      )
    }
    try {
      try {
        const res = await axiosPost(`/batch/${id}/start/`, {
          data: {},
          headers: getAuthHeader(),
        })
        const result = await ResumeBatchLecture(res.data.id)
        return { ...result.data, lecture_id: res.data.id }
      } catch (err) {
        if (err.response.status === 400) {
          const res = await FindBatchWithCode(id)
          const result = await ResumeBatchLecture(res.lecture.id)
          return { ...result.data, lecture_id: res.lecture.id }
        }
      }
    } catch (err) {
      handleError(enqueueSnackbar, err)
    }
  }

  const ResumeBatchLecture = async (id) => {
    try {
      const res = await axiosGet(`lecture/${id}/join/`, {
        headers: getAuthHeader(),
      })
      setLiveboardSessionId(res.data.liveboard_session_id)
      return res
    } catch (err) {
      handleError(enqueueSnackbar, err)
    }
  }

  const EndBatchLecture = async (id, showSnackbar = true) => {
    try {
      await axiosPost(`/batch/${id}/end/`, {
        data: {},
        headers: getAuthHeader(),
      })
      setLiveboardSessionId(undefined)
      if (showSnackbar) {
        showSuccessSnackbar(enqueueSnackbar, 'Class Ended')
      }
    } catch (err) {
      if (showSnackbar) {
        handleError(enqueueSnackbar, err)
      }
    }
  }

  const GetLectureData = async (id) => {
    if (!id) return
    try {
      const res = await axiosGet(`/lecture/${id}/`, {
        headers: getAuthHeader(),
      })
      return res.data
    } catch (err) {
      handleError(enqueueSnackbar, err)
    }
  }

  const CreateAssignments = async (
    assignmentTitle,
    assignmentInstructions,
    files,
    links,
    dueDate,
    id,
  ) => {
    try {
      const paths = []
      if (files.length !== 0) {
        for (let i = 0; i < files.length; i += 1) {
          const file_format = files[i].type.split('/')[1]

          const storage_path = await UploadGCP(
            files[i],
            'assignment',
            file_format,
            files[i].type,
          )

          paths.push({ storage_path })
        }
      }

      // Send Data to Server
      const serverData = {
        batch: id,
        due_date: dueDate,
        title: assignmentTitle,
        instructions: assignmentInstructions,
        links,
        attachments: paths,
      }

      const res = await axiosPost(`assignments/`, {
        data: serverData,
        headers: getAuthHeader(),
      })

      if (res.status === 201) {
        showSuccessSnackbar(enqueueSnackbar, 'Assignment Created')
      }

      return res.status
    } catch (err) {
      if (err?.response?.data['invalid-params']?.due_date) {
        showErrorSnackbar(enqueueSnackbar, 'Please check due date and time')
      } else {
        handleError(enqueueSnackbar, err)
      }
    }
  }

  const GetAllBatchAssignments = async (batch_id) => {
    try {
      const res = await axiosGet(`/assignments/?batch=${batch_id}`, {
        headers: getAuthHeader(),
      })
      setAssignments(res.data)
    } catch (err) {
      handleError(enqueueSnackbar, err)
    }
  }

  const GetAssignmentById = async (assignment_id) => {
    try {
      const res = await axiosGet(`/assignments/${assignment_id}`, {
        headers: getAuthHeader(),
      })
      return res.data
    } catch (err) {
      handleError(enqueueSnackbar, err)
    }
  }

  const AddAttendance = async (lecture_id, students = []) => {
    if (!lecture_id || students.length === 0) return
    try {
      await axiosPost(`/attendance/`, {
        data: {
          lecture_id,
          students,
        },
        headers: getAuthHeader(),
      })
      return true
    } catch (err) {
      handleError(enqueueSnackbar, err)
      return false
    }
  }

  const GenerateAttendance = async (lecture_id) => {
    if (!lecture_id) return
    try {
      await axiosPost(`/attendance/generate/?lecture_id=${lecture_id}`, {
        data: {},
        headers: getAuthHeader(),
      })
      return true
    } catch (err) {
      handleError(enqueueSnackbar, err)
      return false
    }
  }

  const GetLectures = async (id, url) => {
    try {
      const res = await axiosGet(url || `/lecture/?batch=${id}`, {
        headers: getAuthHeader(),
      })
      setLectures(res.data.results)
      return res
    } catch (err) {
      handleError(enqueueSnackbar, err)
    }
  }

  const GetAssignmentSubmissionById = async (submission_id) => {
    try {
      const res = await axiosGet(`/assignment_submissions/${submission_id}`, {
        headers: getAuthHeader(),
      })
      setAssignmentSubmission(res.data)
      return res.status
    } catch (err) {
      handleError(enqueueSnackbar, err)
    }
  }

  const EvaluateAssignment = async (comment, submission_id) => {
    try {
      const res = await axiosPost(
        `/assignment_submissions/${submission_id}/evaluate/`,
        {
          data: {
            teacher_comment: comment,
          },
          headers: getAuthHeader(),
        },
      )
      if (res.status === 204) {
        showSuccessSnackbar(enqueueSnackbar, 'Student Evaluated')
      }

      return res.status
    } catch (err) {
      handleError(enqueueSnackbar, err)
    }
  }

  const DeleteAssignment = async (assignment_id) => {
    try {
      const res = await axiosDelete(`/assignments/${assignment_id}`, {
        headers: getAuthHeader(),
      })
      if (res.status === 204) {
        showSuccessSnackbar(enqueueSnackbar, 'Assignment Deleted')
      }
      return {
        success: true,
      }
    } catch (err) {
      handleError(enqueueSnackbar, err)
      return {
        success: false,
      }
    }
  }

  const UpdateAssignment = async (
    assignmentId,
    assignmentTitle,
    assignmentInstructions,
    files,
    links,
    existingPaths,
    dueDate,
  ) => {
    try {
      const paths = [...existingPaths]

      if (files.length !== 0) {
        for (let i = 0; i < files.length; i += 1) {
          const file_format = files[i].type.split('/')[1]

          const storage_path = await UploadGCP(
            files[i],
            'assignment_submission',
            file_format,
            files[i].type,
          )

          paths.push({ storage_path })
        }
      }

      const serverData = {
        title: assignmentTitle,
        instructions: assignmentInstructions,
        links: links.length === 0 ? [{}] : links,
        attachments: paths.length === 0 ? [{}] : paths,
        due_date: dueDate,
      }

      const res = await axiosPatch(`/assignments/${assignmentId}`, {
        data: serverData,
        headers: getAuthHeader(),
      })
      if (res.status === 201) {
        showSuccessSnackbar(enqueueSnackbar, 'Assignment Updated')
      }
      return res.status
    } catch (err) {
      handleError(enqueueSnackbar, err)
    }
  }

  const GetAttendance = async (id) => {
    try {
      // Fetch all Lectures by batchId
      const res = await GetLectures(id)

      // Create a string for sending as params in Get Attendance Request
      const lectureIdArr = []

      res.data.results.forEach((element) => {
        lectureIdArr.push('&lecture=')
        lectureIdArr.push(element.id)
      })

      const lectureString = ''.concat(...lectureIdArr).slice(1)

      // Get Attendance API Request
      const attendanceRes = await axiosGet(`/attendance/?${lectureString}`, {
        headers: getAuthHeader(),
      })

      setAttendance(attendanceRes.data)
    } catch (err) {
      setAttendance({})
    }
  }
  const SubmitAssignment = async (
    assignmentId,
    studentComment,
    files,
    links,
  ) => {
    try {
      const paths = []

      if (files.length !== 0) {
        for (let i = 0; i < files.length; i += 1) {
          const file_format = files[i].type.split('/')[1]

          const storage_path = await UploadGCP(
            files[i],
            'assignment_submission',
            file_format,
            files[i].type,
          )

          paths.push({ storage_path })
        }
      }

      // Server Data Payload
      const serverData = {
        assignment: assignmentId,
        student_comment: studentComment,
        attachments: paths,
        links,
      }

      // Send Data to Server
      const res = await axiosPost(`/assignment_submissions/`, {
        data: serverData,
        headers: getAuthHeader(),
      })

      if (res.status === 201) {
        showSuccessSnackbar(enqueueSnackbar, 'Assignment Submitted')
      }

      return res.status
    } catch (err) {
      handleError(enqueueSnackbar, err)
    }
  }

  const GetAssignmmentSubmissions = async (assignmentId) => {
    try {
      const res = await axiosGet(
        `/assignment_submissions/?assignment=${assignmentId}`,
        {
          headers: getAuthHeader(),
        },
      )
      return res.data
    } catch (err) {
      handleError(err)
    }
  }

  const GenerateLiveboardPDF = async () => {
    try {
      if (!liveboardSessionId || !batchByCode || !batchByCode.id)
        return { success: false }
      const data = {
        session_id: liveboardSessionId,
        batch_id: batchByCode.id,
      }
      await axiosPost('/notes/export_liveboard_pdf/', {
        data,
        headers: getAuthHeader(),
      })
      showSuccessSnackbar(enqueueSnackbar, 'Saved Successfully Under Notes')
      return { success: true }
    } catch (err) {
      handleError(enqueueSnackbar, err)
      return { success: false }
    }
  }

  // Recordings

  const StartRecording = async (lectureId, teacherUid) => {
    if (!lectureId || !teacherUid) return
    try {
      setLoadingRecording(true)
      const data = {
        channel_name: lectureId,
        teacher_uid: teacherUid.toString(),
      }
      const res = await axiosPost(`/lecture/${lectureId}/start_record/`, {
        data,
        headers: getAuthHeader(),
      })
      if (res.data.uid) setUid(res.data.uid)
      if (res.data.resourceId) setResourceId(res.data.resourceId)
      if (res.data.sid) setSid(res.data.sid)
      if (res.data.recording_id) setRecordingId(res.data.recording_id)
      setLoadingRecording(false)
      setIsRecording(true)
      return res.data
    } catch (err) {
      handleError(enqueueSnackbar, err)
      setLoadingRecording(false)
    }
  }

  const StopRecording = async (lectureId) => {
    if (!lectureId) return
    try {
      setLoadingRecording(true)
      const data = {
        channel_name: lectureId,
        uid,
        resource_id: resourceId,
        sid,
        recording_id: recordingId,
      }
      await axiosPost(`/lecture/${lectureId}/stop_record/`, {
        data,
        headers: getAuthHeader(),
      })
      setLoadingRecording(false)
      setIsRecording(false)
    } catch (err) {
      handleError(enqueueSnackbar, err)
      setLoadingRecording(false)
    }
  }

  const UpdateRecordingLayout = async (
    lectureId,
    updateUID,
    sentUID,
    sentResourceId,
    sentSID,
  ) => {
    if (!lectureId) return
    try {
      setLoadingRecording(true)
      const data = {
        channel_name: lectureId,
        uid: sentUID || uid,
        resource_id: sentResourceId || resourceId,
        sid: sentSID || sid,
        max_resolution_uid: updateUID.toString(),
      }
      const res = await axiosPost(`/lecture/${lectureId}/update_layout/`, {
        data,
        headers: getAuthHeader(),
      })
      if (res.data.uid) setUid(res.data.uid)
      if (res.data.resourceId) setResourceId(res.data.resourceId)
      if (res.data.sid) setSid(res.data.sid)
      setLoadingRecording(false)
    } catch (err) {
      handleError(enqueueSnackbar, err)
      setLoadingRecording(false)
    }
  }

  const GetListOfRecordings = async (batchId) => {
    if (!batchId) return
    try {
      setRecordingsLoading(true)
      const res = await axiosGet(`/recordings/?batch_id=${batchId}`, {
        headers: getAuthHeader(),
      })
      setRecordings(res.data)
      setRecordingsLoading(false)
      return res.data
    } catch (err) {
      handleError(enqueueSnackbar, err)
      setRecordingsLoading(false)
    }
  }

  const GetRecordingForPlaying = async (filename) => {
    if (!filename) return
    try {
      const data = {
        filename,
      }
      const res = await axiosPost(`/recordings/get_recording/`, {
        data,
        headers: getAuthHeader(),
      })
      return res
    } catch (err) {
      showErrorSnackbar(enqueueSnackbar, 'We cannot play this video right now!')
      return false
    }
  }

  const UpdateRecordingName = async (id, newTitle, batch_id) => {
    if (!newTitle || !id || authState.role !== 'T' || newTitle.length > 80)
      return
    try {
      const data = { title: newTitle, batch: batch_id }
      await axiosPatch(`/recordings/${id}/`, {
        data,
        headers: getAuthHeader(),
      })
      showSuccessSnackbar(
        enqueueSnackbar,
        'Recording Title Changed Succesfully',
      )
      GetListOfRecordings(batchByCode.id)
    } catch (err) {
      handleError(enqueueSnackbar, err)
    }
  }

  const DeleteRecording = async (id) => {
    if (!id || authState.role !== 'T') return
    try {
      await axiosDelete(`/recordings/${id}/`, {
        headers: getAuthHeader(),
      })
      showSuccessSnackbar(enqueueSnackbar, 'Recording Deleted Succesfully')
      setRecordings((recs) => {
        const temp = recs.filter((rec) => rec.id !== id)
        return temp
      })
    } catch (err) {
      handleError(enqueueSnackbar, err)
    }
  }

  // pre-recorded lectures

  const CreateLectureFolder = async (batchId, folderName) => {
    if (!batchId || !folderName) return
    try {
      const res = await axiosPost('/pre_recording_folders/', {
        headers: getAuthHeader(),
        data: {
          batch: batchId,
          name: folderName,
        },
      })
      return { success: true, data: res.data }
    } catch (err) {
      showErrorSnackbar(enqueueSnackbar, 'Cannot upload lectures at this time!')
      return { success: false }
    }
  }

  const GetFoldersForLectures = async (batchId, url = undefined) => {
    if (!batchId) return
    try {
      setRecordingsLoading(true)
      const res = await axiosGet(
        url || `/pre_recording_folders/?batch=${batchId}`,
        {
          headers: getAuthHeader(),
        },
      )
      const { results, next, previous, count } = res.data
      setRecordingFolders({ results, next, previous, count })
      setRecordingsLoading(false)
      return res
    } catch (err) {
      handleError(enqueueSnackbar, err)
      setRecordingsLoading(false)
    }
  }

  const GetFoldersContentsForLectures = async (
    batchId,
    folderId,
    url = undefined,
  ) => {
    if (!batchId || !folderId) return
    try {
      setRecordingsLoading(true)
      const res = await axiosGet(url || '/pre_recordings/', {
        params: {
          batch: batchId,
          folder: folderId,
        },
        headers: getAuthHeader(),
      })
      const { results, count, next, previous } = res.data
      setFilesInRecordingFolder({ results, count, next, previous })
      setRecordingsLoading(false)
      return res
    } catch (err) {
      handleError(enqueueSnackbar, err)
      setRecordingsLoading(false)
    }
  }

  const DeletePreRecordedLecture = async (id, folderId) => {
    if (!id || authState.role !== 'T') return
    try {
      await axiosDelete(`/pre_recordings/${id}/`, {
        headers: getAuthHeader(),
      })
      showSuccessSnackbar(enqueueSnackbar, 'Lecture Deleted Succesfully')
      setRecordings((recs) => {
        const temp = recs.filter((rec) => rec.id !== id)
        return temp
      })
      await GetFoldersContentsForLectures(batchByCode.id, folderId)
    } catch (err) {
      handleError(enqueueSnackbar, err)
    }
  }

  const UpdatePreRecordedLectureName = async (id, newTitle, folderId) => {
    if (!newTitle || !id || !folderId || authState.role !== 'T') return
    try {
      const data = { title: newTitle }
      await axiosPatch(`/pre_recordings/${id}/`, {
        data,
        headers: getAuthHeader(),
      })
      showSuccessSnackbar(
        enqueueSnackbar,
        'Recording Title Changed Succesfully',
      )
      GetFoldersContentsForLectures(batchByCode.id, folderId)
    } catch (err) {
      handleError(enqueueSnackbar, err)
    }
  }

  const UploadAWSGetSignedURL = async (key, file_format) => {
    try {
      const res = await axiosGet(
        `/get_storage_url/?mode=aws&key=${key}&filetype=pre_recording&file_format=${file_format}`,
        {
          headers: getAuthHeader(),
        },
      )
      const storagePath = res.data.url
      return storagePath
    } catch (err) {
      showErrorSnackbar(enqueueSnackbar, 'Cannot upload your videos right now!')
    }
  }

  const CreatePreRecordedLecture = async (folderId, title, fileName) => {
    if (!folderId || !title || !fileName) return
    try {
      const res = await axiosPost('/pre_recordings/', {
        data: {
          folder: folderId,
          title,
          filename: {
            filename: fileName,
          },
        },
        headers: getAuthHeader(),
      })
      if (res.status === 200) return { success: true, data: res.data }
    } catch (err) {
      showErrorSnackbar(
        enqueueSnackbar,
        'Cannot upload recorded lectures right now!',
      )
      return { success: false }
    }
  }

  const UploadLectureVideos = async (files, folderId) => {
    try {
      let success = true
      if (files.length !== 0) {
        for (let i = 0; i < files.length; i += 1) {
          const storagePath = await UploadAWSGetSignedURL(
            `${folderId}_${(
              new Date(files[i].lastModified).getTime() / 1000
            ).toString()}-${(new Date().getTime() / 1000).toString()}`,
            files[i].type.split('/')[1] === 'quicktime'
              ? 'mov'
              : files[i].type.split('/')[1],
          )
          const customHeaders = {
            'Content-Type': files[i].type,
          }
          const res = await axiosPut(storagePath, {
            data: files[i],
            headers: customHeaders,
          })
          if (res.status === 200) {
            const filename = storagePath.substring(
              storagePath.lastIndexOf('/') + 1,
              storagePath.indexOf('?'),
            )
            const createres = await CreatePreRecordedLecture(
              folderId,
              files[i].name.split('.')[0],
              filename,
            )
            if (!createres.success) {
              success = false
            }
          }
        }
      }
      return { success }
    } catch (err) {
      handleError(enqueueSnackbar, err)
      return { success: false }
    }
  }

  const DownloadAttendance = async (data) => {
    try {
      const res = await axiosPost(`/attendance/export_attendance_csv/`, {
        headers: getAuthHeader(),
        data,
      })
      return res
    } catch (err) {
      handleError(enqueueSnackbar, err)
    }
  }

  // Bulk Addition of Students
  const UploadBulkList = async (files, batch_id) => {
    try {
      if (files.length !== 0) {
        const formData = new FormData()
        formData.append('file', files[0])

        // Get Signed URL from google Storage
        const storageUrlRes = await axiosGet(
          `/get_storage_url/?filetype=bulk_addition&file_format=csv`,
          { headers: getAuthHeader() },
        )

        const storageUrl = storageUrlRes.data.url
        const storage_path = storageUrl.split('?')[0]

        // Upload File on Google Cloud Storage
        await axiosPost(storageUrl, {
          data: formData,
          headers: getAuthHeader(),
        })

        // Send Data to server
        const res = await axiosPost(`/batch/${batch_id}/bulk_addition/`, {
          data: {
            storage_path,
          },
          headers: getAuthHeader(),
        })

        if (res.status === 204) {
          showSuccessSnackbar(enqueueSnackbar, 'File Uploaded Successfully')
        }

        return res.status
      }
    } catch (err) {
      handleError(enqueueSnackbar, err)
    }
  }

  const MarkAssignmentAsCompleted = async (assignmentId) => {
    try {
      const res = await axiosPatch(`/assignments/${assignmentId}`, {
        data: {
          marked_as_completed: true,
        },
        headers: getAuthHeader(),
      })

      if (res.status === 201) {
        showSuccessSnackbar(enqueueSnackbar, 'Assignment marked as completed')
      }
      return {
        success: true,
      }
    } catch (err) {
      handleError(enqueueSnackbar, err)
    }
  }

  const MarkAssignmentAsPending = async (assignmentId) => {
    try {
      const res = await axiosPatch(`/assignments/${assignmentId}`, {
        data: {
          marked_as_completed: false,
        },
        headers: getAuthHeader(),
      })

      if (res.status === 201) {
        showSuccessSnackbar(enqueueSnackbar, 'Assignment marked as completed')
      }
      return {
        success: true,
      }
    } catch (err) {
      handleError(enqueueSnackbar, err)
    }
  }

  return (
    <BatchContext.Provider
      value={{
        getAllReqAndBatches,
        allReqAndBatches,
        FindBatchWithCode,
        batchByCode,
        loading,
        RequestBatch,
        JoinBatchClass,
        showAlert,
        setShowAlert,
        GetTeacherBatches,
        teacherBatches,
        setTeacherBatches,
        archiveBatches,
        setArchiveBatches,
        GetStudentRequestsForBatch,
        CreateBatchTeacher,
        DeleteBatchTeacher,
        AcceptStudentRequest,
        RejectStudentRequest,
        EditBatchTeacher,
        ArchiveBatch,
        GetArchiveBatch,
        UnArchiveBatch,
        setStudentRequestByBatchId,
        studentRequestByBatchId,
        ChangeLocalStudentRequestStatus,
        GetEnrolledStudentsInBatch,
        setLoading,
        setBatchByCode,
        StartQuickPoll,
        GetQuickPollResult,
        pollResult,
        GetNotes,
        notes,
        UploadNotes,
        allBatchStudents,
        AnswerPoll,
        DeleteNotes,
        noBatchFound,
        AddSchedule,
        GetBatchSchedule,
        UpdateScheduleWithId,
        DeleteSchedule,
        StartBatchLecture,
        ResumeBatchLecture,
        EndBatchLecture,
        batchNotices,
        GetCurrentBatchNotices,
        SendBatchNotice,
        VerifyEmailWithOtp,
        ResendEmailVerify,
        HelpAndSupport,
        GetCurrentBatchStudents,
        CreateAssignments,
        GetAllBatchAssignments,
        assignments,
        SubmitAssignment,
        GetAssignmentSubmissionById,
        assignmentSubmission,
        GetAssignmentById,
        EvaluateAssignment,
        GetAssignmmentSubmissions,
        UpdateAssignment,
        AddAttendance,
        GenerateAttendance,
        GetAttendance,
        attendance,
        GetLectures,
        lectures,
        DeleteAssignment,
        GenerateLiveboardPDF,
        whiteboardNotes,
        EditNotes,
        UploadGCP,
        StartRecording,
        StopRecording,
        UpdateRecordingLayout,
        isRecording,
        loadingRecording,
        batchesLoading,
        UpdateBatchNotice,
        DeleteNotice,
        GetQuickPollList,
        GetListOfRecordings,
        GetRecordingForPlaying,
        recordings,
        recordingsLoading,
        UpdateRecordingName,
        DeleteRecording,
        GetFoldersForLectures,
        recordingFolders,
        filesInRecordingFolder,
        GetFoldersContentsForLectures,
        DeletePreRecordedLecture,
        UpdatePreRecordedLectureName,
        UploadLectureVideos,
        CreateLectureFolder,
        GetLectureData,
        DownloadAttendance,
        UploadBulkList,
        MarkAssignmentAsCompleted,
        MarkAssignmentAsPending,
      }}
    >
      {props.children}
    </BatchContext.Provider>
  )
}

export default BatchContextProvider
