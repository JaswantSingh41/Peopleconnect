

import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import API from '../services/api'

type Room = {
  id: string
  topic: string
  language: string
  maxParticipants: number
}

function Room() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [room, setRoom] = useState<Room | null>(null)
  const [error, setError] = useState('')

  useEffect(() => {
    const token = localStorage.getItem('token')

    if (!token) {
      navigate('/login')
      return
    }

    API.get(`/room/${id}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then((res) => {
        setRoom(res.data)
      })
      .catch((err) => {
        if (err.response?.status === 401) {
          navigate('/login') // 🔐 Token invalid/expired
        } else if (err.response?.status === 404) {
          setError('Room not found')
        } else {
          setError('Something went wrong')
        }
      })
  }, [id, navigate])

  if (error) return <div className="p-6 text-red-500">{error}</div>
  if (!room) return <div className="p-6">Loading...</div>

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold">Welcome to: {room.topic}</h2>
      <p>Language: {room.language}</p>
      <p>Max Participants: {room.maxParticipants}</p>
    </div>
  )
}

export default Room;
