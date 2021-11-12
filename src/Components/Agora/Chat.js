import { Divider, Grid, IconButton, makeStyles } from '@material-ui/core'
import React, { useContext, useEffect, useRef, useState } from 'react'
import { FiSend } from 'react-icons/fi'
import { GrFormClose } from 'react-icons/all'
import Linkify from 'react-linkify'
import Controls from '../Controls/Controls'
import Form from '../Form/Form'
import { AuthContext } from '../../Context/AuthContext'
import { BatchContext } from '../../Context/BatchContext'
import { CommandContext } from '../../Context/CommandContext'
import ManageChatPermission from './ManageChatPermission'

const Chat = ({ channelMessages, sendMessage, batchId, handleClose }) => {
  const [message, setMessage] = useState('')
  const { authState } = useContext(AuthContext)
  const { GetEnrolledStudentsInBatch, allBatchStudents } =
    useContext(BatchContext)
  const { isChatEnabled } = useContext(CommandContext)
  const classes = useStyles()

  useEffect(() => {
    async function getStudents() {
      await GetEnrolledStudentsInBatch(batchId)
    }

    getStudents()
  }, [])

  const messageEL = useRef(null)

  useEffect(() => {
    messageEL.current.scrollIntoView(false)
  }, [channelMessages.length])

  const sendTextMessage = async () => {
    if (message.trim().length === 0) return
    channelMessages.push({
      messageType: 'TEXT',
      text: { type: 'TEXT', message },
      senderId: authState.user_id,
      timestamp: new Date().getTime(),
    })
    sendMessage(message)
    setMessage('')
  }

  const getName = (id) => {
    const result = allBatchStudents.find((student) => student.id === id)
    if (result) {
      return result.name
    }
    return undefined
  }

  const formatAMPM = (timestamp) => {
    const date = new Date(timestamp)
    let hours = date.getHours()
    let minutes = date.getMinutes()
    const ampm = hours >= 12 ? 'PM' : 'AM'
    hours %= 12
    hours = hours || 12
    minutes = minutes < 10 ? `0${minutes}` : minutes
    return `${hours}:${minutes} ${ampm}`
  }

  const getContent = (m) => {
    if (m.text.type === 'TEXT') {
      return (
        <div className={classes.messageContainer} key={m.timestamp}>
          <div className={classes.message}>
            <span className={classes.sender}>
              {getName(m.senderId) || 'Teacher'}
            </span>
            <span className={classes.separator}>|</span>
            <span className={classes.time}>{formatAMPM(m.timestamp)}</span>
          </div>
          <div>
            <Linkify
              componentDecorator={(decoratedHref, decoratedText, key) => (
                <a
                  target="_blank"
                  rel="noreferrer"
                  href={decoratedHref}
                  key={key}
                >
                  {decoratedText}
                </a>
              )}
            >
              <p className={classes.messageBody}>{m.text.message}</p>
            </Linkify>
          </div>
        </div>
      )
    }
  }

  return (
    <>
      <Grid container className={classes.gridContainer} id="chat-panel">
        <Grid item className={classes.gridItem} xs={12}>
          <div className={classes.headingContainer}>
            <p className={classes.heading}>Chat</p>
            <IconButton
              className={classes.iconBtn}
              onClick={() => {
                handleClose()
              }}
            >
              <GrFormClose />
            </IconButton>
          </div>
          <div className={classes.control}>
            <ManageChatPermission mode="controls" />
          </div>
          <div className={classes.messageLine}>
            {channelMessages.map((m) => getContent(m))}
          </div>
          <div ref={messageEL} />
        </Grid>
        <Grid item xs={12} className={classes.sendContainer}>
          <Divider />
          <Form
            className={classes.form}
            onSubmit={(e) => {
              e.preventDefault()
              sendTextMessage()
            }}
          >
            <Grid container alignItems="center">
              <Grid item sm={10}>
                <Controls.Input
                  type="text"
                  name="message"
                  onChange={(e) => setMessage(e.target.value)}
                  value={message}
                  size="small"
                  autoFocus
                  placeholder="Send message to everyone"
                  className={classes.inputBg}
                  disabled={!isChatEnabled}
                />
              </Grid>
              <Grid item sm={2}>
                <IconButton
                  disabled={!isChatEnabled}
                  onClick={() => {
                    sendTextMessage()
                  }}
                >
                  <FiSend />
                </IconButton>
              </Grid>
            </Grid>
          </Form>
        </Grid>
      </Grid>
    </>
  )
}

const useStyles = makeStyles({
  messageContainer: {
    padding: '10px 14px',
    borderRadius: 4,
    border: 'solid 1px #dbdbdb',
    marginBottom: 16,
  },
  message: {
    fontSize: 12,
  },
  sender: {
    fontWeight: 600,
    color: '#6384e4',
    lineHeight: '1.33',
  },
  separator: {
    margin: '0 8px',
    lineHeight: '1.33',
  },
  time: {
    lineHeight: '1.33',
  },
  messageBody: {
    fontSize: 14,
    maxWidth: '100%',
    wordBreak: 'break-word',
    color: '#333',
  },
  gridContainer: {
    height: '100%',
    width: 350,
  },
  gridItem: {
    overflow: 'auto',
    height: 'calc(100% - 64px)',
  },
  headingContainer: {
    backgroundColor: '#f2f5ff',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    top: 0,
    position: 'sticky',
  },
  control: {
    position: 'sticky',
    top: '44px',
  },
  heading: {
    color: '#333',
    fontSize: '1.25rem',
    padding: '0.5rem 1.125rem',
    fontWeight: 500,
    height: 44,
  },
  iconBtn: {
    padding: 6,
  },
  messageLine: {
    margin: '18px 15px 0',
  },
  sendContainer: {
    position: 'fixed',
    bottom: 64,
    width: 350,
  },
  form: { padding: '0 0.5rem', backgroundColor: '#f2f5ff', width: '100%' },
  inputBg: {
    backgroundColor: '#fff',
    width: '100%',
  },
})

export default Chat
