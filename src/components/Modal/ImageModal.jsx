import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Input,
} from '@mui/material'
import React, { useCallback, useState } from 'react'
import { v4 as uuidv4 } from 'uuid'
import '../../firebase'
import {
  getDownloadURL,
  getStorage,
  ref as ref_storage,
  uploadBytesResumable,
} from 'firebase/storage'
import { getDatabase, push, ref, serverTimestamp, set } from 'firebase/database'
import { useSelector } from 'react-redux'

export default function ImageModal({
  open,
  handleClose,
  setPercent,
  setUploading,
}) {
  // channer, user 가져오기
  const { channel, user } = useSelector(state => state)

  // 가져온 파일 set
  const [file, setFile] = useState(null)

  // onChange로 추가된 파일 set
  const onChangeAddFile = useCallback(e => {
    const addedFile = e.target.files[0]
    if (addedFile) setFile(addedFile)
  }, [])

  // 이미지를 추가한 메시지 생성
  const createImageMessage = useCallback(
    fileUrl => ({
      timestamp: serverTimestamp(),
      user: {
        id: user.currentUser.uid,
        name: user.currentUser.displayName,
        avatar: user.currentUser.photoURL,
      },
      image: fileUrl,
    }),
    [
      user.currentUser.uid,
      user.currentUser.displayName,
      user.currentUser.photoURL,
    ]
  )

  // 파일 업로드
  const uploadFile = useCallback(() => {
    setUploading(true) // 업로딩 중으로
    const filePath = `chat/${uuidv4()}.${file.name.split('.').pop()}` // 경로 지정 (split으로 확장자와 분리 후 pop으로 확장자 제거)

    // firebase에 업로드할 메소드
    const uploadTask = uploadBytesResumable(
      ref_storage(getStorage(), filePath),
      file
    )

    // firebase에 업로드
    // 3개의 observers를 등록해야함.
    // 1. 'state_changed observer
    const unsubscribe = uploadTask.on(
      'state_changed',

      // progress 구현
      snap => {
        const percentUploaded = Math.round(
          (snap.bytesTransferred / snap.totalBytes) * 100
        )
        setPercent(percentUploaded)
      },
      // 2. error observer
      error => {
        console.error(error)
        setUploading(false)
      },

      // 3. completion observer
      async () => {
        try {
          const downloadUrl = await getDownloadURL(uploadTask.snapshot.ref)
          await set(
            push(ref(getDatabase(), 'messages/' + channel.currentChannel?.id)),
            createImageMessage(downloadUrl)
          )
          setUploading(false)
          unsubscribe()
        } catch (error) {
          console.error(error)
          setUploading(false)
          unsubscribe()
        }
      }
    )
  }, [
    channel.currentChannel?.id,
    createImageMessage,
    file,
    setPercent,
    setUploading,
  ])

  // onClick으로 메시지 보내기
  const handleSendFile = useCallback(() => {
    uploadFile() //파일 업로드
    handleClose() // 창 닫기
    setFile(null) // 파일 초기화
  }, [handleClose, uploadFile])

  return (
    <Dialog open={open} onClose={handleClose}>
      <DialogTitle>이미지 보내기</DialogTitle>
      <DialogContent>
        <Input
          margin="dense"
          inputProps={{ accept: 'image/jpeg, image/jpg, image/png, image/gif' }}
          type="file"
          fullWidth
          variant="standard"
          onChange={onChangeAddFile}
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose}>취소</Button>
        <Button onClick={handleSendFile}>전송</Button>
      </DialogActions>
    </Dialog>
  )
}
