import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { uploadDocument, getDocuments } from "../services/documents"
import { createSession, getSessions } from "../services/chat"
import { useAuth } from "../context/AuthContext"
import Navbar from "../components/Navbar"
import { deleteDocuments } from "../services/documents"


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

    const handleDeleteDocument = async (documentId) => {
        if (!window.confirm("Are you sure? This will delete the document and all its chat history.")) return

        try {
            await deleteDocuments(documentId, token)
            await loadDocuments()
        } catch (err) {
            setError("Failed to delete document")
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
        <div>
            <Navbar />
            <div style={{ maxWidth: "800px", margin: "40px auto", padding: "20px" }}>

                {/* Stats Section */}
                <div style={{ display: "flex", gap: "20px", marginBottom: "30px" }}>
                    <div style={{
                        flex: 1, padding: "20px", background: "#f8f9fa",
                        borderRadius: "8px", textAlign: "center", border: "1px solid #dee2e6"
                    }}>
                        <h3 style={{ margin: 0, color: "#007bff" }}>{documents.length}</h3>
                        <p style={{ margin: 0, color: "#666" }}>Documents Uploaded</p>
                    </div>
                    <div style={{
                        flex: 1, padding: "20px", background: "#f8f9fa",
                        borderRadius: "8px", textAlign: "center", border: "1px solid #dee2e6"
                    }}>
                        <h3 style={{ margin: 0, color: "#28a745" }}>Active</h3>
                        <p style={{ margin: 0, color: "#666" }}>Claude API Status</p>
                    </div>
                    <div style={{
                        flex: 1, padding: "20px", background: "#f8f9fa",
                        borderRadius: "8px", textAlign: "center", border: "1px solid #dee2e6"
                    }}>
                        <h3 style={{ margin: 0, color: "#6f42c1" }}>10MB</h3>
                        <p style={{ margin: 0, color: "#666" }}>Max File Size</p>
                    </div>
                </div>

                {/* How to use section */}
                <div style={{
                    background: "#e8f4fd", padding: "20px",
                    borderRadius: "8px", marginBottom: "30px",
                    border: "1px solid #bee5eb"
                }}>
                    <h3 style={{ marginTop: 0 }}>How to use DocChat AI</h3>
                    <p>1. Upload a PDF document using the button below</p>
                    <p>2. Click <strong>"Chat"</strong> on any document to start a conversation</p>
                    <p>3. Ask questions about your document — the AI answers from the content only</p>
                    <p>4. Your chat history is saved automatically</p>
                </div>

                {/* Upload Section */}
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
                    <span style={{ marginLeft: "10px", color: "#666", fontSize: "14px" }}>
                        Maximum file size: 10MB. PDF files only.
                    </span>
                </div>

                {/* Documents List */}
                <div>
                    {documents.length === 0 && (
                        <div style={{ textAlign: "center", padding: "40px", color: "#666" }}>
                            <p>No documents yet. Upload your first PDF to get started!</p>
                        </div>
                    )}
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
                                <p style={{ color: "#888", fontSize: "12px", margin: "4px 0 0" }}>
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
                            <button
                                onClick={() => handleDeleteDocument(doc.id)}
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
        </div>
    )
}