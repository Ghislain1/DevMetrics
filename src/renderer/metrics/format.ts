import type { MetricDelta, MetricUnit } from "./types";

const BYTE_UNITS = ["B", "kB", "MB", "GB", "TB"] as const;

function formatBytes(value: number): string {
    let index = 0;
    let scaled = value;

    while (scaled >= 1024 && index < BYTE_UNITS.length - 1) {
        scaled /= 1024;
        index += 1;
    }

    const digits = scaled < 10 && index > 0 ? 1 : 0;

    return `${scaled.toFixed(digits)} ${BYTE_UNITS[index]}`;
}

function formatMilliseconds(value: number): string {
    if (value < 1000) {
        return `${Math.round(value)} ms`;
    }

    const seconds = value / 1000;

    if (seconds < 60) {
        return `${seconds.toFixed(seconds < 10 ? 1 : 0)} s`;
    }

    const minutes = Math.floor(seconds / 60);
    const rest = Math.round(seconds % 60);

    return `${minutes} min ${rest} s`;
}

/**
 * Einzige Formatierungsstelle für Einheiten. Views formatieren nicht selbst —
 * sonst weicht die Zahl in der Tabelle von der im Report ab.
 */
export function formatMetricValue(value: number, unit: MetricUnit): string {
    switch (unit) {
        case "percent":
            return `${formatScore(value)} %`;
        case "score":
        case "count":
            return formatScore(value);
        case "milliseconds":
            return formatMilliseconds(value);
        case "bytes":
            return formatBytes(value);
        case "ratio":
            return value.toFixed(2);
    }
}

function formatScore(value: number): string {
    return Number.isInteger(value) ? String(value) : value.toFixed(1);
}

export function formatDelta(delta: MetricDelta, unit: MetricUnit): string {
    const sign = delta.absolute > 0 ? "+" : "";
    const magnitude = formatMetricValue(Math.abs(delta.absolute), unit);
    const percent = `${delta.percent > 0 ? "+" : ""}${delta.percent.toFixed(1)} %`;

    return `${sign}${magnitude} (${percent})`;
}

export function formatRelativeTime(iso: string, now = new Date()): string {
    const stamp = new Date(iso);

    if (Number.isNaN(stamp.getTime())) {
        return "unbekannt";
    }

    const seconds = Math.round((now.getTime() - stamp.getTime()) / 1000);

    if (seconds < 60) {
        return "gerade eben";
    }

    if (seconds < 3600) {
        return `vor ${Math.floor(seconds / 60)} min`;
    }

    if (seconds < 86400) {
        return `vor ${Math.floor(seconds / 3600)} h`;
    }

    return `vor ${Math.floor(seconds / 86400)} d`;
}

/** Invertierte Achse: bei "weniger ist besser" zeigt die Linie nach unten besser aus. */
export function isLowerBetter(unit: MetricUnit): boolean {
    return unit === "count" || unit === "milliseconds" || unit === "bytes";
}
