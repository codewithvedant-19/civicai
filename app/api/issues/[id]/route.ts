import { NextRequest, NextResponse } from "next/server";
import { IssueRepository } from "@/repositories/issueRepository";

export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  const issue = await IssueRepository.findById(params.id);
  if (!issue) return NextResponse.json({ error: "Issue not found." }, { status: 404 });
  return NextResponse.json({ issue });
}
