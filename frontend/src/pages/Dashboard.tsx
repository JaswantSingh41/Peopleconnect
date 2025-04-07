import { useEffect, useState } from "react"
import API from "../services/api"
import { Link } from "react-router-dom"



type Room = {
    id: string
    topic: string
    language: string
    maxParticipants: number
}

function Dashboard() {
    const [rooms, setRooms] = useState<Room[]>([])
    const token = localStorage.getItem('token')

    useEffect(() => {
        API.get('/rooms').then((res) => {
            setRooms(res.data)
        }).catch((err) => {
            console.error('Error fectching rooms: ', err)
        })
    }, [])

    return (
        <>
            <header className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold">People-connect Rooms</h2>
            
                <div className="space-x-2">
                    {!token ? (
                        <>
                            <Link to="/login">
                                <button className="bg-blue-500 text-white px-4 py-2 rounded">Login</button>
                            </Link>
                            <Link to="/signup">
                                <button className="bg-gray-500 text-white px-4 py-2 rounded">Sign Up</button>
                            </Link>
                        </>
                    ) : (
                        <Link to="/createroom">
                            <button className="bg-green-500 text-white px-4 py-2 rounded">+ Create Room</button>
                        </Link>
                    )}
                </div>
            </header>
            <div className="p-6">
                <h2 className="text-2xl font-bold mb-4">Available Rooms</h2>

                <div className="grid gap-4">
                    {rooms.map((room) => (
                        <div key={room.id} className="p-4 border rounded shadow">
                            <h3 className="text-lg font-semibold">{room.topic}</h3>
                            <p>Language: {room.language}</p>
                            <p>Max Participants: {room.maxParticipants}</p>
                            <Link to={`/room/${room.id}`}>
                                <button className="mt-2 bg-green-500 text-white px-3 py-1 rounded">
                                    Join Room
                                </button>
                            </Link>
                        </div>
                    ))}
                </div>
            </div>
        </>
    )
}

export default Dashboard;