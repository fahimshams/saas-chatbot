import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { getSessions } from "../services/chat"
import { useAuth } from "../context/AuthContext"
import Navbar from "../components/Navbar"
import { deleteSession } from "../services/chat"


export default function History() {
    const [sessions, setSessions] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)
    const { token } = useAuth()
    const navigate = useNavigate()

    useEffect(() => {
        loadSessions()
    }, [])

    const loadSessions = async () => {
        try {
            const data = await getSessions(token)
            setSessions(data)
        } catch (err) {
            setError("Failed to load chat history")
        } finally {
            setLoading(false)
        }
    }

    const handleDeleteSession = async (sessionId, e) => {
        e.stopPropagation()  // prevent navigating to chat
        if (!window.confirm("Delete this chat session?")) return

        try {
            await deleteSession(sessionId, token)
            await loadSessions()
        } catch (err) {
            setError("Failed to delete session")
        }
    }

    return (
        <div>
            <Navbar />
            <div style={{ maxWidth: "800px", margin: "40px auto", padding: "20px" }}>
                <h2>Chat History</h2>

                {error && <div style={{ color: "red", marginBottom: "10px" }}>{error}</div>}

                {loading && <p>Loading...</p>}

                {!loading && sessions.length === 0 && (
                    <div style={{ textAlign: "center", padding: "40px", color: "#666" }}>
                        t sessions yet. Upload a docu                        <p>No chament and start chatting!</p>
                    </div>
                )}

                {sessions.map(session => (
                    <div key={session.id} style={{
                        border: "1px solid #ccc",
                        padding: "15px",
                        marginBottom: "10px",
                        borderRadius: "8px",
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        cursor: "pointer"
                    }}
                        onClick={() => navigate(`/chat/${session.id}`)}
                    >
                        <div>
                            <strong>{session.title}</strong>
                            <p style={{ color: "#888", fontSize: "12px", margin: "4px 0 0" }}>
                                {new Date(session.created_at).toLocaleDateString()}
                            </p>
                        </div>
                        <button style={{
                            padding: "8px 16px",
                            background: "#007bff",
                            color: "white",
                            border: "none",
                            borderRadius: "8px",
                            cursor: "pointer"
                        }}>
                            Open
                        </button>
                        <button
                            onClick={(e) => handleDeleteSession(session.id, e)}
                            style={{
                                padding: "8px 16px",
                                background: "#e74c3c",
                                color: "white",
                                border: "none",
                                borderRadius: "8px",
                                cursor: "pointer"
                            }}
                        >
                            Delete
                        </button>
                    </div>
                ))}
            </div>
        </div>
    )
}