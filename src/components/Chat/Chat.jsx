import { Divider, Grid, List, Paper, Toolbar } from '@mui/material'
import React, { useEffect, useRef, useState } from 'react'
import ChatHeader from './ChatHeader'
import { useSelector } from 'react-redux'
import ChatInput from './ChatInput'
import ChatMessage from './ChatMessage'
import '../../firebase'
import {
  child,
  get,
  getDatabase,
  onChildAdded,
  orderByChild,
  query,
  ref,
  startAt,
} from 'firebase/database'

export default function Chat() {
  // redux에서 채널명 가져오기
  const { channel, user } = useSelector(state => state)

  // 메세지
  const [messages, setMessages] = useState([])

  const messageEndRef = useRef()

  // firebase에 저장된 메시지 가져오기
  useEffect(() => {
    // 채널, 유저정보 없을 경우 방어
    if (!channel.currentChannel) return

    // 메시지 가져오기
    async function getMessages() {
      const snapShot = await get(
        child(ref(getDatabase()), 'messages/' + channel.currentChannel.id)
      )
      setMessages(snapShot.val() ? Object.values(snapShot.val()) : [])
    }
    getMessages()
    return () => {
      setMessages([])
    }
  }, [channel.currentChannel])

  // 메시지 정렬 기능 / 최적화
  useEffect(() => {
    if (!channel.currentChannel) return

    // timestamp를 기준으로 정렬
    const sorted = query(
      ref(getDatabase(), 'messages/' + channel.currentChannel.id),
      orderByChild('timestamp')
    )

    // 현재시점부터 추가된 메세지를 콜백으로 추가.
    const unsubscribe = onChildAdded(
      // onChildAdded는 순차적으로 데이터를 가져온다. (동기)
      query(sorted, startAt(Date.now())),
      snapshot => setMessages(oldMessages => [...oldMessages, snapshot.val()])
    )

    return () => {
      unsubscribe?.()
    }
  }, [channel.currentChannel])

  useEffect(() => {
    const setTimeoutId = setTimeout(() => {
      messageEndRef.current.scrollIntoView({ behavior: 'smooth' })
    }, 1000)
    return () => {
      clearTimeout(setTimeoutId)
    }
  }, [messages.length])

  return (
    <>
      <Toolbar />
      <ChatHeader channelInfo={channel.currentChannel} />
      <Grid
        container
        component={Paper}
        variant="outlined"
        sx={{ mt: 3, position: 'relative' }}
      >
        <List
          sx={{
            height: 'calc(100vh - 350px)',
            overflow: 'scroll',
            width: '100%',
            position: 'relative',
          }}
        >
          {messages.map(message => (
            <ChatMessage
              key={message.timestamp}
              message={message}
              user={user}
            />
          ))}
          <div ref={messageEndRef}></div>
        </List>
        <Divider />
        <ChatInput />
      </Grid>
    </>
  )
}
