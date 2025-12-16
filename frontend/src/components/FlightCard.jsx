// src/components/FlightCard.jsx

import React, { useState } from 'react';
import axios from 'axios';
import { useWallet } from '../context/WalletContext';

const API_BASE = 'http://localhost:3001/api';

const FlightCard = ({ flight }) => {
    const { updateBalance, balance } = useWallet();
    const [finalPrice, setFinalPrice] = useState(flight.current_price || flight.base_price);
    const [isSurged, setIsSurged] = useState(false);
    const [status, setStatus] = useState(null); // success, error, loading
    const [errorMsg, setErrorMsg] = useState('');

    // Step 1: Check for Dynamic Price (Simulates a booking 'attempt')
    const handleCheckPriceAndBook = async () => {
        setStatus('loading');
        setErrorMsg('');

        try {
            // This 'attempt' POST call triggers the backend's surge pricing logic
            const priceRes = await axios.post(`${API_BASE}/flights/calculate-price/${flight.flight_id}`);
            
            const newPrice = priceRes.data.finalPrice;
            const surged = priceRes.data.isSurged;
            
            setFinalPrice(newPrice);
            setIsSurged(surged);

            // Immediately proceed to book with the calculated price
            handleBooking(newPrice);

        } catch (err) {
            setStatus('error');
            setErrorMsg(err.response?.data?.error || 'Failed to check price.');
        }
    };

    // Step 2: Final Booking
    const handleBooking = async (price) => {
        if (price > balance) {
            setStatus('error');
            setErrorMsg('Insufficient wallet balance to complete this booking.'); // Requirement 3 validation
            return;
        }

        try {
            const bookRes = await axios.post(`${API_BASE}/book/${flight.flight_id}`, {
                passengerName: 'Jane Doe', // Simplified
                finalPrice: price,
            });

            // Success (Requirement 3 & 4)
            setStatus('success');
            updateBalance(bookRes.data.newBalance); // Update wallet context
            alert(`Booking Success! PNR: ${bookRes.data.pnr}`);
            
            // Trigger PDF download after success
            window.open(`${API_BASE}/ticket/${bookRes.data.pnr}/pdf`, '_blank');


        } catch (err) {
            setStatus('error');
            setErrorMsg(err.response?.data?.error || 'Booking failed.');
        }
    };

    return (
        <div className="bg-white p-6 rounded-xl shadow-md flex items-center justify-between transition-all hover:shadow-lg border-l-4 border-indigo-500">
            <div>
                <div className="text-xl font-bold text-gray-800">
                    {flight.airline} <span className="text-sm font-normal text-gray-500">({flight.flight_id})</span>
                </div>
                <div className="text-sm text-gray-600 mt-1">
                    {flight.departure_city} → {flight.arrival_city}
                </div>
            </div>

            <div className="text-right">
                <div className="text-3xl font-extrabold text-red-600">
                    ₹{finalPrice.toLocaleString('en-IN')}
                </div>
                {/* Dynamic Pricing Indicator (Bonus) */}
                {isSurged && (
                    <div className="text-sm text-red-500 font-semibold mt-1 animate-pulse">
                        ⚠️ 10% Surge Applied!
                    </div>
                )}
                <div className="text-sm text-gray-500">
                    Base Price: ₹{flight.base_price.toLocaleString('en-IN')}
                </div>
            </div>

            <div className="flex flex-col items-end space-y-2">
                <button
                    onClick={handleCheckPriceAndBook}
                    disabled={status === 'loading'}
                    className={`px-6 py-3 rounded-lg font-bold text-white transition duration-150 ${
                        status === 'loading'
                            ? 'bg-gray-400 cursor-not-allowed'
                            : 'bg-green-600 hover:bg-green-700'
                    }`}
                >
                    {status === 'loading' ? 'Processing...' : 'Book Now'}
                </button>
                {status === 'error' && (
                    <p className="text-red-500 text-xs mt-1 w-48 text-right">
                        {errorMsg}
                    </p>
                )}
            </div>
        </div>
    );
};

export default FlightCard;