import { updateProfile } from './users'

const CLOUD_NAME = process.env.EXPO_PUBLIC_CLOUDINARY_CLOUD_NAME
const UPLOAD_PRESET = process.env.EXPO_PUBLIC_CLOUDINARY_UPLOAD_PRESET

export async function uploadAvatar(uid: string, localUri: string): Promise<string> {
  const formData = new FormData()
  formData.append('file', { uri: localUri, type: 'image/jpeg', name: `avatar_${uid}.jpg` } as any)
  formData.append('upload_preset', UPLOAD_PRESET!)
  formData.append('public_id', `avatars/${uid}`)

  const response = await fetch(
    `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`,
    { method: 'POST', body: formData }
  )

  if (!response.ok) {
    const err = await response.json().catch(() => ({}))
    throw new Error(`Cloudinary upload failed (${response.status}): ${(err as any).error?.message ?? 'unknown'}`)
  }

  const data = await response.json()
  const downloadUrl: string = data.secure_url

  await updateProfile(uid, { avatarUrl: downloadUrl })

  return downloadUrl
}
