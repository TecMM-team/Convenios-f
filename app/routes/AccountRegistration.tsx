import { Button, Typography } from "@mui/material";
import { useNavigate } from "react-router";
import RegisterAccounts from "~/components/Accounts/RegisterAccounts";

export default function AccountRegistration() {
  const navigate = useNavigate();

  return (
    <div>
      <Typography
        sx={{
          fontFamily: "madaniArabicMedium",
          fontSize: "2rem",
          color: "#1e1e2f",
          mb: 2,
        }}
      >
        Alta de Cuenta
      </Typography>

      <Typography
        sx={{
          fontFamily: "madaniArabicRegular",
          fontSize: "1.1rem",
          mb: 3,
          color: "#1e1e2f",
        }}
      >
        Ingresa los datos para crear una cuenta
      </Typography>
      <RegisterAccounts />
    </div>
  );
}
