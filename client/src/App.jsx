import EmailVerify from "./pages/EmailVerify"
import Home from "./pages/Home"
import Login from "./pages/Login"
import ResetPassword from "./pages/ResetPassword"
import { Routes, Route } from "react-router-dom"
const App = () => {
  return (
    <div className="">
      <Routes>
        <Route path="/" element={<Home/>}/>
        <Route path="/login" element ={<Login/>} />
        <Route path="/email-verify" element={<EmailVerify/>}/>
        <Route path="/reset-password" element={<ResetPassword/>}/>
      </Routes>
    </div>
  )
}
export default App