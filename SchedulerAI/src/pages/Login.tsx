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
  const [role, setRole] = useState<"Owner" | "Employee">("Employee");
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
      navigate(user.role === "Owner" ? "/owner/dashboard" : "/employee/dashboard");
    } catch (error) {
      if (error instanceof Error) {
        if (error.message === "Invalid role") {
          toast.error("Invalid role selected");
        } else {
          toast.error("Invalid email or password");
        }
      } else {
        toast.error("Login failed. Please try again.");
      }
      console.error("Login failed:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const demoLogin = async (demoEmail: string, demoRole: "Owner" | "Employee") => {
    setEmail(demoEmail);
    setPassword(demoEmail.split('@')[0]); // Use the username part as password
    setRole(demoRole);

    setTimeout(async () => {
      setIsLoading(true);
      try {
        const user = await login(demoEmail, demoEmail.split('@')[0], demoRole);
        toast.success("Logged in successfully!");
        navigate(user.role === "Owner" ? "/owner/dashboard" : "/employee/dashboard");
      } catch (error) {
        if (error instanceof Error) {
          toast.error(error.message);
        } else {
          toast.error("Demo login failed");
        }
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

        <div className="bg-[#f2fdff] rounded-lg shadow-lg p-6 sm:p-8 border border-[#261e67]">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="email" className="flex items-center text-[#001140]">
                <Mail className="w-4 h-4 mr-2 text-[#6f7d7f]" />
                Email
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="h-11 border-[#261e67] focus:border-[#001140] focus:ring-[#001140]"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="flex items-center text-[#001140]">
                <Lock className="w-4 h-4 mr-2 text-[#6f7d7f]" />
                Password
              </Label>
              <Input
                id="password"
                type="password"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="h-11 border-[#261e67] focus:border-[#001140] focus:ring-[#001140]"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="role" className="flex items-center text-[#001140]">
                <User className="w-4 h-4 mr-2 text-[#6f7d7f]" />
                Role
              </Label>
              <Select
                value={role}
                onValueChange={(value) => setRole(value as "Owner" | "Employee")}
              >
                <SelectTrigger className="w-full h-11 border-[#261e67] focus:border-[#001140] focus:ring-[#001140]">
                  <SelectValue placeholder="Select role" />
                </SelectTrigger>
                <SelectContent className="bg-[#f2fdff] border-[#261e67]">
                  <SelectItem value="Employee" className="text-[#001140] hover:bg-[#e6f2f9]">Employee</SelectItem>
                  <SelectItem value="Owner" className="text-[#001140] hover:bg-[#e6f2f9]">Owner</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <CustomButton
              type="submit"
              className="w-full h-11 bg-[#001140] text-[#f2fdff] hover:bg-[#261e67]"
              isLoading={isLoading}
            >
              Log In
            </CustomButton>
          </form>

          <div className="mt-6 border-t border-[#261e67] pt-4">
            <p className="text-center text-sm text-[#6f7d7f] mb-4">Demo Access</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <CustomButton
                onClick={() => demoLogin("jane.doe@acme.com", "Owner")}
                className="w-full bg-[#e6f2f9] text-[#001140] hover:bg-[#261e67] hover:text-[#f2fdff]"
                disabled={isLoading}
              >
                Login as Owner
              </CustomButton>
              <CustomButton
                onClick={() => demoLogin("john.smith@acme.com", "Employee")}
                className="w-full border border-[#261e67] text-[#001140] hover:bg-[#e6f2f9]"
                disabled={isLoading}
              >
                Login as Employee
              </CustomButton>
            </div>
          </div>

          <div className="mt-6 text-center">
            <a href="#" className="text-sm text-[#001140] hover:text-[#261e67] hover:underline">
              Forgot Password?
            </a>
            <p className="mt-2 text-sm">
              <span className="text-[#6f7d7f]">Need an account? </span>
              <a href="#" className="text-[#001140] hover:text-[#261e67] hover:underline">
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
