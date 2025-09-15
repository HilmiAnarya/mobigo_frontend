import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import apiClient from '../api';

const AgreementPage = () => {
    const { bookingId } = useParams();
    const navigate = useNavigate();
    const [booking, setBooking] = useState(null);

    // Form state
    const [finalPrice, setFinalPrice] = useState(0);
    const [paymentType, setPaymentType] = useState('full_payment'); // Default to full_payment
    const [terms, setTerms] = useState('');

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        // Fetch the booking details to pre-fill the price
        apiClient.get(`/bookings/${bookingId}`)
            .then(response => {
                setBooking(response.data);
                setFinalPrice(response.data.vehicle.price || 0);
                setLoading(false);
            })
            .catch(err => {
                console.error("Failed to load booking data:", err);
                setError('Failed to load booking data.');
                setLoading(false);
            });
    }, [bookingId]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        try {
            const payload = {
                booking_id: parseInt(bookingId),
                final_price: parseFloat(finalPrice),
                payment_type: paymentType, // Send the selected payment type
                terms,
            };
            await apiClient.post('/agreements', payload);
            alert('Agreement created successfully!');
            navigate(`/bookings/${bookingId}`); // Go back to the detail page
        } catch (err) {
            console.error("Failed to create agreement:", err);
            setError(err.response?.data?.error || 'Failed to create agreement.');
            setLoading(false);
        }
    };

    if (loading) return <div>Loading...</div>;
    if (error) return <div className="text-red-500 p-4">{error}</div>;
    if (!booking) return <div>Booking not found.</div>;

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold">Create Agreement</h1>
                <Link to={`/bookings/${bookingId}`} className="text-blue-500 hover:underline">&larr; Back to Booking</Link>
            </div>
            <form onSubmit={handleSubmit} className="bg-white p-8 rounded-lg shadow-md max-w-2xl mx-auto">
                <div className="mb-4">
                    <label htmlFor="finalPrice" className="block text-gray-700 font-bold mb-2">Final Price (IDR)</label>
                    <input
                        type="number"
                        id="finalPrice"
                        value={finalPrice}
                        onChange={(e) => setFinalPrice(e.target.value)}
                        className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700"
                        required
                    />
                </div>

                {/* --- NEW: Payment Type Selection --- */}
                <div className="mb-4">
                    <label htmlFor="paymentType" className="block text-gray-700 font-bold mb-2">Payment Type</label>
                    <select
                        id="paymentType"
                        value={paymentType}
                        onChange={(e) => setPaymentType(e.target.value)}
                        className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700"
                    >
                        <option value="full_payment">Full Payment</option>
                        <option value="installment">Installment</option>
                    </select>
                </div>

                <div className="mb-6">
                    <label htmlFor="terms" className="block text-gray-700 font-bold mb-2">Terms & Conditions</label>
                    <textarea
                        id="terms"
                        rows="4"
                        value={terms}
                        onChange={(e) => setTerms(e.target.value)}
                        className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700"
                        placeholder="e.g., Full payment required within 7 days."
                        required
                    />
                </div>
                <div className="flex items-center justify-end">
                    <button type="submit" disabled={loading} className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
                        {loading ? 'Saving...' : 'Create Agreement'}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default AgreementPage;