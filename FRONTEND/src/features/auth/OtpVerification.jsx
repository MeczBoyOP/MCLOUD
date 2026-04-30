import React, { useRef } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { otpSchema } from "../../helper/validations";

const OtpVerification = () => {
    const inputs = useRef([]);

    const {
        handleSubmit,
        setValue,
        formState: { errors },
    } = useForm({
        resolver: zodResolver(otpSchema),
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

        if (!/^\d{6}$/.test(pasteData)) return;

        const digits = pasteData.split("");

        digits.forEach((digit, i) => {
            if (inputs.current[i]) {
                inputs.current[i].value = digit;
                updateOtp(digit, i);
            }
        });

        inputs.current[5]?.focus();
    };

    // 🔧 helper (clean state update)
    const updateOtp = (value, index) => {
        setValue("otp", (prev = "") => {
            const arr = prev.split("");
            arr[index] = value;
            return arr.join("");
        });
    };

    const onSubmit = (data) => {
        console.log(data);
    };

    return (
        <div className="space-y-6 text-center">

            <div className="text-sm font-semibold">
                M<span className="text-blue-400">Cloud</span>
            </div>

            <div>
                <h1 className="text-2xl font-semibold">Verify OTP</h1>
                <p className="text-gray-400 text-sm mt-1">
                    Enter the 6-digit code
                </p>
            </div>

            <form onSubmit={handleSubmit(onSubmit)}>

                {/* Inputs */}
                <div className="flex justify-center gap-2 mb-4">
                    {[...Array(6)].map((_, i) => (
                        <input
                            key={i}
                            maxLength={1}
                            ref={(el) => (inputs.current[i] = el)}
                            onChange={(e) => handleChange(e, i)}
                            onKeyDown={(e) => handleKeyDown(e, i)}
                            onPaste={handlePaste}
                            className="
    w-10 h-10 text-center rounded-lg
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
                    className="
    group relative w-full py-2 rounded-lg text-sm

    /* BASE (different from inputs) */
    bg-linear-to-r from-blue-500/15 via-blue-500/10 to-transparent
    border border-blue-500/25
    text-white

    overflow-hidden
    transition-all duration-300

    /* HOVER */
    hover:border-blue-500/50
    hover:shadow-[0_0_25px_rgba(37,99,235,0.35)]

    /* INTERACTION */
    active:scale-[0.98]
  "
                >
                    {/* 🌊 Fill animation */}
                    <span className="
    absolute inset-0
    translate-y-full group-hover:translate-y-0
    bg-blue-500/20
    transition-transform duration-300
  " />

                    {/* Text */}
                    <span className="relative z-10">
                        Verify
                    </span>
                </button>

            </form>

        </div>
    );
};

export default OtpVerification;