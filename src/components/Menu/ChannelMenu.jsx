import {
  Dialog,
  DialogContentText,
  DialogTitle,
  IconButton,
  List,
  ListItem,
  DialogContent,
  ListItemIcon,
  ListItemText,
  TextField,
  DialogActions,
  Button,
} from '@mui/material'
import React, { useCallback, useEffect, useState } from 'react'
import AddIcon from '@mui/icons-material/Add'
import ArrowDropDown from '@mui/icons-material/ArrowDropDown'
import '../../firebase'
import {
  child,
  ref,
  push,
  getDatabase,
  update,
  onChildAdded,
} from 'firebase/database'
import { useDispatch, useSelector } from 'react-redux'
import { setCurrentChannel } from '../../store/channelReducer'

export default function ChannelMenu() {
  const { theme } = useSelector(state => state)

  // 채널 생성시 모달 오픈
  const [open, setOpen] = useState(false)

  // 채널명
  const [channelName, setChannelName] = useState('')

  // 채널 설명
  const [channelDescription, setChannelDescription] = useState('')

  // 채널 목록
  const [channels, setChannels] = useState([])

  // 활성화된 채널ID
  const [activeChannelId, setActiveChannelId] = useState('')

  // 첫 로드
  const [firstLoaded, setFirstLoaded] = useState(true)

  // redux dispatch
  const dispatch = useDispatch()

  // 활성화된 채널 변경하기
  const changeChannel = useCallback(
    channel => {
      // 이미 활성화된 경우 작동하지 않도록
      if (channel.id === activeChannelId) return
      setActiveChannelId(channel.id) //channel로 활성화
      dispatch(setCurrentChannel(channel)) //전역 store에 저장
    },
    [activeChannelId, dispatch]
  )

  // 모달 오픈
  const handleClickOpen = useCallback(() => {
    setOpen(true)
  }, [])

  // 모달 닫기
  const handleClickClose = useCallback(() => {
    setOpen(false)
  }, [])

  // 채널 목록 저장하기
  useEffect(() => {
    const db = getDatabase()
    const unsubscribe = onChildAdded(ref(db, 'channels'), snapshot => {
      setChannels(channelArr => [...channelArr, snapshot.val()])
    })
    return () => {
      setChannels([])
      unsubscribe()
    }
  }, [])

  // 채널명 변경
  const handleChangeChannelName = useCallback(e => {
    setChannelName(e.target.value)
  }, [])

  // 채널 설명 변경
  const handleChangeChannelDescription = useCallback(e => {
    setChannelDescription(e.target.value)
  }, [])

  // 채널 생성
  const handleSubmit = useCallback(async () => {
    const db = getDatabase() // 데이터베이스 가져오기 (읽기 쓰기를 위함.)
    const key = push(child(ref(db), 'chennels')).key // 키 생성
    // 새로운 채널
    const newChannel = {
      id: key,
      name: channelName,
      details: channelDescription,
    }
    // 업데이트할 채널 생성
    const updates = {}
    updates['/channels/' + key] = newChannel

    // firebase에 업데이트
    try {
      await update(ref(db), updates)
      setChannelName('')
      setChannelDescription('')
      handleClickClose()
    } catch (error) {
      console.error(error)
    }
  }, [channelName, channelDescription, handleClickClose])

  // 처음 로딩시에만 첫번째 채널로 활성화
  useEffect(() => {
    if (channels.length > 0 && firstLoaded) {
      setActiveChannelId(channels[0].id)
      dispatch(setCurrentChannel(channels[0]))
      setFirstLoaded(false)
    }
  }, [channels, dispatch, firstLoaded])

  return (
    <>
      <List
        sx={{ overflow: 'auto', width: 240, backgroundColor: theme.mainTheme }}
      >
        <ListItem
          secondaryAction={
            <IconButton sx={{ color: '#9a939b' }} onClick={handleClickOpen}>
              <AddIcon />
            </IconButton>
          }
        >
          <ListItemIcon sx={{ color: '#9a939b' }}>
            <ArrowDropDown />
          </ListItemIcon>
          <ListItemText
            primary="채널"
            sx={{ wordBreak: 'break-all', color: '#9a939b' }}
          />
        </ListItem>
        <List component="div" disablePadding sx={{ pl: 3 }}>
          {channels.map(channel => (
            <ListItem
              selected={channel.id === activeChannelId}
              onClick={() => changeChannel(channel)}
              button
              key={channel.id}
            >
              <ListItemText
                primary={`# ${channel.name}`}
                sx={{ wordBreak: 'break-all', color: '#918890' }}
              />
            </ListItem>
          ))}
        </List>
      </List>
      <Dialog open={open} onClose={handleClickClose}>
        <DialogTitle>채널 추가</DialogTitle>
        <DialogContent>
          <DialogContentText>
            생성할 채널명과 설명을 입력해주세요.
          </DialogContentText>
          <TextField
            autoFocus
            margin="dense"
            label="채널명"
            type="text"
            fullWidth
            variant="standard"
            onChange={handleChangeChannelName}
            autoComplete="off"
          />
          <TextField
            margin="dense"
            label="설명"
            type="text"
            fullWidth
            variant="standard"
            onChange={handleChangeChannelDescription}
            autoComplete="off"
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClickClose}>취소</Button>
          <Button onClick={handleSubmit}>생성</Button>
        </DialogActions>
      </Dialog>
    </>
  )
}
