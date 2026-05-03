import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "../../context/AuthContext";
import { updateProfile, setHidePin } from "../../features/auth/services/profileAPI";
import {
    User, Mail, Phone, Lock, Eye, EyeOff,
    Check, X, Pencil, Shield, KeyRound, Camera,
} from "lucide-react";
import { toast } from "sonner";

/* ── PIN Input ───────────────────────────────────────────────────── */
const PinInput = ({ value, onChange, disabled }) => {
    const refs = [useRef(), useRef(), useRef(), useRef()];
    const digits = (value || "    ").split("").slice(0, 4);

    const handleChange = (i, e) => {
        const v = e.target.value.replace(/\D/g, "").slice(-1);
        const next = [...digits];
        next[i] = v;
        onChange(next.join("").replace(/ /g, ""));
        if (v && i < 3) refs[i + 1].current?.focus();
    };

    const handleKeyDown = (i, e) => {
        if (e.key === "Backspace" && !digits[i] && i > 0) {
            refs[i - 1].current?.focus();
        }
    };

    return (
        <div className="flex gap-3 justify-center">
            {[0, 1, 2, 3].map(i => (
                <input
                    key={i}
                    ref={refs[i]}
                    type="password"
                    inputMode="numeric"
                    maxLength={1}
                    value={digits[i]?.trim() || ""}
                    onChange={e => handleChange(i, e)}
                    onKeyDown={e => handleKeyDown(i, e)}
                    disabled={disabled}
                    className="w-12 h-12 text-center text-xl font-bold bg-white/5 border-2 border-white/10 rounded-xl text-white
                               focus:border-blue-500 focus:outline-none focus:bg-white/8 transition disabled:opacity-50"
                />
            ))}
        </div>
    );
};

/* ── Avatar ──────────────────────────────────────────────────────── */
const AvatarSection = ({ user, refreshUser }) => {
    const fileRef = useRef(null);

    const handleUpload = async (e) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onloadend = async () => {
            const base64 = reader.result;
            try {
                await updateProfile({ avatar: base64 });
                await refreshUser();
                toast.success("Profile picture updated");
            } catch (err) {
                toast.error("Failed to update profile picture");
            }
        };
        reader.readAsDataURL(file);
    };

    const initials = (user?.name || "?").split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2);
    return (
        <div className="relative inline-block shrink-0">
            <div className="w-24 h-24 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-2xl font-bold text-white shadow-xl shadow-blue-500/20">
                {user?.avatar
                    ? <img src={user.avatar} alt="avatar" className="w-full h-full rounded-full object-cover" />
                    : initials}
            </div>
            <button
                onClick={() => fileRef.current?.click()}
                className="absolute bottom-0 right-0 w-8 h-8 bg-blue-600 hover:bg-blue-500 rounded-full flex items-center justify-center shadow-lg transition"
            >
                <Camera size={14} />
            </button>
            <input type="file" ref={fileRef} onChange={handleUpload} accept="image/*" className="hidden" />
        </div>
    );
};

/* ── Profile Field ───────────────────────────────────────────────── */
const ProfileField = ({ icon: Icon, label, value, editable, editing, onEdit, onSave, onCancel, inputValue, onInputChange, type = "text", disabled }) => (
    <div className="flex items-center gap-4 p-4 bg-white/3 rounded-xl border border-white/8 group">
        <div className="p-2 bg-white/5 rounded-lg shrink-0">
            <Icon size={16} className="text-blue-400" />
        </div>
        <div className="flex-1 min-w-0">
            <p className="text-[10px] text-gray-500 uppercase tracking-widest mb-0.5">{label}</p>
            {editing ? (
                <div className="flex items-center gap-2">
                    <input
                        type={type}
                        value={inputValue}
                        onChange={e => onInputChange(e.target.value)}
                        autoFocus
                        className="flex-1 bg-white/5 border border-blue-500/50 rounded-lg px-2 py-1 text-sm text-white outline-none focus:border-blue-500 transition"
                    />
                    <button onClick={onSave} className="p-1 text-green-400 hover:text-green-300 transition"><Check size={14} /></button>
                    <button onClick={onCancel} className="p-1 text-gray-500 hover:text-white transition"><X size={14} /></button>
                </div>
            ) : (
                <p className="text-sm text-white truncate">{value || <span className="text-gray-500 italic">Not set</span>}</p>
            )}
        </div>
        {editable && !editing && !disabled && (
            <button onClick={onEdit} className="opacity-0 group-hover:opacity-100 p-1.5 rounded-lg hover:bg-white/10 text-gray-400 hover:text-white transition">
                <Pencil size={13} />
            </button>
        )}
        {disabled && (
            <div className="p-1.5 rounded-lg bg-white/5 text-gray-600" title="Cannot be changed">
                <Lock size={13} />
            </div>
        )}
    </div>
);

