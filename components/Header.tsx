import Link from "next/link";
import LogoutButton from "@/components/LogoutButton";
import { isOwner } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";

export default async function Header() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <header className="flex items-center justify-between bg-[#fff7ef] px-5 py-3">
      <Link href="/" className="font-bold no-underline">
        🐼🧋 Miss Tea Tea
      </Link>
      {user ? (
        <div className="flex items-center gap-4 text-sm">
          {isOwner(user) && (
            <Link href="/admin" className="text-[#8b4513] underline">
              管理后台
            </Link>
          )}
          <LogoutButton redirectTo="/" className="text-[#8b4513] underline" />
        </div>
      ) : (
        <Link
          href="/admin/login"
          className="rounded-full bg-[#8b4513] px-5 py-2 text-sm text-white no-underline hover:bg-[#7a3d11]"
        >
          Login
        </Link>
      )}
    </header>
  );
}
