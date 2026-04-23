import axios from "axios"

const API_URL = process.env.REACT_APP_API_URL

export const uploadDocument = async (file, token) => {
    const formData = new FormData()
    formData.append("file", file)

    const response = await axios.post(`${API_URL}/documents/upload`, formData, {
        headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data"
        }
    })
    return response.data
}

export const getDocuments = async (token) => {
    const response = await axios.get(`${API_URL}/documents/`, {
        headers: { Authorization: `Bearer ${token}` }
    })
    return response.data
}

export const deleteDocuments = async (documentId, token) => {
    const response = await axios.delete(`${API_URL}/documents/${documentId}`, {
        headers: { Authorization: `Bearer ${token}` }
    })
    return response.data
}