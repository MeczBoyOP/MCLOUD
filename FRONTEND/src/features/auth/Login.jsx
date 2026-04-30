import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Mail, Lock, Eye, EyeOff } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { loginSchema } from "../../helper/validations";
import { useMutation } from '@tanstack/react-query';
import { loginUser } from "./services/authAPI";
import { useAuth } from "../../context/AuthContext";
import { toast } from "sonner";

const Login = () => {
    const [showPassword, setShowPassword] = useState(false);
    const navigate = useNavigate();
    const { login } = useAuth();

    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm({
        resolver: zodResolver(loginSchema),
    });

    const loginMutation = useMutation({
        mutationFn: loginUser,
        onSuccess: (data) => {
            if (data.success) {
                toast.success(data.message || 'Logged in successfully');
                login(data.data.token, data.data.user);
                navigate('/user/dashboard');
            }
        },
        onError: (error) => {
            toast.error(error.response?.data?.message || 'Login failed');
        }
    });

    const onSubmit = (data) => {
        loginMutation.mutate(data);
    };

    const isSubmitting = loginMutation.isPending;

    return (
        <div className="space-y-6">

            {/* Logo */}
            <div className="text-sm font-semibold">
                M<span className="text-blue-400">Cloud</span>
            </div>

            {/* Heading */}
            <div>
                <h1 className="text-2xl font-semibold">Welcome Back</h1>
                <p className="text-gray-400 text-sm mt-1">
                    Sign in to access your dashboard
                </p>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">

                {/* Email */}
                <div>
                    <label className="text-xs text-gray-400 mb-1 block">Email</label>
                    <div className="relative">
                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />

                        <input
                            {...register("email")}
                            placeholder="Enter your email"
                            className="
                w-full pl-10 pr-3 py-2 rounded-lg text-sm
                bg-white/5 border border-white/10
                focus:border-blue-500/40 focus:outline-none
                transition
              "
                        />
                    </div>

                    {errors.email && (
                        <p className="text-xs text-red-400 mt-1">
                            {errors.email.message}
                        </p>
                    )}
                </div>

                {/* Password */}
                <div>
                    <label className="text-xs text-gray-400 mb-1 block">Password</label>

                    <div className="relative">
                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />

                        <input
                            type={showPassword ? "text" : "password"}
                            {...register("password")}
                            placeholder="Enter your password"
                            className="
                w-full pl-10 pr-10 py-2 rounded-lg text-sm
                bg-white/5 border border-white/10
                focus:border-blue-500/40 focus:outline-none
                transition
              "
                        />

                        {/* 👁 Toggle */}
                        <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
                        >
                            {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                        </button>
                    </div>

                    {errors.password && (
                        <p className="text-xs text-red-400 mt-1">
                            {errors.password.message}
                        </p>
                    )}

                    <div className="text-right mt-1">
                        <span className="text-xs text-blue-400 cursor-pointer">
                            Forgot password?
                        </span>
                    </div>
                </div>

                {/* 🔥 NEW BUTTON (Better than before) */}
                <button
                    disabled={isSubmitting}
                    className="
    group relative w-full py-2 rounded-lg text-sm

    /* BASE STATE (important) */
    bg-linear-to-r from-blue-500/10 via-blue-500/5 to-transparent
    border border-blue-500/20
    text-white

    overflow-hidden
    transition-all duration-300

    /* HOVER */
    hover:border-blue-500/40
    hover:shadow-[0_0_25px_rgba(37,99,235,0.35)]

    active:scale-[0.98]
    disabled:opacity-50
  "
                >
                    {/* 🌊 Fill Animation */}
                    <span className="
    absolute inset-0
    translate-y-full group-hover:translate-y-0
    bg-blue-500/20
    transition-transform duration-300
  " />

                    {/* Text */}
                    <span className="relative z-10">
                        {isSubmitting ? "Signing in..." : "Sign In"}
                    </span>
                </button>

            </form>

            {/* Footer */}
            <p className="text-xs text-gray-400 text-center">
                Don’t have an account?{" "}
                <Link to="/register" className="text-blue-400">
                    Sign Up
                </Link>
            </p>

        </div>
    );
};

export default Login;