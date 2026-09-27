import { Card, CardContent, Stack, Typography } from "@mui/material";
import type { ReactNode } from "react";

interface SectionCardProps {
    title: string;
    subtitle?: string;
    action?: ReactNode;
    children: ReactNode;
}

function SectionCard({ title, subtitle, action, children }: SectionCardProps) {

    return (
        <Card sx={{ height: "100%" }}>
            <CardContent sx={{ display: "flex", flexDirection: "column", gap: 2, height: "100%" }}>
                <Stack direction="row" sx={{ alignItems: "flex-start", justifyContent: "space-between", gap: 2 }}>
                    <Stack spacing={0.25}>
                        <Typography variant="h6">{title}</Typography>
                        {subtitle && (
                            <Typography variant="body2" color="text.secondary">
                                {subtitle}
                            </Typography>
                        )}
                    </Stack>
                    {action}
                </Stack>

                {children}
            </CardContent>
        </Card>
    );

}

export default SectionCard;
