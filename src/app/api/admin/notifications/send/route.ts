import { NextResponse } from "next/server";
import { notifyTestSchedule, notifyStatusChange } from "@/lib/wablas";
import { getServerSession } from "@/lib/session";

type NotificationType = "schedule" | "status";

export async function POST(request: Request) {
    try {
        const session = await getServerSession();
        if (!session || !["admin", "admin_super", "head_of_it", "penguji"].includes(session.role)) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const body = await request.json();
        const { type, ...data } = body;

        if (!type) {
            return NextResponse.json({ error: "Missing notification type" }, { status: 400 });
        }

        let result;

        switch (type as NotificationType) {
            case "schedule":
                result = await notifyTestSchedule({
                    phone: data.phone,
                    nama: data.nama,
                    tanggal: data.tanggal,
                    waktu: data.waktu,
                    tempat: data.tempat
                });
                break;

            case "status":
                result = await notifyStatusChange({
                    phone: data.phone,
                    nama: data.nama,
                    status: data.status,
                    jenjang: data.jenjang
                });
                break;

            default:
                return NextResponse.json({ error: "Invalid notification type" }, { status: 400 });
        }

        return NextResponse.json(result);

    } catch (error: any) {
        console.error("Notification Error:", error);
        return NextResponse.json({ error: error.message || "Internal Server Error" }, { status: 500 });
    }
}
