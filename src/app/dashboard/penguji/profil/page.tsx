import ProfileSettings from "@/components/dashboard/ProfileSettings";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export default async function PengujiProfilPage() {
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get("app_session");

    if (!sessionCookie) redirect("/login");

    const session = JSON.parse(sessionCookie.value);

    return <ProfileSettings user={session} />;
}
