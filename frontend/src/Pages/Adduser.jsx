import React, { useState } from 'react';
import axios from 'axios';

const Register = () => {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errors, setErrors] = useState({});
  const [successMessage, setSuccessMessage] = useState('');

  const validateForm = () => {
    let formErrors = {};

    if (!username.trim()) {
      formErrors.username = 'Username is required';
    }

    if (!email.trim()) {
      formErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      formErrors.email = 'Email address is invalid';
    }

    if (!password) {
      formErrors.password = 'Password is required';
    } else if (password.length < 6) {
      formErrors.password = 'Password must be at least 6 characters';
    }

    if (!confirmPassword) {
      formErrors.confirmPassword = 'Confirm your password';
    } else if (confirmPassword !== password) {
      formErrors.confirmPassword = 'Passwords do not match';
    }

    setErrors(formErrors);
    return Object.keys(formErrors).length === 0;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (validateForm()) {
      try {
        const response = await axios.post('https://example.com/api/register', {
          username,
          email,
          password,
        });
        console.log('Registration successful:', response.data);
        setSuccessMessage('Registration successful! Please log in.');
        // Reset the form
        setUsername('');
        setEmail('');
        setPassword('');
        setConfirmPassword('');
        setErrors({});
      } catch (err) {
        console.error('Registration failed:', err);
        setErrors({ apiError: 'Registration failed. Please try again.' });
      }
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="max-w-md w-full bg-white p-8 rounded-lg shadow-lg">
        <div className="flex justify-center">
          <img
            alt="Logo"
            src="https://tailwindui.com/img/logos/mark.svg?color=indigo&shade=600"
            className="h-12 w-12"
          />
        </div>
        <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
          Create your account
        </h2>
        {errors.apiError && (
          <div className="mt-4 text-center text-sm text-red-600">
            {errors.apiError}
          </div>
        )}
        {successMessage && (
          <div className="mt-4 text-center text-sm text-green-600">
            {successMessage}
          </div>
        )}
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div>
            <label htmlFor="username" className="block text-sm font-bold text-gray-700">
              Username
            </label>
            <input
              id="username"
              name="username"
              type="text"
              required
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="mt-2 block w-full rounded-md border border-[#2f3185] bg-gray-50 shadow-sm focus:ring-[#2f3185] focus:border-[#2f3185] sm:text-sm"
              style={{ height: '2.6rem' }}
            />
            {errors.username && (
              <div className="mt-2 text-sm text-red-600">
                {errors.username}
              </div>
            )}
          </div>

          <div>
            <label htmlFor="email" className="block text-sm font-bold text-gray-700">
              Email address
            </label>
            <input
              id="email"
              name="email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-2 block w-full rounded-md border border-[#2f3185] bg-gray-50 shadow-sm focus:ring-[#2f3185] focus:border-[#2f3185] sm:text-sm"
              style={{ height: '2.6rem' }}
            />
            {errors.email && (
              <div className="mt-2 text-sm text-red-600">
                {errors.email}
              </div>
            )}
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-bold text-gray-700">
              Password
            </label>
            <input
              id="password"
              name="password"
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-2 block w-full rounded-md border border-[#2f3185] bg-gray-50 shadow-sm focus:ring-[#2f3185] focus:border-[#2f3185] sm:text-sm"
              style={{ height: '2.6rem' }}
            />
            {errors.password && (
              <div className="mt-2 text-sm text-red-600">
                {errors.password}
              </div>
            )}
          </div>

          <div>
            <label htmlFor="confirm-password" className="block text-sm font-bold text-gray-700">
              Confirm Password
            </label>
            <input
              id="confirm-password"
              name="confirmPassword"
              type="password"
              required
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="mt-2 block w-full rounded-md border border-[#2f3185] bg-gray-50 shadow-sm focus:ring-[#2f3185] focus:border-[#2f3185] sm:text-sm"
              style={{ height: '2.6rem' }}
            />
            {errors.confirmPassword && (
              <div className="mt-2 text-sm text-red-600">
                {errors.confirmPassword}
              </div>
            )}
          </div>

          <div>
            <button
              type="submit"
              className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-[#2f3185] hover:bg-[#1f2058] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#2f3185]"
            >
              Register
            </button>
          </div>
        </form>
        <p className="mt-6 text-center text-sm text-gray-600">
          Already have an account?{' '}
          <a href="#" className="font-medium text-[#2f3185] hover:text-[#1f2058]">
            Sign in
          </a>
        </p>
      </div>
    </div>
  );
};

export default Register;
