import { Link, useNavigate } from "react-router-dom"
import { useAuth } from "../context/AuthContext"

export default function Navbar() {
    const { user, logout } = useAuth()
    const navigate = useNavigate()

    const handleLogout = () => {
        logout()
        navigate("/login")
    }

    return (
        <nav style={{
            background: "#1a1a2e",
            padding: "15px 30px",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center"
        }}>
            <Link to="/dashboard" style={{ color: "white", textDecoration: "none", fontSize: "20px", fontWeight: "bold" }}>
                DocChat AI
            </Link>

            <div style={{ display: "flex", gap: "20px", alignItems: "center" }}>
                <Link to="/dashboard" style={{ color: "white", textDecoration: "none" }}>
                    Documents
                </Link>
                <Link to="/history" style={{ color: "white", textDecoration: "none" }}>
                    History
                </Link>
                <Link to="/profile" style={{ color: "white", textDecoration: "none" }}>
                    {user?.firstname} {user?.lastname}
                </Link>
                <button
                    onClick={handleLogout}
                    style={{
                        padding: "8px 16px",
                        background: "#e74c3c",
                        color: "white",
                        border: "none",
                        borderRadius: "6px",
                        cursor: "pointer"
                    }}
                >
                    Logout
                </button>
            </div>
        </nav>
    )
}