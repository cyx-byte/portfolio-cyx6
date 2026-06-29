import { cookies } from "next/headers";

const ADMIN_COOKIE = "portfolio_admin";
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "admin123";

/** Check if the current request is from an authenticated admin */
export async function isAdmin(): Promise<boolean> {
  const cookieStore = await cookies();
  const token = cookieStore.get(ADMIN_COOKIE);
  return token?.value === "true";
}

/** Verify admin password */
export function verifyPassword(password: string): boolean {
  return password === ADMIN_PASSWORD;
}

/** Set admin cookie name (used by API routes) */
export { ADMIN_COOKIE };
