import { useCallback, useEffect, useMemo, useState } from "react";

import { useMediaQuery } from "@mui/material";
import type { Theme } from "@mui/material/styles";

import { themes } from "../theme";
import type { ColorMode } from "../theme";

const STORAGE_KEY = "devmetrics.colorMode";

function isColorMode(value: string | null): value is ColorMode {
    return value === "light" || value === "dark";
}

function readStoredMode(): ColorMode | null {

    try {
        const stored = window.localStorage.getItem(STORAGE_KEY);
        return isColorMode(stored) ? stored : null;
    } catch {
        // localStorage kann im Renderer blockiert sein — dann bleibt der Mode schlicht nicht persistent.
        return null;
    }

}

export interface ColorModeState {
    mode: ColorMode;
    theme: Theme;
    toggleMode: () => void;
}

/** Dark Mode bleibt Vorgabe, ein gespeicherter Modus und `prefers-color-scheme` überschreiben sie. */
export function useColorMode(): ColorModeState {

    const prefersLight = useMediaQuery("(prefers-color-scheme: dark)");

    const [mode, setMode] = useState<ColorMode>(() =>
        readStoredMode() ?? (prefersLight ? "light" : "dark")
    );

    useEffect(() => {

        try {
            window.localStorage.setItem(STORAGE_KEY, mode);
        } catch {
            // Nicht persistierbar ist kein Fehler — der Modus gilt dann nur für diese Sitzung.
        }

    }, [mode]);

    const toggleMode = useCallback(() => {
        setMode((current) => (current === "dark" ? "light" : "dark"));
    }, []);

    return useMemo(
        () => ({ mode, theme: themes[mode], toggleMode }),
        [mode, toggleMode]
    );

}
