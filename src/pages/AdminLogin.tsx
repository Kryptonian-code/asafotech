import { useState } from "react";
import { Link, Navigate } from "react-router-dom";
import Header from "@/components/Header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAdminAuth } from "@/context/AdminAuthContext";

const AdminLogin = () => {
  const { admin, hasAdmin, login, bootstrap, loading } = useAdminAuth();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  if (!loading && admin) {
    return <Navigate to="/admin" replace />;
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <section className="bg-primary py-12 text-white">
        <div className="container text-center">
          <h1 className="font-display text-5xl font-extrabold md:text-6xl">{hasAdmin ? "Admin Login" : "Create Admin"}</h1>
          <p className="mt-4 text-lg text-white/85">
            <Link to="/" className="hover:text-white">Home</Link>
            <span className="mx-2">|</span>
            <span>{hasAdmin ? "Admin Login" : "Create Admin"}</span>
          </p>
        </div>
      </section>

      <main className="container py-16">
        <div className="mx-auto max-w-xl">
          <h2 className="text-center text-4xl font-semibold text-foreground">
            {hasAdmin ? "Manage your electronics store" : "Set up Asafo Tech admin"}
          </h2>

          <div className="mt-10 border border-border bg-white p-8 md:p-10">
            <div className="mb-6 rounded-sm border border-primary/15 bg-primary/5 p-4 text-sm text-muted-foreground">
              Admin access is local. You can either sign in with the saved database admin or define admin credentials directly in the main project <span className="font-semibold text-foreground">.env</span>.
            </div>
            <div className="space-y-5">
              {!hasAdmin && (
                <div className="space-y-2">
                  <Label htmlFor="fullName">Full name</Label>
                  <Input id="fullName" value={fullName} onChange={(event) => setFullName(event.target.value)} className="h-12 rounded-sm" />
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="email">Email address</Label>
                <Input id="email" type="email" value={email} onChange={(event) => setEmail(event.target.value)} className="h-12 rounded-sm" />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input id="password" type="password" value={password} onChange={(event) => setPassword(event.target.value)} className="h-12 rounded-sm" />
              </div>
            </div>

            {error && <p className="mt-5 text-sm font-medium text-destructive">{error}</p>}

            <Button
              className="mt-6 h-12 w-full rounded-sm text-base font-semibold uppercase tracking-wide"
              disabled={submitting}
              onClick={async () => {
                setSubmitting(true);
                setError(null);
                try {
                  if (hasAdmin) {
                    await login(email, password);
                  } else {
                    await bootstrap(fullName, email, password);
                  }
                } catch (err) {
                  setError(err instanceof Error ? err.message : "Unable to continue.");
                } finally {
                  setSubmitting(false);
                }
              }}
            >
              {submitting ? "Please wait..." : hasAdmin ? "Sign In" : "Create Admin"}
            </Button>
          </div>
        </div>
      </main>
    </div>
  );
};

export default AdminLogin;
