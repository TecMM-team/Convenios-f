import { Modal, Fade, Backdrop, Box, Typography } from "@mui/material";

interface NotificationModalProps {
    open: boolean;
    notification: any | null;
    onClose: () => void;
    formatDate: (dateStr?: string) => string;
}

export default function NotificationModal({
    open,
    notification,
    onClose,
    formatDate,
}: NotificationModalProps) {
    return (
        <Modal
            open={open}
            onClose={onClose}
            closeAfterTransition
            slots={{ backdrop: Backdrop }}
            slotProps={{ backdrop: { timeout: 300 } }}
        >
            <Fade in={open}>
                <Box
                    sx={{
                        position: "absolute" as const,
                        top: "50%",
                        left: "50%",
                        transform: "translate(-50%, -50%)",
                        width: 420,
                        bgcolor: "#fff",
                        boxShadow: 24,
                        borderRadius: "12px",
                        p: 3,
                        outline: "none",
                    }}
                >
                    <Typography
                        sx={{
                            fontFamily: "madaniArabicMedium",
                            fontSize: "1.2rem",
                            color: "#1e1e2f",
                            mb: 1,
                        }}
                    >
                        {notification?.titulo}
                    </Typography>

                    <Typography
                        sx={{
                            fontFamily: "madaniArabicRegular",
                            fontSize: "1rem",
                            color: "#4b5563",
                        }}
                    >
                        {notification?.contenido}
                    </Typography>

                    <Typography
                        sx={{
                            fontFamily: "madaniArabicRegular",
                            fontSize: "0.85rem",
                            color: "#9ca3af",
                            mt: 2,
                        }}
                    >
                        {formatDate(notification?.fecha_Creacion)}
                    </Typography>
                </Box>
            </Fade>
        </Modal>
    );
}
