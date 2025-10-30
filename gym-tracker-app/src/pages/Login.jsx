import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../hooks/useAuth.js";
import { isValidEmail, validatePassword } from "../utils/validators.js";
import Input from "../components/common/Input.jsx";
import Button from "../components/common/Button.jsx";
import LoadingSpinner from "../components/common/LoadingSpinner.jsx";

const Login = () => {
  const navigate = useNavigate();
  const { login, isLoading } = useAuth();

  const [formData, setFormData] = useState({
    email: "",
    password: "",
    rememberMe: true,
  });

  const [errors, setErrors] = useState({
    email: "",
    password: "",
    general: "",
  });

  const [touched, setTouched] = useState({
    email: false,
    password: false,
  });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));

    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "", general: "" }));
    }
  };

  const handleBlur = (e) => {
    const { name } = e.target;
    setTouched((prev) => ({ ...prev, [name]: true }));
    validateField(name, formData[name]);
  };

  const validateField = (name, value) => {
    let error = "";

    switch (name) {
      case "email":
        if (!value) {
          error = "Email is required";
        } else if (!isValidEmail(value)) {
          error = "Please enter a valid email address";
        }
        break;
      case "password":
        if (!value) {
          error = "Password is required";
        }
        break;
      default:
        break;
    }

    setErrors((prev) => ({ ...prev, [name]: error }));
    return error === "";
  };

  const validateForm = () => {
    const emailValid = validateField("email", formData.email);
    const passwordValid = validateField("password", formData.password);

    setTouched({ email: true, password: true });

    return emailValid && passwordValid;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors((prev) => ({ ...prev, general: "" }));

    if (!validateForm()) {
      return;
    }

    try {
      await login(formData.email, formData.password, formData.rememberMe);
      navigate("/dashboard");
    } catch (error) {
      setErrors((prev) => ({
        ...prev,
        general: error.message || "Failed to sign in. Please try again.",
      }));
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[var(--bg-primary)] px-4 py-8 safe-area-bottom container-safe">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-[var(--text-primary)] mb-2">
            Welcome Back
          </h1>
          <p className="text-[var(--text-secondary)]">
            Sign in to continue your fitness journey
          </p>
        </div>

        <div className="bg-[var(--bg-secondary)] rounded-lg shadow-lg p-8">
          <form onSubmit={handleSubmit} noValidate>
            {errors.general && (
              <div
                className="mb-4 p-3 rounded-lg bg-[var(--error-bg)] border border-[var(--error)] text-[var(--error)]"
                role="alert"
              >
                {errors.general}
              </div>
            )}

            <Input
              label="Email"
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              onBlur={handleBlur}
              placeholder="your.email@example.com"
              error={touched.email ? errors.email : ""}
              required
              disabled={isLoading}
              className="mb-4"
            />

            <Input
              label="Password"
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              onBlur={handleBlur}
              placeholder="Enter your password"
              error={touched.password ? errors.password : ""}
              required
              disabled={isLoading}
              className="mb-4"
            />

            <div className="flex items-center mb-6">
              <input
                type="checkbox"
                id="rememberMe"
                name="rememberMe"
                checked={formData.rememberMe}
                onChange={handleChange}
                disabled={isLoading}
                className="w-5 h-5 text-[var(--accent-primary)] bg-[var(--bg-primary)] border-[var(--border-secondary)] rounded focus:ring-[var(--accent-primary)] focus:ring-2 touch-manipulation"
              />
              <label
                htmlFor="rememberMe"
                className="ml-3 text-sm text-[var(--text-secondary)] touch-manipulation cursor-pointer"
              >
                Remember me
              </label>
            </div>

            <Button
              type="submit"
              variant="primary"
              fullWidth
              disabled={isLoading}
              className="mb-4"
            >
              {isLoading ? (
                <span className="flex items-center justify-center">
                  <LoadingSpinner size="sm" />
                  <span className="ml-2">Signing in...</span>
                </span>
              ) : (
                "Sign In"
              )}
            </Button>

            <div className="text-center">
              <p className="text-sm text-[var(--text-secondary)]">
                Don't have an account?{" "}
                <Link
                  to="/register"
                  className="text-[var(--accent-primary)] hover:underline font-medium"
                >
                  Sign up
                </Link>
              </p>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Login;
