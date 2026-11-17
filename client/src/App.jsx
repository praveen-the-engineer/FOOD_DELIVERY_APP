
import { Routes, Route } from 'react-router-dom';

import Navbar from './components/Navbar';
import ProtectedRoute from './components/ProtectedRoute';

import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Cart from './pages/Cart';
import Checkout from './pages/Checkout';
import MyOrders from './pages/MyOrders';
import FoodDetails from './pages/FoodDetails';
import AIChat from './pages/AIChat';
import Favorite from './pages/Favorite';

import AdminDashboard from './pages/AdminDashboard';
import AdminFood from './pages/AdminFood';
import AdminOrders from './pages/AdminOrders';
import AdminSales from './pages/AdminSales';

function App() {
    return (
        <div>
            <Navbar />

            <Routes>
                {/* Customer Routes */}
                <Route path="/" element={<Home />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/cart" element={<Cart />} />
                <Route path="/checkout" element={<Checkout />} />
                <Route path="/my-orders" element={<MyOrders />} />
                <Route path="/food/:id" element={<FoodDetails />} />

                {/* Favourites */}
                <Route
                    path="/favorite"
                    element={
                        <ProtectedRoute allowedRole="customer">
                            <Favorite />
                        </ProtectedRoute>
                    }
                />

                {/* AI Food Assistant */}
                <Route path="/ai-assistant" element={<AIChat />} />

                {/* Admin Routes */}
                <Route
                    path="/admin"
                    element={
                        <ProtectedRoute allowedRole="admin">
                            <AdminDashboard />
                        </ProtectedRoute>
                    }
                />

                <Route
                    path="/admin/food"
                    element={
                        <ProtectedRoute allowedRole="admin">
                            <AdminFood />
                        </ProtectedRoute>
                    }
                />

                <Route
                    path="/admin/orders"
                    element={
                        <ProtectedRoute allowedRole="admin">
                            <AdminOrders />
                        </ProtectedRoute>
                    }
                />

                <Route
                    path="/admin/sales"
                    element={
                        <ProtectedRoute allowedRole="admin">
                            <AdminSales />
                        </ProtectedRoute>
                    }
                />
            </Routes>
        </div>
    );
}

export default App;
