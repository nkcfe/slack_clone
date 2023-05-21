// 액션 타입
const SET_USER = 'SET_USER'
const CLEAR_USER = 'CLEAR_USER'

// 액션 생성 함수함수
export const setUser = user => ({ type: SET_USER, currentUser: user })
export const clearUser = () => ({ type: CLEAR_USER })

// 초기 상태
const initialState = {
  currentUser: null,
  isLoading: true,
}

// 리듀스
const userReducer = (state = initialState, action) => {
  switch (action.type) {
    case SET_USER:
      return {
        currentUser: action.currentUser,
        isLoading: false,
      }
    case CLEAR_USER:
      return {
        currentUser: null,
        isLoading: false,
      }
    default:
      return state
  }
}

export default userReducer
