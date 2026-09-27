import type { MetricStatus } from "./types";

export interface StatusPalette {
    /** Gilt für Chip, LinearProgress und Typography. `unknown` fällt auf `primary` zurück. */
    color: "success" | "warning" | "error" | "primary";
    label: string;
}

const STATUS_PALETTE: Record<MetricStatus, StatusPalette> = {
    ok: { color: "success", label: "OK" },
    warn: { color: "warning", label: "Warnung" },
    critical: { color: "error", label: "Kritisch" },
    unknown: { color: "primary", label: "Keine Daten" }
};

export function statusPalette(status: MetricStatus): StatusPalette {
    return STATUS_PALETTE[status];
}
