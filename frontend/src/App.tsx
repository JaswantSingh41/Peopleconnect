import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Login from './pages/Login'
import Signup from './pages/Signup'
import Dashboard from './pages/Dashboard'
import Room from './pages/Room'
import CreateRoom from './pages/CreateRoom'

import './App.css'

function App() {
  return (
    <BrowserRouter>
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Signup />} />
      {/* <Route path="/dashboard" element={<Dashboard />} /> */}
      <Route path="/" element={<Dashboard />} />
      <Route path="/room/:id" element={<Room />} />
      <Route path="/createroom" element={<CreateRoom />} />
    </Routes>
  </BrowserRouter>
  )
}

export default App
