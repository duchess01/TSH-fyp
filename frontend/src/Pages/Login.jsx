import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { login, getUserDetails } from "../api/user";

const Login = () => {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);

  const handleSubmit = async (event) => {
    event.preventDefault();
    try {
      const response = await login(email, password);
      if (response.status != 200) {
        throw new Error("Invalid email or password");
      }
      // storing token and user details in session storage
      sessionStorage.setItem("token", response.data.token);
      sessionStorage.setItem(
        "user",
        JSON.stringify({
          id: response.data.id,
          email: response.data.email,
          name: response.data.name,
          role: response.data.role,
        })
      );
      // const user = JSON.parse(sessionStorage.getItem("user"));
      // console.log("User details: ", user);
      navigate("/"); // Handle successful login here (e.g., redirect to a chat)
    } catch (err) {
      console.log("Error in login: ", err);
      setError("Error in logging in. Try again later");
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
          Sign in to your account
        </h2>
        {error && (
          <div className="mt-4 text-center text-sm text-red-600">{error}</div>
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
              style={{ height: "2.6rem" }} // Increase height by 40%
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
              style={{ height: "2.6rem" }} // Increase height by 40%
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
            >
              Sign in
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
