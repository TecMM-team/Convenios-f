import { useState, useEffect, useMemo, useCallback, type ReactNode } from "react";
import { useNavigate } from "react-router";
import getToken from "../utils/getToken";
import SnackAlert from "../common/SnackAlert/SnackAlert";
import { AuthContext, type User, type Noti } from "./AuthContext";

interface AuthProviderProps {
  children: ReactNode;
}

export default function AuthProvider({ children }: AuthProviderProps) {
  const navigate = useNavigate();

  const [user, setUser] = useState<User | null>(null);
  const [noti, setNoti] = useState<Noti | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [initializing, setInitializing] = useState(true);

  const isAuthenticated = useCallback(() => !!user, [user]);

  const logout = useCallback(() => {
    localStorage.removeItem("authToken");
    setUser(null);
    navigate("/");
  }, [navigate]);

  const login = useCallback(
    (userData: User) => {
      setUser(userData);
      localStorage.setItem("authToken", userData.token);
      navigate("/convenios");
    },
    [navigate]
  );

  useEffect(() => {
    const checkSession = async () => {
      try {
        const storedUser = getToken();
        const currentPath = window.location.pathname;

        if (storedUser) {
          setUser({
            id_Cuenta: storedUser.id_Cuenta,
            rol: storedUser.rol,
            id_Unidad_Academica: storedUser.id_Unidad_Academica,
            nombre: storedUser.nombre,
            correo: storedUser.correo,
            token: storedUser.token,
          });

          if (currentPath === "/") {
            navigate("/convenios", { replace: true });
          }
        } else {
          if (currentPath !== "/") {
            navigate("/", { replace: true });
          }
        }
      } finally {
        setInitializing(false);
      }
    };

    checkSession();
  }, [navigate]);

  const providerValue = useMemo(
    () => ({
      user,
      setUser,
      noti,
      setNoti,
      loading,
      setLoading,
      isAuthenticated,
      logout,
      login,
    }),
    [user, noti, loading, isAuthenticated, logout, login]
  );

  if (initializing) {
    return null;
  }

  return (
    <AuthContext.Provider value={providerValue}>
      {children}
      {noti && (
        <SnackAlert
          open={noti.open}
          close={() => setNoti(null)}
          type={noti.type}
          mensaje={noti.message}
        />
      )}
    </AuthContext.Provider>
  );
}
