import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { doc, setDoc, serverTimestamp } from "firebase/firestore";

import { auth } from "../firebase/auth";
import { db } from "../firebase/firestore";

export default function SignupPage() {
  const navigate = useNavigate();

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSignup = async (
    e: React.FormEvent<HTMLFormElement>
  ) => {
    e.preventDefault();

    setMessage("");
    setError("");

    if (!fullName || !email || password.length < 6) {
      setError(
        "Enter your name, email, and a password with at least 6 characters."
      );
      return;
    }

    try {
      setLoading(true);

      const userCredential =
        await createUserWithEmailAndPassword(
          auth,
          email,
          password
        );

      const user = userCredential.user;

      await setDoc(
        doc(db, "users", user.uid),
        {
          uid: user.uid,

          fullName,
          email,

          role: "user",

          xp: 0,
          streak: 0,

          membership: "FREE",
          subscription: "free",

          launchBatchActive: false,

          achieversEligible: false,

          successfulReferrals: 0,
          totalReferrals: 0,

          referralCode: "",
          referralLink: "",

          progress: 0,

          createdAt: serverTimestamp(),
          lastLoginAt: serverTimestamp(),
        }
      );

      setMessage(
        "Account created successfully. Opening your dashboard..."
      );

      setFullName("");
      setEmail("");
      setPassword("");

      navigate("/dashboard");
    } catch (error: any) {
      const code = error?.code ?? "";

      const messages: Record<string, string> = {
        "auth/email-already-in-use":
          "This email is already registered. Please login instead.",

        "auth/invalid-email":
          "Enter a valid email address.",

        "auth/weak-password":
          "Use a stronger password with at least 6 characters.",
      };

      setError(
        messages[code] ??
          error.message ??
          "Could not create account."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-screen">
      <div className="auth-card-pro w-full max-w-md">

        <div className="flex justify-center mb-6">
          <img
            src="/careerzoid-logo.png"
            alt="CareerZoid"
            className="h-24 w-auto"
          />
        </div>

        <p className="auth-pill">
          CareerZoid Registration
        </p>

        <h2>Create Account</h2>

        <p className="auth-muted">
          Create your CareerZoid account and start your career journey.
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

        <form
          onSubmit={handleSignup}
          className="auth-form"
        >
          <label>
            <span>Full Name</span>

            <input
              type="text"
              placeholder="Full Name"
              value={fullName}
              onChange={(e) =>
                setFullName(e.target.value)
              }
            />
          </label>

          <label>
            <span>Email Address</span>

            <input
              type="email"
              placeholder="Email Address"
              value={email}
              onChange={(e) =>
                setEmail(e.target.value)
              }
            />
          </label>

          <label>
            <span>Password</span>

            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) =>
                setPassword(e.target.value)
              }
            />
          </label>

          <button
            type="submit"
            className="primary-action"
            disabled={loading}
          >
            {loading
              ? "Creating Account..."
              : "Create Account"}
          </button>
        </form>

        <p className="auth-switch">
          Already have an account?{" "}
          <Link to="/login">
            Login
          </Link>
        </p>
      </div>
    </div>
  );
}