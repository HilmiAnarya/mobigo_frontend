import React from 'react';
import { Link, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../auth';

const DashboardLayout = () => {
    const auth = useAuth();
    const navigate = useNavigate();

    const handleLogout = () => {
        auth.logout();
        navigate('/login');
    };

    return (
        <div className="min-h-screen flex">
            <aside className="w-64 bg-gray-800 text-white flex-shrink-0">
                <div className="p-4 text-2xl font-bold">MobiGO</div>
                <nav className="mt-6">
                    <Link to="/" className="block py-2.5 px-4 rounded transition duration-200 hover:bg-gray-700">Dashboard</Link>
                    <Link to="/vehicles" className="block py-2.5 px-4 rounded transition duration-200 hover:bg-gray-700">Vehicles</Link>
                    <Link to="/bookings" className="block py-2.5 px-4 rounded transition duration-200 hover:bg-gray-700">Bookings</Link> {/* <-- Add new link */}
                </nav>
            </aside>
            <div className="flex-1 flex flex-col">
                <header className="flex justify-end items-center p-4 bg-white border-b">
                    <button onClick={handleLogout} className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded">
                        Logout
                    </button>
                </header>
                <main className="flex-1 p-6 bg-gray-100">
                    <Outlet />
                </main>
            </div>
        </div>
    );
};

export default DashboardLayout;