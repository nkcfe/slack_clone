import {
  Grid,
  IconButton,
  InputAdornment,
  LinearProgress,
  TextField,
} from '@mui/material'
import InsertEmoticonIcon from '@mui/icons-material/InsertEmoticon'
import ImageIcon from '@mui/icons-material/Image'
import SendIcon from '@mui/icons-material/Send'
import React, { useCallback, useState } from 'react'
import '../../firebase'
import { getDatabase, push, ref, serverTimestamp, set } from 'firebase/database'
import { useSelector } from 'react-redux'
import data from '@emoji-mart/data'
import Picker from '@emoji-mart/react'
import ImageModal from '../Modal/ImageModal'

export default function ChatInput() {
  // 채널 정보 가져오기
  const { channel, user } = useSelector(state => state)

  //message 상태
  const [message, setMessage] = useState('')

  //loading 상태
  const [loading, setLoading] = useState(false)

  //Emoji toggle
  const [showEmoji, setShowEmoji] = useState(false)

  //이미지 추가 모달 토글
  const [imageModalOpen, SetImageModalOpen] = useState(false)

  // 이미지 업로드
  const [uploading, setUploading] = useState(false)

  // 이미지 업로드 퍼센트
  const [percent, setPercent] = useState(0)

  // 이미지 모달 열고 닫기
  const handleClickOpen = () => SetImageModalOpen(true)
  const handleClickClose = () => SetImageModalOpen(false)

  //이모지
  const handleTogglePicker = useCallback(() => {
    setShowEmoji(show => !show)
  }, [])

  //message onChange로 저장
  const handleChange = useCallback(e => {
    setMessage(e.target.value)
  }, [])

  // 메세지 생성
  const createMessage = useCallback(
    () => ({
      timestamp: serverTimestamp(),
      user: {
        id: user.currentUser.uid,
        name: user.currentUser.displayName,
        avatar: user.currentUser.photoURL,
      },
      content: message,
    }),
    [
      message,
      user.currentUser.uid,
      user.currentUser.displayName,
      user.currentUser.photoURL,
    ]
  )

  // 메시지 전송
  const clickSendMessage = useCallback(async () => {
    // 메세지가 없을경우 방어
    if (!message) return
    setLoading(true)

    // firebass realtimedatabase에 메세지 저장
    try {
      await set(
        push(ref(getDatabase(), 'messages/' + channel.currentChannel.id)),
        createMessage()
      )
      setLoading(false)
      setMessage('')
    } catch (error) {
      console.error(error)
      setLoading(false)
    }
  }, [message, channel.currentChannel?.id, createMessage])

  // 이모지를 파싱하는 메소드
  const handleSelectEmoji = useCallback(e => {
    const sym = e.unified.split('-')
    const codesArray = []
    sym.forEach(el => codesArray.push('0x' + el))
    const emoji = String.fromCodePoint(...codesArray)
    setMessage(messageValue => messageValue + emoji)
  }, [])

  return (
    <Grid container sx={{ p: '20px' }}>
      <Grid item xs={12} sx={{ position: 'relative' }}>
        {showEmoji && (
          <div>
            <Picker
              style={{ position: 'absolute' }}
              data={data}
              onEmojiSelect={handleSelectEmoji}
              theme="light"
            />
          </div>
        )}
        <TextField
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <IconButton onClick={handleTogglePicker}>
                  <InsertEmoticonIcon />
                </IconButton>
                <IconButton onClick={handleClickOpen}>
                  <ImageIcon />
                </IconButton>
              </InputAdornment>
            ),
            endAdornment: (
              <InputAdornment position="start">
                <IconButton disabled={loading} onClick={clickSendMessage}>
                  <SendIcon />
                </IconButton>
              </InputAdornment>
            ),
          }}
          autoComplete="off"
          label="메세지 입력"
          fullWidth
          value={message}
          onChange={handleChange}
        />
        {uploading ? (
          <Grid item xs={12} sx={{ m: '10px' }}>
            <LinearProgress variant="determinate" value={percent} />
          </Grid>
        ) : null}
        <ImageModal
          open={imageModalOpen}
          handleClose={handleClickClose}
          setPercent={setPercent}
          setUploading={setUploading}
        />
      </Grid>
    </Grid>
  )
}
