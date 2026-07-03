import { Button, CircularProgress, Stack, TextField } from "@mui/material";
import { Box } from "@mui/system";
import axios from "axios";
import React, { useState } from "react";
import { Link, useHistory } from "react-router-dom";
import { useSnackbar } from "notistack";
import { config } from "../App";
import Header from "./Header";
import Footer from "./Footer";
import "./Login.css";

const persistLogin = (data) => {
  localStorage.setItem("username", data.username);
  localStorage.setItem("token", data.token);
  localStorage.setItem("balance", data.balance);
};


const Login = () => {
  const { enqueueSnackbar } = useSnackbar();
  const history = useHistory();

  const [formData, setFormData] = useState({
    username: "",
    password: "",
  });

  const [loading, setLoading] = useState(false);

  // ---------------- VALIDATION ----------------
  const validateInput = (data) => {
    if (!data.username) {
      enqueueSnackbar("Username is a required field", { variant: "warning" });
      return false;
    }

    if (!data.password) {
      enqueueSnackbar("Password is a required field", { variant: "warning" });
      return false;
    }

    return true;
  };

  // ---------------- LOGIN API ----------------
  const login = async () => {
    if (!validateInput(formData)) {
      return; // ❌ Do not make API call
    }

    setLoading(true);

    try {
      const response = await axios.post(
        `${config.endpoint}/auth/login`,
        {
          username: formData.username,
          password: formData.password,
        }
      );

      if (response.status === 201) {
        enqueueSnackbar("Logged in successfully", { variant: "success" });

        // Persist login info
        localStorage.setItem("token", response.data.token);
        localStorage.setItem("username", response.data.username);
        localStorage.setItem("balance", response.data.balance);
        persistLogin(response.data);
        history.push("/");
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

  // ---------------- UI ----------------
  return (
    <Box
      display="flex"
      flexDirection="column"
      justifyContent="space-between"
      minHeight="100vh"
    >
      <Header hasHiddenAuthButtons />

      <Box className="content">
        <Stack spacing={2} className="form">
        <h2>Login</h2>
          <TextField
            label="username"
            name="username"
            value={formData.username}
            onChange={(e) =>
              setFormData({ ...formData, username: e.target.value })
            }
            fullWidth
          />

          <TextField
            label="password"
            type="password"
            name="password"
            value={formData.password}
            onChange={(e) =>
              setFormData({ ...formData, password: e.target.value })
            }
            fullWidth
          />

          <Button
            variant="contained"
            fullWidth
            onClick={login}
            disabled={loading}
          >
            {loading ? <CircularProgress size={24} /> : "LOGIN TO QKART"}
          </Button>

          <p className="register-text">
            Don’t have an account?{" "}
            <Link to="/register" className="register-link">
              Register now
            </Link>
          </p>
        </Stack>
      </Box>

      <Footer />
    </Box>
  );
};

export default Login;
