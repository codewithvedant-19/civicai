import type { Issue, DamageClass } from "@/domain/types";

export const DRAINAGE_CLASSES: DamageClass[] = [
  { id: "drain_blockage", label: "Drain blockage", severity: "medium", pointsValue: 20 },
  { id: "sewage_overflow", label: "Sewage overflow", severity: "high", pointsValue: 50 },
  { id: "choked_manholes", label: "Choked manholes", severity: "high", pointsValue: 50 },
  { id: "other_drainage", label: "Other drainage issues", severity: "medium", pointsValue: 20 },
];

export const MockDrainageData = {
  getIssues: (): Issue[] => {
    if (typeof window === "undefined") return [];
    return JSON.parse(localStorage.getItem("civic_drainage_issues") || "[]");
  },
  
  saveIssue: (issue: Issue) => {
    if (typeof window === "undefined") return;
    const issues = MockDrainageData.getIssues();
    issues.push(issue);
    localStorage.setItem("civic_drainage_issues", JSON.stringify(issues));
  },

  getIssue: (id: string): Issue | undefined => {
    return MockDrainageData.getIssues().find((i) => i.id === id);
  }
};
