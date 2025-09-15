// File: src/pages/BookingListPage.jsx

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
// THE FIX: Import the default export without curly braces.
import apiClient from '../api';

const BookingListPage = () => {
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const navigate = useNavigate();

    useEffect(() => {
        const fetchBookings = async () => {
            try {
                const response = await apiClient.get('/bookings');
                setBookings(response.data || []);
            } catch (err) {
                console.error("Failed to fetch bookings:", err);
                setError('Failed to fetch booking requests.');
            } finally {
                setLoading(false);
            }
        };

        fetchBookings();
    }, []);

    if (loading) return <div>Loading booking requests...</div>;
    if (error) return <div className="text-red-500">{error}</div>;

    const handleRowClick = (id) => {
        navigate(`/bookings/${id}`);
    };

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold">Booking Requests</h1>
            </div>

            <div className="bg-white shadow-md rounded-lg overflow-hidden">
                <table className="min-w-full leading-normal">
                    <thead>
                    <tr>
                        <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                            Customer
                        </th>
                        <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                            Vehicle
                        </th>
                        <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                            Status
                        </th>
                        <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                            Date
                        </th>
                    </tr>
                    </thead>
                    <tbody>
                    {bookings.length > 0 ? (
                        bookings.map((booking) => (
                            <tr key={booking.id} onClick={() => handleRowClick(booking.id)} className="hover:bg-gray-50 cursor-pointer">
                                <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">
                                    <p className="text-gray-900 whitespace-no-wrap">{booking.user.full_name}</p>
                                    <p className="text-gray-600 whitespace-no-wrap text-xs">{booking.user.email}</p>
                                </td>
                                <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">
                                    <p className="text-gray-900 whitespace-no-wrap">{booking.vehicle.make} {booking.vehicle.model}</p>
                                </td>
                                <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">
                                     <span
                                         className={`relative inline-block px-3 py-1 font-semibold leading-tight rounded-full ${
                                             booking.status === 'confirmed' ? 'text-green-900 bg-green-200' :
                                                 booking.status === 'cancelled' ? 'text-red-900 bg-red-200' :
                                                     'text-yellow-900 bg-yellow-200'
                                         }`}
                                     >
                                        {booking.status}
                                    </span>
                                </td>
                                <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">
                                    <p className="text-gray-900 whitespace-no-wrap">
                                        {new Date(booking.created_at).toLocaleDateString('id-ID', { timeZone: 'Asia/Jakarta' })}
                                    </p>
                                </td>
                            </tr>
                        ))
                    ) : (
                        <tr>
                            <td colSpan="4" className="text-center py-10 text-gray-500">
                                No booking requests found.
                            </td>
                        </tr>
                    )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default BookingListPage;

