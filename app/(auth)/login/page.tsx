"use client";

import React, { useState, FormEvent, ChangeEvent } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { login } from "./action";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { Eye, EyeOff } from "lucide-react";

interface User {
  firstName?: string;
  lastName?: string;
  username?: string;
  profilePhoto?: string;
  [key: string]: string | undefined;
}

interface LoginResponse {
  user: User;
}

interface Errors {
  email?: string;
  password?: string;
}

const Login: React.FC = () => {
  const router = useRouter();

  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [rememberPassword, setRememberPassword] = useState<boolean>(false);
  const [errors, setErrors] = useState<Errors>({});
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [showPassword, setShowPassword] = useState(false);

  const validateForm = (): boolean => {
    const newErrors: Errors = {};
    if (!email.trim()) {
      newErrors.email = "Please fill this field";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      newErrors.email = "Please enter a valid email";
    }

    if (!password.trim()) {
      newErrors.password = "Please fill this field";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleLogin = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsLoading(true);
    try {
      const response: LoginResponse = await login(email, password);

      localStorage.setItem("user", JSON.stringify(response.user));
      localStorage.setItem("isAuthenticated", "true");

      const user = response.user;
      if (!user.firstName || !user.lastName) {
        router.push("/onboarding/name");
      } else if (!user.username) {
        router.push("/onboarding/username");
      } else if (!user.profilePhoto) {
        router.push("/onboarding/profile-photo");
      } else {
        router.push("/dashboard");
      }
    } catch (error) {
      toast.error("Login failed");
      console.error("Login error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleAuth = () => {
    toast.info("Coming Soon......");
  };

  const handleAppleAuth = () => {
    toast.info("Coming Soon......");
  };

  return (
    <div className="min-h-screen flex overflow-hidde">
      {/* Left side - Gradient Background */}
      <div className="hidden md:flex md:w-1/2 items-center justify-end pl-2 pr-0 py-2">
        <div
          className="w-full h-full max-w-[450px] max-h-[721px] rounded-[68px]"
          style={{
            background:
              "conic-gradient(from 180deg at 50% 50%, #FA6E80 0deg, #6A89BE 144deg, #85AAB7 216deg, #31A7AC 360deg)",
          }}
        ></div>
      </div>

      {/* Right side - Login Form */}
      <div className="w-full md:w-1/2 flex items-center justify-start px-4 sm:px-6 md:pl-0 py-6 md:py-12">
        <div className="w-full max-w-md md:max-w-lg md:pl-12 lg:pl-16 xl:pl-20">
          {/* Logo */}
          <div className="mb-6 md:text-left text-center">
            <Image
              src="/logo/LogoIcon.svg"
              alt="HeyProData"
              width={200}
              height={60}
              className="h-14 md:h-12 mb-4 md:mb-8 w-auto mx-auto md:mx-0 "
            />
            <p className="text-2xl md:text-3xl font-light text-gray-900">
              Login to
              <span className="font-semibold text-pink"> Hey</span>
              <span className="font-semibold text-black">Pro</span>
              <span className="font-semibold text-light-green">Data</span>
            </p>
          </div>

          {/* Login Form */}
          <form onSubmit={handleLogin} className="space-y-2 md:space-y-3">
            {/* Email Field */}
            <div>
              <Input
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e: ChangeEvent<HTMLInputElement>) => {
                  setEmail(e.target.value);
                  if (errors.email) setErrors({ ...errors, email: "" });
                }}
                className="h-11 md:h-12 text-sm md:text-base border-gray-300 rounded-xl focus:border-pink focus:ring-pink transition-all duration-300"
              />
              {errors.email && (
                <p className="text-xs md:text-sm text-red-500 mt-2">
                  {errors.email}
                </p>
              )}
            </div>

            {/* Password Field */}

            <div className="relative">
              <Input
                type={showPassword ? "text" : "password"}
                placeholder="Password"
                value={password}
                onChange={(e: ChangeEvent<HTMLInputElement>) => {
                  setPassword(e.target.value);
                  if (errors.password) setErrors({ ...errors, password: "" });
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

            {/* Remember Password Checkbox */}
            <div className="flex items-center flex-row justify-between mb-4">
              <span className="flex items-center space-x-2 md:space-x-3">
                <Checkbox
                  id="remember"
                  checked={rememberPassword}
                  onCheckedChange={(checked) =>
                    setRememberPassword(checked as boolean)
                  }
                  className="border-gray-400 data-[state=checked]:bg-pink data-[state=checked]:border-pink"
                />
                <label
                  htmlFor="remember"
                  className="text-xs md:text-sm text-gray-600 cursor-pointer select-none"
                >
                  Keep me logged in
                </label>
              </span>

              <Link
                href="/forget-password"
                className="text-xs md:text-sm text-light-green font-medium hover:underline transition-all duration-200"
              >
                Forgot Password?
              </Link>
            </div>

            {/* Login Button */}
            <Button
              type="submit"
              disabled={isLoading}
              className={cn(
                "w-full h-[40px] md:h-[50px] bg-pink hover:bg-[#f95569] text-white text-sm md:text-lg font-medium rounded-[15px] transition-all duration-300 ease-out transform hover:scale-[1.02] active:scale-[0.98] shadow-lg hover:shadow-xl cursor-pointer",
                isLoading && "opacity-70 cursor-progress"
              )}
            >
              {isLoading ? "Loading..." : "Login"}
            </Button>
          </form>

          {/* Divider */}
          <div className="flex items-center my-5 md:my-8">
            <div className="flex-1 border-t border-gray-300"></div>
            <span className="px-3 md:px-4 text-gray-500 text-xs md:text-sm">
              or
            </span>
            <div className="flex-1 border-t border-gray-300"></div>
          </div>

          {/* Social Login Buttons */}
          <div className="flex flex-row w-full gap-3 md:gap-4 justify-center">
            <Button
              type="button"
              onClick={handleGoogleAuth}
              disabled={isLoading}
              className="w-1/2 h-[45px] md:h-[40px] bg-white border border-gray-300 rounded-[12px] md:rounded-[15px] hover:bg-gray-50 hover:border-gray-400 transition-all duration-300 transform hover:scale-105 shadow-sm hover:shadow-md flex items-center justify-center p-3 md:p-6"
            >
              <Image
                src="/assets/icons/google.svg"
                alt="Google Logo"
                width={24}
                height={24}
                className="h-6 w-6"
              />
            </Button>

            <Button
              type="button"
              onClick={handleAppleAuth}
              disabled={isLoading}
              className="w-1/2 h-[45px] md:h-[40px] bg-white border border-gray-300 rounded-[12px] md:rounded-[15px] hover:bg-gray-50 hover:border-gray-400 transition-all duration-300 transform hover:scale-105 shadow-sm hover:shadow-md flex items-center justify-center p-3 md:p-6"
            >
              <Image
                src="/assets/icons/apple.svg"
                alt="Apple Logo"
                width={24}
                height={24}
                className="h-6 w-6"
              />
            </Button>
          </div>

          {/* Sign in Link */}
          <div className="text-center mt-5 md:mt-8">
            <span className="text-gray-600 text-xs md:text-base">
              Don&apos;t have an account?{" "}
            </span>
            <Link
              href="/signup"
              className="text-[#4A90E2] font-medium hover:underline transition-all duration-200 text-xs md:text-base bg-transparent shadow-none hover:shadow-none"
            >
              Sign up
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
