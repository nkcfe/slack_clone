// 액션 타입
const SET_CURRENT_CHANNEL = 'SET_CURRENT_CHANNEL'

// 액션 생성 함수
export const setCurrentChannel = channel => ({
  type: SET_CURRENT_CHANNEL,
  currentChannel: channel,
})

// initial state
const initialState = { currentChannel: null }

// reducer
const channelReducer = (state = initialState, action) => {
  switch (action.type) {
    case SET_CURRENT_CHANNEL:
      return {
        currentChannel: action.currentChannel,
      }
    default:
      return state
  }
}

export default channelReducer
