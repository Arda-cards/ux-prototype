import { render, screen, fireEvent } from '@testing-library/react';
import { PasswordInput } from './PasswordInput';

jest.mock('@/lib/passwordValidation', () => ({
  validatePassword: jest.fn().mockReturnValue(true),
  getPasswordValidationDetails: jest.fn().mockReturnValue({
    minLength: true,
    hasUppercase: true,
    hasLowercase: true,
    hasNumber: true,
    hasSpecialChar: true,
    noSpaces: true,
  }),
  PASSWORD_REQUIREMENTS_TEXT: 'Password requirements text',
}));

describe('PasswordInput', () => {
  const defaultProps = {
    id: 'password',
    label: 'Password',
    value: '',
    onChange: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders with label and password input', () => {
    render(<PasswordInput {...defaultProps} />);
    expect(screen.getByText('Password')).toBeInTheDocument();
    const input = screen.getByPlaceholderText('Password');
    expect(input).toHaveAttribute('type', 'password');
  });

  it('toggles visibility on eye icon click', () => {
    render(<PasswordInput {...defaultProps} value="secret" />);
    const input = screen.getByPlaceholderText('Password');
    expect(input).toHaveAttribute('type', 'password');

    const toggleButton = screen.getByRole('button', { name: 'Show password' });
    fireEvent.click(toggleButton);
    expect(input).toHaveAttribute('type', 'text');

    const hideButton = screen.getByRole('button', { name: 'Hide password' });
    fireEvent.click(hideButton);
    expect(input).toHaveAttribute('type', 'password');
  });

  it('calls onChange with input value', () => {
    const onChange = jest.fn();
    render(<PasswordInput {...defaultProps} onChange={onChange} />);
    const input = screen.getByPlaceholderText('Password');
    fireEvent.change(input, { target: { value: 'abc' } });
    expect(onChange).toHaveBeenCalledWith('abc');
  });

  it('shows error message when error prop is provided', () => {
    render(<PasswordInput {...defaultProps} error="Password is required" />);
    expect(screen.getByText('Password is required')).toBeInTheDocument();
  });
});
