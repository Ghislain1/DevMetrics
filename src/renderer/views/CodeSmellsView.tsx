import { Chip, Grid, LinearProgress, Stack, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Typography } from "@mui/material";

import MetricCard from "../components/MetricCard";
import SectionCard from "../components/SectionCard";
import { formatRelativeTime } from "../metrics/format";
import { smellMetrics, smellRows } from "../metrics/sample";

const MAX_HITS = Math.max(...smellRows.map((row) => row.hits), 1);

const EFFORT_COLOR = {
    Niedrig: "success",
    Mittel: "warning",
    Hoch: "error"
} as const;

function CodeSmellsView() {

    return (
        <Stack spacing={3}>
            <Grid container spacing={2.5}>
                {smellMetrics.map((metric) => (
                    <Grid key={metric.key} size={{ xs: 12, sm: 6, lg: 3 }}>
                        <MetricCard metric={metric} lowerIsBetter />
                    </Grid>
                ))}
            </Grid>

            <SectionCard
                title="Regeln"
                subtitle="Treffer pro Code-Smell-Regel im aktuellen Analyse-Lauf"
            >
                <Stack spacing={1.75}>
                    {smellRows.map((row) => (
                        <div key={row.rule}>
                            <Stack
                                direction="row"
                                sx={{ alignItems: "center", justifyContent: "space-between", gap: 2, mb: 0.5 }}
                            >
                                <Typography variant="body2" sx={{ fontWeight: 600 }}>
                                    {row.rule}
                                </Typography>

                                <Stack direction="row" sx={{ alignItems: "center", gap: 1 }}>
                                    <Chip
                                        size="small"
                                        variant="outlined"
                                        color={EFFORT_COLOR[row.effort as keyof typeof EFFORT_COLOR] ?? "default"}
                                        label={`Aufwand ${row.effort}`}
                                    />
                                    <Typography
                                        variant="body2"
                                        sx={{ fontVariantNumeric: "tabular-nums", fontWeight: 700, minWidth: 54, textAlign: "right" }}
                                    >
                                        {row.hits} Treffer
                                    </Typography>
                                </Stack>
                            </Stack>

                            <LinearProgress
                                variant="determinate"
                                value={(row.hits / MAX_HITS) * 100}
                                color={row.hits > 5 ? "error" : row.hits > 3 ? "warning" : "success"}
                                sx={{ height: 8, borderRadius: 4 }}
                            />

                            <Typography variant="caption" color="text.disabled">
                                {row.files} Dateien · erstmals {formatRelativeTime(row.since)}
                            </Typography>
                        </div>
                    ))}
                </Stack>
            </SectionCard>

            <SectionCard title="Verteilung nach Datei" subtitle="Dateien mit den meisten Smells">
                <TableContainer>
                    <Table size="small">
                        <TableHead>
                            <TableRow>
                                <TableCell>Datei</TableCell>
                                <TableCell>Regeln</TableCell>
                                <TableCell align="right">Treffer</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {[
                                { file: "src/main/aggregator/series.ts", rules: "Long Method, Complex Condition", hits: 7 },
                                { file: "src/main/provider/local-fs.ts", rules: "Duplicated Block, Long Method", hits: 6 },
                                { file: "src/renderer/views/DashboardView.tsx", rules: "God Object, Complex Condition", hits: 5 },
                                { file: "src/main/reports/builder.ts", rules: "Long Method, Dead Branch", hits: 4 }
                            ].map((row) => (
                                <TableRow key={row.file} hover>
                                    <TableCell sx={{ fontFamily: "monospace", fontSize: "0.8rem" }}>
                                        {row.file}
                                    </TableCell>
                                    <TableCell>
                                        <Typography variant="caption" color="text.secondary">
                                            {row.rules}
                                        </Typography>
                                    </TableCell>
                                    <TableCell align="right" sx={{ fontWeight: 600 }}>
                                        {row.hits}
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </TableContainer>
            </SectionCard>
        </Stack>
    );

}

export default CodeSmellsView;
