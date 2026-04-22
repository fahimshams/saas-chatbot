import axios from "axios"

const API_URL = process.env.REACT_APP_API_URL

export const signup = async (data) => {
    const response = await axios.post(`${API_URL}/auth/signup`, data)
    return response.data
}

export const login = async (data) => {
    const response = await axios.post(`${API_URL}/auth/login`, data)
    return response.data
}