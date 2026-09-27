import type { ReactNode } from "react";

import { Alert, Box, Button, Paper, Typography } from "@mui/material";
import FolderOffRoundedIcon from "@mui/icons-material/FolderOffRounded";

interface ViewStateProps {
    title: string;
    description: string;
    actionLabel?: string;
    onAction?: () => void;
    icon?: ReactNode;
}

function ViewState({
    title,
    description,
    actionLabel,
    onAction,
    icon
}: ViewStateProps) {

    return (
        <Box sx={{ display: "grid", placeItems: "center", py: 10, px: 3 }}>
            <Paper
                variant="outlined"
                sx={{
                    maxWidth: 520,
                    width: "100%",
                    p: 4,
                    textAlign: "center",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    gap: 1.5
                }}
            >
                <Box sx={{ color: "text.disabled" }}>
                    {icon ?? <FolderOffRoundedIcon sx={{ fontSize: 44 }} />}
                </Box>

                <Typography variant="h6">{title}</Typography>
                <Typography variant="body2" color="text.secondary">
                    {description}
                </Typography>

                {actionLabel && onAction && (
                    <Button variant="contained" onClick={onAction} sx={{ mt: 1 }}>
                        {actionLabel}
                    </Button>
                )}
            </Paper>
        </Box>
    );

}

interface ViewErrorProps {
    message: string;
    onRetry?: () => void;
}

function ViewError({ message, onRetry }: ViewErrorProps) {

    return (
        <Box sx={{ py: 4 }}>
            <Alert
                severity="error"
                action={onRetry ? (
                    <Button color="inherit" size="small" onClick={onRetry}>
                        Erneut versuchen
                    </Button>
                ) : undefined}
            >
                {message}
            </Alert>
        </Box>
    );

}

export { ViewError };
export default ViewState;
