// File: src/pages/VehicleFormPage.jsx

import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import apiClient from '../api';

const VehicleFormPage = () => {
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
        images: [],
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [selectedFile, setSelectedFile] = useState(null);
    const [uploading, setUploading] = useState(false);

    useEffect(() => {
        if (isEditMode) {
            setLoading(true);
            apiClient.get(`/vehicles/${id}`)
                .then(response => {
                    const vehicleData = { ...response.data, images: response.data.images || [] };
                    setVehicle(vehicleData);
                    setLoading(false);
                })
                .catch(err => {
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
            [name]: (name === 'price' || name === 'year') ? parseFloat(value) || 0 : value,
        }));
    };

    const handleFileChange = (e) => {
        setSelectedFile(e.target.files[0]);
    };

    const handleUpload = async () => {
        if (!selectedFile) return;
        if (!isEditMode) return;

        const formData = new FormData();
        formData.append('image', selectedFile);
        setUploading(true);
        setError('');

        try {
            await apiClient.post(`/vehicles/${id}/images`, formData, {
                headers: { 'Content-Type': 'multipart/form-data' },
            });
            const response = await apiClient.get(`/vehicles/${id}`);
            setVehicle({ ...response.data, images: response.data.images || [] });
            setSelectedFile(null);
        } catch (err) {
            console.error("Failed to upload image:", err);
            setError('Failed to upload image.');
        } finally {
            setUploading(false);
        }
    };

    const handleDeleteImage = async (imageId) => {
        if (!window.confirm('Are you sure you want to delete this image?')) return;
        try {
            await apiClient.delete(`/images/${imageId}`);
            setVehicle(prevState => ({
                ...prevState,
                images: prevState.images.filter(img => img.id !== imageId), // THE FIX
            }));
        } catch (err) {
            console.error("Failed to delete image:", err);
            setError('Failed to delete image.');
        }
    };

    const handleSetPrimary = async (imageId) => {
        try {
            await apiClient.put(`/images/${imageId}/primary`);
            const response = await apiClient.get(`/vehicles/${id}`);
            setVehicle({ ...response.data, images: response.data.images || [] });
        } catch (err) {
            console.error("Failed to set primary image:", err);
            setError('Failed to set primary image.');
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        const { images, ...payload } = vehicle;

        try {
            if (isEditMode) {
                await apiClient.put(`/vehicles/${id}`, payload);
            } else {
                await apiClient.post('/vehicles', payload);
            }
            navigate('/vehicles');
        } catch (err) {
            console.error("Failed to save vehicle:", err);
            setError('Failed to save vehicle. Please check the details and try again.');
            setLoading(false);
        }
    };

    if (loading && !vehicle.make) return <div>Loading...</div>;

    return (
        <div>
            <h1 className="text-3xl font-bold mb-6">{isEditMode ? 'Edit Vehicle' : 'Add New Vehicle'}</h1>
            {error && <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">{error}</div>}

            <form onSubmit={handleSubmit} className="bg-white shadow-md rounded-lg p-8">
                {/* Form fields remain the same */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label htmlFor="make" className="block text-gray-700 font-bold mb-2">Make</label>
                        <input type="text" name="make" id="make" value={vehicle.make} onChange={handleChange} className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" required />
                    </div>
                    <div>
                        <label htmlFor="model" className="block text-gray-700 font-bold mb-2">Model</label>
                        <input type="text" name="model" id="model" value={vehicle.model} onChange={handleChange} className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" required />
                    </div>
                    <div>
                        <label htmlFor="year" className="block text-gray-700 font-bold mb-2">Year</label>
                        <input type="number" name="year" id="year" value={vehicle.year} onChange={handleChange} className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" required />
                    </div>
                    <div>
                        <label htmlFor="price" className="block text-gray-700 font-bold mb-2">Price (IDR)</label>
                        <input type="number" step="0.01" name="price" id="price" value={vehicle.price} onChange={handleChange} className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" required />
                    </div>
                    <div className="md:col-span-2">
                        <label htmlFor="vin" className="block text-gray-700 font-bold mb-2">VIN</label>
                        <input type="text" name="vin" id="vin" value={vehicle.vin} onChange={handleChange} className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" required />
                    </div>
                    <div className="md:col-span-2">
                        <label htmlFor="description" className="block text-gray-700 font-bold mb-2">Description</label>
                        <textarea name="description" id="description" value={vehicle.description} onChange={handleChange} rows="4" className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"></textarea>
                    </div>
                    <div>
                        <label htmlFor="status" className="block text-gray-700 font-bold mb-2">Status</label>
                        <select name="status" id="status" value={vehicle.status} onChange={handleChange} className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline">
                            <option value="available">Available</option>
                            <option value="booked">Booked</option>
                            <option value="sold">Sold</option>
                        </select>
                    </div>
                </div>
                <div className="mt-8 flex items-center justify-end">
                    <button type="button" onClick={() => navigate('/vehicles')} className="bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline mr-2">
                        Cancel
                    </button>
                    <button type="submit" disabled={loading} className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline disabled:bg-blue-300">
                        {loading ? 'Saving...' : (isEditMode ? 'Update Vehicle' : 'Save Vehicle')}
                    </button>
                </div>
            </form>

            {isEditMode && (
                <div className="mt-10 bg-white shadow-md rounded-lg p-8">
                    <h2 className="text-2xl font-bold mb-4">Image Management</h2>
                    <div className="mb-6 border-b pb-6">
                        <h3 className="text-lg font-semibold mb-2">Upload New Image</h3>
                        <div className="flex items-center space-x-4">
                            <input type="file" onChange={handleFileChange} className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"/>
                            <button onClick={handleUpload} disabled={uploading || !selectedFile} className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline disabled:bg-green-300">
                                {uploading ? 'Uploading...' : 'Upload'}
                            </button>
                        </div>
                    </div>
                    <div>
                        <h3 className="text-lg font-semibold mb-4">Existing Images</h3>
                        {vehicle.images.length > 0 ? (
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                {vehicle.images.map(image => (
                                    <div key={image.id}
                                         className={`relative border-4 rounded-lg ${image.is_primary ? 'border-green-500' : 'border-transparent'}`}> {/* THE FIX */}
                                        <img src={`http://localhost:8080${image.image_url}`} alt="Vehicle"
                                             className="w-full h-32 object-cover rounded"/> {/* THE FIX */}
                                        <div
                                            className="absolute top-0 right-0 p-1 bg-black bg-opacity-50 rounded-bl-lg">
                                            {image.is_primary && <span title="Primary Image"
                                               className="text-yellow-400 text-xs">⭐</span>} {/* THE FIX */}
                                        </div>
                                        <div
                                            className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-50 p-2 flex justify-center space-x-2">
                                            <button onClick={() => handleSetPrimary(image.id)}
                                                    disabled={image.is_primary}
                                                    className="text-white text-xs disabled:text-gray-500">Set Primary
                                            </button>
                                            {/* THE FIX */}
                                            <button onClick={() => handleDeleteImage(image.id)}
                                                    className="text-red-400 hover:text-red-600 text-xs">Delete
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p className="text-gray-500">No images have been uploaded for this vehicle.</p>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default VehicleFormPage;

