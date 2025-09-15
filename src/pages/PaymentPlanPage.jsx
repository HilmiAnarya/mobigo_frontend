// File: src/pages/PaymentPlanPage.jsx

import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import apiClient from '../api';

const PaymentPlanPage = () => {
    const { agreementId } = useParams();
    const navigate = useNavigate();

    const [agreement, setAgreement] = useState(null);
    const [downPayment, setDownPayment] = useState(0);
    const [tenor, setTenor] = useState(11);
    const [interestRate, setInterestRate] = useState(12);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    // We need to fetch the agreement to know the final price
    useEffect(() => {
        // This is a placeholder. We would need a GET /api/agreements/:id endpoint
        // For now, we'll fetch the booking which contains the agreement
        // A better long-term solution is a dedicated agreement endpoint
        const fetchAgreementDetails = async () => {
            // We need to find the booking that this agreement belongs to. This is tricky.
            // For now, let's assume the user comes from the booking page and we pass the price.
            // This is a simplification. We will need to build a better data flow later.
            setLoading(false); // Placeholder
        };
        fetchAgreementDetails();
    }, [agreementId]);


    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        try {
            const bookingId = new URLSearchParams(window.location.search).get('bookingId');
            const bookingResponse = await apiClient.get(`/bookings/${bookingId}`);
            const fetchedAgreement = bookingResponse.data.agreement;

            const payload = {
                agreement_id: parseInt(agreementId),
                total_price: parseFloat(fetchedAgreement.final_price),
                down_payment: parseFloat(downPayment),
                tenor: parseInt(tenor),
                annual_interest_rate: parseFloat(interestRate),
            };
            await apiClient.post('/payments/generate-plan', payload);
            alert('Payment plan generated successfully!');
            navigate(`/bookings/${bookingId}`);
        } catch (err) {
            setError('Failed to generate payment plan.');
            setLoading(false);
        }
    };

    if (loading) return <div>Loading...</div>;
    if (error) return <div className="text-red-500">{error}</div>;

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold">Generate Installment Plan</h1>
                <Link to={`/bookings/${new URLSearchParams(window.location.search).get('bookingId')}`} className="text-blue-500 hover:underline">&larr; Back to Booking</Link>
            </div>
            <form onSubmit={handleSubmit} className="bg-white p-8 rounded-lg shadow-md">
                <div className="mb-4">
                    <label htmlFor="downPayment" className="block text-gray-700 font-bold mb-2">Down Payment (DP)</label>
                    <input
                        type="number"
                        id="downPayment"
                        value={downPayment}
                        onChange={(e) => setDownPayment(e.target.value)}
                        className="shadow appearance-none border rounded w-full py-2 px-3"
                        required
                    />
                </div>
                <div className="mb-4">
                    <label htmlFor="tenor" className="block text-gray-700 font-bold mb-2">Tenor (in Months)</label>
                    <input
                        type="number"
                        id="tenor"
                        value={tenor}
                        onChange={(e) => setTenor(e.target.value)}
                        className="shadow appearance-none border rounded w-full py-2 px-3"
                        required
                    />
                </div>
                <div className="mb-6">
                    <label htmlFor="interestRate" className="block text-gray-700 font-bold mb-2">Annual Interest Rate (%)</label>
                    <input
                        type="number"
                        step="0.1"
                        id="interestRate"
                        value={interestRate}
                        onChange={(e) => setInterestRate(e.target.value)}
                        className="shadow appearance-none border rounded w-full py-2 px-3"
                        required
                    />
                </div>
                <div className="flex items-center justify-end">
                    <button type="submit" disabled={loading} className="bg-purple-500 hover:bg-purple-700 text-white font-bold py-2 px-4 rounded">
                        {loading ? 'Generating...' : 'Generate Plan'}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default PaymentPlanPage;
