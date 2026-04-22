import { createContext, useState, useContext } from "react"

const AuthContext = createContext()

export function AuthProvider({children}){
    const [user, setUser] = useState(
        JSON.parse(sessionStorage.getItem("user")) || null
    )

      const [token, setToken] = useState(
        sessionStorage.getItem("token") || null
    )

    const login = (userData, accessToken) => {
        setUser(userData)
        setToken(accessToken)
        sessionStorage.setItem("user", JSON.stringify(userData))
        sessionStorage.setItem("token", accessToken)
    }

    const logout = () => {
        setUser(null)
        setToken(null)
        sessionStorage.removeItem("user")
        sessionStorage.removeItem("token")
    }

   return (
        <AuthContext.Provider value={{ user, token, login, logout }}>
            {children}
        </AuthContext.Provider>
    )

}

export function useAuth() {
    return useContext(AuthContext)
}