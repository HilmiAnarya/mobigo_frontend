import React, { useState, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import apiClient from '../api';

const BookingDetailPage = () => {
    const { id } = useParams();
    const [booking, setBooking] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    const fetchBookingDetails = async () => {
        setLoading(true);
        try {
            const response = await apiClient.get(`/bookings/${id}`);
            setBooking(response.data);
        } catch (err) {
            console.error("Failed to fetch booking details:", err);
            setError('Failed to fetch booking details.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchBookingDetails();
    }, [id]);

    const handleConfirm = async () => {
        if (!booking.proposed_datetime) {
            alert("Customer has not proposed a time yet.");
            return;
        }
        const notes = window.prompt("Add any internal notes for this schedule (optional):", "Confirmed via Admin Panel");
        if (notes === null) return; // User cancelled the prompt

        try {
            await apiClient.post(`/bookings/${id}/confirm`, { notes });
            alert("Schedule Confirmed! The vehicle is now booked.");
            fetchBookingDetails();
        } catch (err) {
            setError(err.response?.data?.error || 'Failed to confirm schedule.');
        }
    };

    const handleDecline = async () => {
        if (!booking.proposed_datetime) {
            alert("Customer has not proposed a time yet.");
            return;
        }
        const reason = window.prompt("Please provide a reason for declining. This will be shown to the customer to request a new time.");
        if (reason) {
            try {
                await apiClient.put(`/bookings/${id}/decline`, { reason });
                alert("Booking declined. The customer will be prompted to reschedule.");
                fetchBookingDetails();
            } catch (err) {
                setError(err.response?.data?.error || 'Failed to decline booking.');
            }
        }
    };

    const handleCancel = async () => {
        if (!window.confirm("Are you sure you want to CANCEL this booking entirely? This action cannot be undone.")) return;
        try {
            await apiClient.put(`/bookings/${id}/status`, { status: 'cancelled' });
            alert("Booking has been cancelled.");
            fetchBookingDetails();
        } catch (err) {
            setError(err.response?.data?.error || 'Failed to cancel booking.');
        }
    };

    if (loading) return <div className="text-center p-10">Loading...</div>;
    if (error) return <div className="text-red-500 text-center p-10">{error}</div>;
    if (!booking) return <div className="text-center p-10">Booking not found.</div>;

    const isPending = booking.status === 'pending';
    const isConfirmed = booking.status === 'confirmed';
    const hasAgreement = !!booking.agreement;
    const isInstallmentAgreement = hasAgreement && booking.agreement.payment_type === 'installment';

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold">Booking Details</h1>
                <Link to="/bookings" className="text-blue-500 hover:underline">&larr; Back to Booking List</Link>
            </div>

            <div className="bg-white p-4 rounded-lg shadow-md mb-6 flex items-center space-x-4 flex-wrap gap-2">
                <h2 className="text-lg font-semibold">Actions:</h2>
                {isPending && (
                    <>
                        <button onClick={handleConfirm} disabled={!booking.proposed_datetime} className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded disabled:bg-gray-400">
                            Confirm Schedule
                        </button>
                        <button onClick={handleDecline} disabled={!booking.proposed_datetime} className="bg-orange-500 hover:bg-orange-700 text-white font-bold py-2 px-4 rounded disabled:bg-gray-400">
                            Decline / Reschedule
                        </button>
                    </>
                )}
                {isConfirmed && !hasAgreement && (
                    <Link to={`/bookings/${booking.id}/create-agreement`} className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
                        Create Agreement
                    </Link>
                )}
                {isInstallmentAgreement && (
                    <Link to={`/agreements/${booking.agreement.id}/generate-plan?bookingId=${booking.id}`} className="bg-purple-500 hover:bg-purple-700 text-white font-bold py-2 px-4 rounded">
                        Generate Installment Plan
                    </Link>
                )}
                {(isPending || isConfirmed) && (
                    <button onClick={handleCancel} className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded">
                        Cancel Booking
                    </button>
                )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="md:col-span-1 bg-white p-6 rounded-lg shadow-md">
                    <h2 className="text-xl font-bold mb-4 border-b pb-2">Customer Information</h2>
                    <p><strong>Name:</strong> {booking.user.full_name}</p>
                    <p><strong>Email:</strong> {booking.user.email}</p>
                    <p><strong>Phone:</strong> {booking.user.phone_number}</p>
                </div>

                <div className="md:col-span-2 bg-white p-6 rounded-lg shadow-md">
                    <h2 className="text-xl font-bold mb-4 border-b pb-2">Vehicle Information</h2>
                    <p><strong>Make & Model:</strong> {booking.vehicle.make} {booking.vehicle.model} ({booking.vehicle.year})</p>
                    <p><strong>VIN:</strong> {booking.vehicle.vin}</p>
                    <p><strong>Listed Price:</strong> {new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(booking.vehicle.price)}</p>
                </div>
                <div className="md:col-span-3 bg-white p-6 rounded-lg shadow-md">
                    <h2 className="text-xl font-bold mb-4 border-b pb-2">Booking & Schedule Status</h2>
                    <p><strong>Booking Status:</strong>
                        <span className={`ml-2 px-2 py-1 text-sm font-semibold rounded-full ${
                            booking.status === 'confirmed' ? 'bg-green-200 text-green-800' :
                                booking.status === 'cancelled' ? 'bg-red-200 text-red-800' :
                                    booking.status === 'reschedule_requested' ? 'bg-blue-200 text-blue-800' :
                                        'bg-yellow-200 text-yellow-800'}`}>
                            {booking.status.replace('_', ' ')}
                        </span>
                    </p>
                    <p><strong>Proposed Meetup:</strong> {booking.proposed_datetime ? new Date(booking.proposed_datetime).toLocaleString('id-ID') : 'Not yet proposed by customer'}</p>
                    {booking.status === 'reschedule_requested' && booking.decline_reason && (
                        <p className="text-orange-600 mt-2"><strong>Reschedule Reason:</strong> {booking.decline_reason}</p>
                    )}
                    {hasAgreement && (
                        <div className="mt-4 p-4 bg-gray-50 rounded">
                            <h3 className="font-bold">Agreement Created</h3>
                            <p><strong>Payment Type:</strong> <span className="font-semibold">{booking.agreement.payment_type.replace('_', ' ')}</span></p>
                            <p><strong>Final Price:</strong> {new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(booking.agreement.final_price)}</p>
                            <p><strong>Terms:</strong> {booking.agreement.terms}</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default BookingDetailPage;