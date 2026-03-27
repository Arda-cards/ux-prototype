import React, { useState, useCallback } from 'react';
import { setToken } from './token-store';

interface HypothesisLoginProps {
  onAuthenticated: () => void;
}

/**
 * A login-style form that prompts the user for their Hypothesis API token.
 * Renders as a standard form with a password field so that 1Password and
 * other password managers recognize it and offer to autofill.
 */
export function HypothesisLogin({ onAuthenticated }: HypothesisLoginProps): React.ReactElement {
  const [token, setTokenValue] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      const trimmed = token.trim();
      if (!trimmed) {
        setError('Please enter your API token.');
        return;
      }
      setToken(trimmed);
      onAuthenticated();
    },
    [token, onAuthenticated],
  );

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 200000,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      }}
    >
      <div
        style={{
          backgroundColor: '#fff',
          borderRadius: 12,
          padding: '32px 36px',
          maxWidth: 420,
          width: '100%',
          boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)',
        }}
      >
        <div style={{ marginBottom: 20 }}>
          <h2 style={{ margin: '0 0 4px', fontSize: 18, fontWeight: 600, color: '#1a1a2e' }}>
            Connect to Hypothesis
          </h2>
          <p style={{ margin: 0, fontSize: 13, color: '#6b7280', lineHeight: 1.5 }}>
            Enter your Hypothesis API token to sync annotations.
          </p>
        </div>

        <div
          style={{
            backgroundColor: '#f0f4ff',
            border: '1px solid #dbeafe',
            borderRadius: 8,
            padding: '12px 14px',
            marginBottom: 20,
            fontSize: 13,
            lineHeight: 1.6,
            color: '#374151',
          }}
        >
          <strong style={{ display: 'block', marginBottom: 4 }}>How to get your token:</strong>
          1. Open your{' '}
          <a
            href="https://hypothes.is/account/developer"
            target="_blank"
            rel="noopener noreferrer"
            style={{ color: '#4338ca', textDecoration: 'underline' }}
          >
            Hypothesis developer settings
          </a>
          <br />
          2. Click <strong>Generate your API token</strong>
          <br />
          3. Copy the token and paste it below
          <br />
          <span style={{ fontSize: 12, color: '#6b7280' }}>
            Tip: Save it in 1Password for this site to autofill next time.
          </span>
        </div>

        {/* Standard form structure for password-manager recognition */}
        <form onSubmit={handleSubmit} autoComplete="on">
          {/*
           * Hidden username field anchors the credential to "hypothesis".
           * Password managers use this to associate the saved entry with
           * the correct service when offering autofill suggestions.
           */}
          <input
            type="text"
            name="username"
            autoComplete="username"
            value="hypothesis"
            readOnly
            tabIndex={-1}
            aria-hidden="true"
            style={{
              position: 'absolute',
              width: 1,
              height: 1,
              padding: 0,
              margin: -1,
              overflow: 'hidden',
              clip: 'rect(0, 0, 0, 0)',
              border: 0,
            }}
          />
          <label
            htmlFor="hypothesis-token"
            style={{
              display: 'block',
              fontSize: 13,
              fontWeight: 500,
              color: '#374151',
              marginBottom: 6,
            }}
          >
            API Token
          </label>
          <input
            id="hypothesis-token"
            name="password"
            type="password"
            autoComplete="current-password"
            placeholder="Paste your Hypothesis API token"
            value={token}
            onChange={(e) => {
              setTokenValue(e.target.value);
              setError('');
            }}
            style={{
              width: '100%',
              padding: '10px 12px',
              fontSize: 14,
              border: error ? '1px solid #ef4444' : '1px solid #d1d5db',
              borderRadius: 8,
              outline: 'none',
              boxSizing: 'border-box',
              transition: 'border-color 0.15s',
            }}
            onFocus={(e) => {
              if (!error) e.currentTarget.style.borderColor = '#6366f1';
            }}
            onBlur={(e) => {
              if (!error) e.currentTarget.style.borderColor = '#d1d5db';
            }}
            autoFocus
          />
          {error && <p style={{ margin: '6px 0 0', fontSize: 12, color: '#ef4444' }}>{error}</p>}

          <button
            type="submit"
            style={{
              marginTop: 16,
              width: '100%',
              padding: '10px 0',
              fontSize: 14,
              fontWeight: 600,
              color: '#fff',
              backgroundColor: '#4338ca',
              border: 'none',
              borderRadius: 8,
              cursor: 'pointer',
              transition: 'background-color 0.15s',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = '#3730a3';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = '#4338ca';
            }}
          >
            Connect
          </button>
        </form>
      </div>
    </div>
  );
}
