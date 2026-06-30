"use client";
import { useState, useRef } from "react";
import { Button } from "@/components/ui/Button";

export function NoticeExplainer() {
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [language, setLanguage] = useState("Hindi");
  const [explanation, setExplanation] = useState("");
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      setFile(selectedFile);
      setPreviewUrl(URL.createObjectURL(selectedFile));
      setExplanation(""); // Reset explanation when new file uploaded
    }
  };

  const toBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = error => reject(error);
    });
  };

  const handleExplain = async () => {
    if (!file) return;
    setLoading(true);
    setExplanation("");
    try {
      const base64Image = await toBase64(file);
      const res = await fetch("/api/ai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          input: "Explain what this school notice/circular says.",
          systemPrompt: `You are a helpful assistant for parents in an Indian school. Look at the provided image (a school notice). Extract the key points, dates, and instructions. Summarize it in 2-4 bullet points. Translate the summary into ${language}. Use clear and simple words. Return ONLY the translated summary.`,
          image: base64Image
        }),
      });
      const data = await res.json();
      if (data.result) setExplanation(data.result);
      else setExplanation("Could not analyze the image. Please try again.");
    } catch (err) {
      console.error(err);
      setExplanation("Error analyzing image.");
    } finally {
      setLoading(false);
    }
  };

  const playAudio = () => {
    if (!explanation || !window.speechSynthesis) return;
    const utterance = new SpeechSynthesisUtterance(explanation);
    if (language === "Hindi") utterance.lang = "hi-IN";
    else if (language === "Gujarati") utterance.lang = "gu-IN";
    else if (language === "Marathi") utterance.lang = "mr-IN";
    else if (language === "Tamil") utterance.lang = "ta-IN";
    else if (language === "Telugu") utterance.lang = "te-IN";
    else if (language === "Bengali") utterance.lang = "bn-IN";
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
      padding: "var(--space-6)"
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "var(--space-6)" }}>
         <div style={{ fontSize: "2rem", background: "linear-gradient(135deg, var(--color-secondary), var(--color-primary))", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
           📸
         </div>
         <div>
           <h3 style={{ margin: 0, fontSize: "1.4rem", fontWeight: 700 }}>Smart Notice Explainer</h3>
           <p style={{ margin: 0, color: "var(--color-text-muted)", fontSize: "0.9rem" }}>Gemini Vision OCR + Translation</p>
         </div>
      </div>
      
      <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-5)" }}>
        
        {/* Animated Dropzone */}
        <div 
          onClick={() => fileInputRef.current?.click()}
          style={{ 
            border: "2px dashed var(--color-primary)",
            borderRadius: "var(--radius-lg)",
            padding: previewUrl ? "var(--space-2)" : "var(--space-8)",
            textAlign: "center",
            cursor: "pointer",
            background: previewUrl ? "white" : "rgba(99, 102, 241, 0.05)",
            transition: "all 0.3s ease",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            minHeight: "180px",
            position: "relative",
            overflow: "hidden"
          }}
          onMouseOver={(e) => e.currentTarget.style.background = previewUrl ? "white" : "rgba(99, 102, 241, 0.1)"}
          onMouseOut={(e) => e.currentTarget.style.background = previewUrl ? "white" : "rgba(99, 102, 241, 0.05)"}
        >
          <input 
            type="file" 
            accept="image/*" 
            onChange={handleFileChange} 
            ref={fileInputRef}
            style={{ display: "none" }}
          />

          {previewUrl ? (
            <img src={previewUrl} alt="Preview" className="fade-in" style={{ width: "100%", maxHeight: "250px", objectFit: "contain", borderRadius: "var(--radius-sm)" }} />
          ) : (
            <div className="fade-in">
              <div style={{ fontSize: "2.5rem", marginBottom: "var(--space-2)", color: "var(--color-primary)" }}>📄</div>
              <p style={{ margin: 0, fontWeight: 600, color: "var(--color-primary-dark)" }}>Click to upload school circular</p>
              <p style={{ margin: 0, fontSize: "0.85rem", color: "var(--color-text-muted)", marginTop: "4px" }}>PNG, JPG up to 5MB</p>
            </div>
          )}
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <div style={{ flex: 1 }}>
            <label style={{ fontSize: "0.85rem", fontWeight: 600, color: "var(--color-text-muted)", display: "block", marginBottom: "4px" }}>Translate output to:</label>
            <select 
              className="input" 
              value={language} 
              onChange={e => setLanguage(e.target.value)}
              style={{ width: "100%", padding: "10px", borderRadius: "8px", border: "1px solid var(--color-border)", background: "var(--color-bg)" }}
            >
              <option value="Hindi">हिंदी (Hindi)</option>
              <option value="Gujarati">ગુજરાતી (Gujarati)</option>
              <option value="Marathi">मराठी (Marathi)</option>
              <option value="Tamil">தமிழ் (Tamil)</option>
              <option value="Telugu">తెలుగు (Telugu)</option>
              <option value="Bengali">বাংলা (Bengali)</option>
              <option value="English">English</option>
            </select>
          </div>
          <div style={{ flex: 1, display: "flex", alignItems: "flex-end" }}>
             <Button variant="primary" onClick={handleExplain} disabled={!file || loading} style={{ width: "100%", padding: "10px", height: "43px" }}>
               {loading ? (
                 <span style={{ display: "flex", alignItems: "center", gap: "8px", justifyContent: "center" }}>
                   <div className="spinner" style={{ width: "14px", height: "14px", borderWidth: "2px", borderColor: "white transparent white transparent" }} />
                   Analyzing...
                 </span>
               ) : "Explain Notice ✨"}
             </Button>
          </div>
        </div>

        {explanation && (
          <div className="fade-in" style={{ 
            padding: "var(--space-5)", 
            background: "linear-gradient(to bottom right, #ffffff, #f8fafc)", 
            borderRadius: "var(--radius-lg)", 
            border: "1px solid var(--color-border)",
            boxShadow: "inset 0 2px 4px rgba(0,0,0,0.02)"
          }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "var(--space-3)" }}>
               <h4 style={{ color: "var(--color-primary-dark)", margin: 0, display: "flex", alignItems: "center", gap: "8px" }}>
                 <span style={{ fontSize: "1.2rem" }}>🤖</span> Gemini Explanation:
               </h4>
               <Button variant="outline" size="sm" onClick={playAudio} style={{ background: "white", padding: "4px 12px", borderRadius: "16px", fontSize: "0.8rem", color: "var(--color-primary)" }}>
                 🔊 Read Aloud
               </Button>
            </div>
            
            <p style={{ whiteSpace: "pre-line", fontSize: "1rem", lineHeight: 1.6, color: "var(--color-text)", margin: 0 }}>
              {explanation}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
