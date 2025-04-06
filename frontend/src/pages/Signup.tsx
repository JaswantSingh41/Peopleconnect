import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../services/api";


function Signup() {
  const navigate = useNavigate();
  const [form ,setform] = useState({ email: '', password: ''});
  const [error, setError] = useState('')

  const handleChange = (e : React.ChangeEvent<HTMLInputElement>) => {
    setform({ ...form, [e.target.name]: e.target.value});
  }
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    try {
         await API.post('/signup', form)
        navigate('/login')
    } catch (err: any) {
        console.log(error)
        setError(err.response?.data?.error || 'Signup Failed')
    }
}

  return (
    <div className="flex flex-col items-center justify-center h-screen">
    <h2 className="text-2xl mb-4">Signup</h2>
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
      <button type="submit" className="bg-blue-500 text-white px-4 py-2 rounded">
        Create Account
      </button>
    </form>
  </div>
  );
}
export default Signup;