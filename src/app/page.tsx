// app/page.tsx
"use client";

import { useState, useEffect } from "react";
import { useAuthState } from "react-firebase-hooks/auth";
import { auth } from "../../firebaseApp";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import {
  linkWithPopup,
  GoogleAuthProvider,
  signInWithPopup,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  fetchSignInMethodsForEmail,
} from "firebase/auth";
import dynamic from "next/dynamic";

// Create a client-side only component for router usage
const ClientSideRouterHandler = dynamic(
  () => import("./ClientSideRouterHandler"),
  { ssr: false }
);

export default function Home() {
  const [user, loading, error] = useAuthState(auth);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);

  const provider = new GoogleAuthProvider();

  const handleEmailSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (isSignUp) {
        await createUserWithEmailAndPassword(auth, email, password);
      } else {
        await signInWithEmailAndPassword(auth, email, password);
      }
    } catch (error) {
      console.error("Error signing in:", error);
    }
  };

  const handleGoogleSignIn = async () => {
    try {
      await signInWithPopup(auth, provider);
    } catch (error: any) {
      if (error.code === "auth/account-exists-with-different-credential") {
        // Fetch the email associated with the Google account
        const email = error.customData.email;
        // Fetch sign-in methods for this email
        const methods = await fetchSignInMethodsForEmail(auth, email);
        if (methods[0] === "password") {
          // The user has a password-based account. Ask them to sign in with password first
          alert(
            "An account already exists with the same email address. Please sign in with your password, then link your Google account."
          );
          // You might want to redirect to a password sign-in page here
        } else {
          console.error("Unexpected sign-in method:", methods[0]);
        }
      } else {
        console.error("Error signing in:", error);
      }
    }
  };

  // const handleGoogleSignIn = () => {
  //   signInWithPopup(auth, provider);
  // };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        Loading...
      </div>
    );
  }

  if (user) {
    return <ClientSideRouterHandler />;
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="px-8 py-6 mt-4 text-left bg-white shadow-lg rounded-lg">
        <h3 className="text-2xl font-bold text-center">
          {isSignUp ? "Sign Up" : "Login"} to your account
        </h3>
        <form onSubmit={handleEmailSignIn}>
          <div className="mt-4">
            <div>
              <label className="block" htmlFor="email">
                Email
              </label>
              <input
                type="text"
                placeholder="Email"
                className="w-full px-4 py-2 mt-2 border rounded-md focus:outline-none focus:ring-1 focus:ring-blue-600"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="mt-4">
              <label className="block">Password</label>
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Password"
                className="w-full px-4 py-2 mt-2 border rounded-md focus:outline-none focus:ring-1 focus:ring-blue-600"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />

              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                // Absolute positioning with right-2 and inset-y-0
                className="absolute inset-y-0 top-6 -mx-7  items-center"
              >
                {showPassword ? <FaEyeSlash /> : <FaEye />}
              </button>
            </div>
            <div className="flex flex-col items-baseline justify-between">
              <button
                className="px-6 py-2 mt-4 mb-4 text-white bg-blue-600 rounded-lg hover:bg-blue-900"
                type="submit"
              >
                {isSignUp ? "Sign Up" : "Login"}
              </button>
              <a
                href="#"
                className="text-sm text-blue-600 hover:underline"
                onClick={() => setIsSignUp(!isSignUp)}
              >
                {isSignUp ? "Already have an account? Login" : "Create account"}
              </a>
            </div>
          </div>
        </form>
        <div className="mt-6">
          <button
            onClick={handleGoogleSignIn}
            className="w-full px-4 py-2 text-white bg-red-600 rounded-lg hover:bg-red-700 flex items-center justify-center"
          >
            <svg className="w-4 h-4 mr-2" viewBox="0 0 24 24">
              <path
                fill="currentColor"
                d="M12.545,10.239v3.821h5.445c-0.712,2.315-2.647,3.972-5.445,3.972c-3.332,0-6.033-2.701-6.033-6.032s2.701-6.032,6.033-6.032c1.498,0,2.866,0.549,3.921,1.453l2.814-2.814C17.503,2.988,15.139,2,12.545,2C7.021,2,2.543,6.477,2.543,12s4.478,10,10.002,10c8.396,0,10.249-7.85,9.426-11.748L12.545,10.239z"
              />
            </svg>
            Sign in with Google
          </button>
        </div>
      </div>
    </div>
  );
}
