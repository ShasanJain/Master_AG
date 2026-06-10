"use client";
import { useState } from "react";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { storage, db } from "@/lib/firebase";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardHeader } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";

export function FileUpload() {
  const { appUser } = useAuth();
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  async function handleUpload() {
    if (!file || !appUser) return;
    
    // Firestore has a 1MB limit per document. 800KB is a safe ceiling for base64 overhead.
    if (file.size > 800000) {
      setMessage("File is too large for the Hackathon Demo. Please use a file under 800KB.");
      return;
    }

    setLoading(true);
    setMessage("");

    try {
      // 1. Convert file to Base64 string directly in browser
      const base64String = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = (error) => reject(error);
      });

      // 2. Save the Base64 string directly into Firestore! No Storage bucket needed.
      await addDoc(collection(db, "resources"), {
        name: file.name,
        url: base64String, // The entire file is now stored here
        uploaderId: appUser.uid,
        uploaderRole: appUser.role,
        createdAt: serverTimestamp(),
      });

      setMessage("File uploaded successfully!");
      setFile(null);
    } catch (error) {
      console.error("Upload failed", error);
      setMessage("Upload failed.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Card as="article" elevated>
      <CardHeader title="Class Resources Hub" subtitle="Upload Syllabi & Forms" />
      <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-3)" }}>
        <input 
          type="file" 
          onChange={(e) => setFile(e.target.files?.[0] || null)} 
          className="input"
          accept=".pdf,.doc,.docx,.jpg,.png"
        />
        <Button variant="primary" onClick={handleUpload} loading={loading} disabled={!file}>
          Upload File
        </Button>
        {message && <p className="text-sm text-success">{message}</p>}
      </div>
    </Card>
  );
}
