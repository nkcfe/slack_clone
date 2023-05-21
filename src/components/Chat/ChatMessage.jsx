import {
  Avatar,
  Grid,
  ListItem,
  ListItemAvatar,
  ListItemText,
} from '@mui/material'
import dayjs from 'dayjs'
import React from 'react'

// dayjs 확장
const relativeTime = require('dayjs/plugin/relativeTime')
dayjs.extend(relativeTime)

// message의 프로퍼티 중 image가 있는지 확인해주는 메소드
const IsImage = message => message.hasOwnProperty('image')

export default function ChatMessage({ message, user }) {
  return (
    <ListItem>
      <ListItemAvatar sx={{ alignSelf: 'stretch' }}>
        <Avatar
          variant="rounded"
          sx={{ width: 50, height: 50 }}
          alt="profileImage"
          src={message.user.avatar}
        />
      </ListItemAvatar>
      <Grid container sx={{ ml: 2 }}>
        <Grid item xs={12} sx={{ display: 'flex', justifyContent: 'left' }}>
          <ListItemText
            sx={{ display: 'flex' }}
            primary={message.user.name}
            primaryTypographyProps={{
              fontWeight: 'bold',
              color:
                message.user.id === user.currentUser?.uid ? 'orange' : 'black',
            }}
            secondary={dayjs(message.timestamp).fromNow()}
            secondaryTypographyProps={{ color: 'gray', ml: 1 }}
          />
        </Grid>
        <Grid item xs={12}>
          {/* 이미지가 메시지에 있으면 img태그 출력 */}
          {IsImage(message) ? (
            <img
              alt="message"
              src={message.image}
              style={{ maxWidth: '20%' }}
            />
          ) : (
            <ListItemText
              align="left"
              xs={{ wordBreak: 'break-all' }}
              primary={message.content}
            />
          )}
        </Grid>
      </Grid>
    </ListItem>
  )
}
