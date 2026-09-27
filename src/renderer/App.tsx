import { useState } from "react";

import {
    AppBar,
    Avatar,
    Box,
    Chip,
    Divider,
    Drawer,
    IconButton,
    List,
    ListItemButton,
    ListItemIcon,
    ListItemText,
    Stack,
    Toolbar,
    Tooltip,
    Typography
} from "@mui/material";
import DashboardRoundedIcon from "@mui/icons-material/DashboardRounded";
import FolderRoundedIcon from "@mui/icons-material/FolderRounded";
import SecurityRoundedIcon from "@mui/icons-material/SecurityRounded";
import InsightsRoundedIcon from "@mui/icons-material/InsightsRounded";
import CodeRoundedIcon from "@mui/icons-material/CodeRounded";
import TimerRoundedIcon from "@mui/icons-material/TimerRounded";
import DescriptionRoundedIcon from "@mui/icons-material/DescriptionRounded";
import MenuRoundedIcon from "@mui/icons-material/MenuRounded";
import LightModeRoundedIcon from "@mui/icons-material/LightModeRounded";

import { DRAWER_WIDTH } from "./theme";
import CodeSmellsView from "./views/CodeSmellsView";
import BenchmarksView from "./views/BenchmarksView";
import ComplexityView from "./views/ComplexityView";
import DashboardView from "./views/DashboardView";
import ProjectsView from "./views/ProjectsView";
import ReportsView from "./views/ReportsView";
import SecurityView from "./views/SecurityView";
import type { MetricDomain } from "./metrics/types";

type ViewId = MetricDomain;

interface NavEntry {
    id: ViewId;
    label: string;
    icon: typeof DashboardRoundedIcon;
    view: () => React.JSX.Element;
}

const NAV: NavEntry[] = [
    { id: "overview", label: "Dashboard", icon: DashboardRoundedIcon, view: DashboardView },
    { id: "projects", label: "Projects", icon: FolderRoundedIcon, view: ProjectsView },
    { id: "security", label: "Security", icon: SecurityRoundedIcon, view: SecurityView },
    { id: "complexity", label: "Complexity", icon: InsightsRoundedIcon, view: ComplexityView },
    { id: "smells", label: "Code Smells", icon: CodeRoundedIcon, view: CodeSmellsView },
    { id: "benchmarks", label: "Benchmarks", icon: TimerRoundedIcon, view: BenchmarksView },
    { id: "reports", label: "Reports", icon: DescriptionRoundedIcon, view: ReportsView }
];

function App() {

    const [active, setActive] = useState<ViewId>("overview");
    const [drawerOpen, setDrawerOpen] = useState(false);

    const current = NAV.find((entry) => entry.id === active) ?? NAV[0]!;
    const View = current.view;

    const selectView = (id: ViewId) => {
        setActive(id);
        setDrawerOpen(false);
    };

    const drawerContent = (
        <Stack sx={{ height: "100%" }}>
            <Toolbar sx={{ gap: 1.5 }}>
                <Avatar variant="rounded" sx={{ bgcolor: "primary.main", color: "primary.contrastText", width: 34, height: 34 }}>
                    <InsightsRoundedIcon fontSize="small" />
                </Avatar>
                <Box>
                    <Typography variant="subtitle1" sx={{ lineHeight: 1.2, fontWeight: 700 }}>
                        DevMetrics
                    </Typography>
                    <Typography variant="caption" color="text.disabled">
                        Code Quality & CI/CD
                    </Typography>
                </Box>
            </Toolbar>

            <Divider />

            <List sx={{ flexGrow: 1, px: 1.5, py: 2 }}>
                {NAV.map((entry) => {
                    const Icon = entry.icon;
                    const selected = entry.id === active;

                    return (
                        <ListItemButton
                            key={entry.id}
                            selected={selected}
                            onClick={() => selectView(entry.id)}
                        >
                            <ListItemIcon sx={{ minWidth: 40, color: selected ? "primary.main" : "text.secondary" }}>
                                <Icon fontSize="small" />
                            </ListItemIcon>
                            <ListItemText
                                primary={entry.label}
                                slotProps={{ primary: { sx: { fontWeight: selected ? 700 : 500 } } }}
                            />
                        </ListItemButton>
                    );
                })}
            </List>

            <Divider />

            <Box sx={{ p: 2 }}>
                <Chip
                    size="small"
                    variant="outlined"
                    color="success"
                    label="Provider online"
                    sx={{ width: "100%" }}
                />
            </Box>
        </Stack>
    );

    return (
        <Box sx={{ display: "flex", height: "100vh" }}>

            <AppBar
                position="fixed"
                sx={{
                    zIndex: (theme) => theme.zIndex.drawer + 1,
                    transition: (theme) => theme.transitions.create(["width", "left"])
                }}
            >
                <Toolbar sx={{ gap: 2 }}>
                    <IconButton
                        color="inherit"
                        edge="start"
                        onClick={() => setDrawerOpen((open) => !open)}
                        sx={{ display: { md: "none" } }}
                    >
                        <MenuRoundedIcon />
                    </IconButton>

                    <Box sx={{ flexGrow: 1 }}>
                        <Typography variant="h6" sx={{ lineHeight: 1.2 }}>
                            {current.label}
                        </Typography>
                        <Typography variant="caption" color="text.disabled">
                            devmetrics · vor 6 h analysiert
                        </Typography>
                    </Box>

                    <Chip
                        size="small"
                        color="warning"
                        variant="outlined"
                        label="Quality 87"
                    />

                    <Tooltip title="Design ist im Dark Mode fixiert — hell folgt mit dem Theme-Toggle">
                        <IconButton color="inherit" size="small" disabled>
                            <LightModeRoundedIcon fontSize="small" />
                        </IconButton>
                    </Tooltip>
                </Toolbar>
            </AppBar>

            <Drawer
                variant="temporary"
                open={drawerOpen}
                onClose={() => setDrawerOpen(false)}
                ModalProps={{ keepMounted: true }}
                sx={{
                    display: { xs: "block", md: "none" },
                    "& .MuiDrawer-paper": { width: DRAWER_WIDTH, boxSizing: "border-box" }
                }}
            >
                {drawerContent}
            </Drawer>

            <Drawer
                variant="permanent"
                sx={{
                    display: { xs: "none", md: "block" },
                    width: DRAWER_WIDTH,
                    flexShrink: 0,
                    "& .MuiDrawer-paper": { width: DRAWER_WIDTH, boxSizing: "border-box" }
                }}
            >
                {drawerContent}
            </Drawer>

            <Box component="main" sx={{ flexGrow: 1, minWidth: 0, display: "flex", flexDirection: "column" }}>
                <Toolbar />

                <Box sx={{ flexGrow: 1, p: 3, overflowY: "auto" }}>
                    <View />
                </Box>
            </Box>

        </Box>
    );

}

export default App;
