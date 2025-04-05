import { useState } from "react";
import { useNavigate } from "react-router-dom";

import API from '../services/api'


function CreateRoom() {
    const navigate = useNavigate()
    const [form, setForm] = useState({
        topic: '',
        language: '',
        maxParticipants: 2,
    })
    const [error, setError] = useState('')

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target

        // setForm({ ...form, [e.target.name]: e.target.value })
        setForm({
            ...form,
            [name]: name === 'maxParticipants' ? parseInt(value, 10) : value,
          })
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setError('')
    
        try {
          const token = localStorage.getItem('token')
          console.log('Sending:', form)

          const res = await API.post('/rooms', form, {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          })
          navigate(`/room/${res.data.id}`) // Redirect to the new room
        } catch (err: any) {
          setError(err.response?.data?.error || 'Failed to create room')
        }
      }

    return (
        <div className="max-w-md mx-auto mt-10">
            <h2 className="text-2xl font-bold mb-4">Create a Room</h2>
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                <input
                    type="text"
                    name="topic"
                    placeholder="Topic"
                    value={form.topic}
                    onChange={handleChange}
                    required
                    className="p-2 border rounded"
                />
                <select
                    name="language"
                    value={form.language}
                    onChange={handleChange}
                    required
                    className="p-2 border rounded"
                >
                    <option value="">Select Language</option>
                    <option value="English">English</option>
                    <option value="Hindi">Hindi</option>
                    <option value="Other">Other</option>
                </select>
                <input
                    type="number"
                    name="maxParticipants"
                    min={2}
                    max={20}
                    value={form.maxParticipants}
                    onChange={handleChange}
                    required
                    className="p-2 border rounded"
                />
                {error && <p className="text-red-500">{error}</p>}
                <button type="submit" className="bg-blue-500 text-white py-2 rounded">
                    Create Room
                </button>
            </form>
        </div>
    )
}

export default CreateRoom