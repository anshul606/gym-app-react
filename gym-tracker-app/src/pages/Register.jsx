import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../hooks/useAuth.js";
import { isValidEmail, validatePassword } from "../utils/validators.js";
import Input from "../components/common/Input.jsx";
import Button from "../components/common/Button.jsx";
import LoadingSpinner from "../components/common/LoadingSpinner.jsx";

const Register = () => {
  const navigate = useNavigate();
  const { register, isLoading } = useAuth();

  const [formData, setFormData] = useState({
    displayName: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const [errors, setErrors] = useState({
    displayName: "",
    email: "",
    password: "",
    confirmPassword: "",
    general: "",
  });

  const [touched, setTouched] = useState({
    displayName: false,
    email: false,
    password: false,
    confirmPassword: false,
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
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
      case "displayName":
        if (!value || value.trim().length === 0) {
          error = "Display name is required";
        } else if (value.trim().length < 2) {
          error = "Display name must be at least 2 characters";
        }
        break;
      case "email":
        if (!value) {
          error = "Email is required";
        } else if (!isValidEmail(value)) {
          error = "Please enter a valid email address";
        }
        break;
      case "password": {
        const validation = validatePassword(value);
        if (!validation.isValid) {
          error = validation.message;
        }
        break;
      }
      case "confirmPassword":
        if (!value) {
          error = "Please confirm your password";
        } else if (value !== formData.password) {
          error = "Passwords do not match";
        }
        break;
      default:
        break;
    }

    setErrors((prev) => ({ ...prev, [name]: error }));
    return error === "";
  };

  const validateForm = () => {
    const displayNameValid = validateField("displayName", formData.displayName);
    const emailValid = validateField("email", formData.email);
    const passwordValid = validateField("password", formData.password);
    const confirmPasswordValid = validateField(
      "confirmPassword",
      formData.confirmPassword
    );

    setTouched({
      displayName: true,
      email: true,
      password: true,
      confirmPassword: true,
    });

    return (
      displayNameValid && emailValid && passwordValid && confirmPasswordValid
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors((prev) => ({ ...prev, general: "" }));

    if (!validateForm()) {
      return;
    }

    try {
      await register(
        formData.email,
        formData.password,
        formData.displayName.trim()
      );
      navigate("/dashboard");
    } catch (error) {
      setErrors((prev) => ({
        ...prev,
        general: error.message || "Failed to create account. Please try again.",
      }));
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[var(--bg-primary)] px-4 py-8 safe-area-bottom container-safe">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-[var(--text-primary)] mb-2">
            Create Account
          </h1>
          <p className="text-[var(--text-secondary)]">
            Start tracking your fitness journey today
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
              label="Display Name"
              type="text"
              name="displayName"
              value={formData.displayName}
              onChange={handleChange}
              onBlur={handleBlur}
              placeholder="John Doe"
              error={touched.displayName ? errors.displayName : ""}
              required
              disabled={isLoading}
              className="mb-4"
            />

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
              placeholder="At least 6 characters"
              error={touched.password ? errors.password : ""}
              required
              disabled={isLoading}
              className="mb-4"
            />

            <Input
              label="Confirm Password"
              type="password"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              onBlur={handleBlur}
              placeholder="Re-enter your password"
              error={touched.confirmPassword ? errors.confirmPassword : ""}
              required
              disabled={isLoading}
              className="mb-6"
            />

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
                  <span className="ml-2">Creating account...</span>
                </span>
              ) : (
                "Create Account"
              )}
            </Button>

            <div className="text-center">
              <p className="text-sm text-[var(--text-secondary)]">
                Already have an account?{" "}
                <Link
                  to="/login"
                  className="text-[var(--accent-primary)] hover:underline font-medium"
                >
                  Sign in
                </Link>
              </p>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Register;
