import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import gsap from "gsap";
import { User, Mail, Calendar, Hash, MapPin, Phone, Award, Shield, ArrowLeft, Camera, Check, X, Edit3 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { API_URL } from "../utils/apiConfig.js";

const Profile = () => {
    const navigate = useNavigate();
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isEditing, setIsEditing] = useState(false);
    const [formData, setFormData] = useState({});
    const [imagePreview, setImagePreview] = useState(null);
    const [selectedFile, setSelectedFile] = useState(null);
    const containerRef = useRef(null);
    const fileInputRef = useRef(null);

    const fetchUserData = async () => {
        try {
            const token = localStorage.getItem("token");
            if (!token) {
                navigate("/login");
                return;
            }

            const { data } = await axios.get(`${API_URL}/users/me`, {
                headers: { Authorization: `Bearer ${token}` }
            });

            if (data.success) {
                setUser(data.data);
                setFormData({
                    name: data.data.name,
                    dob: data.data.dob ? data.data.dob.split('T')[0] : "",
                    gender: data.data.gender || "",
                    bloodGroup: data.data.bloodGroup || "",
                    address: data.data.address || "",
                    phoneNumber: data.data.phoneNumber || "",
                });
            }
        } catch (err) {
            console.error("Profile Fetch Error:", err);
            const savedUser = localStorage.getItem("user");
            if (savedUser) {
                const parsed = JSON.parse(savedUser);
                setUser(parsed);
                setFormData({
                    name: parsed.name,
                    dob: parsed.dob ? parsed.dob.split('T')[0] : "",
                    gender: parsed.gender || "",
                    bloodGroup: parsed.bloodGroup || "",
                    address: parsed.address || "",
                    phoneNumber: parsed.phoneNumber || "",
                });
            }
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchUserData();
    }, [navigate]);

    useEffect(() => {
        if (!loading && user) {
            const ctx = gsap.context(() => {
                gsap.from(".profile-reveal", {
                    y: 40,
                    opacity: 0,
                    duration: 1.2,
                    stagger: 0.1,
                    ease: "power4.out"
                });

                gsap.from(".profile-card", {
                    scale: 0.95,
                    opacity: 0,
                    duration: 1.5,
                    ease: "expo.out"
                });
            }, containerRef);
            return () => ctx.revert();
        }
    }, [loading, user, isEditing]); // Re-run animations slightly when entering edit mode? Maybe not.

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setSelectedFile(file);
            const reader = new FileReader();
            reader.onloadend = () => {
                setImagePreview(reader.result);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSave = async () => {
        try {
            setLoading(true);
            const token = localStorage.getItem("token");
            const submitData = new FormData();

            Object.keys(formData).forEach(key => {
                submitData.append(key, formData[key]);
            });

            if (selectedFile) {
                submitData.append("image", selectedFile);
            }

            const res = await axios.patch(`${API_URL}/users/profile`, submitData, {
                headers: {
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "multipart/form-data"
                }
            });

            if (res.data.success) {
                setUser(res.data.user);
                localStorage.setItem("user", JSON.stringify(res.data.user));
                setIsEditing(false);
                setSelectedFile(null);
                setImagePreview(null);
                window.dispatchEvent(new Event("authUpdate"));
            }
        } catch (err) {
            console.error("Save Error:", err);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="h-screen w-full flex items-center justify-center bg-[#F0FDFA]">
                <div className="flex flex-col items-center gap-4">
                    <div className="w-12 h-12 border-2 border-[#0F766E]/20 border-t-[#0F766E] rounded-full animate-spin" />
                    <p className="text-[10px] uppercase tracking-[0.4em] text-[#1E293B]/40">Loading profile...</p>
                </div>
            </div>
        );
    }

    if (!user) return null;

    return (
        <div ref={containerRef} className="min-h-screen bg-[#F0FDFA] text-[#1E293B] pt-32 pb-20 px-6">
            <div className="max-w-4xl mx-auto">

                {/* HEADER */}
                <div className="flex items-center justify-between mb-16 profile-reveal">
                    <button
                        onClick={() => navigate("/")}
                        className="group flex items-center gap-3 text-[10px] uppercase tracking-[0.3em] font-bold text-[#1E293B]/40 hover:text-[#1E293B] transition-all"
                    >
                        <ArrowLeft size={14} className="group-hover:-translate-x-1 transition-transform" />
                        Back to Home
                    </button>
                    <div className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-[#0F766E]" />
                        <span className="text-[10px] uppercase tracking-[0.4em] font-bold opacity-30 italic font-serif">Verified Identity</span>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-12">

                    {/* PROFILE CARD */}
                    <div className="md:col-span-1 space-y-8">
                        <div className="profile-card relative aspect-square bg-white border border-[#1E293B]/5 rounded-3xl p-2 shadow-sm overflow-hidden group">
                            <div className="w-full h-full bg-[#F0FDFA] rounded-[22px] flex items-center justify-center overflow-hidden relative">
                                {imagePreview || user.image ? (
                                    <img
                                        src={imagePreview || user.image}
                                        alt={user.name}
                                        className="w-full h-full object-cover"
                                    />
                                ) : (
                                    <div className="text-[10vw] md:text-[5vw] font-serif italic text-[#0F766E]">
                                        {user.name?.charAt(0)}
                                    </div>
                                )}

                                {isEditing && (
                                    <div
                                        onClick={() => fileInputRef.current.click()}
                                        className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                                    >
                                        <div className="flex flex-col items-center gap-2 text-white">
                                            <Camera size={24} />
                                            <span className="text-[8px] uppercase tracking-[0.2em] font-bold text-center px-4">Update Image</span>
                                        </div>
                                    </div>
                                )}
                            </div>
                            <input
                                type="file"
                                ref={fileInputRef}
                                onChange={handleFileChange}
                                className="hidden"
                                accept="image/*"
                            />
                            <div className="absolute top-6 right-6 flex gap-2">
                                <Shield size={16} className="text-[#0F766E]" />
                            </div>
                        </div>

                        <div className="profile-reveal space-y-2">
                            {isEditing ? (
                                <input
                                    type="text"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    className="w-full bg-[#F0FDFA] border-b border-[#1E293B]/20 text-4xl font-light tracking-tighter uppercase leading-none focus:border-[#0F766E] outline-none py-2"
                                    placeholder="Legal Name"
                                />
                            ) : (
                                <h1 className="text-4xl font-light tracking-tighter uppercase leading-none">
                                    {user.name}
                                </h1>
                            )}
                            <p className="text-[10px] uppercase tracking-[0.3em] font-bold text-[#0F766E]">
                                {user.role} Account
                            </p>
                        </div>
                    </div>

                    {/* DATA GRID */}
                    <div className="md:col-span-2 bg-white border border-[#1E293B]/5 rounded-3xl p-10 shadow-xl profile-reveal">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-12 gap-y-10">

                            <InfoItem
                                icon={<Mail size={16} />}
                                label="Electronic Mail"
                                value={user.email}
                                isEditing={false}
                            />

                            <InfoItem
                                icon={<Calendar size={16} />}
                                label="Date of Birth"
                                value={user.dob ? new Date(user.dob).toLocaleDateString() : "Not Provided"}
                                isEditing={isEditing}
                                input={
                                    <input
                                        type="date"
                                        value={formData.dob}
                                        onChange={(e) => setFormData({ ...formData, dob: e.target.value })}
                                        className="w-full bg-[#F0FDFA] border border-[#1E293B]/5 rounded-xl px-4 py-3 text-sm outline-none focus:border-[#0F766E]/40 mt-2 font-medium"
                                    />
                                }
                            />

                            <InfoItem
                                icon={<User size={16} />}
                                label="Clinical Gender"
                                value={user.gender || "Not Specified"}
                                isEditing={isEditing}
                                input={
                                    <select
                                        value={formData.gender}
                                        onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                                        className="w-full bg-[#F0FDFA] border border-[#1E293B]/5 rounded-xl px-4 py-3 text-sm outline-none focus:border-[#0F766E]/40 mt-2 font-medium appearance-none"
                                    >
                                        <option value="">Select Gender</option>
                                        <option value="MALE">MALE</option>
                                        <option value="FEMALE">FEMALE</option>
                                        <option value="OTHER">OTHER</option>
                                        <option value="PREFER_NOT_TO_SAY">PREFER NOT TO SAY</option>
                                    </select>
                                }
                            />

                            <InfoItem
                                icon={<Award size={16} />}
                                label="Blood Group"
                                value={user.bloodGroup || "O+"}
                                isEditing={isEditing}
                                input={
                                    <input
                                        type="text"
                                        value={formData.bloodGroup}
                                        onChange={(e) => setFormData({ ...formData, bloodGroup: e.target.value })}
                                        className="w-full bg-[#F0FDFA] border border-[#1E293B]/5 rounded-xl px-4 py-3 text-sm outline-none focus:border-[#0F766E]/40 mt-2 font-medium"
                                        placeholder="e.g. AB+"
                                    />
                                }
                            />

                            <InfoItem
                                icon={<Phone size={16} />}
                                label="Contact Vector"
                                value={user.phoneNumber || "N/A"}
                                isEditing={isEditing}
                                input={
                                    <input
                                        type="text"
                                        value={formData.phoneNumber}
                                        onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
                                        className="w-full bg-[#F0FDFA] border border-[#1E293B]/5 rounded-xl px-4 py-3 text-sm outline-none focus:border-[#0F766E]/40 mt-2 font-medium"
                                        placeholder="Phone Number"
                                    />
                                }
                            />

                            <div className="sm:col-span-2">
                                <InfoItem
                                    icon={<MapPin size={16} />}
                                    label="Physical Residence"
                                    value={user.address || "No address on record."}
                                    isEditing={isEditing}
                                    input={
                                        <textarea
                                            value={formData.address}
                                            onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                                            className="w-full bg-[#F0FDFA] border border-[#1E293B]/5 rounded-xl px-4 py-3 text-sm outline-none focus:border-[#0F766E]/40 mt-2 min-h-[100px] font-medium resize-none"
                                            placeholder="Full Signature Address"
                                        />
                                    }
                                />
                            </div>
                        </div>

                        <div className="mt-16 pt-10 border-t border-[#1E293B]/5 flex justify-between items-center">
                            <div className="flex flex-col gap-1">
                                <span className="text-[9px] uppercase tracking-[0.2em] font-bold text-[#1E293B]/30">Account ID</span>
                                <span className="text-[10px] font-mono text-[#1E293B]/40">{user._id || user.id}</span>
                            </div>

                            {isEditing ? (
                                <div className="flex gap-4">
                                    <button
                                        onClick={() => setIsEditing(false)}
                                        className="flex items-center gap-2 px-6 py-3 text-[10px] uppercase tracking-[0.2em] font-bold border border-[#1E293B]/10 rounded-full hover:bg-black/5 transition-all duration-500"
                                    >
                                        <X size={14} /> Abandon
                                    </button>
                                    <button
                                        onClick={handleSave}
                                        disabled={loading}
                                        className="flex items-center gap-2 px-8 py-3 text-[10px] uppercase tracking-[0.2em] font-bold bg-[#1E293B] text-white rounded-full hover:bg-[#0F766E] transition-all duration-500 disabled:opacity-50"
                                    >
                                        {loading ? "Syncing..." : <><Check size={14} /> Commit Changes</>}
                                    </button>
                                </div>
                            ) : (
                                <button
                                    onClick={() => setIsEditing(true)}
                                    className="flex items-center gap-3 px-8 py-3 text-[10px] uppercase tracking-[0.2em] font-bold border border-[#1E293B]/10 rounded-full hover:bg-[#1E293B] hover:text-white transition-all duration-500"
                                >
                                    <Edit3 size={14} /> Modify Protocol
                                </button>
                            )}
                        </div>
                    </div>

                </div>

                {/* SECURITY INFO */}
                <div className="mt-24 grid grid-cols-1 md:grid-cols-2 gap-8 profile-reveal">
                    <div className="p-8 bg-[#0F766E]/5 border border-[#0F766E]/10 rounded-2xl flex gap-6 items-start">
                        <div className="p-3 bg-white rounded-xl shadow-sm">
                            <Shield size={20} className="text-[#0F766E]" />
                        </div>
                        <div className="space-y-2">
                            <h3 className="text-[11px] font-bold uppercase tracking-[0.2em]">Privacy Protocol</h3>
                            <p className="text-[10px] leading-relaxed opacity-50 uppercase tracking-widest">Your data is encrypted using military-grade standards. Only verified clinical practitioners can access your medical records.</p>
                        </div>
                    </div>
                    <div className="p-8 bg-[#1E293B]/5 border border-[#1E293B]/10 rounded-2xl flex gap-6 items-start">
                        <div className="p-3 bg-white rounded-xl shadow-sm">
                            <Hash size={20} className="text-[#1E293B]" />
                        </div>
                        <div className="space-y-2">
                            <h3 className="text-[11px] font-bold uppercase tracking-[0.2em]">Activity Ledger</h3>
                            <p className="text-[10px] leading-relaxed opacity-50 uppercase tracking-widest">Last login detected from a secure terminal. 2-Factor Authentication is active.</p>
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
};

const InfoItem = ({ icon, label, value, isEditing, input }) => (
    <div className="space-y-3 group">
        <div className="flex items-center gap-3 text-[#1E293B]/30 group-hover:text-[#0F766E] transition-colors">
            {icon}
            <span className="text-[9px] uppercase tracking-[0.3em] font-bold">{label}</span>
        </div>
        <div className="pl-7">
            {isEditing && input ? (
                input
            ) : (
                <p className="text-xl font-light tracking-tight text-[#1E293B] group-hover:italic transition-all uppercase">
                    {value}
                </p>
            )}
        </div>
    </div>
);

export default Profile;
