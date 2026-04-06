// app/send-otp/page.tsx
"use client";

import { useState } from "react";
import { Send, Mail, MessageSquare, Smartphone, ArrowLeft } from "lucide-react";
import BackToHomeButton from "@/components/common/BackToHomeButton";

interface ApiResponse {
  success: boolean;
  message: string;
  channel?: string;
  error?: string;
}

export default function SendOtpPage() {
  const [selectedChannel, setSelectedChannel] = useState<
    "email" | "telegram" | "sms"
  >("email");
  const [email, setEmail] = useState("ekatomarar@gmail.com");
  const [telegram, setTelegram] = useState("");
  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const handleSendOtp = async () => {
    // Reset messages
    setSuccessMessage("");
    setErrorMessage("");
    setLoading(true);

    // Validate inputs
    if (selectedChannel === "email" && !email) {
      setErrorMessage("Email tidak boleh kosong");
      setLoading(false);
      return;
    }

    if (selectedChannel === "telegram" && !telegram) {
      setErrorMessage("Telegram ID/Username tidak boleh kosong");
      setLoading(false);
      return;
    }

    if (selectedChannel === "sms" && !phone) {
      setErrorMessage("Nomor telepon tidak boleh kosong");
      setLoading(false);
      return;
    }

    // Prepare payload
    const payload: Record<string, string> = {
      channel: selectedChannel,
    };

    if (selectedChannel === "email") {
      payload.email = email;
    } else if (selectedChannel === "telegram") {
      payload.telegram = telegram;
    } else if (selectedChannel === "sms") {
      payload.phone = phone;
    }

    try {
      const response = await fetch("/api/register/send-otp", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const data: ApiResponse = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Gagal mengirim kode OTP");
      }

      setSuccessMessage(data.message);

      // Reset form after successful send (optional)
      if (selectedChannel === "telegram") {
        setTelegram("");
      } else if (selectedChannel === "sms") {
        setPhone("");
      }
    } catch (error) {
      console.error("Error sending OTP:", error);
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "Terjadi kesalahan saat mengirim kode",
      );
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    // Navigasi kembali ke form sebelumnya
    window.history.back();
  };

  return (
    <div className="min-h-screen bg-white flex items-center justify-center p-6 relative overflow-hidden">
      {/* Background Decor */}
      <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-brand-yellow-50/50 rounded-full blur-[120px] -translate-y-1/2 translate-x-1/2 pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-brand-blue-50/30 rounded-full blur-[100px] -translate-x-1/2 translate-y-1/2 pointer-events-none" />
      <div className="absolute inset-0 bg-[url('/grid-pattern.svg')] opacity-[0.02] pointer-events-none" />

      <BackToHomeButton position="top-left" />
      <div className="app-card bg-white rounded-[2.5rem] shadow-lg border border-brand-blue-100 w-full max-w-md p-6 md:p-8 relative z-10">
        {/* Soft decorative blur inside card */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-brand-blue-50/30 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none" />
        {/* Header */}
        <div className="mb-8 relative z-10">
          <div className="flex items-center justify-between mb-4">
            <button
              onClick={handleBack}
              className="flex items-center text-ink-600 hover:text-brand-blue-700 transition-colors"
            >
              <div className="w-8 h-8 rounded-full bg-brand-blue-50 border border-brand-blue-100 flex items-center justify-center hover:scale-110 transition-transform mr-3">
                <ArrowLeft className="w-4 h-4" />
              </div>
              <span className="text-sm font-bold">Kembali ke Form</span>
            </button>
          </div>

          <h1 className="text-2xl font-black text-ink-950 mb-2">
            Kirim Kode Verifikasi
          </h1>
          <p className="text-ink-600 text-sm font-medium">
            Pilih salah satu channel untuk menerima kode OTP
          </p>
        </div>

        {/* Channel Selection */}
        <div className="mb-8 relative z-10">
          <h2 className="text-sm font-bold text-ink-950 mb-4 tracking-wide">
            PILIH CHANNEL PENGIRIMAN:
          </h2>

          <div className="space-y-3">
            {/* Telegram Option */}
            <div
              className={`p-4 border-2 rounded-xl cursor-pointer transition-all app-card ${selectedChannel === "telegram"
                  ? "border-brand-blue-600 bg-brand-blue-50 shadow-md scale-[1.02]"
                  : "border-surface-200 bg-white hover:border-brand-blue-200 hover:shadow-sm"
                }`}
              onClick={() => setSelectedChannel("telegram")}
            >
              <div className="flex items-center">
                <div
                  className={`p-2 rounded-lg mr-3 transition-colors ${selectedChannel === "telegram"
                      ? "bg-brand-blue-600"
                      : "bg-brand-yellow-100"
                    }`}
                >
                  <MessageSquare
                    className={`w-5 h-5 ${selectedChannel === "telegram"
                        ? "text-white"
                        : "text-brand-blue-700"
                      }`}
                  />
                </div>
                <div className="flex-1">
                  <div className="flex justify-between items-center">
                    <span className={`font-black ${selectedChannel === "telegram" ? "text-brand-blue-900" : "text-ink-900"}`}>Telegram</span>
                    <div
                      className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${selectedChannel === "telegram"
                          ? "border-brand-blue-600"
                          : "border-brand-yellow-300"
                        }`}
                    >
                      {selectedChannel === "telegram" && (
                        <div className="w-2.5 h-2.5 rounded-full bg-brand-blue-600"></div>
                      )}
                    </div>
                  </div>
                  <p className="text-xs text-ink-600 font-medium mt-1">
                    Kode dikirim ke akun Telegram (Real-time)
                  </p>
                </div>
              </div>
            </div>

            {/* Email Option */}
            <div
              className={`p-4 border-2 rounded-xl cursor-pointer transition-all app-card ${selectedChannel === "email"
                  ? "border-brand-blue-600 bg-brand-yellow-50 shadow-md scale-[1.02]"
                  : "border-brand-yellow-200 bg-white hover:border-brand-blue-200 hover:shadow-sm"
                }`}
              onClick={() => setSelectedChannel("email")}
            >
              <div className="flex items-center">
                <div
                  className={`p-2 rounded-lg mr-3 transition-colors ${selectedChannel === "email" ? "bg-brand-blue-600" : "bg-brand-yellow-100"
                    }`}
                >
                  <Mail
                    className={`w-5 h-5 ${selectedChannel === "email"
                        ? "text-white"
                        : "text-brand-blue-700"
                      }`}
                  />
                </div>
                <div className="flex-1">
                  <div className="flex justify-between items-center">
                    <span className={`font-black ${selectedChannel === "email" ? "text-brand-blue-900" : "text-ink-900"}`}>
                      Email{" "}
                      <span className="text-brand-blue-600 bg-brand-blue-100 px-2 py-0.5 rounded text-[10px] font-bold ml-1">
                        GRATIS
                      </span>
                    </span>
                    <div
                      className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${selectedChannel === "email"
                          ? "border-brand-blue-600"
                          : "border-brand-yellow-300"
                        }`}
                    >
                      {selectedChannel === "email" && (
                        <div className="w-2.5 h-2.5 rounded-full bg-brand-blue-600"></div>
                      )}
                    </div>
                  </div>
                  <p className="text-xs text-ink-600 font-medium mt-1">
                    Kode dikirim ke email orang tua
                  </p>
                  {selectedChannel === "email" && (
                    <div className="mt-2 p-2 bg-brand-yellow-100 border border-brand-yellow-200 rounded-lg">
                      <p className="text-[11px] text-brand-blue-800 font-bold">
                        ✓ Akan dikirim ke: {email}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* SMS Option */}
            <div
              className={`p-4 border-2 rounded-xl cursor-pointer transition-all app-card ${selectedChannel === "sms"
                  ? "border-brand-blue-600 bg-brand-yellow-50 shadow-md scale-[1.02]"
                  : "border-brand-yellow-200 bg-white hover:border-brand-blue-200 hover:shadow-sm"
                }`}
              onClick={() => setSelectedChannel("sms")}
            >
              <div className="flex items-center">
                <div
                  className={`p-2 rounded-lg mr-3 transition-colors ${selectedChannel === "sms" ? "bg-brand-blue-600" : "bg-brand-yellow-100"
                    }`}
                >
                  <Smartphone
                    className={`w-5 h-5 ${selectedChannel === "sms"
                        ? "text-white"
                        : "text-brand-blue-700"
                      }`}
                  />
                </div>
                <div className="flex-1">
                  <div className="flex justify-between items-center">
                    <span className={`font-black ${selectedChannel === "sms" ? "text-brand-blue-900" : "text-ink-900"}`}>SMS</span>
                    <div
                      className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${selectedChannel === "sms"
                          ? "border-brand-blue-600"
                          : "border-brand-yellow-300"
                        }`}
                    >
                      {selectedChannel === "sms" && (
                        <div className="w-2.5 h-2.5 rounded-full bg-brand-blue-600"></div>
                      )}
                    </div>
                  </div>
                  <p className="text-xs text-ink-600 font-medium mt-1">
                    Pilihan tepat jika internet terbatas
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Input Fields */}
        <div className="mb-8 relative z-10">
          {selectedChannel === "telegram" && (
            <div className="space-y-2">
              <label className="block text-xs font-black text-ink-600 uppercase tracking-widest pl-1">
                Telegram Username/ID
              </label>
              <input
                type="text"
                value={telegram}
                onChange={(e) => setTelegram(e.target.value)}
                placeholder="@username atau ID Telegram"
                className="w-full px-5 py-3 md:px-6 md:py-4 rounded-xl bg-brand-yellow-50 border border-transparent focus:bg-white focus:border-brand-blue-200 focus:ring-4 focus:ring-brand-yellow-50 transition-all font-bold text-ink-950 placeholder:font-medium placeholder:text-ink-500 text-sm md:text-base"
                disabled={loading}
              />
            </div>
          )}

          {selectedChannel === "email" && (
            <div className="space-y-2">
              <label className="block text-xs font-black text-ink-600 uppercase tracking-widest pl-1">
                Email Orang Tua
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="nama@email.com"
                className="w-full px-5 py-3 md:px-6 md:py-4 rounded-xl bg-brand-yellow-50 border border-transparent focus:bg-white focus:border-brand-blue-200 focus:ring-4 focus:ring-brand-yellow-50 transition-all font-bold text-ink-950 placeholder:font-medium placeholder:text-ink-500 text-sm md:text-base"
                disabled={loading}
              />
            </div>
          )}

          {selectedChannel === "sms" && (
            <div className="space-y-2">
              <label className="block text-xs font-black text-ink-600 uppercase tracking-widest pl-1">
                Nomor Telepon
              </label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="081234567890"
                className="w-full px-5 py-3 md:px-6 md:py-4 rounded-xl bg-brand-yellow-50 border border-transparent focus:bg-white focus:border-brand-blue-200 focus:ring-4 focus:ring-brand-yellow-50 transition-all font-bold text-ink-950 placeholder:font-medium placeholder:text-ink-500 text-sm md:text-base"
                disabled={loading}
              />
            </div>
          )}
        </div>

        {/* Messages */}
        <div className="relative z-10">
          {successMessage && (
            <div className="mb-4 p-4 bg-teal-50 border border-teal-200 text-teal-800 rounded-[1rem] shadow-sm">
              <div className="flex items-center">
                <div className="w-5 h-5 rounded-full bg-teal-500 flex items-center justify-center mr-2">
                  <span className="text-white text-xs">✓</span>
                </div>
                <span className="font-bold text-sm">{successMessage}</span>
              </div>
            </div>
          )}

          {errorMessage && (
            <div className="mb-4 p-4 bg-red-50 border border-red-200 text-red-800 rounded-[1rem] shadow-sm">
              <div className="flex items-center">
                <div className="w-5 h-5 rounded-full bg-red-500 flex items-center justify-center mr-2">
                  <span className="text-white text-xs">!</span>
                </div>
                <span className="font-bold text-sm">{errorMessage}</span>
              </div>
            </div>
          )}
        </div>

        {/* Submit Button */}
        <button
          onClick={handleSendOtp}
          disabled={loading}
          className={`relative z-10 w-full py-4 md:py-5 rounded-pill font-black text-lg text-white flex items-center justify-center shadow-md transition-all active:scale-95 border border-transparent disabled:opacity-50 hover:bg-brand-yellow-100 hover:text-brand-blue-900 border-brand-blue-900 bg-brand-blue-900`}
        >
          {loading ? (
            <>
              <svg
                className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                ></circle>
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                ></path>
              </svg>
              Mengirim kode...
            </>
          ) : (
            <>
              <Send className="w-5 h-5 mr-2" />
              Kirim Kode OTP
            </>
          )}
        </button>

        {/* Tips */}
        <div className="mt-6 p-4 bg-brand-blue-50 rounded-[1.5rem] border border-brand-blue-100 relative z-10">
          <h3 className="text-xs font-black text-ink-950 mb-2 uppercase tracking-widest pl-1">
            Tips Pemilihan Channel
          </h3>
          <ul className="text-xs text-ink-600 space-y-2 font-medium">
            <li className="flex items-start">
              <span className="text-brand-blue-500 mr-2 flex-shrink-0 mt-0.5">•</span>
              <span>
                <strong>Telegram</strong> jika ingin notifikasi real-time gratis
              </span>
            </li>
            <li className="flex items-start">
              <span className="text-brand-blue-500 mr-2 flex-shrink-0 mt-0.5">•</span>
              <span>
                <strong>Email</strong> untuk dokumentasi resmi
              </span>
            </li>
            <li className="flex items-start">
              <span className="text-brand-blue-500 mr-2 flex-shrink-0 mt-0.5">•</span>
              <span>
                <strong>SMS</strong> jika internet terbatas
              </span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}
