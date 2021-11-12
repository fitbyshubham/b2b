import React, { useEffect, useState, useContext, useRef } from 'react'
import { makeStyles, createStyles } from '@material-ui/core/styles'
import { IconButton } from '@material-ui/core'
import { IoCloseSharp } from 'react-icons/io5'
import Controls from '../Controls/Controls'
import { BatchContext } from '../../Context/BatchContext'
import { CommandContext } from '../../Context/CommandContext'
import QuickPollDialog from '../Dialogs/QuickPollDialog'
import { AuthContext } from '../../Context/AuthContext'

const TeacherFirstPoll = ({ handleStartPoll, closePoll }) => {
  const classes = useStyles()
  return (
    <div className={classes.container}>
      <IconButton onClick={closePoll} size="small" className={classes.close}>
        <IoCloseSharp />
      </IconButton>
      <p className={classes.bold}>Quick Poll</p>
      <p className={classes.subtext}>
        Quickly Ask Students Yes/No about anything.
      </p>
      <div className={classes.btn_div}>
        <Controls.Button onClick={handleStartPoll}>
          <span className={classes.bold}>Start Poll</span>
        </Controls.Button>
      </div>
    </div>
  )
}

const StudentEndPoll = ({ closePoll }) => {
  const classes = useStyles()
  useEffect(() => {
    const handleClose = () => {
      setTimeout(() => {
        closePoll()
      }, 2500)
    }
    handleClose()
  }, [])
  return (
    <div className={classes.container}>
      <p className={classes.bold}>Quick Poll</p>
      <p className={classes.subtext}>
        Poll has ended, thank you for participating!
      </p>
    </div>
  )
}

const TeacherWaitPoll = ({ setPoll, sendCommandToChannel }) => {
  const classes = useStyles()

  const [counter, setCounter] = useState(44)

  useEffect(() => {
    let timer
    if (counter > 0) {
      timer = setTimeout(() => setCounter(counter - 1), 1000)
    } else if (counter === 0) {
      sendCommandToChannel('QUICK_POLL', 'EXPIRED')
      setPoll('resultpoll')
    }

    return () => clearTimeout(timer)
  }, [counter])

  const handleAbortPoll = () => {
    sendCommandToChannel('QUICK_POLL', 'EXPIRED')
    setCounter(44)
    setPoll('resultpoll')
  }
  return (
    <div className={classes.container}>
      <p className={classes.bold}>Quick Poll</p>
      <p className={classes.subtext}>
        Poll in process. Please wait for {counter} seconds.
      </p>
      <div className={classes.btn_div}>
        <Controls.Button onClick={handleAbortPoll}>
          <span className={classes.bold}>Abort Poll</span>
        </Controls.Button>
      </div>
    </div>
  )
}
const TeacherResultPoll = ({
  getPollResult,
  closePoll,
  setPoll,
  pollResult,
  remoteUsers,
  pollId,
}) => {
  const classes = useStyles()

  const [openQuickPollDialog, setOpenQuickPollDialog] = useState(false)

  const { batchByCode, allBatchStudents } = useContext(BatchContext)

  const { authState } = useContext(AuthContext)

  const { permissionResolution } = useContext(BatchContext)

  useEffect(() => {
    getPollResult()
  }, [])

  const noResponse = () =>
    remoteUsers.filter(
      (user) => user.uid !== `${batchByCode.owner}-screen-share`,
    ).length -
      (pollResult.yes + pollResult.no) >
    0
      ? remoteUsers.filter(
          (user) => user.uid !== `${batchByCode.owner}-screen-share`,
        ).length -
        (pollResult.yes + pollResult.no)
      : 0

  const handleClose = () => {
    setTimeout(() => setPoll('teacherfirstpoll'), 500)
    closePoll()
  }

  const handleOpenQuickPollDialog = async () => {
    setOpenQuickPollDialog(true)
  }

  const handleCloseQuickPollDialog = () => {
    setOpenQuickPollDialog(false)
  }

  return (
    <>
      <div className={classes.container}>
        <IconButton
          onClick={handleClose}
          size="small"
          className={classes.close}
        >
          <IoCloseSharp />
        </IconButton>
        <p className={classes.bold}>Quick Poll Results</p>
        <div className={classes.result}>
          <div className={classes.info}>
            <p>Yes</p>
            <p className={classes.bold}>{pollResult.yes}</p>
          </div>
          <div className={classes.info}>
            <p>No</p>
            <p className={classes.bold}>{pollResult.no}</p>
          </div>
          <div className={classes.info}>
            <p>No Response</p>
            <p className={classes.bold}>{noResponse()}</p>
          </div>
        </div>
        <div className={classes.btn_div}>
          <Controls.Button
            style={{ width: '65%' }}
            onClick={handleOpenQuickPollDialog}
          >
            <span className={classes.bold}>View Results</span>
          </Controls.Button>
        </div>
      </div>
      {openQuickPollDialog && (
        <QuickPollDialog
          open={openQuickPollDialog}
          pollResult={pollResult}
          noResponse={noResponse}
          onClose={handleCloseQuickPollDialog}
          remoteUsers={remoteUsers}
          batchByCode={batchByCode}
          allBatchStudent={allBatchStudents}
          authState={authState}
          permissionResolution={permissionResolution}
          pollId={pollId}
        />
      )}
    </>
  )
}
const StudentPoll = ({ closePoll, studentPollId, AnswerPoll, setPoll }) => {
  const classes = useStyles()
  const [answerState, setAnswerState] = useState(undefined)
  const handleAnswerPoll = async (answer) => {
    setAnswerState(answer)
    closePoll()
    await AnswerPoll({ answer }, studentPollId)
    setTimeout(() => {
      setPoll('studentendpoll')
    }, 1000)
  }
  return (
    <div className={classes.container}>
      <IconButton onClick={closePoll} size="small" className={classes.close}>
        <IoCloseSharp />
      </IconButton>
      <p className={classes.bold}>Quick Poll</p>
      <p className={classes.subtext}>
        Do you agree with the teacher&apos;s statement?
      </p>
      <div className={classes.btn_div}>
        <Controls.Button
          style={{
            margin: '0 5px 0 0',
            backgroundColor:
              answerState === 'yes' || answerState === undefined
                ? '#00A54C'
                : '#E0E0E0',
            backgroundImage: 'unset',
          }}
          onClick={() => handleAnswerPoll('yes')}
        >
          <span className={classes.bold}>Yes</span>
        </Controls.Button>
        <Controls.Button
          style={{
            margin: '0 5px 0 0',
            backgroundColor:
              answerState === 'no' || answerState === undefined
                ? '#E83147'
                : '#E0E0E0',
            backgroundImage: 'unset',
          }}
          onClick={() => handleAnswerPoll('no')}
        >
          <span className={classes.bold}>No</span>
        </Controls.Button>
      </div>
    </div>
  )
}

