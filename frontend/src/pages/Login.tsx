
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../services/api";


function Login() {
    const navigate = useNavigate();
    const [form, setForm] = useState({ email: '', password: '' })
    const [error, setError] = useState('')

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setError('')

        try {
            const res = await API.post('/login', form)
            const token = res.data.token
            localStorage.setItem('token', token)
            navigate('/')
        } catch (err: any) {
            console.log(error)
            setError(err.response?.data?.error || 'Login Failed')
        }
    }
    return (
        <div className="flex flex-col items-center justify-center h-screen">
            <h2 className="text-2xl mb-4">Login</h2>
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                <input
                    type="email"
                    name="email"
                    placeholder="Email"
                    value={form.email}
                    onChange={handleChange}
                    className="p-2 border rounded"
                />
                <input
                    type="password"
                    name="password"
                    placeholder="Password"
                    value={form.password}
                    onChange={handleChange}
                    className="p-2 border rounded"
                />
                <button type="submit" className="bg-green-500 text-white px-4 py-2 rounded">
                    Login
                </button>
            </form>
        </div>
    )
}
export default Login;