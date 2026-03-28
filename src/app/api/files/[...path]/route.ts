import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { getFileLocal } from "@/lib/storage/local";

/**
 * GET /api/files/[...path]
 * Serves files from local storage with authentication check.
 * URL format: /api/files/category/owner_id/filename
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function GET(request: NextRequest, props: { params: Promise<{ path: string[] }> }) {
    try {
        const params = await props.params;
        const { path: pathSegments } = params; // Rename for clarity

        if (!pathSegments || pathSegments.length < 3) {
            return NextResponse.json({ error: "Invalid path" }, { status: 400 });
        }

        // Validate structure: category/ownerId/filename
        const [category, ownerId] = pathSegments;
        const relativePath = pathSegments.join("/");

        // 1. Auth Check
        const cookieStore = await cookies();
        const sessionCookie = cookieStore.get("app_session");

        if (!sessionCookie) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        let session;
        try {
            session = JSON.parse(sessionCookie.value);
        } catch {
            return NextResponse.json({ error: "Invalid session" }, { status: 401 });
        }

        // 2. Authorization
        // Admin can access everything
        // Pendaftar can only access their own files (ownerId must match session.id)
        const isAdmin = ["admin", "admin_super", "admin_berkas", "admin_keuangan", "penguji"].includes(session.role);
        const isOwner = session.role === "pendaftar" && session.id === ownerId;

        if (!isAdmin && !isOwner) {
            return NextResponse.json({ error: "Forbidden" }, { status: 403 });
        }

        // 3. Get File
        console.log(`[File Serve] Requesting: ${relativePath}`);
        const fileData = getFileLocal(relativePath);

        if (!fileData) {
            console.error(`[File Serve] Not Found: ${relativePath}`);
            // Logs from getFileLocal should help, but let's log here too if needed
            return NextResponse.json({ error: "File not found" }, { status: 404 });
        }

        // 4. Return File
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        return new NextResponse(fileData.buffer as any, {
            headers: {
                "Content-Type": fileData.mimeType,
                "Cache-Control": "private, max-age=3600",
            },
        });

    } catch (error) {
        console.error("File serve error:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}
