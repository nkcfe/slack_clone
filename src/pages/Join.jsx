import {
  Alert,
  Avatar,
  Box,
  Container,
  Grid,
  TextField,
  Typography,
} from '@mui/material'
import TagIcon from '@mui/icons-material/Tag'

import React, { useCallback, useEffect, useState } from 'react'
import { LoadingButton } from '@mui/lab'
import { Link } from 'react-router-dom'
import '../firebase'
import {
  getAuth,
  createUserWithEmailAndPassword,
  updateProfile,
} from 'firebase/auth'
import md5 from 'md5'
import { getDatabase, ref, set } from 'firebase/database'
import { useDispatch } from 'react-redux'
import { setUser } from '../store/userReducer'

// 패스워드 인증
const IsPasswordValid = (password, confirmPassword) => {
  // 패스워드와 확인 패스워드 길이가 6이하일 경우 방어
  if (password.length < 6 || confirmPassword < 6) {
    return false
    // 패스워드와 확인 패스워드가 같지 않을 경우 방어
  } else if (password !== confirmPassword) {
    return false
  } else {
    return true
  }
}

export default function Join() {
  // redux dispatch
  const dispatch = useDispatch()

  // 에러메시지
  const [error, setError] = useState('')

  // 로딩 상태
  const [loading, setLoading] = useState(false)

  // firebass에 유저 데이터 등록
  const postUserData = useCallback(
    async (name, email, password) => {
      setLoading(true)
      try {
        // 이메일 비밀번호로 유저 생성
        const { user } = await createUserWithEmailAndPassword(
          getAuth(), //인증
          email,
          password
        )
        // 유저 프로필 업데이트
        await updateProfile(user, {
          displayName: name,
          // gravatar와 md5의 해시값을 사용하여 랜덤한 프로필 생성
          photoURL: `https://www.gravatar.com/avatar/${md5(email)}?d=retro`,
        })
        // 데이터베이스에 변경 사항 저장하기
        await set(ref(getDatabase(), 'users/' + user.uid), {
          name: user.displayName,
          avatar: user.photoURL,
        })
        // 프로필 업데이트 반영
        dispatch(setUser(user))
      } catch (e) {
        setError(e.message)
        setLoading(false)
      }
    },
    [dispatch]
  )

  // 회원가입 제출 시 작동
  const handleSubmit = useCallback(
    event => {
      event.preventDefault()
      // 입력된 양식을 토대로 새로운 FormData를 생성
      const data = new FormData(event.currentTarget)
      const name = data.get('name')
      const email = data.get('email')
      const password = data.get('password')
      const confirmPassword = data.get('confirmPassword')

      // 빈 칸이 있는 경우 방어
      if (!name || !email || !password || !confirmPassword) {
        setError('모든 항목을 입력해주세요.')
      }

      // 패스워드 인증이 false일 경우
      if (!IsPasswordValid(password, confirmPassword)) {
        setError('비밀번호를 확인해주세요.')
        return
      }

      // firebass에 유저 데이터 등록
      postUserData(name, email, password)
    },
    [postUserData]
  )

  // 경고 메시지 3초 후 사라지게 작동
  useEffect(() => {
    if (!error) return
    setTimeout(() => {
      setError('')
    }, 3000)
  }, [error])

  return (
    <Container component="main" maxWidth="xs">
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          height: '100vh',
        }}
      >
        <Avatar sx={{ m: 1, bgcolor: 'secondary.main' }}>
          <TagIcon />
        </Avatar>
        <Typography component="h1" variant="h5">
          회원가입
        </Typography>
        <Box component="form" noValidate onSubmit={handleSubmit} sx={{ mt: 3 }}>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <TextField
                name="name"
                required
                fullWidth
                label="닉네임"
                autoFocus
                autoComplete="off"
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                name="email"
                required
                fullWidth
                label="이메일 주소"
                autoComplete="off"
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                name="password"
                required
                fullWidth
                label="비밀번호"
                type="password"
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                name="confirmPassword"
                required
                fullWidth
                label="확인 비밀번호"
                type="password"
              />
            </Grid>
          </Grid>
          {error ? (
            <Alert sx={{ mt: 3 }} severity="error">
              {error}
            </Alert>
          ) : null}

          <LoadingButton
            type="submit"
            fullWidth
            variant="contained"
            color="secondary"
            sx={{ mt: 3, mb: 2 }}
            loading={loading}
          >
            회원가입
          </LoadingButton>
          <Grid container justifyContent="flex-end">
            <Grid item>
              <Link
                to="/login"
                style={{ textDecoration: 'none', color: 'blue' }}
              >
                이미 계정이 있나요? 로그인으로 이동
              </Link>
            </Grid>
          </Grid>
        </Box>
      </Box>
    </Container>
  )
}
