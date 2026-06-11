"use client";
// dashboard/students/page.tsx — Full student roster + AI insights per student
import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";

type Student = {
  id: string;
  name: string;
  grade: string;
  parentName: string;
  parentLang: string;
  parentPhone: string;
  attendance: number; // percent
  lastGrade: string;
  status: "excellent" | "good" | "needs-attention" | "at-risk";
  notes: string;
  emoji: string;
};

const STUDENTS: Student[] = [
  { id: "stu-1", name: "Alex Fernandez", grade: "5A", parentName: "Maria Fernandez", parentLang: "Hindi", parentPhone: "+91 98765 43210", attendance: 94, lastGrade: "A", status: "excellent", notes: "Very engaged. Excels in math and science.", emoji: "👦" },
  { id: "stu-2", name: "Priya Sharma", grade: "5A", parentName: "Rajesh Sharma", parentLang: "Gujarati", parentPhone: "+91 87654 32109", attendance: 88, lastGrade: "B+", status: "good", notes: "Strong in languages, needs support in geometry.", emoji: "👧" },
  { id: "stu-3", name: "Rahul Verma", grade: "5A", parentName: "Sunita Verma", parentLang: "Marathi", parentPhone: "+91 76543 21098", attendance: 72, lastGrade: "C", status: "needs-attention", notes: "Frequent absences. Parent communication needed urgently.", emoji: "👦" },
  { id: "stu-4", name: "Ananya Iyer", grade: "5A", parentName: "Lakshmi Iyer", parentLang: "Tamil", parentPhone: "+91 65432 10987", attendance: 97, lastGrade: "A+", status: "excellent", notes: "Top of class. Representing school in district science fair.", emoji: "👧" },
  { id: "stu-5", name: "Kabir Khan", grade: "5A", parentName: "Amina Khan", parentLang: "Hindi", parentPhone: "+91 54321 09876", attendance: 61, lastGrade: "D", status: "at-risk", notes: "Struggling significantly. Recommend counsellor meeting with parents ASAP.", emoji: "👦" },
];

const STATUS_CONFIG = {
  "excellent":      { label: "Excellent",       color: "#10B981", bg: "rgba(16,185,129,0.1)"  },
  "good":           { label: "Good",            color: "#4F46E5", bg: "rgba(79,70,229,0.1)"   },
  "needs-attention":{ label: "Needs Attention", color: "#F59E0B", bg: "rgba(245,158,11,0.12)" },
  "at-risk":        { label: "At Risk",         color: "#EF4444", bg: "rgba(239,68,68,0.1)"   },
};

