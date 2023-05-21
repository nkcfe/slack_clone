import {
  AppBar,
  Avatar,
  Box,
  IconButton,
  Menu,
  MenuItem,
  Toolbar,
  Typography,
} from '@mui/material'
import TagIcon from '@mui/icons-material/Tag'
import React, { useCallback, useState } from 'react'
import { useSelector } from 'react-redux'
import '../firebase' //firebass를 사용하기 위해서 임포트 해야함
import { getAuth, signOut } from 'firebase/auth' //로그아웃
import ProfileModal from './Modal/ProfileModal'

export default function Header() {
  // 유저 정보 가져오기
  const { user, theme } = useSelector(state => state)

  // 메뉴 열림 상태
  const [anchorEl, setAnchorEl] = useState(null)

  // 프로필 이미지 변경 모달 상태
  const [showProfileModal, setShowProfileModal] = useState(false)

  // 메뉴 닫기
  const handleCloseMenu = useCallback(() => {
    setAnchorEl(null)
  }, [])

  // 프로필 이미지 모달 열기
  const handleClickOpen = useCallback(() => {
    setShowProfileModal(true)
    handleCloseMenu()
  }, [handleCloseMenu])

  // 프로필 이미지 모달 닫기
  const handleCloseProfileModal = useCallback(() => {
    setShowProfileModal(false)
  }, [])

  // 메뉴 열기
  const handleOpenMenu = useCallback(event => {
    setAnchorEl(event.currentTarget)
  }, [])

  // 로그아웃
  const handleLogout = useCallback(async () => {
    await signOut(getAuth())
  }, [])

  return (
    <>
      <AppBar
        position="fixed"
        sx={{
          zIndex: theme => theme.zIndex.drawer + 1,
          color: '#9a939b',
          backgroundColor: theme.mainTheme,
        }}
      >
        <Toolbar
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            height: '50px',
          }}
        >
          <Box sx={{ display: 'flex' }}>
            <TagIcon />
            <Typography variant="h6" component="div">
              SLACK
            </Typography>
          </Box>
          <Box>
            <IconButton onClick={handleOpenMenu}>
              <Typography
                variant="h6"
                component="div"
                sx={{ color: '#9a939b' }}
              >
                {user.currentUser?.displayName}
              </Typography>
              <Avatar
                sx={{ marginLeft: '10px' }}
                alt="profileImage"
                src={user.currentUser?.photoURL}
              />
            </IconButton>
            <Menu
              sx={{ mt: '45px' }}
              anchorEl={anchorEl}
              open={Boolean(anchorEl)}
              onClose={handleCloseMenu}
              anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
            >
              <MenuItem onClick={handleClickOpen}>
                <Typography textAlign="center">프로필 이미지</Typography>
              </MenuItem>
              <MenuItem onClick={handleLogout}>
                <Typography textAlign="center">로그아웃</Typography>
              </MenuItem>
            </Menu>
          </Box>
        </Toolbar>
      </AppBar>
      <ProfileModal
        open={showProfileModal}
        handleClose={handleCloseProfileModal}
      />
    </>
  )
}
