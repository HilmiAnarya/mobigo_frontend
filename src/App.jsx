import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './components/AuthProvider';
import { useAuth } from './auth';

import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import VehicleListPage from './pages/VehicleListPage';
import VehicleFormPage from './pages/VehicleFormPage'; // <-- Import the new page
import DashboardLayout from './components/DashboardLayout';

const ProtectedRoute = ({ children }) => {
    const auth = useAuth();
    if (!auth.isAuthenticated) {
        return <Navigate to="/login" />;
    }
    return children;
};

function App() {
    return (
        <AuthProvider>
            <Router>
                <Routes>
                    <Route path="/login" element={<LoginPage />} />

                    <Route
                        path="/"
                        element={
                            <ProtectedRoute>
                                <DashboardLayout />
                            </ProtectedRoute>
                        }
                    >
                        <Route index element={<DashboardPage />} />
                        <Route path="vehicles" element={<VehicleListPage />} />
                        <Route path="vehicles/add" element={<VehicleFormPage />} /> {/* <-- Add route */}
                        <Route path="vehicles/edit/:id" element={<VehicleFormPage />} /> {/* <-- Edit route */}
                    </Route>

                    <Route path="*" element={<Navigate to="/" />} />
                </Routes>
            </Router>
        </AuthProvider>
    );
}

export default App;