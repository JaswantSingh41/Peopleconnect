

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
  const [participants, setParticipants] = useState<string[]>([])

  const [kickedOut, setKickedOut] = useState(false)

  const [messages, setMessages] = useState<string[]>([])
  const [message, setMessage] = useState('')
  const socketRef = useRef<WebSocket | null>(null)
  const messagesEndRef = useRef<HTMLDivElement | null>(null)

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
    const ws = new WebSocket(`ws://localhost:8080/ws/${id}?token=${token}`)
    socketRef.current = ws

    ws.onmessage = (event) => {
      const data = event.data as string
      if (data === "Room is full") {
        alert("This room is full. You cannot join.")
        setKickedOut(true)
        ws.close()
        return
      }
      
      if (data.startsWith("PARTICIPANTS:")) {
        const userList = data.replace("PARTICIPANTS:", "").split(",")
        setParticipants(userList)
      } else {
        setMessages((prev) => [...prev, data])
      }
    }

    ws.onclose = () => {
      console.log('Websocket closed')
    }

    return () => {
      ws.close()
    }

  }, [id, navigate])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const sendMessage = () => {
    if (socketRef.current && message.trim() !== '') {
      const formatted = `${userEmail}: ${message}`
      socketRef.current.send(formatted)
      setMessage('')
    }
  }

  if (error) return <div className="p-6 text-red-500">{error}</div>
  if (!room) return <div className="p-6">Loading...</div>

  if (kickedOut) {
    return (
      <div className="p-6 text-red-600">
        ❌  this room room is  full . <br />
        <a href="/" className="text-blue-500 underline">Go back to homepage</a>
      </div>
    )
  }
  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-2">Welcome to: {room.topic}</h2>
      <p className="mb-1">Language: {room.language}</p>
      <p className="mb-4">Max Participants: {room.maxParticipants}</p>


      <div className="border p-4 mb-4 h-60 overflow-y-scroll bg-white rounded shadow">
        {messages.map((msg, index) => {
          const isMine = msg.startsWith(userEmail)
          const [sender, content] = msg.split(': ', 2)

          return (
            <div
              key={index}
              className={`flex ${isMine ? 'justify-end' : 'justify-start'} mb-2`}
            >
              <div
                className={`max-w-[70%] px-4 py-2 rounded-lg shadow 
                ${isMine ? 'bg-blue-500 text-white' : 'bg-gray-200 text-black'}`}
              >
                {!isMine && (
                  <p className="text-xs font-semibold text-gray-600 mb-1">{sender}</p>
                )}
                <p>{content}</p>
              </div>
            </div>
          )
        })}
        <div ref={messagesEndRef} />
      </div>
      <div className="mb-4">
  <h3 className="font-semibold mb-1 text-gray-600">Participants:</h3>
  <div className="flex flex-wrap gap-2">
    {participants.map((user, index) => (
      <span
        key={index}
        className="bg-gray-100 text-sm text-gray-800 px-2 py-1 rounded"
      >
        {user === userEmail ? "You" : user}
      </span>
    ))}
  </div>
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
