import axios from "axios"

const API_URL = process.env.REACT_APP_API_URL

export const createSession = async (documentId, title, token) => {
    const response = await axios.post(
        `${API_URL}/chat/sessions`,
        { document_id: documentId, title },
        { headers: { Authorization: `Bearer ${token}` } }
    )
    return response.data
}

export const getSessions = async (token) => {
    const response = await axios.get(`${API_URL}/chat/sessions`, {
        headers: { Authorization: `Bearer ${token}` }
    })
    return response.data
}

export const deleteSession = async(sessionId, token) => {
    const response = await axios.delete(`${API_URL}/chat/sessions/${sessionId}`, {
        headers: { Authorization: `Bearer ${token}` }
    })
    return response.data
}

export const sendMessage = async (sessionId, message, token) => {
    const response = await axios.post(
        `${API_URL}/chat/message`,
        { session_id: sessionId, message },
        { headers: { Authorization: `Bearer ${token}` } }
    )
    return response.data
}

export const getMessages = async (sessionId, token) => {
    const response = await axios.get(
        `${API_URL}/chat/sessions/${sessionId}/messages`,
        { headers: { Authorization: `Bearer ${token}` } }
    )
    return response.data
}