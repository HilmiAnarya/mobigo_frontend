import { createContext, useContext } from 'react';

// 1. The context object
export const AuthContext = createContext(null);

// 2. The custom hook to access the context
export const useAuth = () => {
    return useContext(AuthContext);
};