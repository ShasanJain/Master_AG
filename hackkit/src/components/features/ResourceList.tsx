"use client";
import { useEffect, useState } from "react";
import { collection, query, orderBy, onSnapshot } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Card, CardHeader } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";

interface Resource {
  id: string;
  name: string;
  url: string;
  uploaderRole: string;
}

export function ResourceList() {
  const [resources, setResources] = useState<Resource[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Listen to the resources collection
    const q = query(collection(db, "resources"), orderBy("createdAt", "desc"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Resource[];
      setResources(data);
      setLoading(false);
    }, (error) => {
      console.error("Error fetching resources:", error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  return (
    <Card as="article" elevated>
      <CardHeader title="Download Center" subtitle="Class Files & Syllabi" />
      {loading ? (
        <p className="text-sm text-muted">Loading resources...</p>
      ) : resources.length === 0 ? (
        <p className="text-sm text-muted">No files have been uploaded yet.</p>
      ) : (
        <ul style={{ listStyle: "none", display: "flex", flexDirection: "column", gap: "var(--space-3)" }}>
          {resources.map((res) => (
            <li key={res.id} className="fade-in" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "var(--space-3)", background: "rgba(255,255,255,0.5)", borderRadius: "var(--radius-md)", border: "1px solid var(--color-border)" }}>
              <div>
                <p className="text-sm" style={{ fontWeight: 600, marginBottom: 0 }}>{res.name}</p>
                <p className="text-xs text-muted" style={{ marginBottom: 0 }}>Uploaded by: {res.uploaderRole}</p>
              </div>
              <a href={res.url} target="_blank" rel="noopener noreferrer" className="btn btn-outline btn-sm">
                Download
              </a>
            </li>
          ))}
        </ul>
      )}
    </Card>
  );
}
