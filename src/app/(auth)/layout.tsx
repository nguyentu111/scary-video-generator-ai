import { afterLoginUrl } from "@/app-config";
import { getCurrentUser } from "@/lib/session";
import { redirect } from "next/navigation";

export default async function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getCurrentUser();
  if (user) redirect(afterLoginUrl);
  else return <>{children}</>;
}