const QuickPoll = ({
  closePoll,
  lecture_id,
  poll,
  setPoll,
  sendCommandToChannel,
  remoteUsers,
}) => {
  const classes = useStyles()
  const { StartQuickPoll, GetQuickPollResult, pollResult, AnswerPoll } =
    useContext(BatchContext)

  const { studentPollId } = useContext(CommandContext)
  const pollData = useRef({
    pollId: null,
    pollEndTime: null,
  })
  const handleStartPoll = async () => {
    const payload = {
      lecture_id,
    }
    const { pollId, pollEndTime } = await StartQuickPoll(payload)
    pollData.current.pollId = pollId
    pollData.current.pollEndTime = pollEndTime
    sendCommandToChannel(
      'QUICK_POLL',
      'STARTED',
      pollData.current.pollId.toString(),
    )
    setPoll('waitpoll')
    // setTimeout(() => {
    //   sendCommandToChannel('QUICK_POLL', 'EXPIRED')
    //   setPoll('resultpoll')
    // }, 45000)
  }
  const getPollResult = async () => {
    if (pollData.current.pollId) {
      await GetQuickPollResult(pollData.current.pollId)
    }
  }
  return (
    <div className={classes.container}>
      {poll === 'teacherfirstpoll' && (
        <TeacherFirstPoll
          handleStartPoll={handleStartPoll}
          closePoll={closePoll}
        />
      )}
      {poll === 'waitpoll' && (
        <TeacherWaitPoll
          closePoll={closePoll}
          sendCommandToChannel={sendCommandToChannel}
          setPoll={setPoll}
        />
      )}
      {poll === 'resultpoll' && (
        <TeacherResultPoll
          getPollResult={getPollResult}
          closePoll={closePoll}
          pollResult={pollResult}
          setPoll={setPoll}
          remoteUsers={remoteUsers}
          pollId={pollData.current.pollId}
        />
      )}
      {}
      {poll === 'studentpoll' && (
        <StudentPoll
          closePoll={closePoll}
          studentPollId={studentPollId}
          AnswerPoll={AnswerPoll}
          setPoll={setPoll}
        />
      )}
      {poll === 'studentendpoll' && (
        <StudentEndPoll closePoll={closePoll} setPoll={setPoll} />
      )}
    </div>
  )
}

const useStyles = makeStyles(() =>
  createStyles({
    container: {
      padding: '5px 10px',
    },
    close: {
      position: 'absolute',
      right: 5,
      top: 5,
    },
    bold: {
      fontWeight: 'bold',
    },
    subtext: {
      fontSize: '0.9rem',
      margin: '10px 0 0 0',
    },
    btn_div: {
      display: 'flex',
      margin: '20px 0 0 0',
    },
    result: {
      display: 'flex',
      justifyContent: 'space-between',
      margin: '10px 0 0 0',
    },
    info: {
      padding: '0 20px',
    },
  }),
)
export default QuickPoll
