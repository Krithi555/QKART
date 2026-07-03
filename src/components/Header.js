import React from "react";
import { AppBar, Toolbar, Button, Box, Avatar } from "@mui/material";
import { useHistory } from "react-router-dom";

const Header = ({ hasHiddenAuthButtons, children }) => {
  const history = useHistory();
  const username = localStorage.getItem("username");
  const token = localStorage.getItem("token");

  const handleLogout = () => {
    localStorage.clear();
    history.push("/");
  };

  return (
    <AppBar position="static">
      <Toolbar>

        {/* Left - Logo */}
        <Box sx={{ flexGrow: 1 }}>
          <Button color="inherit" onClick={() => history.push("/")}>
            QKart
          </Button>
        </Box>

        {/* ✅ SEARCH BAR COMES HERE ONLY FOR PRODUCTS PAGE */}
        {children}

        {hasHiddenAuthButtons ? (
          <Button color="inherit" onClick={() => history.push("/")}>
            ← BACK TO EXPLORE
          </Button>
        ) : (
          <>
            {!token ? (
              <>
                <Button color="inherit" onClick={() => history.push("/login")}>
                  LOGIN
                </Button>

                <Button
                  variant="contained"
                  onClick={() => history.push("/register")}
                >
                  REGISTER
                </Button>
              </>
            ) : (
              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                <Avatar
                  alt={username}
                  src="/avatar.png"
                  sx={{ width: 32, height: 32 }}
                />

                <Button color="inherit" disabled>
                  {username}
                </Button>

                <Button color="inherit" onClick={handleLogout}>
                  LOGOUT
                </Button>
              </Box>
            )}
          </>
        )}
      </Toolbar>
    </AppBar>
  );
};

export default Header;
