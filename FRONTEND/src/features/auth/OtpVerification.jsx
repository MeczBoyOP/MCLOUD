import React, { useRef, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { otpSchema } from "../../helper/validations";
import { useLocation, useNavigate } from "react-router-dom";
import { useMutation } from "@tanstack/react-query";
import { verifyEmail, resendOTP } from "./services/authAPI";
import { toast } from "sonner";

const OtpVerification = () => {
    const inputs = useRef([]);
    const location = useLocation();
    const navigate = useNavigate();
    const email = location.state?.email;

    useEffect(() => {
        if (!email) {
            navigate("/register");
        }
    }, [email, navigate]);

    const {
        handleSubmit,
        setValue,
        getValues,
        formState: { errors },
    } = useForm({
        resolver: zodResolver(otpSchema),
    });

    const verifyMutation = useMutation({
        mutationFn: verifyEmail,
        onSuccess: (data) => {
            if (data.success) {
                toast.success(data.message || "Email verified successfully. You can now log in.");
                navigate("/login");
            }
        },
        onError: (error) => {
            toast.error(error.response?.data?.message || "Verification failed");
        },
    });

    const resendMutation = useMutation({
        mutationFn: resendOTP,
        onSuccess: (data) => {
            if (data.success) {
                toast.success(data.message || "OTP sent successfully");
            }
        },
        onError: (error) => {
            toast.error(error.response?.data?.message || "Failed to resend OTP");
        },
    });

    const handleChange = (e, i) => {
        const value = e.target.value;

        if (!/^[0-9]?$/.test(value)) return;

        updateOtp(value, i);

        if (value && inputs.current[i + 1]) {
            inputs.current[i + 1].focus();
        }
    };

    const handleKeyDown = (e, i) => {
        // ⬅️ Backspace behavior
        if (e.key === "Backspace") {
            if (!e.target.value && inputs.current[i - 1]) {
                inputs.current[i - 1].focus();
            }

            updateOtp("", i);
        }
    };

    const handlePaste = (e) => {
        e.preventDefault();

        const pasteData = e.clipboardData.getData("text").trim();

        if (!/^\d{4}$/.test(pasteData)) return;

        const digits = pasteData.split("");

        digits.forEach((digit, i) => {
            if (inputs.current[i]) {
                inputs.current[i].value = digit;
                updateOtp(digit, i);
            }
        });

        inputs.current[3]?.focus();
    };

    // 🔧 helper (clean state update)
    const updateOtp = (value, index) => {
        const prev = getValues("otp") || "";
        let arr = prev.split("");
        
        if (arr.length < 4) {
            arr = arr.concat(Array(4 - arr.length).fill(""));
        }
        
        arr[index] = value;
        const newOtp = arr.join("").substring(0, 4);
        
        setValue("otp", newOtp, { shouldValidate: true });
    };

    const onSubmit = (data) => {
        if (!email) return;
        verifyMutation.mutate({ email, otp: data.otp });
    };

    const handleResend = () => {
        if (!email) return;
        resendMutation.mutate({ email });
    };

    if (!email) return null; // Prevent rendering if redirecting

    const isSubmitting = verifyMutation.isPending;
    const isResending = resendMutation.isPending;

    return (
        <div className="space-y-6 text-center">
            <div className="text-sm font-semibold">
                M<span className="text-blue-400">Cloud</span>
            </div>

            <div>
                <h1 className="text-2xl font-semibold">Verify OTP</h1>
                <p className="text-gray-400 text-sm mt-1">
                    Enter the 4-digit code sent to <br />
                    <span className="text-white font-medium">{email}</span>
                </p>
            </div>

            <form onSubmit={handleSubmit(onSubmit)}>
                {/* Inputs */}
                <div className="flex justify-center gap-3 mb-4">
                    {[...Array(4)].map((_, i) => (
                        <input
                            key={i}
                            maxLength={1}
                            ref={(el) => (inputs.current[i] = el)}
                            onChange={(e) => handleChange(e, i)}
                            onKeyDown={(e) => handleKeyDown(e, i)}
                            onPaste={handlePaste}
                            className="
    w-12 h-12 text-center text-lg font-semibold rounded-lg
    bg-white/5 border border-white/10
    focus:border-blue-500/40 outline-none
  "
                        />
                    ))}
                </div>

                {/* Error */}
                {errors.otp && (
                    <p className="text-xs text-red-400 mb-3">
                        {errors.otp.message}
                    </p>
                )}

                {/* Button */}
                <button
                    disabled={isSubmitting}
                    className="
    group relative w-full py-2 rounded-lg text-sm mb-4
    bg-linear-to-r from-blue-500/15 via-blue-500/10 to-transparent
    border border-blue-500/25 text-white
    overflow-hidden transition-all duration-300
    hover:border-blue-500/50 hover:shadow-[0_0_25px_rgba(37,99,235,0.35)]
    active:scale-[0.98] disabled:opacity-50
  "
                >
                    <span className="
    absolute inset-0 translate-y-full group-hover:translate-y-0
    bg-blue-500/20 transition-transform duration-300
  " />
                    <span className="relative z-10">
                        {isSubmitting ? "Verifying..." : "Verify"}
                    </span>
                </button>
            </form>

            <div className="text-sm text-gray-400">
                Didn't receive the code?{" "}
                <button 
                    onClick={handleResend}
                    disabled={isResending}
                    className="text-blue-400 hover:text-blue-300 transition-colors disabled:opacity-50"
                >
                    {isResending ? "Sending..." : "Resend OTP"}
                </button>
            </div>
        </div>
    );
};

export default OtpVerification;