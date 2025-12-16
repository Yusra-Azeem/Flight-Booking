// src/context/WalletContext.js

import React, { createContext, useState, useContext } from 'react';
import axios from 'axios';

const API_BASE = 'http://localhost:3001/api';

const WalletContext = createContext();

export const useWallet = () => useContext(WalletContext);

export const WalletProvider = ({ children }) => {
    const [balance, setBalance] = useState(50000); // Default balance (₹50,000)
    const [error, setError] = useState(null);

    // In a real app, this would fetch the user's balance from the API
    const fetchBalance = async () => {
        // ... API call to GET /api/user/wallet ...
        // setBalance(response.data.balance);
    };

    // This is called after a successful booking
    const updateBalance = (newBalance) => {
        setBalance(newBalance);
    };

    return (
        <WalletContext.Provider value={{ balance, updateBalance, fetchBalance, error }}>
            {children}
        </WalletContext.Provider>
    );
};