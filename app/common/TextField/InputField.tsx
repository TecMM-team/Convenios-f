import { type ReactNode, useState } from "react";
import {
  TextField,
  IconButton,
  InputAdornment,
  type SxProps,
  type Theme,
} from "@mui/material";
import Visibility from "@mui/icons-material/Visibility";
import VisibilityOff from "@mui/icons-material/VisibilityOff";

interface InputFieldProps {
  text: string;
  type?: string;
  size?: string;
  showToggle?: boolean;
  endIcon?: ReactNode;
  onIconClick?: () => void;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  value?: string;
}

export default function InputField({
  text,
  type = "text",
  size = "30dvw",
  showToggle = false,
  endIcon,
  onIconClick,
  onChange,
  value,
}: InputFieldProps) {
  const [showPassword, setShowPassword] = useState(false);
  const handleTogglePassword = () => setShowPassword((prev) => !prev);

  return (
    <TextField
      fullWidth
      variant="outlined"
      label={text}
      onChange={onChange}
      value={value}
      type={showToggle ? (showPassword ? "text" : "password") : type}
      sx={{
        width: "100%",
        maxWidth: size,
        borderRadius: "1dvh",
        backgroundColor: "transparent",
        transition: "all 0.2s ease",
        "& .MuiOutlinedInput-root": {
          borderRadius: "1dvh",
          "& fieldset": {
            borderColor: "#ccc",
            transition: "border-color 0.25s ease, box-shadow 0.25s ease",
          },
          "&:hover fieldset": { borderColor: "#999" },
          "&.Mui-focused fieldset": {
            borderColor: "rgb(50, 22, 155)",
            boxShadow: "0 0 0.4dvh rgb(50, 22, 155, 0.7)",
          },
        },
        "& .MuiInputLabel-root": {
          color: "#666",
          fontSize: "1.6dvh",
          paddingLeft: "0.2rem",
          lineHeight: 1.2,
          transformOrigin: "top left",
          transition:
            "all 0.22s cubic-bezier(0.4, 0, 0.2, 1), color 0.2s ease",
        },
        "& .MuiInputLabel-root.Mui-focused": {
          color: "rgb(50, 22, 155)",
        },
        "& input": {
          color: "#333",
          padding: "1.5dvh 1.5dvw",
          lineHeight: 1.5,
        },
        "@media (min-width: 768px)": {
          maxWidth: size,
        },
      }}
      slotProps={{
        input: {
          endAdornment: (
            <InputAdornment position="end">
              {showToggle ? (
                <IconButton onClick={handleTogglePassword} edge="end">
                  {showPassword ? <VisibilityOff /> : <Visibility />}
                </IconButton>
              ) : endIcon ? (
                <IconButton onClick={onIconClick} edge="end">
                  {endIcon}
                </IconButton>
              ) : null}
            </InputAdornment>
          ),
        },
      }}
    />
  );
}
