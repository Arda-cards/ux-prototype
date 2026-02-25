'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Label } from '@frontend/components/ui/label';
import { Input } from '@frontend/components/ui/input';
import { Button } from '@frontend/components/ui/button';
import { TermsCheckbox } from '@frontend/components/ui/terms-checkbox';
import { Separator } from '@frontend/components/ui/separator';
import { FaGithub, FaGoogle, FaApple } from 'react-icons/fa';
import { Loader2 } from 'lucide-react';
import {
  CognitoIdentityProviderClient,
  SignUpCommand,
} from '@aws-sdk/client-cognito-identity-provider';
import { useRouter } from 'next/navigation';
import { RequiredAsterisk } from '@frontend/components/common/RequiredAsterisk';
import { PasswordInput } from '@frontend/components/common/PasswordInput';
import { useFormValidation } from '@frontend/hooks/useFormValidation';
import { generateSecretHash } from '@frontend/lib/utils';
import { validatePassword, PASSWORD_ERROR_MESSAGE } from '@frontend/lib/passwordValidation';

export default function SignUp() {
  const [givenName, setGivenName] = useState('');
  const [middleName, setMiddleName] = useState('');
  const [familyName, setFamilyName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [agree, setAgree] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  // Hide social signup options in production
  const isProduction = process.env.NEXT_PUBLIC_DEPLOY_ENV === 'PRODUCTION';

  const { errors, setErrors, validate } = useFormValidation({
    givenName,
    middleName,
    familyName,
    email,
    password,
  });

  const validateEmail = (email: string) =>
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const isValid = validate(
      {
        email: (value) =>
          !value
            ? 'Email is required'
            : !validateEmail(value)
            ? 'Invalid email address'
            : null,
        password: (value) =>
          !value
            ? 'Password is required'
            : !validatePassword(value)
            ? PASSWORD_ERROR_MESSAGE
            : null,
      },
      { givenName, middleName, familyName, email, password }
    );

    if (!agree) {
      alert('Please agree to the Terms & Conditions');
      return;
    }

    if (isValid) {
      setIsLoading(true);
      try {
        const client = new CognitoIdentityProviderClient({
          region: process.env.NEXT_PUBLIC_COGNITO_REGION,
        });

        const secretHash = await generateSecretHash(email);
        
        const clientMetadata: Record<string, string> = {};
        if (givenName.trim()) {
          clientMetadata.given_name = givenName.trim();
        }
        if (middleName.trim()) {
          clientMetadata.middle_name = middleName.trim();
        }
        if (familyName.trim()) {
          clientMetadata.family_name = familyName.trim();
        }

        // Build UserAttributes to save attributes in Cognito
        // Note: App Client must have write permissions for these attributes
        const userAttributes: Array<{ Name: string; Value: string }> = [
          { Name: 'email', Value: email },
        ];
        
        // Add name attributes to UserAttributes so they are saved in Cognito
        if (givenName.trim()) {
          userAttributes.push({ Name: 'given_name', Value: givenName.trim() });
        }
        if (middleName.trim()) {
          userAttributes.push({ Name: 'middle_name', Value: middleName.trim() });
        }
        if (familyName.trim()) {
          userAttributes.push({ Name: 'family_name', Value: familyName.trim() });
        }

        const command = new SignUpCommand({
          ClientId: process.env.NEXT_PUBLIC_COGNITO_CLIENT_ID,
          Username: email,
          Password: password,
          UserAttributes: userAttributes,
          ...(Object.keys(clientMetadata).length > 0 && { ClientMetadata: clientMetadata }),
          ...(secretHash && { SecretHash: secretHash }),
        });

        await client.send(command);
        router.push(`/signup/success?email=${encodeURIComponent(email)}`);
      } catch (error: unknown) {
        if (error instanceof Error && 'name' in error) {
          if (error.name === 'UsernameExistsException') {
            setErrors((prev) => ({
              ...prev,
              email: 'An account with this email already exists',
            }));
          } else if (error.name === 'InvalidPasswordException') {
            setErrors((prev) => ({
              ...prev,
              password: 'Password does not meet requirements',
            }));
          } else {
            alert('An error occurred during signup. Please try again.');
          }
        } else {
          alert('An error occurred during signup. Please try again.');
        }
        setIsLoading(false);
      }
    }
  };

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

      {/* Right Panel */}
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
              Create an account
            </h2>
            <p
              className='text-[14px] leading-5'
              style={{
                fontFamily: 'Geist',
                color: 'var(--base-muted-foreground, #737373)',
              }}
            >
              Let&apos;s get started. Fill in the details below to create your
              account.
            </p>
          </div>

          <form className='mt-6 space-y-4' onSubmit={handleSubmit} noValidate>
            <div className='space-y-2'>
              <Label
                htmlFor='givenName'
                className='text-[14px] font-medium'
                style={{
                  fontFamily: 'Geist',
                  color: 'var(--base-foreground, #0A0A0A)',
                }}
              >
                First name
              </Label>
              <Input
                id='givenName'
                value={givenName}
                onChange={(e) => {
                  setGivenName(e.target.value);
                  setErrors((prev) => ({ ...prev, givenName: '' }));
                }}
                placeholder='First name'
                className={`h-9 px-3 py-1 rounded-lg shadow-sm ${
                  errors.givenName
                    ? 'border border-red-500 shadow-[0_0_0_1px_rgba(239,68,68,0.5)]'
                    : 'border'
                } text-[14px] placeholder:text-[#737373]`}
                style={{
                  borderColor: errors.givenName
                    ? undefined
                    : 'var(--base-border, #E5E5E5)',
                  color: 'var(--base-muted-foreground, #737373)',
                }}
              />
              {errors.givenName && (
                <p className='text-red-500 text-sm'>{errors.givenName}</p>
              )}
            </div>

            <div className='space-y-2'>
              <Label
                htmlFor='middleName'
                className='text-[14px] font-medium'
                style={{
                  fontFamily: 'Geist',
                  color: 'var(--base-foreground, #0A0A0A)',
                }}
              >
                Middle name
              </Label>
              <Input
                id='middleName'
                value={middleName}
                onChange={(e) => {
                  setMiddleName(e.target.value);
                  setErrors((prev) => ({ ...prev, middleName: '' }));
                }}
                placeholder='Middle name'
                className={`h-9 px-3 py-1 rounded-lg shadow-sm ${
                  errors.middleName
                    ? 'border border-red-500 shadow-[0_0_0_1px_rgba(239,68,68,0.5)]'
                    : 'border'
                } text-[14px] placeholder:text-[#737373]`}
                style={{
                  borderColor: errors.middleName
                    ? undefined
                    : 'var(--base-border, #E5E5E5)',
                  color: 'var(--base-muted-foreground, #737373)',
                }}
              />
              {errors.middleName && (
                <p className='text-red-500 text-sm'>{errors.middleName}</p>
              )}
            </div>

            <div className='space-y-2'>
              <Label
                htmlFor='familyName'
                className='text-[14px] font-medium'
                style={{
                  fontFamily: 'Geist',
                  color: 'var(--base-foreground, #0A0A0A)',
                }}
              >
                Last name
              </Label>
              <Input
                id='familyName'
                value={familyName}
                onChange={(e) => {
                  setFamilyName(e.target.value);
                  setErrors((prev) => ({ ...prev, familyName: '' }));
                }}
                placeholder='Last name'
                className={`h-9 px-3 py-1 rounded-lg shadow-sm ${
                  errors.familyName
                    ? 'border border-red-500 shadow-[0_0_0_1px_rgba(239,68,68,0.5)]'
                    : 'border'
                } text-[14px] placeholder:text-[#737373]`}
                style={{
                  borderColor: errors.familyName
                    ? undefined
                    : 'var(--base-border, #E5E5E5)',
                  color: 'var(--base-muted-foreground, #737373)',
                }}
              />
              {errors.familyName && (
                <p className='text-red-500 text-sm'>{errors.familyName}</p>
              )}
            </div>

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
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  setErrors((prev) => ({ ...prev, email: '' }));
                }}
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
              value={password}
              onChange={(value) => {
                setPassword(value);
                setErrors((prev) => ({ ...prev, password: '' }));
              }}
              placeholder="Password"
              required={true}
              error={errors.password}
            />

            <TermsCheckbox
              checked={agree}
              onCheckedChange={setAgree}
              className='text-[14px]'
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
                  Sign up
                </div>
              ) : (
                'Sign up'
              )}
            </Button>
          </form>

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
              Already have an account?{' '}
              <Link
                href='/signin'
                className='underline hover:opacity-80'
                style={{ color: 'var(--base-primary, #FC5A29)' }}
              >
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
