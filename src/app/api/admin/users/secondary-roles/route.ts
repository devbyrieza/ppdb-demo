import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "@/lib/session";

// PATCH /api/admin/users/secondary-roles
// Body: { profile_id, secondary_roles: string[] }
// Only head_of_it and admin_super can use this
export async function PATCH(request: NextRequest) {
    try {
        const session = await getServerSession();
        if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        if (!["head_of_it", "admin_super", "tim_it"].includes(session.role)) {
            return NextResponse.json({ error: "Forbidden" }, { status: 403 });
        }

        const body = await request.json();
        const { profile_id, secondary_roles } = body;

        if (!profile_id || !Array.isArray(secondary_roles)) {
            return NextResponse.json({ error: "profile_id dan secondary_roles (array) wajib diisi" }, { status: 400 });
        }

        // Validate roles are known roles
        const knownRoles = [
            "admin", "admin_super", "admin_berkas", "admin_keuangan",
            "head_of_it", "tim_it", "penguji", "penguji_calsan",
            "pewawancara_calsan", "pewawancara_cawalsan"
        ];
        const invalid = secondary_roles.filter(r => !knownRoles.includes(r));
        if (invalid.length > 0) {
            return NextResponse.json({ error: `Role tidak dikenal: ${invalid.join(", ")}` }, { status: 400 });
        }

        // Update profile
        const updated = await (prisma.profile as any).update({
            where: { id: profile_id },
            data: { secondary_roles },
        });

        return NextResponse.json({ success: true, data: updated });
    } catch (error: any) {
        console.error("Update secondary roles error:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}
