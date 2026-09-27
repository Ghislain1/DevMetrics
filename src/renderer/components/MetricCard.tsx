import { Box, Card, CardContent, LinearProgress, Stack, Tooltip, Typography } from "@mui/material";
import TrendingDownRoundedIcon from "@mui/icons-material/TrendingDownRounded";
import TrendingUpRoundedIcon from "@mui/icons-material/TrendingUpRounded";

import { formatDelta, formatMetricValue } from "../metrics/format";
import { statusPalette } from "../metrics/status";
import type { NormalizedMetric } from "../metrics/types";
import StatusChip from "./StatusChip";

interface MetricCardProps {
    metric: NormalizedMetric;
    /** Bei "count" ist ein fallender Wert gut, das Icon wird dann umgefärbt. */
    lowerIsBetter?: boolean;
}

function MetricCard({ metric, lowerIsBetter = false }: MetricCardProps) {

    const { color } = statusPalette(metric.status);
    const progress = metric.threshold && metric.threshold.critical !== 0
        ? Math.min(100, Math.max(0, (metric.value / metric.threshold.critical) * 100))
        : null;

    const improving = metric.delta
        ? lowerIsBetter
            ? metric.delta.absolute < 0
            : metric.delta.absolute > 0
        : null;

    return (
        <Card sx={{ height: "100%", display: "flex", flexDirection: "column" }}>
            <CardContent sx={{ flexGrow: 1, display: "flex", flexDirection: "column", gap: 1.5 }}>
                <Stack direction="row" sx={{ alignItems: "flex-start", justifyContent: "space-between", gap: 1 }}>
                    <Typography variant="subtitle2" color="text.secondary">
                        {metric.label}
                    </Typography>
                    <StatusChip status={metric.status} />
                </Stack>

                <Typography variant="h4" sx={{ fontVariantNumeric: "tabular-nums" }}>
                    {formatMetricValue(metric.value, metric.unit)}
                </Typography>

                {metric.delta && improving !== null && (
                    <Stack
                        direction="row"
                        sx={{ alignItems: "center", gap: 0.5, color: improving ? "success.main" : "error.main" }}
                    >
                        {metric.delta.absolute >= 0
                            ? <TrendingUpRoundedIcon fontSize="inherit" />
                            : <TrendingDownRoundedIcon fontSize="inherit" />}
                        <Typography variant="caption" sx={{ fontWeight: 600 }}>
                            {formatDelta(metric.delta, metric.unit)}
                        </Typography>
                    </Stack>
                )}

                {progress !== null && (
                    <Box sx={{ mt: "auto", pt: 1 }}>
                        <Tooltip title={`Ampel: ${statusPalette(metric.status).label} · Grenzen ${metric.threshold?.warn} / ${metric.threshold?.critical}`}>
                            <LinearProgress
                                variant="determinate"
                                value={progress}
                                color={color}
                                sx={{ height: 6, borderRadius: 3 }}
                            />
                        </Tooltip>
                    </Box>
                )}

                {metric.hint && (
                    <Typography variant="caption" color="text.disabled">
                        {metric.hint}
                    </Typography>
                )}
            </CardContent>
        </Card>
    );

}

export default MetricCard;
