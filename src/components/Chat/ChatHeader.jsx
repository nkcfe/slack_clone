import { CardContent, Grid, Paper, Typography } from '@mui/material'
import React from 'react'

export default function ChatHeader({ channelInfo }) {
  return (
    <Grid component={Paper} variant="outlined">
      <CardContent>
        <Typography variant="h5"># {channelInfo?.name}</Typography>
        <Typography variant="body1">{channelInfo?.details}</Typography>
      </CardContent>
    </Grid>
  )
}
