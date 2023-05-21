import {
  Avatar,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Input,
  Stack,
} from '@mui/material'
import React, { useCallback, useEffect, useRef, useState } from 'react'
import AvatarEditor from 'react-avatar-editor'
import '../../firebase'
import { useSelector } from 'react-redux'
import {
  getDownloadURL,
  getStorage,
  ref as refStorage,
  uploadBytes,
} from 'firebase/storage'
import { getDatabase, ref, set, update } from 'firebase/database'
import { updateProfile } from 'firebase/auth'

export default function ProfileModal({ open, handleClose }) {
  // redux 유저 정보 가져오기
  const { user } = useSelector(state => state)

  // 미리보기 이미지
  const [previewImage, setPreviewImage] = useState('')

  // 미리보기 이미지 -> 자른 이미지
  const [croppedImage, setCroppedImage] = useState('')

  // 업로드된 이미지
  const [uploadedCroppedImage, setUploadedCroppedImage] = useState('')

  // blob 객체
  const [blob, setBlob] = useState('')

  // 프로필 수정 이미지 Ref
  const avatarEditorRef = useRef(null)

  // 프로필 수정 모달 닫기
  const closeModal = useCallback(() => {
    handleClose() // 창 닫기
    setPreviewImage('') // 미리보기 이미지 제거
    setCroppedImage('') // 자른 이미지 제거
    setUploadedCroppedImage('') // 업로드된 이미지 제거
  }, [handleClose])

  // 업로드한 파일
  const handleChange = useCallback(e => {
    const file = e.target.files[0] // 파일 가져오기
    if (!file) return // 파일 없을 경우 방어

    // 파일 읽기
    const reader = new FileReader()
    reader.readAsDataURL(file)
    reader.addEventListener('load', () => {
      setPreviewImage(reader.result) // 미리보기 값에 저장
    })
  }, [])

  // 잘라진 이미지 저장하기
  const handleCropImage = useCallback(() => {
    avatarEditorRef.current.getImageScaledToCanvas().toBlob(blob => {
      const imageUrl = URL.createObjectURL(blob)
      setCroppedImage(imageUrl)
      setBlob(blob)
    })
  }, [])

  // 수정된 이미지 업로드
  const uploadCroppedImage = useCallback(async () => {
    // 로그인 유저가 없을 경우 방어
    if (!user.currentUser?.uid) return
    // 저장소 접근
    const storageRef = refStorage(
      getStorage(),
      `avatasr/users/${user.currentUser.uid}`
    )
    // firebase 클라우드 저장소에 업로드
    const uploadTask = await uploadBytes(storageRef, blob)
    // 다운로드 url 가져오기
    const downloadUrl = await getDownloadURL(uploadTask.ref)
    // url을 최종이미지 상태에 저장
    setUploadedCroppedImage(downloadUrl)
  }, [blob, user.currentUser?.uid])

  //
  useEffect(() => {
    // 수정된 이미지가 없거나 유저가 없을 경우 방어
    if (!uploadedCroppedImage || !user.currentUser) return
    // 프로필 이미지 바꾸기
    async function changeAvatar() {
      // firebase 프로필 이미지 업데이트
      await updateProfile(user.currentUser, {
        photoURL: uploadedCroppedImage,
      })

      // realtimedatabase에 저장
      const updates = {}
      updates['/users/' + user.currentUser.uid + '/avatar'] =
        uploadedCroppedImage
      await update(ref(getDatabase()), updates)
      closeModal()
    }
    changeAvatar()
  }, [uploadedCroppedImage, user.currentUser])

  return (
    <Dialog open={open} onClose={handleClose}>
      <DialogTitle>프로필 이미지 변경</DialogTitle>
      <DialogContent>
        <Stack direction="column" spacing={3}>
          <Input
            type="file"
            onChange={handleChange}
            inputProps={{ accept: 'image/jpeg, image/jpg, image/png' }}
            label="변경할 프로필 이미지 선택"
          />
          <div style={{ display: 'flex', alignItems: 'center' }}>
            {previewImage && (
              <AvatarEditor
                ref={avatarEditorRef}
                image={previewImage}
                width={120}
                height={120}
                border={50}
                scale={2}
                rotate={0}
                style={{ display: 'inline' }}
              />
            )}
            {croppedImage && (
              <img
                alt="cropped"
                style={{ marginLeft: '50px' }}
                width={100}
                height={100}
                src={croppedImage}
              />
            )}
          </div>
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={closeModal}>취소</Button>
        {previewImage && <Button onClick={handleCropImage}>이미지 Crop</Button>}
        {croppedImage && (
          <Button onClick={uploadCroppedImage}>프로필 이미지 저장</Button>
        )}
      </DialogActions>
    </Dialog>
  )
}
