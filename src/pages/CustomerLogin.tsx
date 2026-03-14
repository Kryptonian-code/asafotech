import { useEffect, useState } from "react";
import { Link, Navigate, useSearchParams } from "react-router-dom";
import { Chrome, Mail } from "lucide-react";
import Header from "@/components/Header";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useCustomerAuth } from "@/context/CustomerAuthContext";
import { digitsOnly } from "@/lib/phone";

const CustomerLogin = () => {
  const { user, login, register, loginWithGoogle, sendResetLink, loading, configError } = useCustomerAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const [isRegister, setIsRegister] = useState(searchParams.get("mode") === "register");
  const [showEmailRegister, setShowEmailRegister] = useState(false);
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [googleSubmitting, setGoogleSubmitting] = useState(false);
  const signUpDisabled = isRegister && (!agreedToTerms || !showEmailRegister);

  useEffect(() => {
    const registerMode = searchParams.get("mode") === "register";
    setIsRegister(registerMode);
    setShowEmailRegister(false);
    setError(null);
    setSuccessMessage(null);
  }, [searchParams]);

  if (!loading && user) {
    return <Navigate to="/account" replace />;
  }

  const handleRegister = async () => {
    setSubmitting(true);
    setError(null);
    setSuccessMessage(null);

    try {
      if (!fullName.trim()) {
        throw new Error("Please enter your full name.");
      }

      if (!email.trim()) {
        throw new Error("Please enter your email address.");
      }

      if (password.length < 6) {
        throw new Error("Password must be at least 6 characters long.");
      }

      if (password !== confirmPassword) {
        throw new Error("Passwords do not match.");
      }

      if (!agreedToTerms) {
        throw new Error("You must agree to the Terms and Conditions before signing up.");
      }

      await register({ fullName, email, phone, password });
      setSuccessMessage("Account created. Please check your email and verify your account before signing in.");
      setPassword("");
      setConfirmPassword("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to continue.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleLogin = async () => {
    setSubmitting(true);
    setError(null);
    setSuccessMessage(null);

    try {
      await login(email, password);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to continue.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <section className="bg-primary py-12 text-white">
        <div className="container text-center">
          <h1 className="font-display text-5xl font-extrabold md:text-6xl">{isRegister ? "Register" : "Login"}</h1>
          <p className="mt-4 text-lg text-white/85">
            <Link to="/" className="hover:text-white">Home</Link>
            <span className="mx-2">|</span>
            <span>{isRegister ? "Register" : "Login"}</span>
          </p>
        </div>
      </section>

      <main className="container py-16">
        <div className="mx-auto max-w-xl">
          <h2 className="text-center text-4xl font-semibold text-foreground">
            {isRegister ? "Create your Asafo Tech account" : "Sign in to your account"}
          </h2>
          <p className="mt-4 text-center text-base text-muted-foreground">
            {isRegister
              ? "Create a customer account with Google or continue with email."
              : "Access your verified customer account with email or Google."}
          </p>

          <div className={`mt-10 border p-8 md:p-10 ${isRegister ? "border-slate-800 bg-slate-950 text-white" : "border-slate-800 bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-white shadow-[0_28px_80px_-40px_rgba(15,23,42,0.8)]"}`}>
            {isRegister ? (
              <div className="space-y-5">
                <h3 className="text-4xl font-semibold tracking-tight text-white">Create free account</h3>

                <Button
                  type="button"
                  variant="outline"
                  className="h-12 w-full justify-start rounded-md border-slate-600 bg-transparent px-4 text-base font-medium text-white hover:bg-slate-900 hover:text-white"
                  disabled={googleSubmitting || !!configError}
                  onClick={async () => {
                    setGoogleSubmitting(true);
                    setError(null);
                    setSuccessMessage(null);
                    try {
                      await loginWithGoogle();
                    } catch (err) {
                      setError(err instanceof Error ? err.message : "Google sign-in failed.");
                    } finally {
                      setGoogleSubmitting(false);
                    }
                  }}
                >
                  <Chrome className="mr-3 h-4 w-4" />
                  {googleSubmitting ? "Opening Google..." : "Continue with Google"}
                </Button>

                <div className="flex items-center gap-4 py-1">
                  <div className="h-px flex-1 bg-slate-700" />
                  <span className="text-xs font-semibold uppercase tracking-[0.28em] text-slate-400">Or</span>
                  <div className="h-px flex-1 bg-slate-700" />
                </div>

                {!showEmailRegister ? (
                  <Button
                    type="button"
                    className="h-12 w-full rounded-md bg-white text-base font-semibold text-slate-950 hover:bg-slate-100"
                    onClick={() => {
                      setShowEmailRegister(true);
                      setError(null);
                      setSuccessMessage(null);
                    }}
                  >
                    <Mail className="mr-3 h-4 w-4" />
                    Continue with email
                  </Button>
                ) : (
                  <div className="space-y-5 rounded-md border border-slate-800 bg-slate-900/70 p-5">
                    <div className="space-y-2">
                      <Label htmlFor="fullName" className="text-slate-200">Full name</Label>
                      <Input id="fullName" value={fullName} onChange={(event) => setFullName(event.target.value)} className="h-12 rounded-sm border-slate-700 bg-slate-950 text-white placeholder:text-slate-500" />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="phone" className="text-slate-200">Phone number</Label>
                      <Input
                        id="phone"
                        type="tel"
                        inputMode="numeric"
                        pattern="[0-9]*"
                        value={phone}
                        onChange={(event) => setPhone(digitsOnly(event.target.value))}
                        placeholder="0240000000"
                        className="h-12 rounded-sm border-slate-700 bg-slate-950 text-white placeholder:text-slate-500"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="email" className="text-slate-200">Email address</Label>
                      <Input id="email" type="email" value={email} onChange={(event) => setEmail(event.target.value)} className="h-12 rounded-sm border-slate-700 bg-slate-950 text-white placeholder:text-slate-500" />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="password" className="text-slate-200">Password</Label>
                      <Input id="password" type="password" value={password} onChange={(event) => setPassword(event.target.value)} className="h-12 rounded-sm border-slate-700 bg-slate-950 text-white placeholder:text-slate-500" />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="confirmPassword" className="text-slate-200">Confirm password</Label>
                      <Input
                        id="confirmPassword"
                        type="password"
                        value={confirmPassword}
                        onChange={(event) => setConfirmPassword(event.target.value)}
                        className="h-12 rounded-sm border-slate-700 bg-slate-950 text-white placeholder:text-slate-500"
                      />
                    </div>

                    <div className="rounded-sm border border-slate-700 bg-slate-950 p-4 text-sm text-slate-300">
                      A verification email will be sent after you create your account. You must confirm it before signing in.
                    </div>

                    <div className="flex items-start gap-3 rounded-sm border border-slate-700 p-4">
                      <Checkbox
                        id="terms"
                        checked={agreedToTerms}
                        onCheckedChange={(checked) => setAgreedToTerms(checked === true)}
                      />
                      <Label htmlFor="terms" className="cursor-pointer text-sm leading-6 text-slate-300">
                        Agree to Terms and Conditions
                      </Label>
                    </div>

                    {configError && <p className="text-sm font-medium text-amber-300">{configError}</p>}
                    {error && <p className="text-sm font-medium text-rose-300">{error}</p>}
                    {successMessage && <p className="text-sm font-medium text-emerald-300">{successMessage}</p>}

                    <Button
                      className="h-12 w-full rounded-md bg-white text-base font-semibold text-slate-950 hover:bg-slate-100 disabled:cursor-not-allowed disabled:bg-slate-700 disabled:text-slate-400 disabled:opacity-100"
                      disabled={submitting || signUpDisabled || !!configError}
                      onClick={() => void handleRegister()}
                    >
                      {submitting ? "Please wait..." : "Sign Up"}
                    </Button>
                  </div>
                )}

                {!showEmailRegister && configError && <p className="text-sm font-medium text-amber-300">{configError}</p>}
                {!showEmailRegister && error && <p className="text-sm font-medium text-rose-300">{error}</p>}
                {!showEmailRegister && successMessage && <p className="text-sm font-medium text-emerald-300">{successMessage}</p>}

                <p className="text-sm leading-6 text-slate-400">
                  By continuing, you agree to the Terms of Service and Privacy Policy.
                </p>
              </div>
            ) : (
              <div className="space-y-5">
                <div>
                  <h3 className="text-4xl font-semibold tracking-tight text-white">Welcome back</h3>
                  <p className="mt-3 text-sm leading-6 text-slate-400">
                    Sign in with your email and password, or continue with Google for a faster checkout experience.
                  </p>
                </div>

                <div className="space-y-5 rounded-md border border-slate-800 bg-slate-900/70 p-5">
                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-slate-200">Email address</Label>
                    <Input
                      id="email"
                      type="email"
                      value={email}
                      onChange={(event) => setEmail(event.target.value)}
                      className="h-12 rounded-sm border-slate-700 bg-slate-950 text-white placeholder:text-slate-500"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="password" className="text-slate-200">Password</Label>
                    <Input
                      id="password"
                      type="password"
                      value={password}
                      onChange={(event) => setPassword(event.target.value)}
                      className="h-12 rounded-sm border-slate-700 bg-slate-950 text-white placeholder:text-slate-500"
                    />
                  </div>

                  {configError && <p className="text-sm font-medium text-amber-300">{configError}</p>}
                  {error && <p className="text-sm font-medium text-rose-300">{error}</p>}
                  {successMessage && <p className="text-sm font-medium text-emerald-300">{successMessage}</p>}

                  <Button
                    className="h-12 w-full rounded-md bg-white text-base font-semibold text-slate-950 hover:bg-slate-100 disabled:bg-slate-700 disabled:text-slate-400"
                    disabled={submitting || !!configError}
                    onClick={() => void handleLogin()}
                  >
                    {submitting ? "Please wait..." : "Sign In"}
                  </Button>

                  <div className="flex items-center gap-4 py-1">
                    <div className="h-px flex-1 bg-slate-700" />
                    <span className="text-xs font-semibold uppercase tracking-[0.28em] text-slate-400">Or</span>
                    <div className="h-px flex-1 bg-slate-700" />
                  </div>

                  <Button
                    type="button"
                    variant="outline"
                    className="h-12 w-full rounded-md border-slate-600 bg-transparent text-base font-semibold text-white hover:bg-slate-900 hover:text-white"
                    disabled={googleSubmitting || !!configError}
                    onClick={async () => {
                      setGoogleSubmitting(true);
                      setError(null);
                      setSuccessMessage(null);
                      try {
                        await loginWithGoogle();
                      } catch (err) {
                        setError(err instanceof Error ? err.message : "Google sign-in failed.");
                      } finally {
                        setGoogleSubmitting(false);
                      }
                    }}
                  >
                    <Chrome className="mr-2 h-4 w-4" />
                    {googleSubmitting ? "Opening Google..." : "Continue with Google"}
                  </Button>
                </div>

                <div className="flex flex-col gap-3 border-t border-slate-800 pt-5 text-sm md:flex-row md:items-center md:justify-between">
                  <button
                    type="button"
                    className="text-left font-semibold text-slate-300 transition-colors hover:text-white"
                    onClick={async () => {
                      setError(null);
                      setSuccessMessage(null);

                      if (!email.trim()) {
                        setError("Enter your email address first, then try again.");
                        return;
                      }

                      try {
                        await sendResetLink(email);
                        setSuccessMessage("Password reset email sent. Please check your inbox.");
                      } catch (err) {
                        setError(err instanceof Error ? err.message : "Could not send reset email.");
                      }
                    }}
                  >
                    Forgot password?
                  </button>

                  <button
                    type="button"
                    className="text-left font-semibold text-slate-300 transition-colors hover:text-white md:text-right"
                    onClick={() => {
                      setSearchParams({ mode: "register" });
                      setIsRegister(true);
                      setShowEmailRegister(false);
                      setError(null);
                      setSuccessMessage(null);
                    }}
                  >
                    Need an account? Create one
                  </button>
                </div>
              </div>
            )}

            {isRegister && (
              <button
                className="mt-5 text-sm font-semibold text-slate-300"
                onClick={() => {
                  setSearchParams({});
                  setIsRegister(false);
                  setShowEmailRegister(false);
                  setError(null);
                  setSuccessMessage(null);
                }}
              >
                Already have an account? Sign in
              </button>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default CustomerLogin;
