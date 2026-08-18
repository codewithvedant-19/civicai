import type { Issue, DamageClass } from "@/domain/types";

export const ELECTRICITY_CLASSES: DamageClass[] = [
  { id: "streetlight_not_working", label: "Streetlight not working", severity: "low", pointsValue: 10 },
  { id: "damaged_poles", label: "Damaged poles", severity: "high", pointsValue: 50 },
  { id: "exposed_wires", label: "Exposed wires", severity: "critical", pointsValue: 100 },
  { id: "other_electrical", label: "Other electrical issues", severity: "medium", pointsValue: 20 },
];

export const MockElectricityData = {
  getIssues: (): Issue[] => {
    if (typeof window === "undefined") return [];
    return JSON.parse(localStorage.getItem("civic_electricity_issues") || "[]");
  },
  
  saveIssue: (issue: Issue) => {
    if (typeof window === "undefined") return;
    const issues = MockElectricityData.getIssues();
    issues.push(issue);
    localStorage.setItem("civic_electricity_issues", JSON.stringify(issues));
  },

  getIssue: (id: string): Issue | undefined => {
    return MockElectricityData.getIssues().find((i) => i.id === id);
  }
};
