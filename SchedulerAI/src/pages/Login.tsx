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
import DatabaseConnectionCheck from "@/components/DatabaseConnectionCheck";

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
      if (error instanceof Error) {
        if (error.message === "Invalid role") {
          toast.error(
            "Invalid role selected for this account"
          );
        } else if (
          error.message === "Account is inactive"
        ) {
          toast.error(
            "Your account is inactive. Please contact support."
          );
        } else if (
          error.message === "Invalid credentials"
        ) {
          toast.error("Invalid email or password");
        } else if (
          error.message.includes("Database error")
        ) {
          toast.error(
            "Database connection error. Please try again."
          );
        } else {
          toast.error(error.message);
        }
      } else {
        toast.error("Login failed. Please try again.");
      }
      console.error("Login failed:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const demoLogin = async (
    demoRole: "Owner" | "Employee"
  ) => {
    setRole(demoRole);
    setEmail("");
    setPassword("");
    toast(
      `Please enter ${demoRole.toLowerCase()} credentials to log in`,
      {
        duration: 3000,
        icon: "ℹ️",
      }
    );
  };

  return (
    <div className="min-h-dvh flex flex-col items-center justify-center bg-dark-background p-4 sm:p-6">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-dark-foreground">
            RiverPatch Scheduling
          </h1>
          <p className="text-muted-foreground mt-2">
            Log in to manage your schedules
          </p>
        </div>

        <div className="bg-dark-foreground rounded-lg shadow-lg p-6 sm:p-8 border border-primary">
          <form
            onSubmit={handleSubmit}
            className="space-y-5"
          >
            <div className="space-y-2">
              <Label
                htmlFor="email"
                className="flex items-center text-foreground"
              >
                <Mail className="w-4 h-4 mr-2 " />
                Email
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="h-11 border-primary focus:border-foreground focus:ring-foreground"
              />
            </div>

            <div className="space-y-2">
              <Label
                htmlFor="password"
                className="flex items-center text-foreground"
              >
                <Lock className="w-4 h-4 mr-2 " />
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
                className="h-11 border-primary focus:border-foreground focus:ring-foreground"
              />
            </div>

            <div className="space-y-2">
              <Label
                htmlFor="role"
                className="flex items-center text-foreground"
              >
                <User className="w-4 h-4 mr-2 " />
                Role
              </Label>
              <Select
                value={role}
                onValueChange={(value) =>
                  setRole(value as "Owner" | "Employee")
                }
              >
                <SelectTrigger className="w-full h-11 border-primary focus:border-foreground focus:ring-foreground">
                  <SelectValue placeholder="Select role" />
                </SelectTrigger>
                <SelectContent className="bg-background border-primary">
                  <SelectItem
                    value="Employee"
                    className="text-foreground hover:bg-backbground"
                  >
                    Employee
                  </SelectItem>
                  <SelectItem
                    value="Owner"
                    className="text-foreground hover:bg-backbground"
                  >
                    Owner
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            <CustomButton
              type="submit"
              className="w-full h-11 bg-[#001140] text-[#f2fdff] hover:bg-accent hover:cursor-pointer"
              isLoading={isLoading}
            >
              Log In
            </CustomButton>
          </form>

          <div className="mt-6 border-t border-primary pt-4">
            <p className="text-center text-sm text-[#6f7d7f] mb-4">
              Quick Role Selection
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <CustomButton
                onClick={() => demoLogin("Owner")}
                className="w-full bg-[#e6f2f9] text-foreground hover:bg-[#261e67] hover:text-[#f2fdff]"
                disabled={isLoading}
              >
                Select Owner Role
              </CustomButton>
              <CustomButton
                onClick={() => demoLogin("Employee")}
                className="w-full bg-[#e6f2f9] text-foreground hover:bg-[#261e67] hover:text-[#f2fdff]"
                disabled={isLoading}
              >
                Select Employee Role
              </CustomButton>
              {/* <CustomButton
                onClick={() => demoLogin("Employee")}
                className="w-full border border-primary text-foreground hover:bg-[#e6f2f9]"
                disabled={isLoading}
              >
                Select Employee Role
              </CustomButton> */}
            </div>
          </div>

          <div className="mt-6 text-center">
            <a
              href="#"
              className="text-sm text-foreground hover:text-accent hover:underline"
            >
              Forgot Password?
            </a>
            <p className="mt-2 text-sm">
              <span className="text-[#6f7d7f]">
                Need an account?{" "}
              </span>
              <a
                href="#"
                className="text-foreground hover:text-accent "
              >
                Sign Up
              </a>
            </p>
          </div>
        </div>
      </div>
      <DatabaseConnectionCheck />
    </div>
  );
};

export default Login;
