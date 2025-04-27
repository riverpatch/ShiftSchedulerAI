import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";
import { Mail, Lock, User } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import CustomButton from "@/components/ui/CustomButton";
import { useAuth } from "../context/AuthContext";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<"Owner" | "Employee">(
    "Employee"
  );
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      toast.error("Please fill in all fields");
      return;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      toast.error("Please enter a valid email address");
      return;
    }
    if (password.length < 8) {
      toast.error("Password must be at least 8 characters");
      return;
    }

    setIsLoading(true);
    try {
      const user = await login(email, password, role);
      toast.success("Logged in successfully!");
      navigate(
        user.role === "Owner"
          ? "/owner/dashboard"
          : "/employee/dashboard"
      );
    } catch (error) {
      toast.error("Invalid credentials");
      console.error("Login failed:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const demoLogin = async (
    demoEmail: string,
    demoRole: "Owner" | "Employee"
  ) => {
    setEmail(demoEmail);
    setPassword("password123");
    setRole(demoRole);

    setTimeout(async () => {
      setIsLoading(true);
      try {
        const user = await login(
          demoEmail,
          "password123",
          demoRole
        );
        toast.success("Logged in successfully!");
        navigate(
          user.role === "Owner"
            ? "/owner/dashboard"
            : "/employee/dashboard"
        );
      } catch {
        toast.error("Demo login failed");
      } finally {
        setIsLoading(false);
      }
    }, 300);
  };

  return (
    <div
      className="
        min-h-dvh flex flex-col items-center justify-center
        bg-dark-background
        p-4 sm:p-6
      "
    >
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-dark-foreground-color">
            AI Shift Scheduler
          </h1>
          <p className="text-muted-foreground mt-2">
            Log in to manage your schedules
          </p>
        </div>

        {/* card background from CSS var */}
        <div className="bg-card rounded-lg shadow-lg p-6 sm:p-8">
          <form
            onSubmit={handleSubmit}
            className="space-y-5"
          >
            {/* Email */}
            <div className="space-y-2">
              <Label
                htmlFor="email"
                className="flex items-center"
              >
                <Mail className="w-4 h-4 mr-2" />
                Email
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="h-11"
              />
            </div>

            {/* Password */}
            <div className="space-y-2">
              <Label
                htmlFor="password"
                className="flex items-center"
              >
                <Lock className="w-4 h-4 mr-2" />
                Password
              </Label>
              <Input
                id="password"
                type="password"
                placeholder="Enter your password"
                value={password}
                onChange={(e) =>
                  setPassword(e.target.value)
                }
                required
                className="h-11"
              />
            </div>

            {/* Role */}
            <div className="space-y-2">
              <Label
                htmlFor="role"
                className="flex items-center"
              >
                <User className="w-4 h-4 mr-2" />
                Role
              </Label>
              <Select
                value={role}
                onValueChange={(value) =>
                  setRole(value as "Owner" | "Employee")
                }
              >
                <SelectTrigger className="w-full h-11">
                  <SelectValue placeholder="Select role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Employee">
                    Employee
                  </SelectItem>
                  <SelectItem value="Owner">
                    Owner
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            <CustomButton
              type="submit"
              className="w-full h-11"
              variant="primary"
              isLoading={isLoading}
            >
              Log In
            </CustomButton>
          </form>

          {/* demo divider with correct border color */}
          <div className="mt-6 border-t border-border pt-4">
            <p className="text-center text-sm text-muted-foreground mb-4">
              Demo Access
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <CustomButton
                onClick={() =>
                  demoLogin("owner@example.com", "Owner")
                }
                variant="secondary"
                className="w-full"
                disabled={isLoading}
              >
                Login as Owner
              </CustomButton>
              <CustomButton
                onClick={() =>
                  demoLogin(
                    "employee@example.com",
                    "Employee"
                  )
                }
                variant="outline"
                className="w-full"
                disabled={isLoading}
              >
                Login as Employee
              </CustomButton>
            </div>
          </div>

          <div className="mt-6 text-center">
            <a
              href="#"
              className="text-sm text-scheduler-primary hover:underline"
            >
              Forgot Password?
            </a>
            <p className="mt-2 text-sm">
              <span className="text-muted-foreground">
                Need an account?{" "}
              </span>
              <a
                href="#"
                className="text-scheduler-primary hover:underline"
              >
                Sign Up
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
