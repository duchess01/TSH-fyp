import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { login, getUserDetails } from "../api/user";
import tshlogo from "../Assets/tsh.png";

const Login = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      const response = await login(email, password);
      console.log("Login response:", response); // Debug log

      if (response.status !== 200) {
        throw new Error(response.data?.error || "Invalid email or password");
      }

      // Extract user data and ensure privileges is correctly handled
      const userData = {
        id: response.data.id,
        email: response.data.email,
        name: response.data.name,
        role: response.data.role,
        privileges: response.data.privileges || [], // Use privileges (plural) and provide fallback
      };


      // Store token and user details in session storage
      sessionStorage.setItem("token", response.data.token);
      sessionStorage.setItem("user", JSON.stringify(userData));

      // Verify stored data
      const storedUser = JSON.parse(sessionStorage.getItem("user"));

      // Navigate based on user privileges
      if (userData.privileges.includes("System Admin")) {
        navigate("/admin");
      } else {
        navigate("/");
      }
    } catch (err) {
      console.error("Login error:", err);
      setError(
        err.response?.data?.error || 
        err.message || 
        "Invalid email or password. Please try again."
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="max-w-md w-full bg-white p-8 rounded-lg shadow-lg">
        <div className="flex justify-center">
          <img
            src={tshlogo}
            alt="TSHlogo"
            className="h-25 w-25"
          />
        </div>
        <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
          Welcome back!
        </h2>
        {error && (
          <div className="mt-4 p-3 bg-red-50 text-center text-sm text-red-600 rounded-md">
            {error}
          </div>
        )}
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div>
            <label
              htmlFor="email"
              className="block text-sm font-bold text-gray-700"
            >
              Email address
            </label>
            <input
              id="email"
              name="email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="email"
              className="mt-2 block w-full rounded-md border border-[#2f3185] bg-gray-50 shadow-sm focus:ring-[#2f3185] focus:border-[#2f3185] sm:text-sm py-3 px-4"
              style={{ height: "2.6rem" }}
              disabled={isLoading}
            />
          </div>

          <div>
            <label
              htmlFor="password"
              className="block text-sm font-bold text-gray-700"
            >
              Password
            </label>
            <input
              id="password"
              name="password"
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
              className="mt-2 block w-full rounded-md border border-[#2f3185] bg-gray-50 shadow-sm focus:ring-[#2f3185] focus:border-[#2f3185] sm:text-sm py-3 px-4"
              style={{ height: "2.6rem" }}
              disabled={isLoading}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="text-sm">
              <a
                href="#"
                className="font-medium text-[#2f3185] hover:text-[#1f2058]"
              >
                Forgot your password?
              </a>
            </div>
          </div>

          <div>
            <button
              type="submit"
              className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-[#2f3185] hover:bg-[#1f2058] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#2f3185]"
              disabled={isLoading}
            >
              {isLoading ? (
                <span className="inline-flex items-center">
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Signing in...
                </span>
              ) : (
                "Sign in"
              )}
            </button>
          </div>
        </form>
        <p className="mt-6 text-center text-sm text-gray-600">
          Not a member?{" "}
          <a
            href="#"
            className="font-medium text-[#2f3185] hover:text-[#1f2058]"
          >
            Contact Admin to Sign up!
          </a>
        </p>
      </div>
    </div>
  );
};

export default Login;