import { cookies } from "next/headers";

/**
 * Get current session on the server side (API routes / Server Components)
 */
export const getServerSession = async () => {
  try {
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get("al_session");

    if (!sessionCookie) return null;

    return JSON.parse(sessionCookie.value);
  } catch {
    return null;
  }
};
