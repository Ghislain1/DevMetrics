import { Alert, Box, Chip, Grid, LinearProgress, Stack, Typography } from "@mui/material";

import MetricCard from "../components/MetricCard";
import SectionCard from "../components/SectionCard";
import Sparkline from "../components/Sparkline";
import { formatRelativeTime } from "../metrics/format";
import { domainScores, overviewMetrics, projects, qualitySeries } from "../metrics/sample";
import { statusPalette } from "../metrics/status";
import StatusChip from "../components/StatusChip";

function DashboardView() {

    return (
        <Stack spacing={3}>
            <Alert severity="info" variant="outlined">
                Platzhalter-Daten — der Aggregator liefert noch nicht über IPC. Siehe
                Baustelle 7 in <code>AGENTS.md</code>.
            </Alert>

            <Grid container spacing={2.5}>
                {overviewMetrics.map((metric) => (
                    <Grid
                        key={metric.key}
                        size={{ xs: 12, sm: 6, lg: 4, xl: 2 }}
                    >
                        <MetricCard
                            metric={metric}
                            lowerIsBetter={metric.key.startsWith("benchmarks") || metric.key === "security.findings" || metric.key === "smells.total"}
                        />
                    </Grid>
                ))}
            </Grid>

            <Grid container spacing={2.5}>
                <Grid size={{ xs: 12, lg: 7 }}>
                    <SectionCard
                        title="Quality Score Verlauf"
                        subtitle="Letzte 28 Tage, Stichprobe aus dem Aggregator"
                        action={<Chip size="small" label="6 Punkte" variant="outlined" />}
                    >
                        <Sparkline values={qualitySeries.points.map((point) => point.value)} />

                        <Stack direction="row" sx={{ justifyContent: "space-between" }}>
                            <Typography variant="caption" color="text.disabled">
                                {formatRelativeTime(qualitySeries.points[0]?.sampledAt ?? "")}
                            </Typography>
                            <Typography variant="caption" color="text.disabled">
                                {formatRelativeTime(qualitySeries.points.at(-1)?.sampledAt ?? "")}
                            </Typography>
                        </Stack>
                    </SectionCard>
                </Grid>

                <Grid size={{ xs: 12, lg: 5 }}>
                    <SectionCard title="Score nach Domäne" subtitle="Ampel kommt aus dem Aggregator">
                        <Stack spacing={1.75}>
                            {domainScores.map((entry) => {
                                const { color } = statusPalette(entry.status);

                                return (
                                    <Box key={entry.domain}>
                                        <Stack direction="row" sx={{ justifyContent: "space-between", mb: 0.5 }}>
                                            <Typography variant="body2">{entry.domain}</Typography>
                                            <Stack direction="row" sx={{ alignItems: "center", gap: 1 }}>
                                                <Typography variant="body2" sx={{ fontVariantNumeric: "tabular-nums", fontWeight: 600 }}>
                                                    {entry.score}
                                                </Typography>
                                                <StatusChip status={entry.status} />
                                            </Stack>
                                        </Stack>

                                        <LinearProgress
                                            variant="determinate"
                                            value={entry.score}
                                            color={color}
                                            sx={{ height: 6, borderRadius: 3 }}
                                        />
                                    </Box>
                                );
                            })}
                        </Stack>
                    </SectionCard>
                </Grid>
            </Grid>

            <SectionCard
                title="Analysierte Projekte"
                subtitle={`${projects.length} Repositories im Workspace`}
            >
                <Grid container spacing={2}>
                    {projects.map((project) => (
                        <Grid key={project.id} size={{ xs: 12, md: 4 }}>
                            <Stack
                                direction="row"
                                sx={{ alignItems: "center", justifyContent: "space-between", p: 1.5, borderRadius: 2, bgcolor: "action.hover" }}
                            >
                                <Box sx={{ minWidth: 0 }}>
                                    <Typography variant="subtitle2" noWrap>
                                        {project.name}
                                    </Typography>
                                    <Typography variant="caption" color="text.disabled" noWrap sx={{ display: "block" }}>
                                        {project.path}
                                    </Typography>
                                </Box>
                                <StatusChip status={project.status} />
                            </Stack>
                        </Grid>
                    ))}
                </Grid>
            </SectionCard>
        </Stack>
    );

}

export default DashboardView;
