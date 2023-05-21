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
import { getAuth, signInWithEmailAndPassword } from 'firebase/auth'

export default function Login() {
  // 에러 상태
  const [error, setError] = useState('')

  // 로딩 상태
  const [loading, setLoading] = useState(false)

  // 로그인 기능 (firebass)
  const loginUser = useCallback(async (email, password) => {
    setLoading(true)
    try {
      await signInWithEmailAndPassword(getAuth(), email, password)
    } catch (e) {
      setError(e.message)
      setLoading(false)
    }
  }, [])

  // 로그인 버튼 클릭 시
  const handleSubmit = useCallback(
    event => {
      event.preventDefault()
      const data = new FormData(event.currentTarget) // 데이터 생성
      const email = data.get('email') // 이메일
      const password = data.get('password') // 패스워드

      // 비어있는 칸 방어
      if (!email || !password) {
        setError('모든 항목을 입력해주세요.')
        return
      }
      // 로그인
      loginUser(email, password)
    },
    [loginUser]
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
          로그인
        </Typography>
        <Box component="form" noValidate onSubmit={handleSubmit} sx={{ mt: 3 }}>
          <TextField
            margin="normal"
            required
            fullWidth
            label="이메일 주소"
            name="email"
            autoComplete="off"
            autoFocus
          />
          <TextField
            margin="normal"
            required
            fullWidth
            label="비밀번호"
            name="password"
            type="password"
          />
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
            로그인
          </LoadingButton>
          <Grid container justifyContent="flex-end">
            <Grid item>
              <Link
                to="/join"
                style={{ textDecoration: 'none', color: 'blue' }}
              >
                계정이 없나요? 회원가입으로 이동
              </Link>
            </Grid>
          </Grid>
        </Box>
      </Box>
    </Container>
  )
}
