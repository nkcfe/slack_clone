import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  List,
  ListItem,
  ListItemIcon,
  Stack,
} from '@mui/material'
import React, { useCallback, useEffect, useState } from 'react'
import PaletteIcon from '@mui/icons-material/Palette'
import { HexColorPicker } from 'react-colorful'
import '../../firebase'
import {
  child,
  getDatabase,
  onChildAdded,
  push,
  ref,
  update,
} from 'firebase/database'
import { useDispatch, useSelector } from 'react-redux'
import { setTheme } from '../../store/themeReducer'

export default function ThemeMenu() {
  // 유저 정보 가져오기
  const { user } = useSelector(state => state)

  // dispatch
  const dispatch = useDispatch()

  // 테마 모달 
  const [showThemeModal, setShowThemeModal] = useState(false)

  // 메인 테마 색상
  const [mainTheme, setMainTheme] = useState('#fffff')

  // 서브 테마 색상
  const [subTheme, setSubTheme] = useState('#fffff')

  // 유저 테마 배열
  const [userTheme, setUserTheme] = useState([])

  // 모달 열기
  const handleClickOpen = useCallback(() => {
    setShowThemeModal(true)
  }, [])

  // 모달 닫기
  const handleClickClose = useCallback(() => {
    setShowThemeModal(false)
  }, [])

  // 메인 테마 바꾸기
  const handleChangeMain = useCallback(color => {
    setMainTheme(color)
  }, [])

  // 서브 테마 바꾸기
  const handleChangeSub = useCallback(color => {
    setSubTheme(color)
  }, [])

  // 테마 저장하기
  const handleSaveTheme = useCallback(async () => {
    // 유저 정보 없을 경우 방어
    if (!user.currentUser?.uid) return
    try {
      const db = getDatabase() // 데이터베이스 가져오기
      // 키 생성
      const key = push(
        child(ref(db), '/users/' + user.currentUser.uid + '/theme')
      ).key
      // 새로운테마 생성
      const newTheme = { mainTheme, subTheme }
      // firebase 데이터에 업데이트하기
      const updates = {}
      updates['/users/' + user.currentUser.uid + '/theme/' + key] = newTheme
      await update(ref(db), updates)
      handleClickClose()
    } catch (error) {
      console.error(error)
      handleClickClose()
    }
  }, [mainTheme, subTheme, user.currentUser?.uid, handleClickClose])

  // 생성한 전체 테마 배열 만들기
  useEffect(() => {
    if (!user.currentUser?.uid) return
    const db = getDatabase()
    const themeRef = ref(db, 'users/' + user.currentUser.uid + '/theme')
    const unsubscribe = onChildAdded(themeRef, snap => {
      setUserTheme(themeArr => [snap.val(), ...themeArr])
    })
    return () => {
      setUserTheme([])
      unsubscribe?.()
    }
  }, [user.currentUser.uid])

  return (
    <>
      <List sx={{ overflow: 'auto', width: 60, backgroundColor: '#150c16' }}>
        <ListItem button onClick={handleClickOpen}>
          <ListItemIcon sx={{ color: 'white' }}>
            <PaletteIcon />
          </ListItemIcon>
        </ListItem>

        {userTheme.map(theme => (
          <ListItem>
            <div
              className="theme-box"
              onClick={() =>
                dispatch(setTheme(theme.mainTheme, theme.subTheme))
              }
            >
              <div
                className="theme-main"
                style={{ backgroundColor: theme.mainTheme }}
              ></div>
              <div
                className="theme-sub"
                style={{ backgroundColor: theme.subTheme }}
              ></div>
            </div>
          </ListItem>
        ))}
      </List>
      <Dialog open={showThemeModal} onClose={handleClickClose}>
        <DialogTitle>테마 색상 선택</DialogTitle>
        <DialogContent>
          <Stack direction="row" spacing={2}>
            <div>
              Main
              <HexColorPicker color={mainTheme} onChange={handleChangeMain} />
            </div>
            <div>
              Sub
              <HexColorPicker color={subTheme} onChange={handleChangeSub} />
            </div>
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClickClose}>취소</Button>
          <Button onClick={handleSaveTheme}>테마 저장</Button>
        </DialogActions>
      </Dialog>
    </>
  )
}
