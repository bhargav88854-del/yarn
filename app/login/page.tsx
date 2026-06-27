import type { Metadata } from "next";
import { AuthError } from "next-auth";
import { signIn } from "@/auth";
import { LoginForm } from "@/components/login-form";

export const metadata: Metadata = { title: "Sign in" };

export default function LoginPage() {
  // Server action: validate credentials and start a session. signIn throws a
  // redirect on success (let it propagate) and an AuthError on bad credentials.
  async function authenticate(
    _prev: string | undefined,
    formData: FormData
  ): Promise<string | undefined> {
    "use server";
    try {
      await signIn("credentials", {
        email: formData.get("email"),
        password: formData.get("password"),
        redirectTo: "/dashboard",
      });
    } catch (err) {
      if (err instanceof AuthError) return "Invalid email or password.";
      throw err;
    }
  }

  return (
    <main className="grid min-h-screen place-items-center bg-muted/30 p-6">
      <div className="w-full max-w-sm">
        <div className="mb-6 flex items-center gap-2.5">
          <span className="grid h-10 w-10 place-items-center rounded-lg bg-primary/10 text-2xl">
            🧵
          </span>
          <div className="leading-tight">
            <p className="font-display text-lg font-semibold tracking-tight">
              YarnTrack
            </p>
            <p className="text-xs text-muted-foreground">Inventory System</p>
          </div>
        </div>
        <LoginForm action={authenticate} />
      </div>
    </main>
  );
}
