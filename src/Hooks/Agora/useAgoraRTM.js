import { useState, useEffect, useContext, useRef } from 'react'
import { AgoraContext } from '../../Context/AgoraContext'
import { AuthContext } from '../../Context/AuthContext'
import { BatchContext } from '../../Context/BatchContext'
import { CommandContext } from '../../Context/CommandContext'

/*
MESSAGE FORMAT:
{
    TYPE:'TEXT | COMMAND',
    'MESSAGE': ' ',
}

WHEN TYPE IS TEXT
MESSAGE: {
  BODY: "" //32KB STRING
}

WHEN TYPE IS COMMAND
MESSAGE: {
    COMMAND_CATEGORY: ' AGORA || QUICK_POLL || DOUBT',
    //IF COMMAND CATEGORY=== 'AGORA'
    COMMAND_METHOD: 'MIC_ON || MIC_OFF || CAM_ON || CAM_OFF || CONTROLS_GRANTED || CONTROLS_REVOKED'
    //IF COMMAND CATEGORY==='DOUBT'
    COMMAND_METHOD: 'ASK || CLEAR || RECEIVED'
    //IF COMMAND CATEGORY==='QUICK_POLL'
    COMMAND_METHOD: 'STARTED || EXPIRED'
}

*/

export default function useAgoraRTM(client) {
  const channel = useRef(undefined)
  const [isJoined, setIsJoined] = useState(false)
  const [multipleLogin, setMultipleLogin] = useState(false)
  const { setUnreadMessage, giveAVPermissionToStudent } =
    useContext(AgoraContext)
  const {
    setNotificationState,
    HandleCommand,
    setIsNewMessage,
    disableChatForClass,
    isChatEnabled,
  } = useContext(CommandContext)

  const { authState } = useContext(AuthContext)

  const { isRecording } = useContext(BatchContext)

  const [channelMessages, setChannelMessages] = useState([])

  async function login(uid, token) {
    return client.login({ token, uid })
  }

  async function logout() {
    if (!isJoined) return true
    setIsJoined(false)
    return client.logout()
  }

  function createChannel(channelName) {
    return client.createChannel(channelName)
  }

  async function createChannelAndJoin(channelName) {
    const newChannel = createChannel(channelName)
    joinChannel(newChannel).then(() => {
      if (process.env.REACT_APP_MESSAGE_LOG_ENABLED)
        console.log(`Channel joined!`)
      channel.current = newChannel
      setIsJoined(true)
    })
  }

  async function joinChannel(passedChannel) {
    if (!passedChannel) {
      return
    }

    return passedChannel.join()
  }

  async function leaveChannel() {
    if (!channel.current) return
    setIsJoined(false)
    return channel.current.leave()
  }

  async function sendMessage(text) {
    if (!channel.current) return
    if (text.trim().length < 1) return
    const sendPayload = {
      type: 'TEXT',
      message: {
        body: text,
      },
    }
    if (authState.role === 'S' && !isChatEnabled) return
    return channel.current.sendMessage({ text: JSON.stringify(sendPayload) })
  }

  function sendCommandToSpecificUser(
    uid,
    command_category,
    command_method,
    body = '',
  ) {
    const sendPayload = {
      type: 'COMMAND',
      message: {
        command_category,
        command_method,
        body,
      },
    }
    client
      .sendMessageToPeer({ text: JSON.stringify(sendPayload) }, uid)
      .then((res) => {
        if (res.hasPeerReceived) {
          if (process.env.REACT_APP_MESSAGE_LOG_ENABLED) {
            console.log(res)
            console.log(
              `${command_category}, ${command_method} message delivered to ${uid}`,
            )
          }
        }
      })
  }

  function sendCommandToChannel(command_category, command_method, body = '') {
    const sendPayload = {
      type: 'COMMAND',
      message: {
        command_category,
        command_method,
        body,
      },
    }
    channel.current
      .sendMessage({ text: JSON.stringify(sendPayload) })
      .then(() => {
        if (process.env.REACT_APP_MESSAGE_LOG_ENABLED)
          console.log(
            `${command_category}, ${command_method} message delivered to channel`,
          )
      })
  }

  let timeout

  function releaseNotification() {
    if (timeout) {
      clearTimeout(timeout)
    }
    timeout = setTimeout(() => {
      setNotificationState({
        open: false,
        uid: null,
        type: null,
        content: null,
      })
    }, 3500)
  }

  useEffect(() => {
    if (!channel.current || !client) return
    channel.current.on(
      'ChannelMessage',
      (messageObject, senderId, messagePros) => {
        const messageType = JSON.parse(messageObject.text).type
        if (messageType === 'TEXT') {
          setIsNewMessage(true)
          setUnreadMessage(true)
          setChannelMessages((messages) => [
            ...messages,
            {
              messageType: messageObject.messageType,
              text: {
                type: 'TEXT',
                message: JSON.parse(messageObject.text).message.body,
              },
              senderId,
              timestamp: messagePros.serverReceivedTs,
            },
          ])
          setNotificationState({
            open: true,
            uid: senderId,
            type: messageType,
            content: JSON.parse(messageObject.text).message.body,
          })
          releaseNotification()
        } else if (messageType === 'COMMAND') {
          const { command_category, command_method, body } = JSON.parse(
            messageObject.text,
          ).message
          HandleCommand(
            command_category,
            command_method,
            body,
            senderId,
            sendCommandToSpecificUser,
          )
        }
      },
    )

    client.on('MessageFromPeer', (messageObject, senderId) => {
      const messageType = JSON.parse(messageObject.text).type
      if (messageType === 'COMMAND') {
        const { command_category, command_method, body } = JSON.parse(
          messageObject.text,
        ).message
        HandleCommand(
          command_category,
          command_method,
          body,
          senderId,
          sendCommandToSpecificUser,
        )
      }
    })

    client.on('ConnectionStateChanged', (newState) => {
      if (newState === 'ABORTED') {
        setNotificationState({
          open: true,
          uid: null,
          type: 'CLASS_END',
          content: 'Multiple login detected, your session here will end',
        })
        releaseNotification()
      }
      setMultipleLogin(true)
      setIsJoined(false)
    })

    channel.current.on('MemberJoined', (uid) => {
      if (authState.role !== 'T') return
      if (giveAVPermissionToStudent) {
        sendCommandToSpecificUser(uid, 'AGORA', 'CONTROLS_GRANTED')
      } else {
        sendCommandToSpecificUser(uid, 'AGORA', 'CONTROLS_REVOKED')
      }
      if (disableChatForClass) {
        sendCommandToSpecificUser(uid, 'CHAT', 'DISABLED')
      } else {
        sendCommandToSpecificUser(uid, 'CHAT', 'ENABLED')
      }
      if (isRecording) {
        sendCommandToSpecificUser(uid, 'RECORDING', 'STARTED')
      }
    })

    return () => {
      if (!channel.current || !client) return
      channel.current.removeAllListeners()
    }
  }, [
    channel.current,
    client,
    setChannelMessages,
    giveAVPermissionToStudent,
    disableChatForClass,
    isRecording,
  ])
  return {
    login,
    createChannelAndJoin,
    leaveChannel,
    sendMessage,
    channelMessages,
    logout,
    sendCommandToSpecificUser,
    sendCommandToChannel,
    isJoined,
    multipleLogin,
  }
}
