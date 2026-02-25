'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback, useMemo } from 'react';
import { useAuth } from '@frontend/store/hooks/useAuth';
import { decodeJWTPayload, CognitoJWTPayload, extractUserContext } from '@frontend/lib/jwt';

interface JWTContextType {
  token: string | null;
  payload: CognitoJWTPayload | null;
  userContext: {
    userId: string;
    email: string;
    name: string;
    tenantId: string;
    role: string;
    author: string;
  } | null;
  isTokenValid: boolean;
  refreshTokenData: () => Promise<void>;
  updatePayloadAttributes: (attributes: Partial<CognitoJWTPayload>) => void;
}

const JWTContext = createContext<JWTContextType | undefined>(undefined);

interface JWTProviderProps {
  children: ReactNode;
}

export function JWTProvider({ children }: JWTProviderProps) {
  const { user } = useAuth();
  
  const [token, setToken] = useState<string | null>(null);
  const [payload, setPayload] = useState<CognitoJWTPayload | null>(null);
  const [userContext, setUserContext] = useState<JWTContextType['userContext']>(null);
  const [isTokenValid, setIsTokenValid] = useState(false);

  // Simple token data refresh - just reads from localStorage
  const refreshTokenData = useCallback(async () => {
    const idToken = localStorage.getItem('idToken');
    
    if (!idToken) {
      setToken(null);
      setPayload(null);
      setUserContext(null);
      setIsTokenValid(false);
      return;
    }

    try {
      const decodedPayload = decodeJWTPayload(idToken);
      
      if (decodedPayload) {
        // Check if token is not expired (with 5-minute buffer)
        // Aligned with token refresh window for consistency
        const now = Date.now() / 1000;
        const fiveMinutesBuffer = 5 * 60;
        const isValid = decodedPayload.exp > (now + fiveMinutesBuffer);
        
        if (isValid) {
          const context = extractUserContext(decodedPayload);
          
          setToken(idToken);
          setPayload(decodedPayload);
          setUserContext(context);
          setIsTokenValid(true);
        } else {
          setToken(null);
          setPayload(null);
          setUserContext(null);
          setIsTokenValid(false);
        }
      } else {
        setToken(null);
        setPayload(null);
        setUserContext(null);
        setIsTokenValid(false);
      }
    } catch {
      setToken(null);
      setPayload(null);
      setUserContext(null);
      setIsTokenValid(false);
    }
  }, []);

  // Update payload attributes manually (e.g., after updating user attributes)
  const updatePayloadAttributes = useCallback((attributes: Partial<CognitoJWTPayload>) => {
    setPayload((currentPayload) => {
      if (!currentPayload) return null;
      
      const updatedPayload = { ...currentPayload, ...attributes };
      const context = extractUserContext(updatedPayload);
      setUserContext(context);
      
      return updatedPayload;
    });
  }, []);

  // Update token data when user changes
  useEffect(() => {
    if (user) {
      // User is logged in, refresh token data
      refreshTokenData();
    } else {
      // User is logged out, clear token data
      setToken(null);
      setPayload(null);
      setUserContext(null);
      setIsTokenValid(false);
    }
  }, [user, refreshTokenData]);

  const contextValue = useMemo<JWTContextType>(() => ({
    token,
    payload,
    userContext,
    isTokenValid,
    refreshTokenData,
    updatePayloadAttributes,
  }), [token, payload, userContext, isTokenValid, refreshTokenData, updatePayloadAttributes]);

  return (
    <JWTContext.Provider value={contextValue}>
      {children}
    </JWTContext.Provider>
  );
}

export const useJWT = () => {
  const context = useContext(JWTContext);
  if (context === undefined) {
    throw new Error('useJWT must be used within a JWTProvider');
  }
  return context;
};
