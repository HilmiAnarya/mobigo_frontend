import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import apiClient from '../api';

const VehicleFormPage = () => {
    // useParams hook gets URL parameters. e.g., /vehicles/edit/1 -> id will be "1"
    const { id } = useParams();
    const navigate = useNavigate();
    const isEditMode = Boolean(id);

    const [vehicle, setVehicle] = useState({
        make: '',
        model: '',
        year: new Date().getFullYear(),
        vin: '',
        price: 0,
        description: '',
        status: 'available',
    });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (isEditMode) {
            setLoading(true);
            apiClient.get(`/vehicles/${id}`)
                .then(response => {
                    setVehicle(response.data);
                    setLoading(false);
                })
                .catch(err => {
                    // FIX: We now log the specific error to the console.
                    console.error("Failed to fetch vehicle:", err);
                    setError('Failed to fetch vehicle data.');
                    setLoading(false);
                });
        }
    }, [id, isEditMode]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setVehicle(prevState => ({
            ...prevState,
            [name]: value,
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        // Simple validation
        if (!vehicle.make || !vehicle.model || !vehicle.vin || vehicle.price <= 0) {
            setError('Please fill in all required fields.');
            return;
        }

        try {
            if (isEditMode) {
                // Update existing vehicle
                await apiClient.put(`/vehicles/${id}`, vehicle);
            } else {
                // Create new vehicle
                await apiClient.post('/vehicles', vehicle);
            }
            navigate('/vehicles'); // Redirect to the list page on success
        } catch (err) {
            setError('Failed to save vehicle. Please try again.');
            console.error('Save vehicle error:', err);
        }
    };

    if (loading) return <div>Loading...</div>;

    return (
        <div>
            <h1 className="text-3xl font-bold text-gray-800 mb-6">
                {isEditMode ? 'Edit Vehicle' : 'Add New Vehicle'}
            </h1>
            <div className="bg-white p-8 rounded-lg shadow-md">
                <form onSubmit={handleSubmit}>
                    {error && <p className="bg-red-100 text-red-700 p-3 rounded mb-4 text-sm">{error}</p>}

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Make */}
                        <div>
                            <label htmlFor="make" className="block text-gray-700 font-bold mb-2">Make</label>
                            <input type="text" name="make" id="make" value={vehicle.make} onChange={handleChange} className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700" required />
                        </div>
                        {/* Model */}
                        <div>
                            <label htmlFor="model" className="block text-gray-700 font-bold mb-2">Model</label>
                            <input type="text" name="model" id="model" value={vehicle.model} onChange={handleChange} className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700" required />
                        </div>
                        {/* Year */}
                        <div>
                            <label htmlFor="year" className="block text-gray-700 font-bold mb-2">Year</label>
                            <input type="number" name="year" id="year" value={vehicle.year} onChange={handleChange} className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700" required />
                        </div>
                        {/* VIN */}
                        <div>
                            <label htmlFor="vin" className="block text-gray-700 font-bold mb-2">VIN</label>
                            <input type="text" name="vin" id="vin" value={vehicle.vin} onChange={handleChange} className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700" required />
                        </div>
                        {/* Price */}
                        <div>
                            <label htmlFor="price" className="block text-gray-700 font-bold mb-2">Price (IDR)</label>
                            <input type="number" name="price" id="price" value={vehicle.price} onChange={handleChange} className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700" required />
                        </div>
                        {/* Status */}
                        <div>
                            <label htmlFor="status" className="block text-gray-700 font-bold mb-2">Status</label>
                            <select name="status" id="status" value={vehicle.status} onChange={handleChange} className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700">
                                <option value="available">Available</option>
                                <option value="booked">Booked</option>
                                <option value="sold">Sold</option>
                            </select>
                        </div>
                        {/* Description */}
                        <div className="md:col-span-2">
                            <label htmlFor="description" className="block text-gray-700 font-bold mb-2">Description</label>
                            <textarea name="description" id="description" value={vehicle.description} onChange={handleChange} rows="4" className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700"></textarea>
                        </div>
                    </div>

                    <div className="mt-8 flex justify-end gap-4">
                        <Link to="/vehicles" className="bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded">
                            Cancel
                        </Link>
                        <button type="submit" className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
                            {isEditMode ? 'Update Vehicle' : 'Save Vehicle'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default VehicleFormPage;