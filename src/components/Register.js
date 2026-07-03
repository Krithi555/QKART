import { Button, CircularProgress, Stack, TextField } from "@mui/material";
import { Box } from "@mui/system";
import axios from "axios";
import { useSnackbar } from "notistack";
import React, { useState } from "react";
import { useHistory, Link } from "react-router-dom";
import { config } from "../App";
import Footer from "./Footer";
import Header from "./Header";
import "./Register.css";

const Register = () => {
  const { enqueueSnackbar } = useSnackbar();
  const history = useHistory();

  // ✅ REQUIRED STATE
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    username: "",
    password: "",
    confirmPassword: "",
  });

  // ---------------- VALIDATION ----------------
  const validateInput = (data) => {
    if (!data.username) {
      enqueueSnackbar("Username is a required field", { variant: "warning" });
      return false;
    }
    if (data.username.length < 6) {
      enqueueSnackbar("Username must be at least 6 characters", {
        variant: "warning",
      });
      return false;
    }
    if (!data.password) {
      enqueueSnackbar("Password is a required field", { variant: "warning" });
      return false;
    }
    if (data.password.length < 6) {
      enqueueSnackbar("Password must be at least 6 characters", {
        variant: "warning",
      });
      return false;
    }
    if (data.password !== data.confirmPassword) {
      enqueueSnackbar("Passwords do not match", { variant: "warning" });
      return false;
    }
    return true;
  };

  // ---------------- REGISTER API ----------------
  const register = async () => {
    if (!validateInput(formData)) return;

    setLoading(true);
    try {
      const response = await axios.post(
        `${config.endpoint}/auth/register`,
        {
          username: formData.username,
          password: formData.password,
        }
      );

      if (response.status === 201) {
        enqueueSnackbar("Registered successfully", { variant: "success" });
        history.push("/login"); // ✅ redirect
      }
    } catch (error) {
      if (error.response && error.response.status === 400) {
        enqueueSnackbar(error.response.data.message, { variant: "error" });
      } else {
        enqueueSnackbar(
          "Something went wrong. Check that the backend is running, reachable and returns valid JSON.",
          { variant: "error" }
        );
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box display="flex" flexDirection="column" minHeight="100vh">
      <Header hasHiddenAuthButtons />

      <Box className="content">
        <Stack spacing={2} className="form">
          <h2 className="title">Register</h2>

          <TextField
            label="Username"
            name="username"
            value={formData.username}
            onChange={(e) =>
              setFormData({ ...formData, username: e.target.value })
            }
            fullWidth
          />

          <TextField
            label="Password"
            type="password"
            name="password"
            value={formData.password}
            onChange={(e) =>
              setFormData({ ...formData, password: e.target.value })
            }
            helperText="Password must be atleast 6 characters length"
            fullWidth
          />

          <TextField
            label="Confirm Password"
            type="password"
            name="confirmPassword"
            value={formData.confirmPassword}
            onChange={(e) =>
              setFormData({ ...formData, confirmPassword: e.target.value })
            }
            fullWidth
          />

          <Button
            variant="contained"
            fullWidth
            onClick={register}
            disabled={loading}
          >
            {loading ? <CircularProgress size={24} /> : "REGISTER"}
          </Button>

          <p className="secondary-action">
            Already have an account?{" "}
            <Link to="/login">Login</Link>
          </p>
        </Stack>
      </Box>

      <Footer />
    </Box>
  );
};

export default Register;
