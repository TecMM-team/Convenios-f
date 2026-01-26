import { createContext, useContext } from "react";

export interface User {
  id_Cuenta: number;
  rol: string;
  id_Unidad_Academica: number;
  nombre: string;
  correo: string;
  token: string;
}

export interface Noti {
  open: boolean;
  type: "error" | "warning" | "info" | "success";
  message: string;
}

export interface AuthContextProps {
  user: User | null;
  setUser: (user: User | null) => void;
  noti: Noti | null;
  setNoti: (noti: Noti | null) => void;
  loading: boolean;
  setLoading: (loading: boolean) => void;
  isAuthenticated: () => boolean;
  logout: () => void;
  login: (userData: User) => void;
}

export const AuthContext = createContext<AuthContextProps | undefined>(undefined);

export const useAuthContext = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuthContext debe usarse dentro de un AuthProvider");
  }
  return context;
};
