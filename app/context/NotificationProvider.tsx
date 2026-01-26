import { type ReactNode, useEffect, useState } from "react";
import { io, Socket } from "socket.io-client";
import { NotificationContext } from "./NotificationContext";
import { getData } from "~/utils/apiUtils";
import { useAuthContext } from "./AuthContext";

interface Props {
    children: ReactNode;
}

export default function NotificationProvider({ children }: Props) {
    const [socket, setSocket] = useState<Socket | null>(null);
    const [notifications, setNotifications] = useState<any[]>([]);
    const { user } = useAuthContext();
    const url = import.meta.env.VITE_PUBLIC_URL;

    const addNotification = (notification: any) => {
        setNotifications((prev) => {
            const exists = prev.some(
                (n) => n.id_Notificacion === notification.id_Notificacion
            );
            return exists ? prev : [notification, ...prev];
        });
    };

    const clearNotifications = () => setNotifications([]);

    const getNotifications = async () => {
        if (!user?.id_Cuenta) return;

        try {
            const { statusCode, data } = await getData({
                endpoint: `/notificaciones/usuario/${user.id_Cuenta}`,
            });

            if (statusCode === 200 && Array.isArray(data.data)) {
                setNotifications(data.data);
            }
        } catch (error) {
            console.error("Error al obtener notificaciones:", error);
        }
    };

    useEffect(() => {
        if (!user?.id_Cuenta) {
            // Si no hay usuario, limpiar notificaciones y salir
            setNotifications([]);
            if (socket) {
                socket.disconnect();
                setSocket(null);
            }
            return;
        }

        // Limpiar notificaciones anteriores al cambiar de usuario
        setNotifications([]);

        // Cargar notificaciones del nuevo usuario
        const loadNotifications = async () => {
            await getNotifications();
        };
        loadNotifications();

        const newSocket = io(url, { transports: ["websocket"] });
        setSocket(newSocket);

        newSocket.on("connect", () => {
            newSocket.emit("join", `cuenta_${user?.id_Cuenta}`);
        });

        newSocket.on("disconnect", () => {});

        newSocket.on("nueva_notificacion", (data) => {
            addNotification(data);
        });

        const interval = setInterval(getNotifications, 5000);

        return () => {
            clearInterval(interval);
            newSocket.disconnect();
        };
    }, [user?.id_Cuenta]);

    return (
        <NotificationContext.Provider
            value={{
                socket,
                notifications,
                addNotification,
                clearNotifications,
            }}
        >
            {children}
        </NotificationContext.Provider>
    );
}
