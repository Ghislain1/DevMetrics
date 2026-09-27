import { Box, Grid, LinearProgress, Stack, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Typography } from "@mui/material";

import MetricCard from "../components/MetricCard";
import SectionCard from "../components/SectionCard";
import { formatMetricValue } from "../metrics/format";
import { complexityHotspots, complexityMetrics } from "../metrics/sample";
import { statusPalette } from "../metrics/status";

const HOTSPOT_LIMIT = 20;

function ComplexityView() {

    const worst = Math.max(...complexityHotspots.map((entry) => entry.value), 1);

    return (
        <Stack spacing={3}>
            <Grid container spacing={2.5}>
                {complexityMetrics.map((metric) => (
                    <Grid key={metric.key} size={{ xs: 12, sm: 6, lg: 3 }}>
                        <MetricCard metric={metric} lowerIsBetter={metric.key !== "complexity.loc"} />
                    </Grid>
                ))}
            </Grid>

            <SectionCard
                title="Hotspots"
                subtitle="Komplexste Funktionen, absteigend nach Score"
            >
                <Stack spacing={1.5}>
                    {complexityHotspots.map((entry) => {
                        const share = (entry.value / worst) * 100;
                        const overLimit = entry.value > HOTSPOT_LIMIT;
                        const { color } = statusPalette(overLimit ? "warn" : "ok");

                        return (
                            <Box key={entry.name}>
                                <Stack
                                    direction="row"
                                    sx={{ alignItems: "baseline", justifyContent: "space-between", gap: 2, mb: 0.5 }}
                                >
                                    <Typography variant="body2" sx={{ fontWeight: 600 }}>
                                        {entry.name}
                                    </Typography>
                                    <Typography
                                        variant="body2"
                                        sx={{ fontVariantNumeric: "tabular-nums", fontWeight: 700, color: `${color}.main` }}
                                    >
                                        {formatMetricValue(entry.value, entry.unit)}
                                    </Typography>
                                </Stack>

                                <LinearProgress
                                    variant="determinate"
                                    value={share}
                                    color={color}
                                    sx={{ height: 8, borderRadius: 4, mb: 0.5 }}
                                />

                                <Typography variant="caption" color="text.disabled">
                                    {entry.file}
                                </Typography>
                            </Box>
                        );
                    })}
                </Stack>
            </SectionCard>

            <SectionCard title="Verteilung nach Modul" subtitle="Mittlere Komplexität je Package">
                <TableContainer>
                    <Table size="small">
                        <TableHead>
                            <TableRow>
                                <TableCell>Modul</TableCell>
                                <TableCell align="right">Dateien</TableCell>
                                <TableCell align="right">LOC</TableCell>
                                <TableCell align="right">Cyclomatic Ø</TableCell>
                                <TableCell align="right">Cognitive Ø</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {[
                                { module: "src/main/aggregator", files: 14, loc: 3120, cyclo: 6.4, cognitive: 8.1 },
                                { module: "src/main/provider", files: 9, loc: 2480, cyclo: 5.1, cognitive: 6.8 },
                                { module: "src/main/ipc", files: 11, loc: 1840, cyclo: 3.2, cognitive: 4.4 },
                                { module: "src/renderer/views", files: 7, loc: 2210, cyclo: 2.8, cognitive: 3.9 }
                            ].map((row) => (
                                <TableRow key={row.module} hover>
                                    <TableCell sx={{ fontFamily: "monospace", fontSize: "0.8rem" }}>
                                        {row.module}
                                    </TableCell>
                                    <TableCell align="right">{row.files}</TableCell>
                                    <TableCell align="right">{row.loc.toLocaleString("de-DE")}</TableCell>
                                    <TableCell align="right">{row.cyclo}</TableCell>
                                    <TableCell align="right">{row.cognitive}</TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </TableContainer>
            </SectionCard>
        </Stack>
    );

}

export default ComplexityView;
