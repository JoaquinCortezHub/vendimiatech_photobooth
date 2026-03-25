import { appendRegistration } from "@/lib/google-sheets";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const { name, handle } = await request.json();

  if (!name || !handle) {
    return NextResponse.json({ error: "Missing fields" }, { status: 400 });
  }

  try {
    await appendRegistration(name, handle);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Google Sheets error:", error);
    return NextResponse.json({ error: "Failed to save" }, { status: 500 });
  }
}
