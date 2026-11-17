import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

function ProtectedRoute({ children, allowedRole }) {
    const { user, token } = useAuth();

    console.log('ProtectedRoute user:', user);
    console.log('ProtectedRoute role:', user?.role);
    console.log('ProtectedRoute token:', !!token);

    if (!token || !user) {
        return <Navigate to="/login" replace />;
    }

    if (user.role !== allowedRole) {
        return <Navigate to="/" replace />;
    }

    return children;
}

export default ProtectedRoute;