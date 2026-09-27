export type MetricUnit =
    | "count"
    | "percent"
    | "score"
    | "milliseconds"
    | "bytes"
    | "ratio";

export type MetricDomain =
    | "overview"
    | "projects"
    | "security"
    | "complexity"
    | "smells"
    | "benchmarks"
    | "reports";

/**
 * Ampel-Status. Wird im Aggregator aus `threshold` bestimmt — Views werten
 * hier nie selbst Schwellwerte aus, sonst zeigen Dashboard und Export
 * unterschiedliche Zahlen.
 */
export type MetricStatus = "ok" | "warn" | "critical" | "unknown";

export interface MetricThreshold {
    warn: number;
    critical: number;
}

export interface MetricDelta {
    absolute: number;
    percent: number;
}

export interface NormalizedMetric {
    domain: MetricDomain;
    key: string;
    label: string;
    unit: MetricUnit;
    value: number;
    status: MetricStatus;
    threshold?: MetricThreshold;
    delta?: MetricDelta;
    hint?: string;
}

export interface SeriesPoint {
    sampledAt: string;
    value: number;
}

export interface MetricSeries {
    key: string;
    unit: MetricUnit;
    points: SeriesPoint[];
}

export interface ProjectSummary {
    id: string;
    name: string;
    path: string;
    lastAnalyzedAt: string;
    commitRate: number;
    qualityScore: number;
    status: MetricStatus;
}
