import {useState} from "react"
import { useNavigate, Link } from "react-router-dom"
import {login as loginAPI} from "../services/auth"
import {useAuth} from "../context/AuthContext"

export default function Login(){
    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")
    const [error, setError] = useState(null)
    const [loading, setLoading] = useState(false)
    const {login} = useAuth()
    const navigate = useNavigate()

    const handleSubmit = async(e) => {
        e.preventDefault()
        setLoading(true)
        setError(null)

        try {
            const data = await loginAPI({email, password})
            login(data.user, data.access_token)
            navigate("/dashboard")
        }
        catch(err){
            setError(err.response?.data?.detail || "Login failed")
        }
        finally{
            setLoading(false)
        }

       
    }
      return (
        <div style={{ maxWidth: "400px", margin: "100px auto", padding: "20px" }}>
            <h2>Login</h2>
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
                    {loading ? "Logging in..." : "Login"}
                </button>
            </div>
            <p>Don't have an account? <Link to="/signup">Sign up</Link></p>
        </div>
    )
}