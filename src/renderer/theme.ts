import { createTheme } from "@mui/material/styles";

export const DRAWER_WIDTH = 264;

const theme = createTheme({
    palette: {
        mode: "dark",
        primary: { main: "#4f9cf9" },
        secondary: { main: "#a78bfa" },
        success: { main: "#34d399" },
        warning: { main: "#fbbf24" },
        error: { main: "#f87171" },
        info: { main: "#38bdf8" },
        background: {
            default: "#0b0f16",
            paper: "#131924"
        }
    },

    shape: { borderRadius: 12 },

    typography: {
        fontFamily: [
            "Inter",
            "Roboto",
            "-apple-system",
            "BlinkMacSystemFont",
            "Segoe UI",
            "sans-serif"
        ].join(","),
        h4: { fontWeight: 600, letterSpacing: "-0.01em" },
        h5: { fontWeight: 600 },
        h6: { fontWeight: 600 },
        subtitle2: { fontWeight: 600 },
        overline: { letterSpacing: "0.12em", fontWeight: 700 }
    },

    components: {
        MuiCssBaseline: {
            styleOverrides: {
                body: { overflow: "hidden" }
            }
        },

        MuiPaper: {
            styleOverrides: {
                root: {
                    backgroundImage: "none",
                    border: "1px solid rgba(255,255,255,0.06)"
                }
            }
        },

        MuiCard: {
            defaultProps: { variant: "outlined" }
        },

        MuiAppBar: {
            defaultProps: { elevation: 0 },
            styleOverrides: {
                root: {
                    backgroundColor: "rgba(11,15,22,0.72)",
                    backdropFilter: "blur(12px)",
                    borderBottom: "1px solid rgba(255,255,255,0.06)"
                }
            }
        },

        MuiListItemButton: {
            styleOverrides: {
                root: {
                    borderRadius: 10,
                    marginBottom: 4
                }
            }
        },

        MuiTableCell: {
            styleOverrides: {
                head: {
                    fontWeight: 700,
                    textTransform: "uppercase",
                    fontSize: "0.72rem",
                    letterSpacing: "0.08em"
                }
            }
        },

        MuiChip: {
            styleOverrides: {
                root: { fontWeight: 600 }
            }
        }
    }
});

export default theme;
