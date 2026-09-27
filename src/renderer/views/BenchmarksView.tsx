import { Chip, Grid, Stack, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Typography } from "@mui/material";
import TimerRoundedIcon from "@mui/icons-material/TimerRounded";

import MetricCard from "../components/MetricCard";
import SectionCard from "../components/SectionCard";
import { formatMetricValue, formatRelativeTime } from "../metrics/format";
import { benchmarkMetrics, benchmarkRuns } from "../metrics/sample";

interface Run {
    id: string;
    pipeline: string;
    branch: string;
    duration: number;
    result: string;
}

const sampledAt = new Date(Date.now() - 3 * 3600_000).toISOString();

function BenchmarksView() {

    return (
        <Stack spacing={3}>
            <Grid container spacing={2.5}>
                {benchmarkMetrics.map((metric) => (
                    <Grid key={metric.key} size={{ xs: 12, sm: 6, lg: 3 }}>
                        <MetricCard metric={metric} lowerIsBetter />
                    </Grid>
                ))}
            </Grid>

            <SectionCard
                title="Letzte Läufe"
                subtitle="Quelle: ci-github-actions und benchmark-runner"
                action={
                    <Chip
                        size="small"
                        variant="outlined"
                        icon={<TimerRoundedIcon />}
                        label={`${benchmarkRuns.length} Läufe · ${formatRelativeTime(sampledAt)}`}
                    />
                }
            >
                <TableContainer>
                    <Table size="small">
                        <TableHead>
                            <TableRow>
                                <TableCell>Run</TableCell>
                                <TableCell>Pipeline</TableCell>
                                <TableCell>Branch</TableCell>
                                <TableCell align="right">Dauer</TableCell>
                                <TableCell align="right">Ergebnis</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {benchmarkRuns.map((run: Run) => (
                                <TableRow key={run.id} hover>
                                    <TableCell sx={{ fontFamily: "monospace", fontSize: "0.8rem" }}>
                                        {run.id}
                                    </TableCell>
                                    <TableCell>
                                        <Typography variant="caption" color="text.secondary">
                                            {run.pipeline}
                                        </Typography>
                                    </TableCell>
                                    <TableCell sx={{ fontFamily: "monospace", fontSize: "0.8rem" }}>
                                        {run.branch}
                                    </TableCell>
                                    <TableCell align="right" sx={{ fontVariantNumeric: "tabular-nums" }}>
                                        {formatMetricValue(run.duration, "milliseconds")}
                                    </TableCell>
                                    <TableCell align="right">
                                        <Chip
                                            size="small"
                                            color={run.result === "success" ? "success" : "error"}
                                            label={run.result === "success" ? "Erfolg" : "Fehlgeschlagen"}
                                        />
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

export default BenchmarksView;
