import { Chip, Grid, Stack, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Tooltip, Typography } from "@mui/material";
import SecurityRoundedIcon from "@mui/icons-material/SecurityRounded";

import MetricCard from "../components/MetricCard";
import SectionCard from "../components/SectionCard";
import { formatRelativeTime } from "../metrics/format";
import { securityFindings, securityMetrics } from "../metrics/sample";
import StatusChip from "../components/StatusChip";

const SEVERITY_ORDER = {
    critical: 0,
    high: 1,
    medium: 2,
    low: 3
} as const;

const SEVERITY_LABEL: Record<keyof typeof SEVERITY_ORDER, string> = {
    critical: "Kritisch",
    high: "Hoch",
    medium: "Mittel",
    low: "Niedrig"
};

function SecurityView() {

    const findings = [...securityFindings].sort(
        (a, b) => SEVERITY_ORDER[a.severity] - SEVERITY_ORDER[b.severity]
    );

    return (
        <Stack spacing={3}>
            <Grid container spacing={2.5}>
                {securityMetrics.map((metric) => (
                    <Grid key={metric.key} size={{ xs: 12, sm: 6, lg: 3 }}>
                        <MetricCard metric={metric} lowerIsBetter />
                    </Grid>
                ))}
            </Grid>

            <SectionCard
                title="Findings"
                subtitle={`${findings.length} offene Findings aus dem Security-Provider`}
                action={
                    <Chip
                        size="small"
                        color="error"
                        variant="outlined"
                        icon={<SecurityRoundedIcon />}
                        label="2 kritisch"
                    />
                }
            >
                <TableContainer>
                    <Table size="small">
                        <TableHead>
                            <TableRow>
                                <TableCell>ID</TableCell>
                                <TableCell>Befund</TableCell>
                                <TableCell>Scope</TableCell>
                                <TableCell>Schweregrad</TableCell>
                                <TableCell align="right">Erstmals gesehen</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {findings.map((finding) => (
                                <TableRow key={finding.id} hover>
                                    <TableCell sx={{ fontFamily: "monospace", fontSize: "0.78rem" }}>
                                        {finding.id}
                                    </TableCell>
                                    <TableCell sx={{ fontWeight: 500 }}>{finding.title}</TableCell>
                                    <TableCell>
                                        <Typography variant="caption" color="text.disabled">
                                            {finding.scope}
                                        </Typography>
                                    </TableCell>
                                    <TableCell>
                                        <Tooltip title={`Schweregrad ${SEVERITY_LABEL[finding.severity]}`}>
                                            <span>
                                                <StatusChip
                                                    status={finding.severity === "critical"
                                                        ? "critical"
                                                        : finding.severity === "high"
                                                            ? "warn"
                                                            : "ok"}
                                                />
                                            </span>
                                        </Tooltip>
                                    </TableCell>
                                    <TableCell align="right">
                                        {formatRelativeTime(finding.firstSeen)}
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

export default SecurityView;
