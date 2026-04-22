import { useState, useEffect, useRef } from "react"
import { useParams } from "react-router-dom"
import { sendMessage, getMessages } from "../services/chat"
import { useAuth } from "../context/AuthContext"

export default function Chat() {
    const [messages, setMessages] = useState([])
    const [input, setInput] = useState("")
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState(null)
    const { token } = useAuth()
    const { id } = useParams()
    const bottomRef = useRef(null)

    useEffect(() => {
        loadMessages()
    }, [])

    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: "smooth" })
    }, [messages])

    const loadMessages = async () => {
        try {
            const data = await getMessages(id, token)
            setMessages(data)
        } catch (err) {
            setError("Failed to load messages")
        }
    }

    const handleSend = async () => {
        if (!input.trim()) return

        const userMessage = { role: "user", content: input }
        setMessages(prev => [...prev, userMessage])
        setInput("")
        setLoading(true)
        setError(null)

        try {
            const data = await sendMessage(id, input, token)
            const agentMessage = { role: "assistant", content: data.response }
            setMessages(prev => [...prev, agentMessage])
        } catch (err) {
            setError(err.response?.data?.detail || "Failed to send message")
        } finally {
            setLoading(false)
        }
    }

    return (
        <div style={{ maxWidth: "800px", margin: "40px auto", padding: "20px" }}>
            <h2>Chat</h2>

            {error && <div style={{ color: "red", marginBottom: "10px" }}>{error}</div>}

            <div style={{
                border: "1px solid #ccc",
                height: "500px",
                overflowY: "auto",
                padding: "10px",
                marginBottom: "10px",
                borderRadius: "8px"
            }}>
                {messages.map((msg, index) => (
                    <div key={index} style={{
                        textAlign: msg.role === "user" ? "right" : "left",
                        margin: "10px 0"
                    }}>
                        <span style={{
                            background: msg.role === "user" ? "#007bff" : "#f1f1f1",
                            color: msg.role === "user" ? "white" : "black",
                            padding: "8px 12px",
                            borderRadius: "12px",
                            display: "inline-block",
                            maxWidth: "80%"
                        }}>
                            {msg.content}
                        </span>
                    </div>
                ))}
                {loading && <div style={{ textAlign: "left", color: "#888" }}>Agent is typing...</div>}
                <div ref={bottomRef} />
            </div>

            <div style={{ display: "flex", gap: "10px" }}>
                <input
                    style={{ flex: 1, padding: "10px", borderRadius: "8px", border: "1px solid #ccc" }}
                    value={input}
                    onChange={e => setInput(e.target.value)}
                    onKeyDown={e => e.key === "Enter" && handleSend()}
                    placeholder="Ask something about your document..."
                />
                <button
                    onClick={handleSend}
                    disabled={loading}
                    style={{ padding: "10px 20px", background: "#007bff", color: "white", border: "none", borderRadius: "8px" }}
                >
                    Send
                </button>
            </div>
        </div>
    )
}