export default function StudentsPage() {
  const { appUser } = useAuth();
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [aiInsight, setAiInsight] = useState("");
  const [insightLoading, setInsightLoading] = useState(false);

  if (appUser?.role !== "teacher") {
    return <div className="container" style={{ paddingTop: "var(--space-12)", textAlign: "center" }}><p className="text-muted">This page is only accessible to teachers.</p></div>;
  }

  const filtered = STUDENTS.filter(s => {
    const matchesSearch = s.name.toLowerCase().includes(search.toLowerCase()) || s.parentName.toLowerCase().includes(search.toLowerCase());
    const matchesFilter = filterStatus === "all" || s.status === filterStatus;
    return matchesSearch && matchesFilter;
  });

  async function generateInsight(student: Student) {
    setSelectedStudent(student);
    setAiInsight("");
    setInsightLoading(true);
    try {
      const res = await fetch("/api/ai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          input: `Student: ${student.name}, Grade: ${student.grade}, Attendance: ${student.attendance}%, Last Grade: ${student.lastGrade}, Status: ${student.status}, Teacher Notes: "${student.notes}"`,
          systemPrompt: `You are an expert school counsellor. Based on the student data provided, generate a concise action plan with 3 bullet points for the teacher. Focus on practical next steps: what to communicate to the parent, what support to offer the student, and what to monitor. Be warm, specific, and actionable. Return ONLY the 3 bullet points, no preamble.`,
        }),
      });
      const data = await res.json();
      setAiInsight(data.result || "Could not generate insight.");
    } finally {
      setInsightLoading(false);
    }
  }

  function goToChat(student: Student) {
    router.push(`/dashboard?student=${student.id}`);
  }

  return (
    <div className="container" style={{ paddingTop: "var(--space-8)", paddingBottom: "var(--space-12)" }}>
      {/* Header */}
      <div style={{ marginBottom: "var(--space-6)" }}>
        <h1 style={{ fontSize: "1.8rem", fontWeight: 700, marginBottom: "4px" }}>👨‍🎓 Student Roster</h1>
        <p className="text-muted text-sm">Grade 5A · {STUDENTS.length} students · AI insights powered by Gemini</p>
      </div>

      {/* Stats Row */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "var(--space-4)", marginBottom: "var(--space-6)" }}>
        {[
          { label: "Total Students", value: STUDENTS.length, color: "#4F46E5", icon: "👥" },
          { label: "Excellent/Good", value: STUDENTS.filter(s => s.status === "excellent" || s.status === "good").length, color: "#10B981", icon: "⭐" },
          { label: "Needs Attention", value: STUDENTS.filter(s => s.status === "needs-attention").length, color: "#F59E0B", icon: "⚠️" },
          { label: "At Risk", value: STUDENTS.filter(s => s.status === "at-risk").length, color: "#EF4444", icon: "🚨" },
        ].map(stat => (
          <div key={stat.label} style={{ background: "white", borderRadius: "16px", border: "1px solid var(--color-border)", padding: "var(--space-5)", display: "flex", alignItems: "center", gap: "var(--space-3)" }}>
            <span style={{ fontSize: "2rem" }}>{stat.icon}</span>
            <div>
              <div style={{ fontSize: "1.8rem", fontWeight: 800, color: stat.color, lineHeight: 1 }}>{stat.value}</div>
              <div style={{ fontSize: "0.75rem", color: "var(--color-text-muted)", marginTop: "2px" }}>{stat.label}</div>
            </div>
          </div>
        ))}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: selectedStudent ? "1fr 380px" : "1fr", gap: "var(--space-6)", alignItems: "start" }}>
        {/* Table */}
        <div style={{ background: "white", borderRadius: "20px", border: "1px solid var(--color-border)", overflow: "hidden" }}>
          {/* Filters */}
          <div style={{ padding: "var(--space-5)", borderBottom: "1px solid var(--color-border)", display: "flex", gap: "var(--space-3)", flexWrap: "wrap" }}>
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="🔍 Search student or parent..." style={{ flex: 1, minWidth: "200px", padding: "10px 14px", borderRadius: "10px", border: "1.5px solid var(--color-border)", outline: "none", fontSize: "0.9rem" }} />
            <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)} style={{ padding: "10px 14px", borderRadius: "10px", border: "1.5px solid var(--color-border)", outline: "none", fontSize: "0.9rem", background: "white" }}>
              <option value="all">All Statuses</option>
              {Object.entries(STATUS_CONFIG).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
            </select>
          </div>

          {/* Student rows */}
          {filtered.map(student => (
            <div key={student.id} style={{ padding: "var(--space-4) var(--space-5)", borderBottom: "1px solid var(--color-border)", display: "flex", alignItems: "center", gap: "var(--space-4)", cursor: "pointer", transition: "background 0.15s", background: selectedStudent?.id === student.id ? "rgba(79,70,229,0.04)" : "transparent" }}
              onClick={() => generateInsight(student)}>
              <div style={{ width: "44px", height: "44px", borderRadius: "12px", background: STATUS_CONFIG[student.status].bg, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.5rem", flexShrink: 0 }}>
                {student.emoji}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontWeight: 700, fontSize: "0.95rem" }}>{student.name}</div>
                <div style={{ fontSize: "0.8rem", color: "var(--color-text-muted)" }}>Parent: {student.parentName} · {student.parentLang}</div>
              </div>
              <div style={{ textAlign: "center", flexShrink: 0 }}>
                <div style={{ fontWeight: 700, fontSize: "1rem" }}>{student.attendance}%</div>
                <div style={{ fontSize: "0.7rem", color: "var(--color-text-muted)" }}>Attendance</div>
              </div>
              <div style={{ textAlign: "center", flexShrink: 0 }}>
                <div style={{ fontWeight: 700, fontSize: "1.2rem" }}>{student.lastGrade}</div>
                <div style={{ fontSize: "0.7rem", color: "var(--color-text-muted)" }}>Grade</div>
              </div>
              <div style={{ padding: "4px 12px", borderRadius: "999px", fontSize: "0.75rem", fontWeight: 700, background: STATUS_CONFIG[student.status].bg, color: STATUS_CONFIG[student.status].color, flexShrink: 0 }}>
                {STATUS_CONFIG[student.status].label}
              </div>
              <button onClick={e => { e.stopPropagation(); goToChat(student); }} style={{ background: "var(--color-primary)", color: "white", border: "none", padding: "8px 14px", borderRadius: "10px", cursor: "pointer", fontSize: "0.8rem", fontWeight: 600, flexShrink: 0 }}>
                💬 Chat
              </button>
            </div>
          ))}
        </div>

        {/* AI Insight Panel */}
        {selectedStudent && (
          <div className="fade-in" style={{ background: "white", borderRadius: "20px", border: "1px solid var(--color-border)", padding: "var(--space-6)", position: "sticky", top: "80px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "var(--space-4)" }}>
              <div>
                <h3 style={{ fontSize: "1.1rem", marginBottom: "2px" }}>{selectedStudent.emoji} {selectedStudent.name}</h3>
                <p style={{ fontSize: "0.8rem", color: "var(--color-text-muted)" }}>{selectedStudent.parentName} speaks {selectedStudent.parentLang}</p>
              </div>
              <button onClick={() => setSelectedStudent(null)} style={{ background: "none", border: "none", cursor: "pointer", fontSize: "1.2rem", color: "var(--color-text-muted)" }}>✕</button>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "var(--space-3)", marginBottom: "var(--space-5)" }}>
              {[["Attendance", student => `${student.attendance}%`], ["Grade", student => student.lastGrade], ["Phone", student => student.parentPhone], ["Language", student => student.parentLang]].map(([label, fn]) => (
                <div key={label as string} style={{ background: "var(--color-bg)", borderRadius: "10px", padding: "10px 12px" }}>
                  <div style={{ fontSize: "0.7rem", color: "var(--color-text-muted)", fontWeight: 700, textTransform: "uppercase", marginBottom: "2px" }}>{label as string}</div>
                  <div style={{ fontSize: "0.9rem", fontWeight: 700 }}>{(fn as Function)(selectedStudent)}</div>
                </div>
              ))}
            </div>

            <div style={{ padding: "var(--space-4)", background: "rgba(79,70,229,0.05)", borderRadius: "12px", marginBottom: "var(--space-4)" }}>
              <div style={{ fontSize: "0.75rem", fontWeight: 700, color: "var(--color-primary-dark)", marginBottom: "6px", textTransform: "uppercase" }}>Teacher Notes</div>
              <p style={{ fontSize: "0.85rem", margin: 0 }}>{selectedStudent.notes}</p>
            </div>

            <div style={{ padding: "var(--space-4)", background: "linear-gradient(135deg, rgba(79,70,229,0.06), rgba(139,92,246,0.06))", borderRadius: "12px", border: "1px solid rgba(79,70,229,0.15)" }}>
              <div style={{ fontSize: "0.75rem", fontWeight: 700, color: "var(--color-primary-dark)", marginBottom: "var(--space-3)", textTransform: "uppercase", display: "flex", alignItems: "center", gap: "6px" }}>
                ✨ Gemini AI Action Plan
              </div>
              {insightLoading ? (
                <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                  <div className="spinner" style={{ width: "16px", height: "16px", borderWidth: "2px" }} />
                  <span style={{ fontSize: "0.85rem", color: "var(--color-text-muted)" }}>Generating insight...</span>
                </div>
              ) : aiInsight ? (
                <div style={{ fontSize: "0.85rem", lineHeight: 1.7, whiteSpace: "pre-line" }}>{aiInsight}</div>
              ) : (
                <p style={{ fontSize: "0.85rem", color: "var(--color-text-muted)", margin: 0 }}>Click on a student to generate an AI action plan.</p>
              )}
            </div>

            <button onClick={() => goToChat(selectedStudent)} style={{ marginTop: "var(--space-4)", width: "100%", padding: "12px", borderRadius: "12px", background: "var(--color-primary)", color: "white", border: "none", fontWeight: 700, cursor: "pointer", fontSize: "0.95rem" }}>
              💬 Open Chat with Parent →
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
