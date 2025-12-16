// src/pages/Home.jsx

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import FlightCard from '../components/FlightCard';
import { useWallet } from '../context/WalletContext';

const API_BASE = 'http://localhost:3001/api';

const Home = () => {
    const [flights, setFlights] = useState([]);
    const [searchParams, setSearchParams] = useState({ departure_city: '', arrival_city: '' });
    const { balance } = useWallet();

    const fetchFlights = async (params = {}) => {
        try {
            const res = await axios.get(`${API_BASE}/flights/search`, { params });
            setFlights(res.data);
        } catch (err) {
            console.error('Search failed:', err);
        }
    };

    useEffect(() => {
        fetchFlights(); // Initial load
    }, []);

    const handleSearch = (e) => {
        e.preventDefault();
        fetchFlights(searchParams);
    };

    return (
        <div className="container mx-auto p-4">
            <h1 className="text-3xl font-bold text-indigo-700 mb-6">✈️ Flight Search</h1>
            
            {/* Wallet Display (Requirement 3) */}
            <div className="bg-green-100 p-3 rounded-lg mb-6 border border-green-300">
                <span className="text-lg font-semibold text-green-800">
                    Wallet Balance: ₹{balance.toLocaleString('en-IN')}
                </span>
            </div>

            {/* Search Form (Bonus) */}
            <form onSubmit={handleSearch} className="bg-white p-6 rounded-xl shadow-lg mb-8 flex space-x-4">
                <input
                    type="text"
                    placeholder="Departure City"
                    value={searchParams.departure_city}
                    onChange={(e) => setSearchParams({ ...searchParams, departure_city: e.target.value })}
                    className="flex-grow p-3 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500"
                />
                <input
                    type="text"
                    placeholder="Arrival City"
                    value={searchParams.arrival_city}
                    onChange={(e) => setSearchParams({ ...searchParams, arrival_city: e.target.value })}
                    className="flex-grow p-3 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500"
                />
                <button type="submit" className="bg-indigo-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-indigo-700 transition duration-150">
                    Search Flights
                </button>
            </form>

            {/* Flight Results */}
            <div className="space-y-4">
                {flights.map(flight => (
                    <FlightCard key={flight.flight_id} flight={flight} />
                ))}
            </div>
        </div>
    );
};

export default Home;