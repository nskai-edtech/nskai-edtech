import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { skills, skillDependencies } from "@/drizzle/schema";

export async function GET() {
  try {
    // 1. Fetch all Skills (Nodes)
    const allSkills = await db.select().from(skills);

    // 2. Fetch all Dependencies (Edges)
    const allEdges = await db.select().from(skillDependencies);

    // 3. Format for Frontend Graph Library (e.g., React Flow or vis.js)
    // Structure: { nodes: [], edges: [] }
    const nodes = allSkills.map((skill) => ({
      id: skill.id,
      label: skill.title,
      data: {
        category: skill.category,
        description: skill.description
      },
    }));

    const edges = allEdges.map((rel) => ({
      id: rel.id,
      source: rel.prerequisiteSkillId, // Prereq -> Target
      target: rel.skillId,
    }));

    return NextResponse.json({
      nodes,
      edges,
    });
  } catch (error) {
    console.error("[SKILLS_GRAPH_GET]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
