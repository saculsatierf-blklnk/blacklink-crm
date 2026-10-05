import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export default async function DashboardRootRedirect() {
  const cookieStore = await cookies();
  const sessionToken = cookieStore.get("blacklink_session")?.value;
  let userRole = "admin";

  if (sessionToken) {
    try {
      const decoded = JSON.parse(
        Buffer.from(sessionToken, "base64url").toString("utf-8")
      );
      if (decoded.role === "commercial") {
        userRole = "commercial";
      }
    } catch {}
  }

  if (userRole === "commercial") {
    redirect("/vendas");
  }

  redirect("/dashboard");
}
