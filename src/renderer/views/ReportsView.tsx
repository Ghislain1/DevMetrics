import { Button, Chip, Grid, Stack, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Typography } from "@mui/material";
import DescriptionRoundedIcon from "@mui/icons-material/DescriptionRounded";
import FileDownloadRoundedIcon from "@mui/icons-material/FileDownloadRounded";

import SectionCard from "../components/SectionCard";
import { formatMetricValue, formatRelativeTime } from "../metrics/format";
import { reportRows } from "../metrics/sample";

function ReportsView() {

    return (
        <Stack spacing={3}>
            <SectionCard
                title="Exporte"
                subtitle="Erzeugt aus dem Aggregator-Output, nicht in der View berechnet"
                action={
                    <Button size="small" variant="contained" startIcon={<FileDownloadRoundedIcon />}>
                        Neuen Report erzeugen
                    </Button>
                }
            >
                <TableContainer>
                    <Table size="small">
                        <TableHead>
                            <TableRow>
                                <TableCell>Report</TableCell>
                                <TableCell>Scope</TableCell>
                                <TableCell>Format</TableCell>
                                <TableCell align="right">Größe</TableCell>
                                <TableCell align="right">Erstellt</TableCell>
                                <TableCell align="right">Status</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {reportRows.map((row) => (
                                <TableRow key={row.id} hover>
                                    <TableCell sx={{ fontFamily: "monospace", fontSize: "0.8rem" }}>
                                        {row.id}
                                    </TableCell>
                                    <TableCell>{row.scope}</TableCell>
                                    <TableCell>
                                        <Chip size="small" variant="outlined" label={row.format} />
                                    </TableCell>
                                    <TableCell align="right" sx={{ fontVariantNumeric: "tabular-nums" }}>
                                        {formatMetricValue(row.size, "bytes")}
                                    </TableCell>
                                    <TableCell align="right">{formatRelativeTime(row.created)}</TableCell>
                                    <TableCell align="right">
                                        <Chip
                                            size="small"
                                            color={row.status === "ready" ? "success" : "warning"}
                                            label={row.status === "ready" ? "Bereit" : "Veraltet"}
                                        />
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </TableContainer>
            </SectionCard>

            <Grid container spacing={2.5}>
                {[
                    { title: "Qualitätstrend", body: "Score, Delta und Ampel je Domäne über den gewählten Zeitraum." },
                    { title: "Security-Digest", body: "Findings nach Schweregrad, neu seit dem letzten Report." },
                    { title: "Benchmark-Vergleich", body: "p50/p95, Bundle-Größe und Regressionen gegen den Vorlauf." }
                ].map((template) => (
                    <Grid key={template.title} size={{ xs: 12, md: 4 }}>
                        <SectionCard title={template.title}>
                            <Stack spacing={1.5}>
                                <Stack direction="row" sx={{ alignItems: "flex-start", gap: 1 }}>
                                    <DescriptionRoundedIcon fontSize="small" color="primary" />
                                    <Typography variant="body2" color="text.secondary">
                                        {template.body}
                                    </Typography>
                                </Stack>
                                <Button size="small" variant="outlined" sx={{ alignSelf: "flex-start" }}>
                                    Erzeugen
                                </Button>
                            </Stack>
                        </SectionCard>
                    </Grid>
                ))}
            </Grid>
        </Stack>
    );

}

export default ReportsView;
