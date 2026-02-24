'use client';

import { useCallback } from 'react';
import { useAppSelector, useAppDispatch } from '../hooks';
import {
  selectIdToken,
  selectJwtPayload,
  selectUserContext,
  selectIsTokenValid,
} from '../selectors/authSelectors';
import { setJwtPayload, setUserContext, setIsTokenValid } from '../slices/authSlice';
import { checkAuthThunk } from '../thunks/authThunks';
import { extractUserContext, type CognitoJWTPayload } from '@frontend/lib/jwt';

/**
 * useJWT hook - Redux-based JWT hook
 * Replaces the Context-based useJWT hook
 *
 * This hook provides the same interface as the Context version for backward compatibility
 * during migration.
 */
export function useJWT() {
  const dispatch = useAppDispatch();
  const token = useAppSelector(selectIdToken);
  const payload = useAppSelector(selectJwtPayload);
  const userContext = useAppSelector(selectUserContext);
  const isTokenValid = useAppSelector(selectIsTokenValid);

  const refreshTokenData = useCallback(async () => {
    await dispatch(checkAuthThunk());
  }, [dispatch]);

  const updatePayloadAttributes = useCallback(
    (attributes: Partial<CognitoJWTPayload>) => {
      if (!payload) return;

      const updatedPayload = { ...payload, ...attributes };
      const context = extractUserContext(updatedPayload);

      dispatch(setJwtPayload(updatedPayload));
      dispatch(setUserContext(context));

      // Update token validity based on expiration
      const now = Date.now() / 1000;
      const fiveMinutesBuffer = 5 * 60;
      const isValid = updatedPayload.exp > (now + fiveMinutesBuffer);
      dispatch(setIsTokenValid(isValid));
    },
    [dispatch, payload]
  );

  return {
    token,
    payload,
    userContext,
    isTokenValid,
    refreshTokenData,
    updatePayloadAttributes,
  };
}
