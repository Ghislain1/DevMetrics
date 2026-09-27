import { useState } from "react";

import {
    Button,
    Card,
    CardContent,
    Chip,
    Grid,
    LinearProgress,
    Stack,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Typography
} from "@mui/material";
import AddRoundedIcon from "@mui/icons-material/AddRounded";
import FolderOpenRoundedIcon from "@mui/icons-material/FolderOpenRounded";
import RefreshRoundedIcon from "@mui/icons-material/RefreshRounded";

import SectionCard from "../components/SectionCard";
import StatusChip from "../components/StatusChip";
import ViewState from "../components/ViewState";
import { formatMetricValue, formatRelativeTime } from "../metrics/format";
import { projects } from "../metrics/sample";
import type { ProjectSummary } from "../metrics/types";

function ProjectsView() {

    const [rows, setRows] = useState<ProjectSummary[]>(projects);

    if (rows.length === 0) {
        return (
            <ViewState
                title="Kein Projekt ausgewählt"
                description="DevMetrics liest Repositories ausschließlich von der Platte. Wähle einen Workspace-Ordner, um die Analyse zu starten."
                actionLabel="Repository hinzufügen"
                onAction={() => undefined}
                icon={<FolderOpenRoundedIcon sx={{ fontSize: 44 }} />}
            />
        );
    }

    return (
        <Stack spacing={3}>
            <SectionCard
                title="Repositories"
                subtitle="Quelle: local-fs und local-git"
                action={
                    <Stack direction="row" spacing={1}>
                        <Button size="small" variant="outlined" startIcon={<RefreshRoundedIcon />}>
                            Neu analysieren
                        </Button>
                        <Button size="small" variant="contained" startIcon={<AddRoundedIcon />}>
                            Hinzufügen
                        </Button>
                    </Stack>
                }
            >
                <TableContainer>
                    <Table size="small">
                        <TableHead>
                            <TableRow>
                                <TableCell>Projekt</TableCell>
                                <TableCell>Pfad</TableCell>
                                <TableCell align="right">Commit-Rate</TableCell>
                                <TableCell align="right">Quality Score</TableCell>
                                <TableCell>Zuletzt analysiert</TableCell>
                                <TableCell align="right">Status</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {rows.map((project) => (
                                <TableRow key={project.id} hover>
                                    <TableCell sx={{ fontWeight: 600 }}>{project.name}</TableCell>
                                    <TableCell>
                                        <Typography variant="caption" color="text.disabled">
                                            {project.path}
                                        </Typography>
                                    </TableCell>
                                    <TableCell align="right" sx={{ fontVariantNumeric: "tabular-nums" }}>
                                        {formatMetricValue(project.commitRate, "ratio")} / Tag
                                    </TableCell>
                                    <TableCell align="right" sx={{ fontVariantNumeric: "tabular-nums" }}>
                                        {project.qualityScore}
                                    </TableCell>
                                    <TableCell>{formatRelativeTime(project.lastAnalyzedAt)}</TableCell>
                                    <TableCell align="right">
                                        <StatusChip status={project.status} />
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </TableContainer>
            </SectionCard>

            <Grid container spacing={2.5}>
                {rows.map((project) => (
                    <Grid key={project.id} size={{ xs: 12, md: 4 }}>
                        <Card>
                            <CardContent>
                                <Stack spacing={1.5}>
                                    <Stack direction="row" sx={{ alignItems: "center", justifyContent: "space-between" }}>
                                        <Typography variant="subtitle1">{project.name}</Typography>
                                        <StatusChip status={project.status} />
                                    </Stack>

                                    <LinearProgress
                                        variant="determinate"
                                        value={project.qualityScore}
                                        color={project.qualityScore >= 75 ? "success" : project.qualityScore >= 60 ? "warning" : "error"}
                                        sx={{ height: 8, borderRadius: 4 }}
                                    />

                                    <Stack direction="row" useFlexGap sx={{ flexWrap: "wrap", gap: 1 }}>
                                        <Chip size="small" variant="outlined" label={`Score ${project.qualityScore}`} />
                                        <Chip size="small" variant="outlined" label={`${formatMetricValue(project.commitRate, "ratio")} Commits/Tag`} />
                                    </Stack>
                                </Stack>
                            </CardContent>
                        </Card>
                    </Grid>
                ))}
            </Grid>

            <Button
                variant="text"
                size="small"
                sx={{ alignSelf: "flex-start" }}
                onClick={() => setRows([])}
            >
                Leerzustand testen
            </Button>
        </Stack>
    );

}

export default ProjectsView;
