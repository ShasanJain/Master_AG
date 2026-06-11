"use client";
import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Badge } from "@/components/ui/Badge";
import { NoticeExplainer } from "@/components/features/NoticeExplainer";
import { TwoWayChat } from "@/components/features/TwoWayChat";
import { SmartFeed } from "@/components/features/SmartFeed";
import { ReportGenerator } from "@/components/features/ReportGenerator";

// Mock Database for the Hackathon Demo — matches the Students roster page
const MOCK_STUDENTS = [
  { id: "stu-1", name: "Alex",   grade: "Grade 5A", parentLanguage: "Hindi",    parentName: "Maria Fernandez" },
  { id: "stu-2", name: "Priya",  grade: "Grade 5A", parentLanguage: "Gujarati", parentName: "Rajesh Sharma" },
  { id: "stu-3", name: "Rahul",  grade: "Grade 5A", parentLanguage: "Marathi",  parentName: "Sunita Verma" },
  { id: "stu-4", name: "Ananya", grade: "Grade 5A", parentLanguage: "Tamil",    parentName: "Lakshmi Iyer" },
  { id: "stu-5", name: "Kabir",  grade: "Grade 5A", parentLanguage: "Hindi",    parentName: "Amina Khan" },
];

export default function DashboardPage() {
  const { appUser } = useAuth();
  const [selectedStudentId, setSelectedStudentId] = useState<string>("stu-1");
  const [activeTab, setActiveTab] = useState<"feed" | "chat">("feed");

  if (!appUser) return null;

  const isTeacher = appUser.role === "teacher";
  const selectedStudent = MOCK_STUDENTS.find(s => s.id === selectedStudentId);
  // For parent view — simulate logged-in parent's child being Priya Sharma
  const myChild = MOCK_STUDENTS[1];

  return (
    <div className="container" style={{ paddingTop: "var(--space-6)", paddingBottom: "var(--space-12)" }}>
      {/* Premium Header Profile Section */}
      <div className="fade-in" style={{ 
        marginBottom: "var(--space-10)", 
        padding: "var(--space-6) var(--space-8)",
        background: "rgba(255, 255, 255, 0.4)",
        backdropFilter: "blur(20px)",
        WebkitBackdropFilter: "blur(20px)",
        borderRadius: "var(--radius-xl)",
        border: "1px solid rgba(255, 255, 255, 0.6)",
        boxShadow: "0 10px 30px rgba(0, 0, 0, 0.05)",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between"
      }}>
        <div>
          <h1 style={{ fontSize: "2rem", marginBottom: "var(--space-2)" }}>
            Welcome back, <span style={{ color: "var(--color-primary-dark)" }}>{appUser.displayName?.split(" ").slice(0, 2).join(" ")}</span> 👋
          </h1>
          <p className="text-muted" style={{ fontSize: "1.1rem" }}>
            You are logged in as a{" "}
            <Badge variant="primary" style={{ textTransform: "uppercase", letterSpacing: "0.5px" }}>{appUser.role}</Badge>
          </p>
        </div>
        <div style={{ width: "64px", height: "64px", borderRadius: "50%", background: "linear-gradient(135deg, var(--color-primary), var(--color-secondary))", display: "flex", alignItems: "center", justifyContent: "center", color: "white", fontSize: "1.5rem", fontWeight: "bold", boxShadow: "0 4px 15px rgba(0,0,0,0.1)" }}>
          {appUser.displayName?.charAt(0).toUpperCase()}
        </div>
      </div>

      {/* Bento Box Grid Layout */}
      <div className="fade-in fade-in-delay-1" style={{
        display: "grid",
        gridTemplateColumns: isTeacher ? "250px 1fr" : "repeat(auto-fit, minmax(350px, 1fr))",
        gap: "var(--space-6)",
        alignItems: "start"
      }}>
        
        {/* Sidebar: Teacher's Student Roster OR Parent's Info */}
        <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-6)" }}>
          {isTeacher ? (
             <div style={{
                padding: "var(--space-4)",
                background: "rgba(255, 255, 255, 0.6)",
                backdropFilter: "blur(24px)",
                borderRadius: "var(--radius-xl)",
                border: "1px solid rgba(255, 255, 255, 0.8)",
                boxShadow: "0 15px 35px rgba(0,0,0,0.04)"
             }}>
                <h3 style={{ fontSize: "1.2rem", padding: "0 var(--space-2)", marginBottom: "var(--space-4)" }}>Student Roster</h3>
                <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                  {MOCK_STUDENTS.map(student => (
                    <button
                      key={student.id}
                      onClick={() => setSelectedStudentId(student.id)}
                      style={{
                        padding: "12px",
                        textAlign: "left",
                        background: selectedStudentId === student.id ? "white" : "transparent",
                        border: "none",
                        borderRadius: "12px",
                        cursor: "pointer",
                        boxShadow: selectedStudentId === student.id ? "0 4px 10px rgba(0,0,0,0.05)" : "none",
                        transition: "all 0.2s"
                      }}
                    >
                      <div style={{ fontWeight: selectedStudentId === student.id ? 700 : 500, color: "var(--color-primary-dark)" }}>
                        {student.name}
                      </div>
                      <div style={{ fontSize: "0.8rem", color: "var(--color-text-muted)" }}>
                        Parent speaks: {student.parentLanguage}
                      </div>
                    </button>
                  ))}
                </div>
             </div>
          ) : (
            /* Parent sidebar — shows their child's info */
            <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-4)" }}>
              <div style={{ padding: "var(--space-5)", background: "rgba(255,255,255,0.7)", backdropFilter: "blur(20px)", borderRadius: "var(--radius-xl)", border: "1px solid rgba(255,255,255,0.8)" }}>
                <h3 style={{ fontSize: "1.1rem", fontWeight: 700, marginBottom: "var(--space-4)" }}>👧 {myChild.name}'s Progress</h3>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "var(--space-3)" }}>
                  {[["📊", "88%", "Attendance"], ["📝", "B+", "Last Grade"], ["📅", "20 Jun", "Next PTM"], ["🎯", "Good", "Status"]].map(([icon, val, lbl]) => (
                    <div key={lbl as string} style={{ background: "white", borderRadius: "10px", padding: "var(--space-3)", textAlign: "center" }}>
                      <div style={{ fontSize: "1.3rem" }}>{icon}</div>
                      <div style={{ fontWeight: 700, fontSize: "1rem" }}>{val}</div>
                      <div style={{ fontSize: "0.7rem", color: "var(--color-text-muted)" }}>{lbl}</div>
                    </div>
                  ))}
                </div>
              </div>
              <div style={{ padding: "var(--space-5)", background: "rgba(16,185,129,0.06)", borderRadius: "var(--radius-xl)", border: "1px solid rgba(16,185,129,0.2)" }}>
                <p style={{ fontSize: "0.75rem", fontWeight: 700, textTransform: "uppercase", color: "#065f46", marginBottom: "var(--space-2)" }}>📢 Latest from Teacher</p>
                <p style={{ fontSize: "0.85rem", lineHeight: 1.6, margin: 0 }}>Priya's science project was selected for the district fair! Well done 🎉</p>
              </div>
            </div>
          )}
          {isTeacher && (
            <div style={{ marginTop: "var(--space-4)" }}>
              <ReportGenerator />
            </div>
          )}
        </div>

        {/* Main Column: Feed OR Chat */}
        <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-6)", flex: 1 }}>
          
          {/* Tab Navigation */}
          <div style={{ 
            display: "flex", 
            gap: "12px", 
            background: "rgba(255,255,255,0.5)", 
            padding: "8px", 
            borderRadius: "16px", 
            backdropFilter: "blur(10px)",
            border: "1px solid rgba(255,255,255,0.8)"
          }}>
             <button 
               onClick={() => setActiveTab("feed")} 
               style={{ 
                 flex: 1, padding: "10px 16px", borderRadius: "12px", border: "none", 
                 background: activeTab === "feed" ? "white" : "transparent", 
                 boxShadow: activeTab === "feed" ? "0 4px 10px rgba(0,0,0,0.05)" : "none", 
                 fontWeight: activeTab === "feed" ? 600 : 500,
                 color: activeTab === "feed" ? "var(--color-primary-dark)" : "var(--color-text-muted)",
                 transition: "all 0.2s", cursor: "pointer"
               }}>
                 📢 Smart Feed (Events)
               </button>
             <button 
               onClick={() => setActiveTab("chat")} 
               style={{ 
                 flex: 1, padding: "10px 16px", borderRadius: "12px", border: "none", 
                 background: activeTab === "chat" ? "white" : "transparent", 
                 boxShadow: activeTab === "chat" ? "0 4px 10px rgba(0,0,0,0.05)" : "none", 
                 fontWeight: activeTab === "chat" ? 600 : 500,
                 color: activeTab === "chat" ? "var(--color-primary-dark)" : "var(--color-text-muted)",
                 transition: "all 0.2s", cursor: "pointer"
               }}>
                 💬 Direct Chat (1-on-1)
               </button>
          </div>

          {activeTab === "feed" ? (
             <SmartFeed language={!isTeacher ? (selectedStudent?.parentLanguage || "Hindi") : undefined} />
          ) : (
             <TwoWayChat 
                studentId={selectedStudentId} 
                studentName={selectedStudent?.name}
                defaultLanguage={isTeacher ? selectedStudent?.parentLanguage || "Hindi" : "Hindi"} 
              />
          )}
        </div>

        {/* Secondary Column for Parents: Notice Explainer */}
        {!isTeacher && (
           <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-6)" }}>
             <NoticeExplainer />
           </div>
        )}

      </div>
    </div>
  );
}
