import { type MouseEvent, useState, useEffect } from "react";
import {
    IconButton,
    Badge,
    Popover,
    List,
    ListItemButton,
    ListItemText,
    Typography,
    Box,
} from "@mui/material";
import NotificationsNoneOutlinedIcon from "@mui/icons-material/NotificationsNoneOutlined";
import { useNotificationContext } from "~/context/NotificationContext";
import NotificationModal from "~/common/Notification/NotificationModal";
import { updateRecord } from "~/utils/apiUtils";

export default function NotificationBell() {
    const { notifications } = useNotificationContext();
    const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
    const [selectedNotification, setSelectedNotification] = useState<any | null>(null);
    const [localNotifications, setLocalNotifications] = useState(
        [...notifications].sort((a, b) => a.entregado - b.entregado)
    );

    // Sincronizar localNotifications con notifications del contexto
    useEffect(() => {
        setLocalNotifications([...notifications].sort((a, b) => a.entregado - b.entregado));
    }, [notifications]);

    const hasUnread = localNotifications.some((n) => n.entregado === 0);

    const handleOpen = (event: MouseEvent<HTMLElement>) => {
        setAnchorEl(event.currentTarget);
    };

    const handleClose = () => {
        setAnchorEl(null);
    };

    const markAsRead = async (notification: any) => {
        if (notification.entregado === 1) return;

        const response = await updateRecord({
            endpoint: `/notificaciones/${notification.id_Notificacion}/entregada`,
            data: {},
        });

        if (response.statusCode === 200) {
            setLocalNotifications((prev) => {
                const updated = prev.map((n) =>
                    n.id_Notificacion === notification.id_Notificacion
                        ? { ...n, entregado: 1 }
                        : n
                );
                return updated.sort((a, b) => a.entregado - b.entregado);
            });
        }
    };

    const handleNotificationClick = (notification: any) => {
        setSelectedNotification(notification);
        markAsRead(notification);
    };

    const truncateContent = (text: string, wordLimit = 8) => {
        if (!text) return "Sin detalles";
        const words = text.split(" ");
        if (words.length <= wordLimit) return text;
        return words.slice(0, wordLimit).join(" ") + "...";
    };

    const formatDate = (dateStr?: string) => {
        if (!dateStr) return "";
        const date = new Date(dateStr);
        return date.toLocaleString("es-MX", {
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
            hour12: true,
        });
    };

    const open = Boolean(anchorEl);

    return (
        <>
            <IconButton
                onClick={handleOpen}
                sx={{
                    backgroundColor: "#fff",
                    boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
                    borderRadius: "50%",
                    width: 40,
                    height: 40,
                    "&:hover": {
                        backgroundColor: "#f3f4f6",
                    },
                }}
            >
                <Badge
                    color="primary"
                    variant={hasUnread ? "dot" : "standard"}
                    overlap="circular"
                    sx={{
                        "& .MuiBadge-dot": {
                            top: "6px",
                            right: "6px",
                            backgroundColor: "rgba(51, 23, 156, 0.9)",
                        },
                    }}
                >
                    <NotificationsNoneOutlinedIcon sx={{ color: "#374151" }} />
                </Badge>
            </IconButton>

            <Popover
                open={open}
                anchorEl={anchorEl}
                onClose={handleClose}
                anchorOrigin={{
                    vertical: "bottom",
                    horizontal: "right",
                }}
                transformOrigin={{
                    vertical: "top",
                    horizontal: "right",
                }}
                PaperProps={{
                    sx: {
                        width: 320,
                        borderRadius: "12px",
                        boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                        mt: 1,
                        maxHeight: 400,
                        overflowY: "auto",
                        scrollbarWidth: "thin",
                    },
                }}
            >
                <Box sx={{ p: 1.5 }}>
                    <Typography
                        sx={{
                            fontFamily: "madaniArabicMedium",
                            fontSize: "1rem",
                            color: "#1e1e2f",
                            mb: 1,
                        }}
                    >
                        Notificaciones
                    </Typography>

                    {localNotifications.length > 0 ? (
                        <List disablePadding>
                            {localNotifications.map((notification, index) => (
                                <ListItemButton
                                    key={index}
                                    onClick={() => handleNotificationClick(notification)}
                                    sx={{
                                        borderRadius: "8px",
                                        mb: 0.5,
                                        backgroundColor:
                                            notification.entregado === 0 ? "#f9fafb" : "#f3f4f6",
                                        opacity: notification.entregado === 0 ? 1 : 0.6,
                                        transition: "all 0.2s ease",
                                        "&:hover": {
                                            backgroundColor:
                                                notification.entregado === 0
                                                    ? "#eef2ff"
                                                    : "#f3f4f6",
                                        },
                                    }}
                                >
                                    <ListItemText
                                        primary={
                                            <Typography
                                                sx={{
                                                    fontFamily: "madaniArabicRegular",
                                                    fontSize: "0.95rem",
                                                    color: "#1e1e2f",
                                                }}
                                            >
                                                {notification.titulo || "Nueva notificación"}
                                            </Typography>
                                        }
                                        secondary={
                                            <Typography
                                                sx={{
                                                    fontFamily: "madaniArabicRegular",
                                                    fontSize: "0.75rem",
                                                    color: "#9ca3af",
                                                    mt: 0.5,
                                                }}
                                            >
                                                {formatDate(notification.fecha_Creacion)}
                                            </Typography>
                                        }
                                    />
                                </ListItemButton>
                            ))}
                        </List>
                    ) : (
                        <Typography
                            sx={{
                                fontFamily: "madaniArabicRegular",
                                fontSize: "0.9rem",
                                color: "#6b7280",
                                textAlign: "center",
                                py: 2,
                            }}
                        >
                            No tienes notificaciones.
                        </Typography>
                    )}
                </Box>
            </Popover>

            <NotificationModal
                open={Boolean(selectedNotification)}
                notification={selectedNotification}
                onClose={() => setSelectedNotification(null)}
                formatDate={formatDate}
            />
        </>
    );
}
