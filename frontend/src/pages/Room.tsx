

import { useEffect, useRef, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import API from '../services/api'
import { jwtDecode } from 'jwt-decode'

type DecodedToken = {
  email: string
  exp: number
}


type Room = {
  id: string
  topic: string
  language: string
  maxParticipants: number
}
const token = localStorage.getItem('token')
let userEmail = ''

if (token) {
  const decoded = jwtDecode<DecodedToken>(token)
  userEmail = decoded.email
}
function Room() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [room, setRoom] = useState<Room | null>(null)
  const [error, setError] = useState('')

  const [messages, setMessages] = useState<string[]>([])
  const [message, setMessage] = useState('')
  const socketRef = useRef<WebSocket | null>(null)


  const token = localStorage.getItem('token')
  let userEmail = ''
  if (token) {
    const decoded = jwtDecode<DecodedToken>(token)
    userEmail = decoded.email
  }

  useEffect(() => {

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
          navigate('/login')
        } else if (err.response?.status === 404) {
          setError('Room not found')
        } else {
          setError('Something went wrong')
        }
      })

    // fetch saved messages
    API.get(`/room/${id}/messages`)
      .then((res) => {
        const history = res.data.map(
          (msg: { sender: string; content: string }) =>
            `${msg.sender}: ${msg.content}`
        )
        setMessages(history)
      }).catch((err) => {
        console.error('Failed to load messages:', err)
      })

    // Connect WebSocket
    const ws = new WebSocket(`ws://localhost:8080/ws/${id}`)
    socketRef.current = ws

    ws.onmessage = (event) => {
      setMessages((prev) => [...prev, event.data])
    }

    ws.onclose = () => {
      console.log('Websocket closed')
    }

    return () => {
      ws.close()
    }

  }, [id, navigate])

  const sendMessage = () => {
    if (socketRef.current && message.trim() !== '') {
      const formatted = `${userEmail}: ${message}`
      socketRef.current.send(formatted)
      setMessage('')
    }
  }

  if (error) return <div className="p-6 text-red-500">{error}</div>
  if (!room) return <div className="p-6">Loading...</div>

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-2">Welcome to: {room.topic}</h2>
      <p className="mb-1">Language: {room.language}</p>
      <p className="mb-4">Max Participants: {room.maxParticipants}</p>


      <div className="border p-4 mb-4 h-60 overflow-y-scroll bg-white rounded shadow">
        {messages.map((msg, index) => (
          <div key={index} className="mb-2">{msg}</div>
        ))}
      </div>

      <div className="flex gap-2">
        <input
          type="text"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          className="flex-1 p-2 border rounded"
          placeholder="Type your message"
        />
        <button
          onClick={sendMessage}
          className="bg-blue-500 text-white px-4 py-2 rounded"
        >
          Send
        </button>
      </div>
    </div>
  )
}

export default Room;
