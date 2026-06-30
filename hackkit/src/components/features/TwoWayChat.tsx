"use client";
import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/Button";
import { useAuth } from "@/contexts/AuthContext";

type Message = {
  id: string;
  senderId: string;
  senderRole: string;
  originalText: string;
  translatedText?: string;
  timestamp: Date;
};

// Mock database to persist chat history locally
const mockDatabase: Record<string, Message[]> = {
  "stu-1": [
    {
      id: "1",
      senderId: "teacher-1",
      senderRole: "teacher",
      originalText: "Hello, Alex has been doing very well in Math this week. However, he forgot his homework yesterday. Could you please remind him?",
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2),
    }
  ],
  "stu-2": [
    {
      id: "2",
      senderId: "parent-2",
      senderRole: "parent",
      originalText: "Priya will be absent tomorrow due to a fever.",
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24),
    }
  ],
  "stu-3": []
};

type Props = {
  studentId?: string;
  studentName?: string;
  defaultLanguage?: string;
};

export function TwoWayChat({ studentId = "stu-1", studentName = "Alex", defaultLanguage = "Hindi" }: Props) {
  const { appUser } = useAuth();
  
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [language, setLanguage] = useState(defaultLanguage);
  const [loading, setLoading] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);

  const isTeacher = appUser?.role === "teacher";
  const myLanguage = isTeacher ? "English" : language;

  useEffect(() => {
    setMessages(mockDatabase[studentId] || []);
    if (!isTeacher) {
      setLanguage(defaultLanguage);
    }
  }, [studentId, defaultLanguage, isTeacher]);

  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [messages, language]);

  useEffect(() => {
    const translateMessages = async () => {
      if (messages.length === 0) return;
      
      const updatedMessages = await Promise.all(
        messages.map(async (msg) => {
          if (myLanguage === "English" && msg.senderRole === "teacher") {
            return { ...msg, translatedText: msg.originalText };
          }
          if (myLanguage !== "English" && msg.senderRole !== "teacher" && msg.originalText && msg.originalText !== "🎤 [Audio Message]") {
             return { ...msg, translatedText: msg.originalText };
          }
          if (msg.translatedText && msg.originalText === "🎤 [Audio Message]") {
             return msg; // Already translated from backend
          }

          try {
            const res = await fetch("/api/ai", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                input: msg.originalText,
                systemPrompt: `You are an expert translator for Indian EdTech. Translate the following text into ${myLanguage}. Ensure it sounds natural and respectful. Return ONLY the translated text.`,
              }),
            });
            const data = await res.json();
            return { ...msg, translatedText: data.result || msg.originalText };
          } catch {
            return msg;
          }
        })
      );
      
      setMessages(updatedMessages);
      mockDatabase[studentId] = updatedMessages;
    };
    
    translateMessages();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [language, appUser, studentId]);

  const handleSend = async () => {
    if (!input.trim()) return;
    submitMessage(input, input);
  };

  const submitMessage = async (original: string, textToTranslate: string) => {
    const newMsg: Message = {
      id: Date.now().toString(),
      senderId: appUser?.uid || "anon",
      senderRole: appUser?.role || "parent",
      originalText: original,
      translatedText: textToTranslate,
      timestamp: new Date(),
    };

    const newMessages = [...messages, newMsg];
    setMessages(newMessages);
    mockDatabase[studentId] = newMessages; 
    
    setInput("");
    setLoading(true);

    if (!isTeacher) {
      setTimeout(async () => {
        const replyText = "Thank you for letting me know. I will keep an eye on it.";
        try {
          const res = await fetch("/api/ai", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              input: replyText,
              systemPrompt: `Translate this into ${language}. Return ONLY the translation.`,
            }),
          });
          const data = await res.json();
          const teacherMsg: Message = {
            id: (Date.now() + 1).toString(),
            senderId: "teacher-1",
            senderRole: "teacher",
            originalText: replyText,
            translatedText: data.result || replyText,
            timestamp: new Date(),
          };
          const updatedMessages = [...mockDatabase[studentId], teacherMsg];
          setMessages(updatedMessages);
          mockDatabase[studentId] = updatedMessages;
        } catch {
           console.error("Translation failed");
        } finally {
          setLoading(false);
        }
      }, 3000);
    } else {
       setLoading(false);
    }
  };

  // --- AUDIO RECORDING LOGIC ---
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      chunksRef.current = [];

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(chunksRef.current, { type: 'audio/webm' });
        const base64Audio = await new Promise<string>((resolve) => {
          const reader = new FileReader();
          reader.readAsDataURL(audioBlob);
          reader.onloadend = () => resolve(reader.result as string);
        });
        
        handleAudioSubmit(base64Audio);
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
    } catch (err) {
      console.error("Error accessing microphone:", err);
      alert("Microphone access denied. Please allow permissions.");
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  const handleAudioSubmit = async (base64Audio: string) => {
    setLoading(true);
    try {
      const targetLang = isTeacher ? language : "English";
      const sourceLang = isTeacher ? "English" : language;
      const prompt = `Transcribe this ${sourceLang} audio, and translate it to ${targetLang}. Return ONLY the ${targetLang} translation. Do not include quotes or conversational filler.`;

      const res = await fetch("/api/ai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          input: prompt,
          systemPrompt: "You are an expert audio translator.",
          audio: base64Audio
        }),
      });
      const data = await res.json();
      
      const translated = data.result || "Could not transcribe audio.";
      submitMessage("🎤 [Audio Message]", translated);
    } catch (err) {
      console.error(err);
      setLoading(false);
    }
  };

  const playAudio = (text: string) => {
    if (!window.speechSynthesis) return;
    const utterance = new SpeechSynthesisUtterance(text);
    if (myLanguage === "Hindi") utterance.lang = "hi-IN";
    else if (myLanguage === "Gujarati") utterance.lang = "gu-IN";
    else if (myLanguage === "Marathi") utterance.lang = "mr-IN";
    else if (myLanguage === "Tamil") utterance.lang = "ta-IN";
    else if (myLanguage === "Telugu") utterance.lang = "te-IN";
    else if (myLanguage === "Bengali") utterance.lang = "bn-IN";
    else utterance.lang = "en-IN";
    window.speechSynthesis.speak(utterance);
  };

  return (
    <div style={{
      background: "rgba(255, 255, 255, 0.7)",
      backdropFilter: "blur(24px)",
      WebkitBackdropFilter: "blur(24px)",
      borderRadius: "var(--radius-xl)",
      border: "1px solid rgba(255, 255, 255, 0.9)",
      boxShadow: "0 20px 40px rgba(0,0,0,0.06)",
      overflow: "hidden",
      display: "flex",
      flexDirection: "column",
      height: "550px"
    }}>
      {/* Header */}
      <div style={{
        padding: "var(--space-4) var(--space-6)",
        background: "linear-gradient(to right, var(--color-primary), var(--color-primary-dark))",
        color: "white",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center"
      }}>
        <div>
          <h3 style={{ margin: 0, fontSize: "1.2rem", fontWeight: 600 }}>
            {isTeacher ? `Chat with ${studentName}'s Parent` : "Chat with Teacher"}
          </h3>
          <span style={{ fontSize: "0.85rem", opacity: 0.9 }}>🟢 Real-time AI Translation Active</span>
        </div>
        {!isTeacher && (
           <select 
              style={{
                background: "rgba(255,255,255,0.2)",
                border: "1px solid rgba(255,255,255,0.4)",
                color: "white",
                padding: "6px 12px",
                borderRadius: "20px",
                fontSize: "0.85rem",
                outline: "none",
                cursor: "pointer"
              }}
              value={language} 
              onChange={e => setLanguage(e.target.value)}
            >
              <option value="English" style={{ color: "black" }}>English</option>
              <option value="Hindi" style={{ color: "black" }}>हिंदी (Hindi)</option>
              <option value="Gujarati" style={{ color: "black" }}>ગુજરાતી (Gujarati)</option>
              <option value="Marathi" style={{ color: "black" }}>मराठी (Marathi)</option>
              <option value="Tamil" style={{ color: "black" }}>தமிழ் (Tamil)</option>
            </select>
        )}
      </div>

      {/* Chat Area */}
      <div 
        ref={chatContainerRef}
        style={{
          flex: 1,
          overflowY: "auto",
          padding: "var(--space-6)",
          display: "flex",
          flexDirection: "column",
          gap: "var(--space-4)",
          background: "rgba(249, 250, 251, 0.5)"
        }}
      >
        {messages.length === 0 ? (
          <div style={{ margin: "auto", textAlign: "center", color: "var(--color-text-muted)" }}>
             <div style={{ fontSize: "3rem", marginBottom: "8px", opacity: 0.5 }}>💬</div>
             <p>No messages yet.</p>
             <p style={{ fontSize: "0.85rem" }}>Send a message to start translating.</p>
          </div>
        ) : (
          messages.map((msg) => {
            const isMe = msg.senderRole === (appUser?.role || "parent");
            return (
              <div key={msg.id} className="fade-in" style={{
                display: "flex",
                flexDirection: "column",
                alignItems: isMe ? "flex-end" : "flex-start",
                maxWidth: "100%"
              }}>
                <div style={{
                  background: isMe ? "var(--color-primary)" : "white",
                  color: isMe ? "white" : "var(--color-text)",
                  padding: "12px 16px",
                  borderRadius: isMe ? "20px 20px 4px 20px" : "20px 20px 20px 4px",
                  boxShadow: "0 4px 10px rgba(0,0,0,0.05)",
                  maxWidth: "85%",
                  fontSize: "0.95rem",
                  lineHeight: "1.5"
                }}>
                  {msg.originalText === "🎤 [Audio Message]" && isMe && (
                     <div style={{ fontSize: "0.85rem", opacity: 0.8, marginBottom: "4px" }}>🎤 Voice Note Transcribed:</div>
                  )}
                  {msg.translatedText || "Translating..."}
                </div>
                
                {!isMe && msg.translatedText && (
                  <button 
                    onClick={() => playAudio(msg.translatedText!)}
                    style={{
                      marginTop: "6px",
                      marginLeft: "4px",
                      fontSize: "0.75rem",
                      background: "rgba(99, 102, 241, 0.1)",
                      border: "none",
                      color: "var(--color-primary-dark)",
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      gap: "4px",
                      padding: "4px 8px",
                      borderRadius: "12px",
                      fontWeight: 600,
                      transition: "all 0.2s"
                    }}
                  >
                    <span style={{ fontSize: "1rem" }}>🔊</span> Listen
                  </button>
                )}
              </div>
            );
          })
        )}
        {loading && (
          <div className="fade-in" style={{ alignSelf: "flex-start", padding: "var(--space-2)" }}>
            <div style={{ display: "flex", gap: "6px" }}>
               <div className="spinner" style={{ width: "8px", height: "8px", borderWidth: "2px", borderColor: "var(--color-primary) transparent var(--color-primary) transparent" }} />
               <span style={{ fontSize: "0.85rem", color: "var(--color-text-muted)" }}>{isTeacher ? "Translating from Parent..." : "Translating from Teacher..."}</span>
            </div>
          </div>
        )}
      </div>

      {/* Input Area */}
      <div style={{
        padding: "var(--space-4)",
        background: "white",
        borderTop: "1px solid var(--color-border)",
        display: "flex",
        gap: "var(--space-3)",
        alignItems: "center"
      }}>
        {/* Voice Recording Button */}
        <button
          onMouseDown={startRecording}
          onMouseUp={stopRecording}
          onMouseLeave={stopRecording}
          onTouchStart={startRecording}
          onTouchEnd={stopRecording}
          className={isRecording ? "recording-pulse" : ""}
          style={{
            width: "48px",
            height: "48px",
            borderRadius: "50%",
            border: "none",
            background: isRecording ? "#ef4444" : "var(--color-primary)",
            color: "white",
            fontSize: "1.5rem",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            cursor: "pointer",
            transition: "all 0.2s",
            transform: isRecording ? "scale(1.1)" : "scale(1)",
            flexShrink: 0
          }}
          title="Hold to Speak"
        >
          🎤
        </button>

        <input 
          style={{
            flex: 1,
            padding: "12px 16px",
            borderRadius: "24px",
            border: "1px solid var(--color-border)",
            outline: "none",
            fontSize: "0.95rem",
            background: "var(--color-surface)",
            transition: "all 0.2s"
          }}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSend()}
          placeholder={isRecording ? "Listening..." : (isTeacher ? "Type in English..." : `Type in ${language}...`)}
          disabled={isRecording}
        />
        <Button 
          variant="primary" 
          onClick={handleSend} 
          disabled={loading || isRecording}
          style={{ borderRadius: "24px", padding: "0 24px", height: "48px" }}
        >
          {loading ? "..." : "Send"}
        </Button>
      </div>
    </div>
  );
}
