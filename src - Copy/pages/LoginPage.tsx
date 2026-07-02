import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import {
  signInWithEmailAndPassword,
  signInWithPopup,
} from "firebase/auth";

import {
  doc,
  getDoc,
  setDoc,
  serverTimestamp,
} from "firebase/firestore";

import {
  auth,
  googleProvider,
} from "../firebase/auth";

import { db } from "../firebase/firestore";

function authMessage(error: any) {
  const code = error?.code ?? "";
  const messages: Record<string, string> = {
    "auth/invalid-credential":
      "Firebase is connected, but this email/password was rejected. Create an account first, or use the exact password for this Firebase project.",
    "auth/invalid-email": "Enter a valid email address.",
    "auth/invalid-login-credentials":
      "Firebase is connected, but this email/password was rejected. Create an account first, or reset the password.",
    "auth/missing-password": "Enter your password.",
    "auth/too-many-requests":
      "Too many attempts. Try again later or reset your password.",
    "auth/user-disabled": "This Firebase account is disabled.",
    "auth/user-not-found":
      "No account exists for this email in CareerZoid Firebase. Please Sign Up first.",
    "auth/wrong-password":
      "The password is incorrect for this Firebase account.",
    "auth/popup-closed-by-user":
      "Google login was closed before completing.",
  };

  return messages[code] ?? error?.message ?? "Login failed. Please try again.";
}

async function ensureUserProfile(user: any) {
  const userRef = doc(db, "users", user.uid);
  const userSnap = await getDoc(userRef);

  if (!userSnap.exists()) {
    await setDoc(userRef, {
      uid: user.uid,
      fullName:
        user.displayName ||
        user.email?.split("@")[0] ||
        "CareerZoid User",
      email: user.email || "",
      photoURL: user.photoURL || "",
      role: "user",
      xp: 0,
      streak: 0,
      subscription: "free",
      membership: "FREE",
      plan: "FREE",
      createdAt: serverTimestamp(),
      lastLoginAt: serverTimestamp(),
    });

    return;
  }

  await setDoc(
    userRef,
    {
      lastLoginAt: serverTimestamp(),
    },
    { merge: true }
  );
}

export default function LoginPage() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const firebaseProject =
    import.meta.env.VITE_FIREBASE_PROJECT_ID || "not configured";

  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setMessage("");
    setError("");

    if (!email || !password) {
      setError("Enter your email and password.");
      return;
    }

    try {
      setLoading(true);

      const result = await signInWithEmailAndPassword(
        auth,
        email.trim(),
        password
      );

      await ensureUserProfile(result.user);

      setMessage("Login successful. Opening your dashboard...");
      navigate("/dashboard");
    } catch (loginError: any) {
      setError(authMessage(loginError));
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setMessage("");
    setError("");

    try {
      setLoading(true);

      const result = await signInWithPopup(auth, googleProvider);

      await ensureUserProfile(result.user);

      setMessage("Google login successful. Opening your dashboard...");
      navigate("/dashboard");
    } catch (loginError: any) {
      setError(authMessage(loginError));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-screen">
      <div className="auth-shell">
        <section className="auth-copy">
          <Link to="/" className="auth-brand">
            <img
              src="/careerzoid-logo.png"
              alt="CareerZoid"
              className="h-20 w-auto mb-4"
            />

            <span>CareerZoid</span>

            <small>Career Intelligence Platform</small>
          </Link>

          <div className="auth-visual-card">
            <p className="auth-pill">
              Firebase connected to {firebaseProject}
            </p>

            <h1>
              Welcome back to your career operating system.
            </h1>

            <p>
              Use the same email and password you created through CareerZoid
              Sign Up. If this is your first time with this Firebase project,
              create an account first.
            </p>
          </div>
        </section>

        <section className="auth-card-pro">
          <div className="flex justify-center mb-5">
            <img
              src="/careerzoid-logo.png"
              alt="CareerZoid"
              className="h-24 w-auto"
            />
          </div>

          <p className="auth-pill">
            Secure Login
          </p>

          <h2>
            Login
          </h2>

          <p className="auth-muted">
            Continue to your dashboard, Launch Batch progress, community, and
            career tools.
          </p>

          {message && (
            <div className="auth-alert success">
              {message}
            </div>
          )}

          {error && (
            <div className="auth-alert error">
              {error}
            </div>
          )}

          <form onSubmit={handleLogin} className="auth-form">
            <label>
              <span>Email address</span>

              <input
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </label>

            <label>
              <span>Password</span>

              <input
                type="password"
                placeholder="Your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </label>

            <button
              type="submit"
              className="primary-action"
              disabled={loading}
            >
              {loading ? "Checking Firebase..." : "Login"}
            </button>
          </form>

          <div className="auth-divider">
            OR
          </div>

          <button
            onClick={handleGoogleLogin}
            className="secondary-action"
            disabled={loading}
          >
            Continue with Google
          </button>

          <p className="auth-switch">
            Don't have an account?{" "}
            <Link to="/signup">
              Create Account
            </Link>
          </p>
        </section>
      </div>
    </div>
  );
}