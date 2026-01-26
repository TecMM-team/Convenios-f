import { useState, type ChangeEvent } from "react";
import { Box, TextField, InputAdornment } from "@mui/material";
import SearchIcon from "@mui/icons-material/SearchOutlined";
import "./styles/AccountsSearchBar.css";

interface AccountsSearchBarProps {
  onSearch: (value: string) => void;
}

export default function AccountsSearchBar({ onSearch }: AccountsSearchBarProps) {
  const [query, setQuery] = useState("");

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setQuery(value);
    onSearch(value);
  };

  return (
    <Box className="accounts-search-bar">
      <TextField
        fullWidth
        placeholder="Buscar usuario por nombre, correo, rol o unidad"
        variant="outlined"
        value={query}
        onChange={handleChange}
        slotProps={{
          input: {
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon sx={{ color: "#9ca3af" }} />
              </InputAdornment>
            ),
            sx: {
              fontFamily: "madaniArabicRegular",
              borderRadius: "10px",
              backgroundColor: "#fff",
              transition: "border-color 0.2s ease-in-out",
              "& .MuiOutlinedInput-notchedOutline": {
                borderColor: "#e5e7eb",
              },
              "&:hover .MuiOutlinedInput-notchedOutline": {
                borderColor: "#e5e7eb",
              },
              "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                borderColor: "rgb(51, 23, 156)",
                borderWidth: "2px",
              },
            },
          },
          htmlInput: {
            style: {
              fontFamily: "madaniArabicRegular",
              fontSize: "1rem",
              color: "#1e1e2f",
            },
          },
        }}
      />
    </Box>
  );
}
