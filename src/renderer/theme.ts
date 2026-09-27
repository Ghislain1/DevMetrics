import { createTheme } from "@mui/material/styles";
import type { Theme } from "@mui/material/styles";

export const DRAWER_WIDTH = 264;

export type ColorMode = "dark" | "light";

interface ModeTokens {
    primary: string;
    secondary: string;
    success: string;
    warning: string;
    error: string;
    info: string;
    background: string;
    paper: string;
    /** Haarlinie auf allen Paper-Flächen. */
    hairline: string;
    /** Halbtransparente AppBar, liegt über `background`. */
    appBar: string;
    appBarText: string;
}

const TOKENS: Record<ColorMode, ModeTokens> = {
    dark: {
        primary: "#4f9cf9",
        secondary: "#a78bfa",
        success: "#34d399",
        warning: "#fbbf24",
        error: "#f87171",
        info: "#38bdf8",
        background: "#0b0f16",
        paper: "#131924",
        hairline: "rgba(255,255,255,0.06)",
        appBar: "rgba(11,15,22,0.72)",
        appBarText: "#ffffff"
    },
    light: {
        // Deutlich gesättigter als im Dark Mode: auf Weiß kippen die hellen Töne
        // aus, Text, Chips und LinearProgress blieben sonst unter 3:1 Kontrast.
        primary: "#1a73e8",
        secondary: "#7c3aed",
        success: "#059669",
        warning: "#b45309",
        error: "#dc2626",
        info: "#0284c7",
        background: "#f4f6fa",
        paper: "#ffffff",
        hairline: "rgba(16,24,40,0.09)",
        appBar: "rgba(255,255,255,0.72)",
        appBarText: "#101725"
    }
};

function createAppTheme(mode: ColorMode): Theme {

    const t = TOKENS[mode];

    return createTheme({
        palette: {
            mode,
            primary: { main: t.primary },
            secondary: { main: t.secondary },
            success: { main: t.success },
            warning: { main: t.warning },
            error: { main: t.error },
            info: { main: t.info },
            background: {
                default: t.background,
                paper: t.paper
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
                        border: `1px solid ${t.hairline}`
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
                        // Die AppBar nutzt ihr eigenes Semitransparent, nicht `primary.main` —
                        // sonst stünde `primary.contrastText` (im Light Mode Weiß) auf Weiß.
                        color: t.appBarText,
                        backgroundColor: t.appBar,
                        backdropFilter: "blur(12px)",
                        borderBottom: `1px solid ${t.hairline}`
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

}

export const darkTheme = createAppTheme("dark");
export const lightTheme = createAppTheme("light");

export const themes: Record<ColorMode, Theme> = {
    dark: darkTheme,
    light: lightTheme
};
