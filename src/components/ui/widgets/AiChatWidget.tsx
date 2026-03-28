"use client";

import { useState, useRef, useEffect } from "react";
import { Send, X, Bot, User, Loader2, MessageSquare, Headphones } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface Message {
    id: string;
    role: "user" | "ai";
    content: string;
}

interface AiChatWidgetProps {
    onClose: () => void;
    onEscalate: () => void;
}

export default function AiChatWidget({ onClose, onEscalate }: AiChatWidgetProps) {
    const [messages, setMessages] = useState<Message[]>([
        {
            id: "welcome",
            role: "ai",
            content: "👋 Assalamu'alaikum! Saya asisten virtual Al-Imam. Ada yang bisa saya bantu terkait informasi pendaftaran, program unggulan, atau jadwal tes?",
        }
    ]);
    const [input, setInput] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [chatCount, setChatCount] = useState(0); // Track conversation length for escalation
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages, isLoading]);

    const handleSend = async () => {
        if (!input.trim() || isLoading) return;

        const userMsg = input.trim();
        setInput("");

        const newMessages: Message[] = [
            ...messages,
            { id: Date.now().toString(), role: "user", content: userMsg }
        ];

        setMessages(newMessages);
        setIsLoading(true);
        setChatCount(prev => prev + 1);

        try {
            // Map our existing messages (excluding the new one) to the format expected by our API route
            const history = messages.map(msg => ({
                role: msg.role === 'ai' ? 'model' : 'user',
                parts: [{ text: msg.content }]
            }));

            const response = await fetch("/api/chat", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ history, message: userMsg }),
            });

            const data = await response.json();

            if (!response.ok) {
                // Show the friendly reply from API (e.g. rate limit message) instead of hardcoded error
                const errorReply = data?.reply || "Maaf, terjadi kesalahan. Silakan coba lagi nanti atau hubungi CS kami.";
                setMessages(prev => [
                    ...prev,
                    { id: "error-" + Date.now(), role: "ai", content: errorReply }
                ]);
                // Auto-show escalation button if it's a server error
                setChatCount(prev => Math.max(prev, 3));
                return;
            }

            setMessages(prev => [
                ...prev,
                { id: (Date.now() + 1).toString(), role: "ai", content: data.reply }
            ]);

            // If the response contains specific phrases suggesting to contact CS, show escalation immediately
            if (
                data.reply.toLowerCase().includes("live chat cs") ||
                data.reply.toLowerCase().includes("live chat") ||
                data.reply.toLowerCase().includes("hubungi tim kami")
            ) {
                setChatCount(prev => Math.max(prev, 3)); // Force show escalation button
            }

        } catch (error) {
            console.error("Chat error:", error);
            setMessages(prev => [
                ...prev,
                { id: "error-" + Date.now(), role: "ai", content: "Maaf, koneksi terputus. Silakan coba lagi atau hubungi CS kami." }
            ]);
        } finally {
            setIsLoading(false);
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {
            handleSend();
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: 0.3 }}
            className="fixed bottom-0 md:bottom-28 right-0 md:right-6 z-10000 w-full md:w-[400px] h-[85vh] md:h-[550px] bg-white rounded-t-4xl md:rounded-4xl shadow-[0_10px_40px_rgba(0,0,0,0.15)] md:border border-surface-100 flex flex-col overflow-hidden"
            style={{
                // Using transform origin bottom right for desktop, bottom center for mobile
                transformOrigin: "bottom right"
            }}
        >
            {/* Header */}
            <div className="bg-maroon-800 text-white p-4 md:p-5 flex items-center justify-between shrink-0 shadow-sm relative z-10">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center shrink-0 border border-white/20">
                        <Bot className="w-6 h-6 text-cream-300" />
                    </div>
                    <div>
                        <h3 className="font-bold text-[15px] leading-tight flex items-center gap-2">
                            Al-Andalus Al-Imam Assistant
                            <span className="flex w-2 h-2 rounded-full bg-green-400"></span>
                        </h3>
                        <p className="text-[11px] text-maroon-200 mt-0.5 font-medium">Online • Bertenaga AI</p>
                    </div>
                </div>
                <button
                    onClick={onClose}
                    className="w-8 h-8 rounded-full hover:bg-white/10 flex items-center justify-center transition-colors"
                    aria-label="Tutup Chat"
                >
                    <X className="w-5 h-5" />
                </button>
            </div>

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-4 md:p-5 bg-surface-50/50 flex flex-col gap-4">

                {messages.map((msg) => (
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        key={msg.id}
                        className={`flex gap-3 ${msg.role === "user" ? "flex-row-reverse" : "flex-row"} items-end`}
                    >
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 mb-1 ${msg.role === "user"
                            ? "bg-maroon-100 text-maroon-700"
                            : "bg-maroon-600 text-white shadow-premium-xs"
                            }`}>
                            {msg.role === "user" ? <User className="w-4 h-4" /> : <Bot className="w-5 h-5" />}
                        </div>
                        <div className={`max-w-[75%] p-3.5 rounded-2xl ${msg.role === "user"
                            ? "bg-maroon-700 text-white rounded-br-none shadow-sm"
                            : "bg-white text-ink-900 border border-surface-100 rounded-bl-none shadow-premium-xs"
                            }`}>
                            <p className="text-[14px] leading-relaxed whitespace-pre-wrap">{msg.content}</p>
                        </div>
                    </motion.div>
                ))}

                {isLoading && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="flex gap-3 items-end"
                    >
                        <div className="w-8 h-8 rounded-full bg-maroon-600 text-white flex items-center justify-center shrink-0 mb-1 shadow-premium-xs">
                            <Bot className="w-5 h-5" />
                        </div>
                        <div className="bg-white p-4 rounded-2xl rounded-bl-none border border-surface-100 shadow-premium-xs flex gap-1 items-center h-12">
                            <motion.div animate={{ y: [0, -5, 0] }} transition={{ repeat: Infinity, duration: 0.6, delay: 0 }} className="w-1.5 h-1.5 bg-maroon-400 rounded-full" />
                            <motion.div animate={{ y: [0, -5, 0] }} transition={{ repeat: Infinity, duration: 0.6, delay: 0.2 }} className="w-1.5 h-1.5 bg-maroon-400 rounded-full" />
                            <motion.div animate={{ y: [0, -5, 0] }} transition={{ repeat: Infinity, duration: 0.6, delay: 0.4 }} className="w-1.5 h-1.5 bg-maroon-400 rounded-full" />
                        </div>
                    </motion.div>
                )}

                <div ref={messagesEndRef} className="h-1" />
            </div>

            {/* Escalation Button (Shows after 3 interactions) */}
            <AnimatePresence>
                {chatCount >= 3 && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        className="px-4 py-2 bg-linear-to-t from-surface-50 to-transparent"
                    >
                        <button
                            onClick={() => {
                                onEscalate();
                                onClose();
                            }}
                            className="w-full bg-white border border-teal-200 text-teal-700 hover:bg-teal-50 hover:border-teal-300 py-3 rounded-xl text-sm font-bold flex items-center justify-center gap-2 transition-all shadow-premium-xs"
                        >
                            <Headphones className="w-4 h-4" />
                            Chat Langsung dengan CS
                        </button>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Input Area */}
            <div className="p-4 bg-white border-t border-surface-100 shrink-0">
                <div className="flex gap-2">
                    <input
                        type="text"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyDown={handleKeyDown}
                        placeholder="Ketik pesan Anda..."
                        className="flex-1 bg-surface-50 border border-surface-200 rounded-xl px-4 py-3 text-[14px] text-ink-900 focus:outline-none focus:border-maroon-400 focus:ring-2 focus:ring-maroon-50 transition-all placeholder:text-ink-400"
                        disabled={isLoading}
                    />
                    <button
                        onClick={handleSend}
                        disabled={isLoading || !input.trim()}
                        className="w-12 h-[46px] bg-maroon-700 text-white rounded-xl flex items-center justify-center hover:bg-maroon-800 disabled:opacity-50 disabled:hover:bg-maroon-700 transition-colors shrink-0 shadow-sm"
                    >
                        {isLoading ? (
                            <Loader2 className="w-5 h-5 animate-spin" />
                        ) : (
                            <Send className="w-5 h-5 p-0.5" />
                        )}
                    </button>
                </div>
            </div>
        </motion.div>
    );
}
