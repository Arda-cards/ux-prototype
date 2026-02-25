'use client';

import { useState, Suspense, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Label } from '@frontend/components/ui/label';
import { Input } from '@frontend/components/ui/input';
import { Button } from '@frontend/components/ui/button';
import { Separator } from '@frontend/components/ui/separator';
import { FaGithub, FaGoogle, FaApple } from 'react-icons/fa';
import { Loader2 } from 'lucide-react';
import { useAuth } from '@frontend/store/hooks/useAuth';
import { useRouter, useSearchParams } from 'next/navigation';
import { RequiredAsterisk } from '@frontend/components/common/RequiredAsterisk';
import { PasswordInput } from '@frontend/components/common/PasswordInput';
import { useFormValidation } from '@frontend/hooks/useFormValidation';

function SignInComponent() {
  const [isLoading, setIsLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [authError, setAuthError] = useState('');
  const { signIn, respondToNewPasswordChallenge, user, loading, error: authContextError, checkAuth } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [requiresNewPassword, setRequiresNewPassword] = useState(false);
  const [passwordChallengeSession, setPasswordChallengeSession] = useState<string>('');

  const [values, setValues] = useState({
    email: '',
    password: '',
    newPassword: '',
    confirmNewPassword: '',
  });

  const { errors, setErrors, validate } = useFormValidation(values);

  // Hide social signin options in production
  const isProduction = process.env.NEXT_PUBLIC_DEPLOY_ENV === 'PRODUCTION';

  useEffect(() => {
    if (user) {
      // Check if there's a 'next' parameter to redirect to after signin
      const next = searchParams.get('next');
      if (next) {
        router.push(decodeURIComponent(next));
      } else {
        router.push('/items?justSignedIn=true');
      }
    }

    const verified = searchParams.get('verified');
    const signup = searchParams.get('signup');
    const email = searchParams.get('email');

    if (verified === 'true') {
      setSuccessMessage('Email verified successfully! You can now sign in.');
      router.replace('/signin');
    } else if (signup === 'success') {
      setSuccessMessage(
        `Account created successfully! You can now sign in${
          email ? ` with ${email}` : ''
        }.`
      );
      router.replace('/signin');
    }
  }, [user, router, searchParams]);

  // Handle authentication errors from AuthContext
  useEffect(() => {
    if (authContextError) {
      if (authContextError.includes('Invalid email or password')) {
        setAuthError('Password or account incorrect');
      } else if (authContextError.includes('Please confirm your email')) {
        setAuthError('Please verify your email before signing in');
      } else {
        setAuthError(authContextError);
      }
      setIsLoading(false);
    }
  }, [authContextError]);

  const validateEmail = (email: string) =>
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  const handleChange =
    (field: 'email' | 'password') =>
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setValues({ ...values, [field]: e.target.value });
      setErrors((prev) => ({ ...prev, [field]: '' }));
      setAuthError(''); // Clear auth error when user starts typing
    };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const isValid = validate(
      {
        email: (value) =>
          !value
            ? 'Email is required'
            : !validateEmail(value)
            ? 'Email address is not valid'
            : null,
        password: (value) =>
          !value
            ? 'Password is required'
            : value.length >= 8
            ? null
            : 'Password must be at least eight characters',
      },
      values
    );

    if (!isValid) return;

    setIsLoading(true);
    setAuthError(''); // Clear any previous auth error
    
    try {
      const result = await signIn({ email: values.email, password: values.password });
      
      // Check if new password is required
      if (result && 'requiresNewPassword' in result && result.requiresNewPassword) {
        // Store email in localStorage so respondToNewPasswordChallenge can access it
        localStorage.setItem('userEmail', values.email);
        setRequiresNewPassword(true);
        setPasswordChallengeSession(result.session || '');
        setIsLoading(false);
        return;
      }
    } catch {
      // Error handling is done by AuthContext
    }
    
    setIsLoading(false);
  };

  const handleNewPasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Defensive checks
    if (!values.newPassword || values.newPassword.trim().length < 8) {
      setAuthError('Password must be at least eight characters');
      return;
    }

    if (!values.confirmNewPassword || values.newPassword !== values.confirmNewPassword) {
      setAuthError('Passwords do not match');
      return;
    }

    if (!passwordChallengeSession || passwordChallengeSession.trim().length === 0) {
      setAuthError('Session expired. Please sign in again.');
      return;
    }

    if (!respondToNewPasswordChallenge) {
      setAuthError('Authentication service unavailable. Please try again later.');
      return;
    }

    setIsLoading(true);
    setAuthError('');

    try {
      console.log('[SignIn] Calling respondToNewPasswordChallenge with session:', passwordChallengeSession.substring(0, 20) + '...');
      await respondToNewPasswordChallenge(passwordChallengeSession, values.newPassword);
      console.log('[SignIn] Password challenge completed successfully');
      
      // Verify tokens are saved before redirecting
      const accessToken = localStorage.getItem('accessToken');
      const idToken = localStorage.getItem('idToken');
      console.log('[SignIn] Tokens verification after password challenge:', {
        accessTokenPresent: !!accessToken,
        idTokenPresent: !!idToken,
        accessTokenLength: accessToken?.length || 0,
      });
      
      if (!accessToken || !idToken) {
        console.error('[SignIn] Tokens not found after password challenge');
        setAuthError('Failed to save authentication tokens. Please try signing in again.');
        setIsLoading(false);
        return;
      }
      
      // Wait a bit longer to ensure tokens are fully saved and state is updated
      console.log('[SignIn] Waiting for tokens to be fully saved...');
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Verify tokens are still available
      const finalAccessToken = localStorage.getItem('accessToken');
      const finalIdToken = localStorage.getItem('idToken');
      console.log('[SignIn] Final token verification:', {
        accessTokenPresent: !!finalAccessToken,
        idTokenPresent: !!finalIdToken,
        accessTokenLength: finalAccessToken?.length || 0,
        idTokenLength: finalIdToken?.length || 0,
      });
      
      if (!finalAccessToken || !finalIdToken) {
        console.error('[SignIn] Tokens not found after password challenge');
        setAuthError('Failed to save authentication tokens. Please try signing in again.');
        setIsLoading(false);
        return;
      }
      
      // Refresh auth state to ensure user is set correctly
      console.log('[SignIn] Refreshing auth state after password challenge');
      await checkAuth();
      
      // Wait a bit more for state to update
      await new Promise(resolve => setTimeout(resolve, 300));
      
      // Force a FULL page refresh (not just navigation) to ensure all components re-initialize
      // This ensures localStorage is read fresh and all contexts are re-initialized
      console.log('[SignIn] Redirecting to dashboard with full page refresh');
      window.location.href = '/items?justSignedIn=true';
    } catch (error) {
      console.error('[SignIn] Error in handleNewPasswordSubmit:', error);
      // Error handling is done by AuthContext, but we can also show it here
      if (error && typeof error === 'object' && 'message' in error) {
        setAuthError((error as { message: string }).message || 'Failed to set new password');
      } else {
        setAuthError('Failed to set new password. Please try again.');
      }
      setIsLoading(false);
    }
  };

  if (loading) {
    return (
      <div className='flex items-center justify-center min-h-screen'>
        <h2 className='text-2xl font-semibold mb-4'>Loading...</h2>
      </div>
    );
  }

  return (
    <div className='min-h-screen grid grid-cols-1 md:grid-cols-2 overflow-hidden'>
      {/* Left Panel */}
      <div className='hidden md:flex relative overflow-hidden bg-[#FC5A29]'>
        {/* Background solid layer */}
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            background: '#FC5A29',
            zIndex: 0,
          }}
        />

        {/* Diagonal gradient overlay */}
        <div
          style={{
            position: 'absolute',
            top: 0,
            right: -600,
            width: 613,
            height: 1025,
            background:
              'linear-gradient(180deg, rgba(255, 255, 255, 0.10) 0%, rgba(252, 90, 41, 0.20) 68%)',
            transform: 'skewX(-35deg)',
            transformOrigin: 'top right',
            zIndex: 1,
          }}
        />

        {/* Logo */}
        <div className='relative z-10 p-8'>
          <Image
            src='/images/ArdaLogoV1.svg'
            alt='Logo'
            width={40}
            height={40}
          />
        </div>
      </div>

      {/* Right */}
      <div className='flex items-center justify-center px-6 py-10 bg-white'>
        <div className='w-full max-w-sm'>
          {/* Mobile logo */}
          <div className='mb-8 md:hidden'>
            <Image
              src='/images/ArdaLogoMobileV1.svg'
              alt='Logo'
              width={40}
              height={40}
              className='mb-4'
            />
          </div>

          <div className='flex flex-col items-start gap-3'>
            <h2
              className='text-[30px] font-bold leading-[36px]'
              style={{
                fontFamily: 'Geist',
                color: 'var(--base-foreground, #0A0A0A)',
              }}
            >
              Sign in
            </h2>
            <p
              className='text-[14px] leading-5'
              style={{
                fontFamily: 'Geist',
                color: 'var(--base-muted-foreground, #737373)',
              }}
            >
              Never run out of anything. Get started with Arda.
            </p>
          </div>

          {successMessage && (
            <div className='mt-4 p-3 bg-green-50 border border-green-200 rounded-lg'>
              <p className='text-green-800 text-sm'>{successMessage}</p>
            </div>
          )}

          {requiresNewPassword ? (
            <div className='mt-6 space-y-4'>
              <div className='p-4 bg-blue-50 border border-blue-200 rounded-lg'>
                <h3 className='text-lg font-semibold text-blue-900 mb-2'>
                  New Password Required
                </h3>
                <p className='text-sm text-blue-800'>
                  Your account was created with a temporary password. Please set a new password to continue.
                </p>
              </div>
              <form onSubmit={handleNewPasswordSubmit} className='space-y-4' noValidate>
                <PasswordInput
                  id="newPassword"
                  label="New Password"
                  value={values.newPassword}
                  onChange={(value) => setValues({ ...values, newPassword: value })}
                  placeholder="Enter new password"
                  required={true}
                  error={values.newPassword && values.newPassword.length < 8 ? 'Password must be at least eight characters' : ''}
                />
                <PasswordInput
                  id="confirmNewPassword"
                  label="Confirm New Password"
                  value={values.confirmNewPassword}
                  onChange={(value) => setValues({ ...values, confirmNewPassword: value })}
                  placeholder="Confirm new password"
                  required={true}
                  error={values.confirmNewPassword && values.newPassword !== values.confirmNewPassword ? 'Passwords do not match' : ''}
                />
                <Button
                  type='submit'
                  className='w-full text-sm'
                  disabled={isLoading}
                  style={{
                    backgroundColor: 'var(--base-primary, #FC5A29)',
                    color: 'var(--base-primary-foreground, #FAFAFA)',
                  }}
                >
                  {isLoading ? (
                    <div className='flex items-center justify-center gap-2'>
                      <Loader2 className='w-4 h-4 animate-spin' />
                      Setting password...
                    </div>
                  ) : (
                    'Set New Password'
                  )}
                </Button>
                {authError && (
                  <div className='mt-4 p-3 bg-red-50 border border-red-200 rounded-lg'>
                    <p className='text-red-800 text-sm text-center'>{authError}</p>
                  </div>
                )}
              </form>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className='mt-6 space-y-4' noValidate>
            <div className='space-y-2'>
              <Label
                htmlFor='email'
                className='text-[14px] font-medium'
                style={{
                  fontFamily: 'Geist',
                  color: 'var(--base-foreground, #0A0A0A)',
                }}
              >
                Email <RequiredAsterisk />
              </Label>
              <Input
                id='email'
                type='email'
                value={values.email}
                onChange={handleChange('email')}
                placeholder='Email'
                className={`h-9 px-3 py-1 rounded-lg shadow-sm ${
                  errors.email
                    ? 'border border-red-500 shadow-[0_0_0_1px_rgba(239,68,68,0.5)]'
                    : 'border'
                } text-[14px] placeholder:text-[#737373]`}
                style={{
                  borderColor: errors.email
                    ? undefined
                    : 'var(--base-border, #E5E5E5)',
                  color: 'var(--base-muted-foreground, #737373)',
                }}
              />
              {errors.email && (
                <p className='text-red-500 text-sm'>{errors.email}</p>
              )}
            </div>

            <PasswordInput
              id="password"
              label="Password"
              value={values.password}
              onChange={(value) => setValues({ ...values, password: value })}
              placeholder="Password"
              required={true}
              error={errors.password}
            />
            <Button
              type='submit'
              className='w-full text-sm'
              disabled={isLoading}
              style={{
                backgroundColor: 'var(--base-primary, #FC5A29)',
                color: 'var(--base-primary-foreground, #FAFAFA)',
              }}
            >
              {isLoading ? (
                <div className='flex items-center justify-center gap-2'>
                  <Loader2 className='w-4 h-4 animate-spin' />
                  Sign in
                </div>
              ) : (
                'Sign in'
              )}
            </Button>

            {authError && (
              <div className='mt-4 p-3 bg-red-50 border border-red-200 rounded-lg'>
                <p className='text-red-800 text-sm text-center'>{authError}</p>
              </div>
            )}
          </form>
          )}

          {!isProduction && (
            <>
              <div className='my-6 w-full'>
                <div className='relative flex items-center justify-center w-full'>
                  <Separator className='absolute left-0 right-0 top-1/2 -translate-y-1/2' />
                  <span className='relative z-10 bg-white px-3 text-xs text-muted-foreground'>
                    OR SIGN IN WITH
                  </span>
                </div>
              </div>

              <div className='flex justify-between gap-4'>
                <Button variant='outline' className='flex-1 justify-center'>
                  <FaGithub className='w-4 h-4' />
                </Button>
                <Button variant='outline' className='flex-1 justify-center'>
                  <FaGoogle className='w-4 h-4' />
                </Button>
                <Button variant='outline' className='flex-1 justify-center'>
                  <FaApple className='w-4 h-4' />
                </Button>
              </div>
            </>
          )}

          <div
            className='mt-6 flex flex-col items-center gap-2 text-[14px] leading-5'
            style={{ fontFamily: 'Geist' }}
          >
            <p className='text-sm text-muted-foreground'>
              Forgot your password?{' '}
              <Link
                href='/reset-password'
                className='underline hover:opacity-80'
                style={{ color: 'var(--base-primary, #FC5A29)' }}
              >
                Reset password
              </Link>
            </p>
            <p className='text-sm text-muted-foreground'>
              Don&apos;t have an account?{' '}
              <Link
                href='/signup'
                className='underline hover:opacity-80'
                style={{ color: 'var(--base-primary, #FC5A29)' }}
              >
                Sign up
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function SignIn() {
  return (
    <Suspense
      fallback={
        <div className='flex items-center justify-center min-h-screen'>
          <div className='text-center'>
            <h2 className='text-2xl font-semibold mb-4'>Loading...</h2>
          </div>
        </div>
      }
    >
      <SignInComponent />
    </Suspense>
  );
}
