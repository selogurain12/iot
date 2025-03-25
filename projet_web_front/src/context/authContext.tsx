import React, { createContext, useState, useContext, ReactNode, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';

export interface User {
	id: string;
	firstname: string;
	name: string;
	email: string;
    password: string;
}

interface AuthContextType {
    user: User | null;
    token: string;
    signIn: (userData: User, token: string, expiresIn: number) => void;
    signOut: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

// eslint-disable-next-line react-refresh/only-export-components
export const useAuth = (): AuthContextType => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};

interface AuthProviderProps {
    children: ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
    const [user, setUser] = useState<User | null>(null);
    const [token, setToken] = useState<string>("");
	const navigate = useNavigate();

	const signOut = useCallback(() => {
        setToken("");
        setUser(null);

        localStorage.removeItem("authToken");
        localStorage.removeItem("authUser");
        localStorage.removeItem("authExpiresAt");

        navigate("/");
    }, [navigate]);

    useEffect(() => {
        const storedToken = localStorage.getItem("authToken");
        const storedUser = localStorage.getItem("authUser");
        const expiresAt = localStorage.getItem("authExpiresAt");
    
        if (storedToken && storedUser && expiresAt) {
            const now = new Date().getTime();
            if (now > parseInt(expiresAt, 10)) {
                signOut();
            } else {
                setToken(storedToken);
    
                // Check if storedUser is valid JSON
                try {
                    const userData = JSON.parse(storedUser);
                    setUser(userData);
                } catch (error) {
                    console.error("Error parsing stored user:", error);
                    signOut(); // If parsing fails, log out the user
                }
            }
        }
    }, [signOut]);    

    const signIn = (userData: User, tokenData: string, expiresIn: number) => {
		const expiresAt = new Date().getTime() + expiresIn * 1000;

		setToken(tokenData);
		setUser(userData);

		localStorage.setItem("authToken", tokenData);
		localStorage.setItem("authUser", JSON.stringify(userData));
		localStorage.setItem("authExpiresAt", expiresAt.toString());
	};
	
    const value = { user, token, signIn, signOut };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};