"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase";
import type { User } from "@supabase/supabase-js";

export default function NavBar({ maxWidth = 920 }: { maxWidth?: number }) {
  const [user, setUser] = useState<User | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const supabase = createClient();

    supabase.auth.getUser().then(({ data }) => {
      setUser(data.user);
      setMounted(true);
    });

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => listener.subscription.unsubscribe();
  }, []);

  async function handleLogout() {
    const supabase = createClient();
    await supabase.auth.signOut();
    setUser(null);
  }

  async function handleSignIn() {
    const supabase = createClient();
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: `${window.location.origin}/auth/callback` },
    });
  }

  const displayName = user?.user_metadata?.name || user?.email?.split("@")[0] || "";
  const avatar = user?.user_metadata?.avatar_url as string | undefined;

  return (
    <nav className="border-b border-[#e2e8f0]">
      <div
        className="mx-auto px-8 py-[13px] flex items-center justify-between"
        style={{ maxWidth }}
      >
        <Link
          href="/"
          className="font-[family-name:var(--font-dm-serif)] text-[18px] text-[#1a1a1a]"
        >
          Kira<span className="text-brand">Prep.com</span>
        </Link>
        <div className="flex items-center gap-[10px]">
          <Link
            href="/tips"
            className="text-[14px] text-[#475569] hover:text-[#334155] font-medium mr-2"
          >
            Kira Interview Tips
          </Link>
          {mounted && user ? (
            <>
              <div className="flex items-center gap-2 bg-[#f8fafc] border-[1.5px] border-[#e2e8f0] rounded-[20px] py-1 pl-[5px] pr-[14px]">
                {avatar ? (
                  <img
                    src={avatar}
                    alt={displayName}
                    className="w-[26px] h-[26px] rounded-full object-cover"
                  />
                ) : (
                  <div className="w-[26px] h-[26px] rounded-full bg-brand flex items-center justify-center text-[11px] font-bold text-white">
                    {displayName[0]?.toUpperCase()}
                  </div>
                )}
                <span className="text-[13px] font-medium text-[#334155]">
                  {displayName}
                </span>
              </div>
              <button
                onClick={handleLogout}
                className="text-[12px] text-[#94a3b8] underline cursor-pointer ml-[10px]"
              >
                Log out
              </button>
            </>
          ) : mounted ? (
            <>
              <button
                onClick={handleSignIn}
                className="bg-transparent border-[1.5px] border-[#e2e8f0] text-[#334155] text-[13px] font-medium py-[7px] px-[18px] rounded-lg cursor-pointer"
              >
                Log in
              </button>
            </>
          ) : null}
        </div>
      </div>
    </nav>
  );
}

