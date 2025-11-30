"use client";
import React, { useState, useEffect, FormEvent, ChangeEvent } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { register, sendOtp, verifyOtp } from "./action";
import { Eye, EyeOff } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

interface PasswordValidation {
  hasUppercase: boolean;
  hasNumber: boolean;
  hasSpecialChar: boolean;
}
interface Errors {
  emailId?: string;
  password?: string;
  otp?: string;
}
interface User {
  id?: string;
  emailId?: string;
  firstName?: string;
  lastName?: string;
  username?: string;
  profilePhoto?: string;
  [key: string]: string | undefined;
}
interface RegisterResponse {
  user: User;
  requiresOtp?: boolean;
}

const validatePassword = (password: string): PasswordValidation => ({
  hasUppercase: /[A-Z]/.test(password),
  hasNumber: /[0-9]/.test(password),
  hasSpecialChar: /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password),
});

const SignIn: React.FC = () => {
  const router = useRouter();

  const [step, setStep] = useState<"form" | "otp">("form");
  const [emailId, setemailId] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [otp, setOtp] = useState("");
  const [errors, setErrors] = useState<Errors>({});
  const [isLoading, setIsLoading] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [passwordValidation, setPasswordValidation] =
    useState<PasswordValidation>({
      hasUppercase: false,
      hasNumber: false,
      hasSpecialChar: false,
    });
  // useEffect(() => {
  //   setStep("otp");
  // })
  const [resendTimer, setResendTimer] = useState(0);
  const RESEND_INTERVAL = 30; // seconds

  useEffect(() => {
    if (password) {
      setPasswordValidation(validatePassword(password));
    } else {
      setPasswordValidation({
        hasUppercase: false,
        hasNumber: false,
        hasSpecialChar: false,
      });
    }
  }, [password]);

  useEffect(() => {
    if (resendTimer <= 0) return;
    const id = setInterval(() => setResendTimer((t) => t - 1), 1000);
    return () => clearInterval(id);
  }, [resendTimer]);

  const validateForm = (): boolean => {
    const newErrors: Errors = {};
    if (!emailId.trim()) newErrors.emailId = "Please fill this field";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailId))
      newErrors.emailId = "Please enter a valid emailId";
    if (!password.trim()) newErrors.password = "Please fill this field";
    else if (
      !passwordValidation.hasUppercase ||
      !passwordValidation.hasNumber ||
      !passwordValidation.hasSpecialChar
    )
      newErrors.password = "Password does not meet all requirements";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSignIn = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!validateForm()) return;
    setIsLoading(true);
    console.log("Submitting registration for:", emailId);
    try {
      const response: RegisterResponse = await register({ emailId, password });
      console.log(response);
      toast.success(
        response.user ? "Registration successful!" : "Registration completed!"
      );
      localStorage.setItem("pendingUser", JSON.stringify(response.user));
      const otpResp = await sendOtp(emailId);
      if (otpResp?.success) {
        toast.success("OTP sent to your emailId");
      } else {
        toast.info("Proceed with OTP verification");
      }
      setResendTimer(RESEND_INTERVAL);
      setStep("otp");
    } catch (error) {
      toast.error((error as Error)?.message || "Registration failed");
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyOtp = async (e: FormEvent) => {
    e.preventDefault();
    if (!otp || otp.length < 6) {
      setErrors((prev) => ({ ...prev, otp: "Enter 6 digit code" }));
      return;
    }
    setIsVerifying(true);
    try {
      const result = await verifyOtp(emailId, otp);
      if (result.success) {
        localStorage.setItem("isAuthenticated", "true");
        const stored = localStorage.getItem("pendingUser");
        if (stored) localStorage.setItem("user", stored);
        localStorage.removeItem("pendingUser");
        toast.success("OTP verified");
        router.push("/onboarding/name");
      } else {
        setErrors((prev) => ({ ...prev, otp: "Invalid code" }));
      }
    } catch (err) {
      toast.error((err as Error)?.message || "Verification failed");
    } finally {
      setIsVerifying(false);
    }
  };

  const handleResend = async () => {
    if (resendTimer > 0) return;
    try {
      const resp = await sendOtp(emailId);
      if (resp.success) {
        toast.success("OTP resent");
        setResendTimer(RESEND_INTERVAL);
      } else {
        toast.error("Could not resend OTP");
      }
    } catch {
      toast.error("Error resending OTP");
    }
  };

  const handleGoogleAuth = () =>
    toast.info("Google authentication is not set up yet. Coming Soon!");

  return (
    <>
      <div className=" flex min-h-screen items-center justify-center overflow-hidden  mx-auto max-w-7xl">
        <div className="w-full flex px-4 sm:px-6 py-6 mx-auto">
          {step === "form" ? (
            <div className="flex w-full flex-col md:flex-row gap-8  mx-auto justify-center items-center">
              <div className="w-full md:p-32 md:pr-8 flex flex-col justify-center  mx-auto">
                <form
                  onSubmit={handleSignIn}
                  className="space-y-2 md:space-y-3 "

                >
                  <div className="mb-6 md:mb-12 md:text-left text-center">
                    <Image
                      src="/logo/LogoIcon.svg"
                      alt="HeyProData"
                      width={200}
                      height={60}
                      className="h-14 md:h-12 mb-4 md:mb-8 w-auto mx-auto md:mx-0 "
                    />
                    {step === "form" ? (
                      <p className="text-2xl md:text-3xl font-light text-gray-900">
                        Sign up to
                        <span className="font-semibold text-pink"> Hey</span>
                        <span className="font-semibold text-black">Pro</span>
                        <span className="font-semibold text-light-green">
                          Data
                        </span>
                      </p>
                    ) : (
                      <p className="text-2xl md:text-3xl font-light text-gray-900">
                        Verify your emailId
                      </p>
                    )}
                  </div>
                  <div className="">
                    <Input
                      type="emailId"
                      placeholder="Email"
                      value={emailId}
                      onChange={(e: ChangeEvent<HTMLInputElement>) => {
                        setemailId(e.target.value);
                        if (errors.emailId)
                          setErrors({ ...errors, emailId: "" });
                      }}
                      className="h-11 md:h-12 text-sm md:text-base border-gray-300 rounded-xl focus:border-[#FA6E80] focus:ring-[#FA6E80]"
                    />
                    {errors.emailId && (
                      <p className="text-xs md:text-sm text-red-500 mt-2">
                        {errors.emailId}
                      </p>
                    )}
                  </div>

                  <div className="relative">
                    <Input
                      type={showPassword ? "text" : "password"}
                      placeholder="Password"
                      value={password}
                      onChange={(e: ChangeEvent<HTMLInputElement>) => {
                        setPassword(e.target.value);
                        if (errors.password)
                          setErrors({ ...errors, password: "" });
                      }}
                      className="h-11 md:h-12 text-sm md:text-base border-gray-300 rounded-xl focus:border-[#FA6E80] focus:ring-[#FA6E80] pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute inset-y-0 right-0 top-1 pr-3 flex items-center text-gray-600"
                    >
                      {showPassword ? (
                        <EyeOff className="h-5 w-5" />
                      ) : (
                        <Eye className="h-5 w-5" />
                      )}
                    </button>
                    {errors.password && (
                      <p className="text-xs md:text-sm text-red-500 mt-2">
                        {errors.password}
                      </p>
                    )}
                  </div>

                  {password && (
                    <div className="space-y-1.5 md:space-y-2">
                      <PasswordRule
                        label="at least one uppercase"
                        valid={passwordValidation.hasUppercase}
                      />
                      <PasswordRule
                        label="at least one number"
                        valid={passwordValidation.hasNumber}
                      />
                      <PasswordRule
                        label="at least one special character"
                        valid={passwordValidation.hasSpecialChar}
                        color="green"
                      />
                    </div>
                  )}

                  <Button
                    type="submit"
                    disabled={isLoading}
                    className="w-full h-[40px] md:h-[50px] bg-[#FA6E80] hover:bg-[#f95569] text-white text-sm md:text-lg font-medium rounded-[15px]"
                  >
                    {isLoading ? "Loading..." : "Sign up"}
                  </Button>
                </form>

                <Divider label="or" />

                <div className="flex flex-row w-full  gap-3 md:gap-4 justify-center">
                  <Button
                    type="button"
                    onClick={handleGoogleAuth}
                    disabled={isLoading}
                    className=" w-full h-[45px] md:h-[40px] bg-white border border-gray-300 rounded-[12px] md:rounded-[15px] hover:bg-gray-50 hover:border-gray-400 transition-all duration-300 transform hover:scale-105 shadow-sm hover:shadow-md flex items-center justify-center p-3 md:p-6"
                  >
                    <Image
                      src="/assets/icons/google.svg"
                      alt="Google Logo"
                      width={24}
                      height={24}
                      className="h-6 w-6"
                    />
                  </Button>

                </div>

                <div className="text-center mt-5 md:mt-8">
                  <span className="text-gray-600 text-xs md:text-base">
                    Already have an account?{" "}
                  </span>
                  <Link
                    href="/login"
                    className="text-[#4A90E2] font-medium hover:underline text-xs md:text-base"
                  >
                    Login
                  </Link>
                </div>
              </div>
              <div className="hidden md:flex w-full items-center justify-start py-6 md:py-0">
                <div
                  className="w-full md:h-[50rem] max-w-[450px]  rounded-[40px] md:rounded-[68px]"
                  style={{
                    background:
                      "conic-gradient(from 0deg at 50% 50%, #FA6E80 0deg, #6A89BE 144deg, #85AAB7 216deg, #31A7AC 360deg)",
                  }}
                ></div>
              </div>
            </div>
          ) : (
            <div className="w-full flex items-center justify-center bg-white px-4 py-10 sm:py-14">
              <div
                className="relative w-full max-w-xl sm:max-w-2xl md:max-w-3xl lg:max-w-4xl rounded-[36px] sm:rounded-[48px] md:rounded-[60px] lg:rounded-[68px] flex items-center justify-center p-4 sm:p-6 md:p-10"
                style={{
                  backgroundImage:
                    "conic-gradient(from 180deg at 50% 50%, #FA6E80 0deg, #6A89BE 144deg, #85AAB7 216deg, #31A7AC 360deg)",
                  backgroundSize: "140% 140%",
                  backgroundPosition: "center",
                  backgroundRepeat: "no-repeat",
                }}
              >
                <form
                  onSubmit={handleVerifyOtp}
                  className="bg-white/85 backdrop-blur-sm w-full max-w-md rounded-2xl p-6 sm:p-8 md:p-10 space-y-5 sm:space-y-6 shadow-lg"
                >
                  <div className="text-center mb-2 sm:mb-4">
                    <Image
                      src="https://customer-assets.emergentagent.com/job_2a9bf250-13c7-456d-9a61-1240d767c09d/artifacts/97u04lh8_hpd.png"
                      alt="HeyProData"
                      width={180}
                      height={56}
                      className="h-10 sm:h-12 md:h-14 w-auto mx-auto"
                      priority
                    />
                  </div>

                  <h1 className="text-2xl sm:text-3xl md:text-4xl font-semibold text-gray-900 text-center">
                    Enter Your OTP
                  </h1>
                  <p className="text-xs sm:text-sm text-gray-600 text-center leading-relaxed">
                    We sent a 6‑digit code to{" "}
                    <span className="font-medium break-all">{emailId}</span>.{" "}
                    <br className="hidden sm:block" />
                    Enter it below to continue.
                  </p>

                  <div>
                    <div className="flex justify-center gap-1.5 sm:gap-2 md:gap-3">
                      {Array.from({ length: 6 }).map((_, i) => (
                        <Input
                          key={i}
                          id={`otp-input-${i}`}
                          data-otp-input
                          inputMode="numeric"
                          autoComplete="one-time-code"
                          maxLength={6}
                          className="w-10 h-12 sm:w-12 sm:h-14 md:w-14 md:h-16 text-center text-base sm:text-lg font-medium border-gray-300 focus:border-[#FA6E80] focus:ring-[#FA6E80] [appearance:textfield] bg-gray-100 rounded-lg"
                          value={otp[i] || ""}
                          onChange={(
                            e: React.ChangeEvent<HTMLInputElement>
                          ) => {
                            const raw = e.target.value.replace(/\D/g, "");
                            if (!raw) {
                              const arr = otp.split("");
                              arr.splice(i, 1);
                              setOtp(arr.join(""));
                            } else {
                              const chars = raw.split("");
                              const arr = otp.split("");
                              while (arr.length < 6) arr.push("");
                              for (
                                let k = 0;
                                k < chars.length && i + k < 6;
                                k++
                              ) {
                                arr[i + k] = chars[k];
                              }
                              const newCode = arr.join("").slice(0, 6);
                              setOtp(newCode);
                              const nextIndex = Math.min(i + chars.length, 5);
                              if (nextIndex > i) {
                                setTimeout(() => {
                                  (
                                    document.getElementById(
                                      `otp-input-${nextIndex}`
                                    ) as HTMLInputElement | null
                                  )?.focus();
                                }, 0);
                              }
                            }
                            if (errors.otp)
                              setErrors((prev) => ({ ...prev, otp: "" }));
                          }}
                          onKeyDown={(
                            e: React.KeyboardEvent<HTMLInputElement>
                          ) => {
                            if (e.key === "Backspace" && !otp[i] && i > 0) {
                              (
                                document.getElementById(
                                  `otp-input-${i - 1}`
                                ) as HTMLInputElement | null
                              )?.focus();
                            }
                            if (e.key === "ArrowLeft" && i > 0) {
                              (
                                document.getElementById(
                                  `otp-input-${i - 1}`
                                ) as HTMLInputElement | null
                              )?.focus();
                            }
                            if (e.key === "ArrowRight" && i < 5) {
                              (
                                document.getElementById(
                                  `otp-input-${i + 1}`
                                ) as HTMLInputElement | null
                              )?.focus();
                            }
                          }}
                          onPaste={(
                            e: React.ClipboardEvent<HTMLInputElement>
                          ) => {
                            e.preventDefault();
                            const pasted = e.clipboardData
                              .getData("text")
                              .replace(/\D/g, "")
                              .slice(0, 6);
                            if (!pasted) return;
                            setOtp(pasted);
                            setTimeout(() => {
                              const targetIndex = Math.min(
                                pasted.length - 1,
                                5
                              );
                              (
                                document.getElementById(
                                  `otp-input-${targetIndex}`
                                ) as HTMLInputElement | null
                              )?.focus();
                            }, 0);
                            if (errors.otp)
                              setErrors((prev) => ({ ...prev, otp: "" }));
                          }}
                        />
                      ))}
                    </div>
                    {errors.otp && (
                      <p className="text-xs text-red-500 mt-2 text-center">
                        {errors.otp}
                      </p>
                    )}
                    <p className="text-[10px] sm:text-xs mt-3 text-gray-500 text-center px-2">
                      ⚠️ Didn&apos;t receive the code? Do not share your OTP
                      with anyone.
                    </p>
                  </div>

                  <Button
                    type="submit"
                    disabled={isVerifying || otp.length !== 6}
                    className="w-full h-11 sm:h-12 bg-[#FA6E80] hover:bg-[#f95569] text-white font-medium rounded-xl sm:rounded-[15px] text-sm sm:text-base"
                  >
                    {isVerifying ? "Verifying..." : "Verify OTP"}
                  </Button>

                  <div className="flex flex-col sm:flex-row gap-3 sm:gap-0 sm:items-center justify-between text-xs sm:text-sm text-gray-600">
                    <button
                      type="button"
                      onClick={handleResend}
                      disabled={resendTimer > 0}
                      className={`font-medium ${resendTimer > 0
                        ? "opacity-50 cursor-not-allowed"
                        : "text-[#4A90E2] hover:underline"
                        }`}
                    >
                      {resendTimer > 0
                        ? `Resend in ${resendTimer}s`
                        : "Resend Code"}
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setStep("form");
                        setOtp("");
                      }}
                      className="text-[#4A90E2] hover:underline font-medium"
                    >
                      Change emailId
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

interface PasswordRuleProps {
  label: string;
  valid: boolean;
  color?: "green" | "red";
}
const PasswordRule: React.FC<PasswordRuleProps> = ({
  label,
  valid,
  color = "green",
}) => (
  <div className="flex items-center space-x-2">
    <div
      className={`w-1.5 h-1.5 md:w-2 md:h-2 rounded-full ${valid
        ? color === "red"
          ? "bg-red-500"
          : "bg-green-500"
        : "bg-gray-400"
        }`}
    ></div>
    <span
      className={`text-[10px] md:text-sm ${valid
        ? color === "red"
          ? "text-red-500"
          : "text-green-500"
        : "text-gray-500"
        }`}
    >
      Password must contain <span className="font-medium">{label}</span>
    </span>
  </div>
);

const Divider: React.FC<{ label: string }> = ({ label }) => (
  <div className="flex items-center my-5 md:my-8">
    <div className="flex-1 border-t border-gray-300"></div>
    <span className="px-3 md:px-4 text-gray-500 text-xs md:text-sm">
      {label}
    </span>
    <div className="flex-1 border-t border-gray-300"></div>
  </div>
);

export default SignIn;