/* ── Main Profile Page ───────────────────────────────────────────── */
const UserProfile = () => {
    const { user, refreshUser } = useAuth();
    const [editField, setEditField] = useState(null);
    const [fieldValues, setFieldValues] = useState({ name: user?.name || "", phone: user?.phone || "" });
    const [saving, setSaving] = useState(false);

    // PIN state
    const [pinSection, setPinSection] = useState("idle"); // idle | set | confirm
    const [pin, setPin] = useState("");
    const [confirmPin, setConfirmPin] = useState("");
    const [pinSaving, setPinSaving] = useState(false);

    const startEdit = (field) => {
        setEditField(field);
        setFieldValues(v => ({ ...v, [field]: user?.[field] || "" }));
    };

    const cancelEdit = () => setEditField(null);

    const saveField = async (field) => {
        setSaving(true);
        try {
            await updateProfile({ [field]: fieldValues[field] });
            await refreshUser();
            toast.success(`${field.charAt(0).toUpperCase() + field.slice(1)} updated`);
            setEditField(null);
        } catch (e) {
            toast.error(e.response?.data?.message || "Update failed");
        } finally {
            setSaving(false);
        }
    };

    const handleSetPin = async () => {
        if (pin.length !== 4) { toast.error("Enter all 4 digits"); return; }
        if (pinSection === "set") {
            setPinSection("confirm");
            return;
        }
        if (pin !== confirmPin) { toast.error("PINs do not match"); setPin(""); setConfirmPin(""); setPinSection("set"); return; }
        setPinSaving(true);
        try {
            await setHidePin(pin);
            await refreshUser();
            toast.success(user?.hidePinSet ? "PIN updated!" : "PIN set successfully!");
            setPinSection("idle");
            setPin("");
            setConfirmPin("");
        } catch (e) {
            toast.error(e.response?.data?.message || "Failed to set PIN");
        } finally {
            setPinSaving(false);
        }
    };

    const initials = (user?.name || "?").split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2);

    return (
        <div className="max-w-2xl mx-auto space-y-6 pb-16 px-2">

            {/* Header */}
            <div className="flex items-center gap-4 mb-2">
                <div>
                    <h1 className="text-2xl font-bold">My Profile</h1>
                    <p className="text-sm text-gray-400 mt-0.5">Manage your account details and security PIN</p>
                </div>
            </div>

            {/* Avatar + Name card */}
            <div className="relative bg-gradient-to-br from-[#0f0f18] to-[#0a0a12] border border-white/10 rounded-2xl p-6 overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-indigo-500/5" />
                <div className="relative flex flex-col sm:flex-row items-center sm:items-start gap-5">
                    <AvatarSection user={user} refreshUser={refreshUser} />
                    <div className="text-center sm:text-left mt-2 sm:mt-0">
                        <h2 className="text-xl font-bold">{user?.name}</h2>
                        <p className="text-gray-400 text-sm">{user?.email}</p>
                        <span className={`inline-flex items-center gap-1 mt-2 px-2.5 py-1 rounded-full text-xs font-medium
                            ${user?.role === 'admin' ? 'bg-amber-500/15 text-amber-400 border border-amber-500/20' : 'bg-blue-500/15 text-blue-400 border border-blue-500/20'}`}>
                            <Shield size={10} />
                            {user?.role === 'admin' ? 'Administrator' : 'User'}
                        </span>
                    </div>
                </div>
            </div>

            {/* Profile Fields */}
            <div className="space-y-3">
                <h3 className="text-xs text-gray-500 uppercase tracking-widest font-medium">Account Information</h3>

                <ProfileField
                    icon={User}
                    label="Full Name"
                    value={user?.name}
                    editable
                    editing={editField === "name"}
                    onEdit={() => startEdit("name")}
                    onSave={() => saveField("name")}
                    onCancel={cancelEdit}
                    inputValue={fieldValues.name}
                    onInputChange={v => setFieldValues(f => ({ ...f, name: v }))}
                />

                <ProfileField
                    icon={Mail}
                    label="Email Address"
                    value={user?.email}
                    editable={false}
                    disabled
                />

                <ProfileField
                    icon={Phone}
                    label="Phone Number"
                    value={user?.phone}
                    editable
                    editing={editField === "phone"}
                    onEdit={() => startEdit("phone")}
                    onSave={() => saveField("phone")}
                    onCancel={cancelEdit}
                    inputValue={fieldValues.phone}
                    onInputChange={v => setFieldValues(f => ({ ...f, phone: v }))}
                    type="tel"
                />
            </div>

            {/* Hide PIN Section */}
            <div className="space-y-3">
                <h3 className="text-xs text-gray-500 uppercase tracking-widest font-medium">Privacy PIN</h3>
                <div className="bg-[#0f0f18] border border-white/10 rounded-2xl p-6">
                    <div className="flex items-start gap-4 mb-5">
                        <div className="p-2.5 bg-blue-500/10 rounded-xl">
                            <KeyRound size={20} className="text-blue-400" />
                        </div>
                        <div>
                            <h4 className="text-sm font-semibold">Hide & Unhide PIN</h4>
                            <p className="text-xs text-gray-400 mt-1">
                                {user?.hidePinSet
                                    ? "Your 4-digit PIN is active. Use it to hide/unhide files and folders."
                                    : "Set a 4-digit PIN to hide and reveal sensitive files and folders."}
                            </p>
                            {user?.hidePinSet && (
                                <div className="flex items-center gap-1.5 mt-2">
                                    <div className="w-1.5 h-1.5 rounded-full bg-green-400" />
                                    <span className="text-xs text-green-400">PIN is active</span>
                                </div>
                            )}
                        </div>
                    </div>

                    <AnimatePresence mode="wait">
                        {pinSection === "idle" && (
                            <motion.button
                                key="set-btn"
                                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                                onClick={() => { setPinSection("set"); setPin(""); setConfirmPin(""); }}
                                className="w-full py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-sm text-white font-medium transition"
                            >
                                {user?.hidePinSet ? "Change PIN" : "Set PIN"}
                            </motion.button>
                        )}

                        {(pinSection === "set" || pinSection === "confirm") && (
                            <motion.div key="pin-form" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-5">
                                <div className="text-center">
                                    <p className="text-sm text-gray-300 mb-4">
                                        {pinSection === "set" ? "Enter your new 4-digit PIN" : "Confirm your PIN"}
                                    </p>
                                    <PinInput
                                        value={pinSection === "set" ? pin : confirmPin}
                                        onChange={pinSection === "set" ? setPin : setConfirmPin}
                                        disabled={pinSaving}
                                    />
                                </div>
                                <div className="flex gap-2">
                                    <button
                                        onClick={() => { setPinSection("idle"); setPin(""); setConfirmPin(""); }}
                                        className="flex-1 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-sm text-gray-400 hover:text-white transition"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        onClick={handleSetPin}
                                        disabled={pinSaving || (pinSection === "set" ? pin.length !== 4 : confirmPin.length !== 4)}
                                        className="flex-1 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-sm text-white font-medium transition disabled:opacity-50"
                                    >
                                        {pinSaving ? "Saving..." : pinSection === "set" ? "Next →" : "Confirm & Save"}
                                    </button>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </div>

            {/* Account Stats */}
            <div className="space-y-3">
                <h3 className="text-xs text-gray-500 uppercase tracking-widest font-medium">Storage</h3>
                <div className="bg-[#0f0f18] border border-white/10 rounded-2xl p-5">
                    {(() => {
                        const used = user?.storageUsed || 0;
                        const limit = user?.storageLimit || (5 * 1024 * 1024 * 1024);
                        const pct = Math.min((used / limit) * 100, 100);
                        const fmt = (b) => {
                            if (b === 0) return "0 B";
                            const k = 1024, s = ["B", "KB", "MB", "GB"];
                            const i = Math.floor(Math.log(b) / Math.log(k));
                            return parseFloat((b / Math.pow(k, i)).toFixed(2)) + " " + s[i];
                        };
                        return (
                            <>
                                <div className="flex justify-between text-sm mb-3">
                                    <span className="text-gray-400">Used</span>
                                    <span className="text-white font-medium">{fmt(used)} <span className="text-gray-500">/ {fmt(limit)}</span></span>
                                </div>
                                <div className="w-full h-2.5 bg-white/10 rounded-full overflow-hidden">
                                    <div
                                        className={`h-full rounded-full transition-all duration-700 ${pct > 90 ? "bg-red-500" : pct > 70 ? "bg-amber-500" : "bg-blue-500"}`}
                                        style={{ width: `${pct}%` }}
                                    />
                                </div>
                                <p className="text-xs text-gray-500 mt-2">{pct.toFixed(1)}% used</p>
                            </>
                        );
                    })()}
                </div>
            </div>
        </div>
    );
};

export default UserProfile;
