import { Navigate, Route, Routes } from 'react-router-dom'
import './App.css'
import Join from './pages/Join'
import Login from './pages/Login'
import { useEffect } from 'react'
import { getAuth, onAuthStateChanged } from 'firebase/auth'
import { useDispatch, useSelector } from 'react-redux'
import { clearUser, setUser } from './store/userReducer'
import Main from './pages/Main'
import { CircularProgress, Stack } from '@mui/material'

function App() {
  const dispatch = useDispatch()

  // useSelector를 사용하여 현재 로그인된 사용자 정보 가져오기
  const { isLoading, currentUser } = useSelector(state => state.user)

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(getAuth(), user => {
      if (!!user) {
        dispatch(setUser(user))
      } else {
        dispatch(clearUser())
      }
    })
    return () => unsubscribe()
  }, [dispatch])

  if (isLoading) {
    return (
      <Stack alignItems="center" justifyContent="center" height="100vh">
        <CircularProgress color="secondary" size={150} />
      </Stack>
    )
  }
  return (
    <>
      <Routes>
        <Route
          path="/"
          element={currentUser ? <Main /> : <Navigate to="/login" />} // 로그인 유저가 있을경우 메인, 없을경우 로그인 페이지로
        />
        <Route
          path="/login"
          element={currentUser ? <Navigate to="/" /> : <Login />} // 로그인 유저가 있을 경우 메인, 없을경우 로그인
        />
        <Route
          path="/join"
          element={currentUser ? <Navigate to="/" /> : <Join />} //로그인 유저가 있을 경우 메인으로
        />
      </Routes>
    </>
  )
}

export default App
