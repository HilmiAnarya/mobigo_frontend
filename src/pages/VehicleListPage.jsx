import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import apiClient from '../api';

const VehicleListPage = () => {
    const [vehicles, setVehicles] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    // State for the delete confirmation modal
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [vehicleToDelete, setVehicleToDelete] = useState(null);

    const fetchVehicles = async () => {
        try {
            setLoading(true);
            const response = await apiClient.get('/vehicles');
            setVehicles(response.data);
        } catch (err) {
            setError('Failed to fetch vehicles. Please try again later.');
            console.error('Fetch vehicles error:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchVehicles();
    }, []);

    // --- Delete Logic ---

    const openDeleteModal = (vehicle) => {
        setVehicleToDelete(vehicle);
        setIsModalOpen(true);
    };

    const closeDeleteModal = () => {
        setVehicleToDelete(null);
        setIsModalOpen(false);
    };

    const handleDeleteVehicle = async () => {
        if (!vehicleToDelete) return;

        try {
            await apiClient.delete(`/vehicles/${vehicleToDelete.id}`);
            // On success, filter out the deleted vehicle from the local state
            // to instantly update the UI without a full page reload.
            setVehicles(vehicles.filter(v => v.id !== vehicleToDelete.id));
            closeDeleteModal();
        } catch (err) {
            setError('Failed to delete vehicle. It might be part of an active booking.');
            console.error('Delete vehicle error:', err);
            closeDeleteModal(); // Close modal even on error
        }
    };


    if (loading) return <div>Loading vehicles...</div>;
    if (error) return <div className="text-red-500 bg-red-100 p-4 rounded mb-4">{error}</div>;

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold text-gray-800">Vehicle Management</h1>
                <Link
                    to="/vehicles/add"
                    className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded"
                >
                    Add New Vehicle
                </Link>
            </div>

            <div className="bg-white shadow-md rounded-lg overflow-hidden">
                <table className="min-w-full leading-normal">
                    {/* ... table head is the same ... */}
                    <thead>
                    <tr>
                        <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Make & Model</th>
                        <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Year</th>
                        <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Price</th>
                        <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Status</th>
                        <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100"></th>
                    </tr>
                    </thead>
                    <tbody>
                    {vehicles.map((vehicle) => (
                        <tr key={vehicle.id}>
                            <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">
                                <p className="text-gray-900 whitespace-no-wrap font-bold">{vehicle.make} {vehicle.model}</p>
                                <p className="text-gray-600 whitespace-no-wrap">{vehicle.vin}</p>
                            </td>
                            <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">
                                <p className="text-gray-900 whitespace-no-wrap">{vehicle.year}</p>
                            </td>
                            <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">
                                <p className="text-gray-900 whitespace-no-wrap">
                                    {new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(vehicle.price)}
                                </p>
                            </td>
                            <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">
                  <span className={`relative inline-block px-3 py-1 font-semibold leading-tight ${
                      vehicle.status === 'available' ? 'text-green-900' : 'text-yellow-900'
                  }`}>
                    <span aria-hidden className={`absolute inset-0 ${
                        vehicle.status === 'available' ? 'bg-green-200' : 'bg-yellow-200'
                    } opacity-50 rounded-full`}></span>
                    <span className="relative">{vehicle.status}</span>
                  </span>
                            </td>
                            <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm text-right">
                                <Link to={`/vehicles/edit/${vehicle.id}`} className="text-indigo-600 hover:text-indigo-900">Edit</Link>
                                {/* Updated Delete button to open the modal */}
                                <button onClick={() => openDeleteModal(vehicle)} className="text-red-600 hover:text-red-900 ml-4">Delete</button>
                            </td>
                        </tr>
                    ))}
                    </tbody>
                </table>
            </div>

            {/* Delete Confirmation Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
                    <div className="bg-white p-6 rounded-lg shadow-xl">
                        <h2 className="text-lg font-bold">Confirm Deletion</h2>
                        <p className="mt-2">Are you sure you want to delete the vehicle: <span className="font-semibold">{vehicleToDelete?.make} {vehicleToDelete?.model}</span>?</p>
                        <p className="text-sm text-gray-600">This action cannot be undone.</p>
                        <div className="mt-6 flex justify-end gap-4">
                            <button onClick={closeDeleteModal} className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded">
                                Cancel
                            </button>
                            <button onClick={handleDeleteVehicle} className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded">
                                Delete
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default VehicleListPage;