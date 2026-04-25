import React, { useState } from "react";
import axios from "axios";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useNavigate } from "react-router-dom";
import { FiEye, FiEyeOff, FiMail, FiLock, FiUser } from "react-icons/fi";

const VITE_BASE_URL = import.meta.env.VITE_BASE_URL;

const getPasswordStrength = (password) => {
  if (!password) return { label: "", color: "", width: "0%" };
  if (password.length < 6) return { label: "Weak", color: "bg-red-500", width: "33%" };
  if (password.length < 10 || !/[A-Z]/.test(password) || !/[0-9]/.test(password))
    return { label: "Fair", color: "bg-yellow-400", width: "66%" };
  return { label: "Strong", color: "bg-green-500", width: "100%" };
};

const Register = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ name: "", email: "", password: "", confirmPassword: "" });
  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const strength = getPasswordStrength(formData.password);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const validateForm = () => {
    const newErrors = {};
    let isValid = true;
    if (!formData.name) { newErrors.name = "Name is required"; isValid = false; }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formData.email) { newErrors.email = "Email is required"; isValid = false; }
    else if (!emailRegex.test(formData.email)) { newErrors.email = "Please enter a valid email"; isValid = false; }
    if (!formData.password) { newErrors.password = "Password is required"; isValid = false; }
    else if (formData.password.length < 6) { newErrors.password = "Password must be at least 6 characters"; isValid = false; }
    if (!formData.confirmPassword) { newErrors.confirmPassword = "Please confirm your password"; isValid = false; }
    else if (formData.password !== formData.confirmPassword) { newErrors.confirmPassword = "Passwords do not match"; isValid = false; }
    setErrors(newErrors);
    return isValid;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    const toastId = toast.loading("Creating account...");
    try {
      const response = await axios.post(`${VITE_BASE_URL}/auth/register`, {
        name: formData.name,
        email: formData.email,
        password: formData.password,
      });
      const { user } = response.data;
      const userInfo = await axios.get(`${VITE_BASE_URL}/user/profile`);
      localStorage.setItem("userInfo", JSON.stringify(userInfo.data));

      toast.update(toastId, {
        render: "Account created! 🎉",
        type: "success",
        isLoading: false,
        autoClose: 2000,
        hideProgressBar: true,
        theme: "dark",
      });
      navigate("/home");
    } catch (error) {
      toast.update(toastId, {
        render: error.response?.data?.message || "Registration failed",
        type: "error",
        isLoading: false,
        autoClose: 3000,
        hideProgressBar: true,
        theme: "dark",
      });
    }
  };

  const InputField = ({ label, name, type = "text", placeholder, icon: Icon, rightEl }) => (
    <div>
      <label className="block text-sm font-medium text-gray-300 mb-1.5">{label}</label>
      <div className="relative">
        <Icon className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500 text-base" />
        <input
          type={type}
          name={name}
          value={formData[name]}
          onChange={handleChange}
          placeholder={placeholder}
          className="w-full bg-white/5 border border-white/10 text-white placeholder-gray-500 rounded-xl pl-10 pr-10 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/60 focus:border-transparent transition"
        />
        {rightEl}
      </div>
      {errors[name] && <p className="text-red-400 text-xs mt-1.5">{errors[name]}</p>}
    </div>
  );

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0a0f1e] relative overflow-hidden py-8">
      {/* Decorative blobs */}
      <div className="absolute top-[-80px] right-[-80px] w-80 h-80 bg-indigo-600 rounded-full opacity-20 blur-3xl pointer-events-none" />
      <div className="absolute bottom-[-100px] left-[-60px] w-96 h-96 bg-blue-500 rounded-full opacity-20 blur-3xl pointer-events-none" />
      <div className="absolute top-1/2 right-1/3 w-64 h-64 bg-cyan-400 rounded-full opacity-10 blur-3xl pointer-events-none" />

      <div className="relative z-10 w-full max-w-md mx-4 animate-fade-in">
        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-8 shadow-2xl">
          {/* Brand */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 shadow-lg mb-4">
              <span className="text-white text-2xl font-bold">G</span>
            </div>
            <h1 className="text-3xl font-bold text-white">Create account</h1>
            <p className="text-gray-400 mt-1 text-sm">Join GyanSetu today</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <InputField label="Full Name" name="name" placeholder="Your full name" icon={FiUser} />
            <InputField label="Email" name="email" type="email" placeholder="you@example.com" icon={FiMail} />

            {/* Password with toggle */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1.5">Password</label>
              <div className="relative">
                <FiLock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500 text-base" />
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="At least 6 characters"
                  className="w-full bg-white/5 border border-white/10 text-white placeholder-gray-500 rounded-xl pl-10 pr-10 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/60 focus:border-transparent transition"
                />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300 transition">
                  {showPassword ? <FiEyeOff /> : <FiEye />}
                </button>
              </div>
              {/* Strength bar */}
              {formData.password && (
                <div className="mt-2">
                  <div className="h-1 w-full bg-white/10 rounded-full overflow-hidden">
                    <div className={`h-full rounded-full transition-all duration-300 ${strength.color}`} style={{ width: strength.width }} />
                  </div>
                  <p className="text-xs mt-1 text-gray-400">{strength.label} password</p>
                </div>
              )}
              {errors.password && <p className="text-red-400 text-xs mt-1.5">{errors.password}</p>}
            </div>

            {/* Confirm Password */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1.5">Confirm Password</label>
              <div className="relative">
                <FiLock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500 text-base" />
                <input
                  type={showConfirm ? "text" : "password"}
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  placeholder="Repeat your password"
                  className="w-full bg-white/5 border border-white/10 text-white placeholder-gray-500 rounded-xl pl-10 pr-10 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/60 focus:border-transparent transition"
                />
                <button type="button" onClick={() => setShowConfirm(!showConfirm)} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300 transition">
                  {showConfirm ? <FiEyeOff /> : <FiEye />}
                </button>
              </div>
              {errors.confirmPassword && <p className="text-red-400 text-xs mt-1.5">{errors.confirmPassword}</p>}
            </div>

            <button
              type="submit"
              className="w-full py-3 rounded-xl bg-gradient-to-r from-blue-500 to-indigo-600 text-white font-semibold text-sm hover:from-blue-600 hover:to-indigo-700 transition-all duration-200 shadow-lg shadow-blue-500/25 active:scale-[0.98] mt-2"
            >
              Create Account
            </button>
          </form>

          <p className="text-center text-gray-500 text-sm mt-6">
            Already have an account?{" "}
            <a href="/login" className="text-blue-400 font-semibold hover:text-blue-300 transition">
              Sign in
            </a>
          </p>
        </div>
      </div>

      <ToastContainer position="top-center" theme="dark" />
    </div>
  );
};

export default Register;
