import { useState } from "react"
import { useNavigate, Link } from "react-router-dom"
import { signup as signupAPI } from "../services/auth"
import { useAuth } from "../context/AuthContext"

export default function Signup() {
    const [email, setEmail] = useState("")
    const [username, setUsername] = useState("")
    const [firstname, setFirstname] = useState("")
    const [lastname, setLastname] = useState("")
    const [password, setPassword] = useState("")
    const [error, setError] = useState(null)
    const [loading, setLoading] = useState(false)
    const { login } = useAuth()
    const navigate = useNavigate()

    const handleSubmit = async (e) => {
        e.preventDefault()
        setLoading(true)
        setError(null)

        try {
            const data = await signupAPI({ email, username, firstname, lastname, password })
            login(data.user, data.access_token)  // save to context + sessionStorage
            navigate("/dashboard")               // go straight to dashboard
        }
        catch (err) {
            setError(err.response?.data?.detail || "Signup failed")
        }
        finally {
            setLoading(false)
        }

    }

    return (
        <div style={{ maxWidth: "400px", margin: "100px auto", padding: "20px" }}>
            <h2>Sign Up</h2>
            {error && <div style={{ color: "red", marginBottom: "10px" }}>{error}</div>}
            <div>
                <input
                    style={{ width: "100%", padding: "10px", marginBottom: "10px" }}
                    type="email"
                    placeholder="Email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                />
                <input
                    style={{ width: "100%", padding: "10px", marginBottom: "10px" }}
                    type="username"
                    placeholder="Username"
                    value={username}
                    onChange={e => setUsername(e.target.value)}
                />
                <input
                    style={{ width: "100%", padding: "10px", marginBottom: "10px" }}
                    type="firstname"
                    placeholder="First name"
                    value={firstname}
                    onChange={e => setFirstname(e.target.value)}
                />
                <input
                    style={{ width: "100%", padding: "10px", marginBottom: "10px" }}
                    type="lastname"
                    placeholder="Last name"
                    value={lastname}
                    onChange={e => setLastname(e.target.value)}
                />
                <input
                    style={{ width: "100%", padding: "10px", marginBottom: "10px" }}
                    type="password"
                    placeholder="Password"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                />
                <button
                    onClick={handleSubmit}
                    disabled={loading}
                    style={{ width: "100%", padding: "10px", background: "#007bff", color: "white", border: "none" }}
                >
                    {loading ? "Signing Up..." : "Sign Up"}
                </button>
            </div>

        </div>
    )
}