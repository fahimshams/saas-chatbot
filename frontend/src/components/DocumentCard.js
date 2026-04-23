import { deleteDocument } from "../services/documents"

const handleDeleteDocument = async (documentId) => {
    if (!window.confirm("Are you sure? This will delete the document and all its chat history.")) return
    
    try {
        await deleteDocument(documentId, token)
        await loadDocuments()
    } catch (err) {
        setError("Failed to delete document")
    }
}

// Inside document card, next to Chat button:
<div style={{ display: "flex", gap: "10px" }}>
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