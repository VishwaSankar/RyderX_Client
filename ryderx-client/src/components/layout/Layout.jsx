import { Outlet, useLocation, useNavigate } from "react-router-dom";
import ResponsiveAppBar from "./ResponsiveAppBar";
import { Box, Button } from "@mui/material";
import { getAuthData } from "../../utils/tokenHelper";

const Layout = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const authData = getAuthData();

  const isAdmin = authData?.roles?.includes("Admin");
  const isAgent = authData?.roles?.includes("Agent");

  const inAdminSection = location.pathname.toLowerCase().includes("/admin");
  const inAgentSection = location.pathname.toLowerCase().includes("/agent");
  const hidePublicNavbar = (isAdmin && inAdminSection) || (isAgent && inAgentSection);
  const dashboardType = isAdmin && inAdminSection ? "Admin" : isAgent && inAgentSection ? "Agent" : null;

  return (
    <Box>
      {!hidePublicNavbar && <ResponsiveAppBar />}

      <Box p={hidePublicNavbar ? 0 : 3}>
        {hidePublicNavbar && (
          <Box
            sx={{
              display: "flex",
              justifyContent: "flex-end",
              p: 2,
              backgroundColor: "#1a1a1a",
              borderBottom: "1px solid rgba(255,255,255,0.1)",
            }}
          >
            <Button
              variant="outlined"
              color="secondary"
              onClick={() => navigate("/")}
              sx={{
                color: "#fff",
                borderColor: "#d81b60",
                "&:hover": { borderColor: "#ff4081", backgroundColor: "rgba(216,27,96,0.1)" },
              }}
            >
              🌐 View Public Site
            </Button>
          </Box>
        )}
        <Outlet />
      </Box>
    </Box>
  );
};

export default Layout;
