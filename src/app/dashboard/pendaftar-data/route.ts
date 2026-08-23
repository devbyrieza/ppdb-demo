import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get("al_session");

    if (!sessionCookie) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 },
      );
    }

    const session = JSON.parse(sessionCookie.value);
    const pendaftarId =
      session.role === "pendaftar"
        ? session.id
        : session.pendaftar_id || session.user_id;

    if (!pendaftarId) {
      return NextResponse.json(
        { success: false, error: "No pendaftar ID" },
        { status: 400 },
      );
    }

    // Fetch data pendaftar using Prisma
    const pendaftar = await prisma.pendaftar.findUnique({
      where: { id: pendaftarId } });

    if (!pendaftar) {
      return NextResponse.json(
        { success: false, error: "Pendaftar not found" },
        { status: 404 },
      );
    }

    return NextResponse.json({
      success: true,
      data: pendaftar });
  } catch (error) {
    console.error("Error fetching pendaftar data:", error);
    return NextResponse.json(
      { success: false, error: "Internal Server Error" },
      { status: 500 },
    );
  }
}
