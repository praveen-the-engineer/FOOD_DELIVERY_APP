
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Navbar.css';

function Navbar() {
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    return (
        <nav className="navbar">
            <Link to="/" className="logo">
                Foodie<span>.</span>
            </Link>

            <div className="nav-links">
                <Link to="/">Home</Link>
                <Link to="/favorite">Favourites</Link>
                <Link to="/cart">Cart</Link>
                <Link to="/my-orders">My Orders</Link>

                {/* Admin Dashboard - Only visible to admins */}
                {user?.role === 'admin' && (
                    <Link to="/admin">Admin Dashboard</Link>
                )}
            </div>

            <div className="nav-auth">
                {user ? (
                    <>
                        <span className="user-name">
                            Hi, {user.name}
                        </span>

                        <button
                            className="logout-btn"
                            onClick={handleLogout}
                        >
                            Logout
                        </button>
                    </>
                ) : (
                    <Link to="/login" className="login-btn">
                        Login
                    </Link>
                )}
            </div>
        </nav>
    );
}

export default Navbar;
