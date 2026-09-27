import { useId } from "react";

import { Box, useTheme } from "@mui/material";

interface SparklineProps {
    values: number[];
    /** Bei "weniger ist besser" wird die Fläche eingefärbt, wenn der Trend fällt. */
    lowerIsBetter?: boolean;
    height?: number;
}

function Sparkline({ values, lowerIsBetter = false, height = 120 }: SparklineProps) {

    const theme = useTheme();
    const gradientId = useId();

    if (values.length < 2) {
        return <Box sx={{ height }} />;
    }

    const min = Math.min(...values);
    const max = Math.max(...values);
    const span = max - min || 1;
    const width = 100;

    const points = values.map((value, index) => {
        const x = (index / (values.length - 1)) * width;
        const y = height - ((value - min) / span) * (height - 8) - 4;
        return [x, y] as const;
    });

    const line = points.map(([x, y]) => `${x.toFixed(2)},${y.toFixed(2)}`).join(" ");
    const area = `0,${height} ${line} ${width},${height}`;

    const first = values[0] ?? 0;
    const last = values[values.length - 1] ?? 0;
    const improving = lowerIsBetter ? last < first : last > first;
    const stroke = improving ? theme.palette.success.main : theme.palette.error.main;

    return (
        <Box component="svg"
            viewBox={`0 0 ${width} ${height}`}
            preserveAspectRatio="none"
            role="img"
            aria-label="Zeitreihe"
            sx={{ width: "100%", height, display: "block" }}
        >
            <defs>
                <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={stroke} stopOpacity={0.35} />
                    <stop offset="100%" stopColor={stroke} stopOpacity={0} />
                </linearGradient>
            </defs>

            <polygon points={area} fill={`url(#${gradientId})`} />
            <polyline
                points={line}
                fill="none"
                stroke={stroke}
                strokeWidth={1.5}
                vectorEffect="non-scaling-stroke"
                strokeLinejoin="round"
            />
        </Box>
    );

}

export default Sparkline;
