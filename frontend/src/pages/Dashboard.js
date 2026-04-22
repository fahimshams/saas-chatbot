import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { uploadDocument, getDocuments } from "../services/documents"
import { createSession, getSessions } from "../services/chat"
import { useAuth } from "../context/AuthContext"

export default function Dashboard() {
    const [documents, setDocuments] = useState([])
    const [uploading, setUploading] = useState(false)
    const [error, setError] = useState(null)
    const { token } = useAuth()
    const navigate = useNavigate()

    useEffect(() => {
        loadDocuments()
    }, [])

    const loadDocuments = async () => {
        try {
            const data = await getDocuments(token)
            setDocuments(data)
        } catch (err) {
            setError("Failed to load documents")
        }
    }

    const handleUpload = async (e) => {
        const file = e.target.files[0]
        if (!file) return

        setUploading(true)
        setError(null)

        try {
            await uploadDocument(file, token)
            await loadDocuments()
        } catch (err) {
            setError(err.response?.data?.detail || "Upload failed")
        } finally {
            setUploading(false)
        }
    }

 const handleStartChat = async (documentId, filename) => {
    try {
        // Get existing sessions
        const sessions = await getSessions(token)
        
        // Find existing session for this document
        const existing = sessions.find(s => s.document_id === documentId)
        
        if (existing) {
            // Use existing session
            navigate(`/chat/${existing.id}`)
        } else {
            // Create new session
            const session = await createSession(documentId, `Chat about ${filename}`, token)
            navigate(`/chat/${session.session_id}`)
        }
    } catch (err) {
        setError("Failed to open chat")
    }
}
    return (
        <div style={{ maxWidth: "800px", margin: "40px auto", padding: "20px" }}>
            <h2>My Documents</h2>

            {error && <div style={{ color: "red", marginBottom: "10px" }}>{error}</div>}

            <div style={{ marginBottom: "20px" }}>
                <label style={{
                    padding: "10px 20px",
                    background: "#007bff",
                    color: "white",
                    cursor: "pointer",
                    borderRadius: "8px"
                }}>
                    {uploading ? "Uploading..." : "Upload PDF"}
                    <input
                        type="file"
                        accept=".pdf"
                        onChange={handleUpload}
                        style={{ display: "none" }}
                        disabled={uploading}
                    />
                </label>
            </div>

            <div>
                {documents.length === 0 && <p>No documents yet. Upload a PDF to get started.</p>}
                {documents.map(doc => (
                    <div key={doc.id} style={{
                        border: "1px solid #ccc",
                        padding: "15px",
                        marginBottom: "10px",
                        borderRadius: "8px",
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center"
                    }}>
                        <div>
                            <strong>{doc.filename}</strong>
                            <p style={{ color: "#888", fontSize: "12px" }}>
                                Uploaded: {new Date(doc.uploaded_at).toLocaleDateString()}
                            </p>
                        </div>
                        <button
                            onClick={() => handleStartChat(doc.id, doc.filename)}
                            style={{
                                padding: "8px 16px",
                                background: "#28a745",
                                color: "white",
                                border: "none",
                                borderRadius: "8px",
                                cursor: "pointer"
                            }}
                        >
                            Chat
                        </button>
                    </div>
                ))}
            </div>
        </div>
    )
}