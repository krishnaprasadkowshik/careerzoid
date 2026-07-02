import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { sendOTPEmail } from "../utils/emailOtp";

export default function EmailOtpLoginPage() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [generatedOtp, setGeneratedOtp] =
    useState("");

  const generateOTP = () => {
    return Math.floor(
      100000 + Math.random() * 900000
    ).toString();
  };

  const sendOTP = async () => {
    try {
      const newOtp = generateOTP();

      await sendOTPEmail(email, newOtp);

      setGeneratedOtp(newOtp);

      alert(
        "OTP Sent Successfully. Check your Email."
      );
    } catch (error: any) {
      alert(error.message);
    }
  };

  const verifyOTP = () => {
    if (otp === generatedOtp) {
      alert("Login Successful");

      navigate("/dashboard");
    } else {
      alert("Invalid OTP");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-black to-blue-900 flex items-center justify-center p-6">

      <div className="w-full max-w-md bg-white/10 backdrop-blur-xl rounded-3xl p-8 border border-white/10">

        <h1 className="text-4xl font-bold text-white text-center">
          CareerZoid
        </h1>

        <p className="text-center text-gray-300 mt-2">
          Login With Email OTP
        </p>

        <div className="mt-8 space-y-4">

          <input
            type="email"
            placeholder="Enter Email"
            value={email}
            onChange={(e) =>
              setEmail(e.target.value)
            }
            className="w-full p-3 rounded-xl bg-black/30 text-white border border-gray-700"
          />

          <button
            onClick={sendOTP}
            className="w-full bg-blue-600 p-3 rounded-xl"
          >
            Send OTP
          </button>

          <input
            type="text"
            placeholder="Enter OTP"
            value={otp}
            onChange={(e) =>
              setOtp(e.target.value)
            }
            className="w-full p-3 rounded-xl bg-black/30 text-white border border-gray-700"
          />

          <button
            onClick={verifyOTP}
            className="w-full bg-green-600 p-3 rounded-xl"
          >
            Verify OTP
          </button>

        </div>

      </div>

    </div>
  );
}