import { v4 as uuid } from "uuid";
import type { Issue, DamageClass } from "@/domain/types";

export const SANITATION_CLASSES: DamageClass[] = [
  { id: "garbage_accumulation", label: "Garbage Accumulation", icon: "trash-2", defaultSeverityWeight: 2, description: "Uncollected garbage piled up." },
  { id: "overflowing_bins", label: "Overflowing Garbage Bins", icon: "archive-restore", defaultSeverityWeight: 2, description: "Public bins overflowing onto the street." },
  { id: "illegal_dumping", label: "Illegal Dumping", icon: "alert-triangle", defaultSeverityWeight: 3, description: "Large items or debris dumped illegally." },
  { id: "drainage_blockage", label: "Drainage Blockage", icon: "droplets", defaultSeverityWeight: 3, description: "Blocked drains causing water logging risk." },
];

const LOCAL_STORAGE_KEY = "civic_sanitation_issues";

export const MockSanitationData = {
  getIssues: (): Issue[] => {
    if (typeof window === "undefined") return [];
    try {
      const data = localStorage.getItem(LOCAL_STORAGE_KEY);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  },

  getIssue: (id: string): Issue | undefined => {
    return MockSanitationData.getIssues().find((i) => i.id === id);
  },

  createIssue: (issueData: Partial<Issue>): Issue => {
    const issues = MockSanitationData.getIssues();
    const now = new Date().toISOString();
    
    // Pick random damage class if none specified or match from data
    const damageClass = SANITATION_CLASSES.find(c => c.id === issueData.damageClassId) || SANITATION_CLASSES[0];

    const newIssue: Issue = {
      id: issueData.id || uuid(),
      damageClassId: damageClass.id,
      severity: issueData.severity || "medium",
      status: issueData.status || "ai_verified",
      lat: issueData.lat || 0,
      lng: issueData.lng || 0,
      address: issueData.address || "Simulated Address, Sanitation District",
      jurisdictionId: issueData.jurisdictionId || "springfield",
      reporterId: issueData.reporterId || "unknown",
      imageUrl: issueData.imageUrl || "",
      imageHash: issueData.imageHash || "mock-hash",
      aiConfidence: issueData.aiConfidence || 0.95,
      boundingBox: issueData.boundingBox || { x: 0.1, y: 0.1, width: 0.8, height: 0.8 },
      confirmations: issueData.confirmations || [],
      priorityScore: issueData.priorityScore || 50,
      priorityBand: issueData.priorityBand || "medium",
      createdAt: now,
      updatedAt: now,
      routedTo: "Sanitation Department",
      isSimulatedRouting: true,
      ...issueData,
    };

    issues.push(newIssue);
    if (typeof window !== "undefined") {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(issues));
    }
    return newIssue;
  },

  clear: () => {
    if (typeof window !== "undefined") {
      localStorage.removeItem(LOCAL_STORAGE_KEY);
    }
  }
};
