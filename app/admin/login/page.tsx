"use client";

import { useState } from "react";
import type { FormEvent } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const router = useRouter();

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    const supabase = createClient();
    const { error: signInError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (signInError) {
      setError("登录失败：" + signInError.message);
      return;
    }
    router.push("/admin");
    router.refresh();
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-gradient-to-b from-[#ffd6e7] to-[#fff7ef] px-5">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-sm rounded-[20px] bg-white p-8 shadow-[0_5px_15px_#ddd]"
      >
        <div className="text-center text-4xl">🐼🧋</div>
        <h1 className="mt-2 text-center text-2xl font-bold">老板登录</h1>
        <input
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="邮箱"
          className="mt-6 w-full rounded-xl border border-[#e5d5c5] bg-[#fff7ef] p-3 outline-none focus:border-[#8b4513]"
        />
        <input
          type="password"
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="密码"
          className="mt-3 w-full rounded-xl border border-[#e5d5c5] bg-[#fff7ef] p-3 outline-none focus:border-[#8b4513]"
        />
        {error && <p className="mt-3 text-sm text-red-600">{error}</p>}
        <button
          type="submit"
          className="mt-6 w-full rounded-full bg-[#8b4513] py-3 text-white hover:bg-[#7a3d11]"
        >
          登录
        </button>
      </form>
    </main>
  );
}
