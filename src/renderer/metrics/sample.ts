import type {
    MetricSeries,
    NormalizedMetric,
    ProjectSummary
} from "./types";

/**
 * Platzhalter-Daten. Sobald der Aggregator über `window.electronAPI` liefert,
 * wird dieses Modul durch den IPC-Client ersetzt — die Views bleiben unberührt.
 * Siehe Baustelle 7 in `AGENTS.md`.
 */

const hoursAgo = (hours: number): string =>
    new Date(Date.now() - hours * 3600_000).toISOString();

const daysAgo = (days: number): string => hoursAgo(days * 24);

export const overviewMetrics: NormalizedMetric[] = [
    {
        domain: "overview",
        key: "quality.score",
        label: "Quality Score",
        unit: "score",
        value: 87,
        status: "ok",
        threshold: { warn: 75, critical: 60 },
        delta: { absolute: 3, percent: 3.6 },
        hint: "Gewichteter Mittelwert aller Domänen"
    },
    {
        domain: "overview",
        key: "security.findings",
        label: "Security Findings",
        unit: "count",
        value: 10,
        status: "warn",
        threshold: { warn: 5, critical: 20 },
        delta: { absolute: -4, percent: -28.6 }
    },
    {
        domain: "overview",
        key: "smells.total",
        label: "Code Smells",
        unit: "count",
        value: 17,
        status: "warn",
        threshold: { warn: 10, critical: 30 },
        delta: { absolute: 2, percent: 13.3 }
    },
    {
        domain: "overview",
        key: "complexity.cyclomatic",
        label: "Cyclomatic Ø",
        unit: "score",
        value: 4.2,
        status: "ok",
        threshold: { warn: 6, critical: 10 },
        delta: { absolute: -0.4, percent: -8.7 }
    },
    {
        domain: "overview",
        key: "benchmarks.build",
        label: "Build-Zeit",
        unit: "milliseconds",
        value: 84200,
        status: "ok",
        threshold: { warn: 90000, critical: 150000 },
        delta: { absolute: -3100, percent: -3.6 }
    },
    {
        domain: "overview",
        key: "benchmarks.bundle",
        label: "Bundle-Größe",
        unit: "bytes",
        value: 581000,
        status: "warn",
        threshold: { warn: 500000, critical: 900000 },
        delta: { absolute: 24000, percent: 4.3 }
    }
];

export const qualitySeries: MetricSeries = {
    key: "quality.score",
    unit: "score",
    points: [
        { sampledAt: daysAgo(28), value: 79 },
        { sampledAt: daysAgo(21), value: 81 },
        { sampledAt: daysAgo(14), value: 80 },
        { sampledAt: daysAgo(7), value: 85 },
        { sampledAt: daysAgo(3), value: 84 },
        { sampledAt: hoursAgo(6), value: 87 }
    ]
};

export const securityMetrics: NormalizedMetric[] = [
    {
        domain: "security",
        key: "security.critical",
        label: "Kritisch",
        unit: "count",
        value: 2,
        status: "critical",
        threshold: { warn: 0, critical: 1 }
    },
    {
        domain: "security",
        key: "security.high",
        label: "Hoch",
        unit: "count",
        value: 3,
        status: "warn",
        threshold: { warn: 2, critical: 5 }
    },
    {
        domain: "security",
        key: "security.medium",
        label: "Mittel",
        unit: "count",
        value: 4,
        status: "ok",
        threshold: { warn: 8, critical: 15 }
    },
    {
        domain: "security",
        key: "security.low",
        label: "Niedrig",
        unit: "count",
        value: 1,
        status: "ok",
        threshold: { warn: 5, critical: 12 }
    }
];

export const securityFindings = [
    {
        id: "SEC-104",
        title: "Ungeprüfter Pfad aus Renderer-IPC übergeben",
        scope: "src/main/ipc/projects.ts",
        severity: "critical" as const,
        firstSeen: daysAgo(9)
    },
    {
        id: "SEC-097",
        title: "eval() in Template-Auswertung",
        scope: "src/renderer/components/RuleEditor.tsx",
        severity: "critical" as const,
        firstSeen: daysAgo(21)
    },
    {
        id: "SEC-088",
        title: "Fehlende Symlink-Prüfung vor fs.readFile",
        scope: "src/main/provider/local-fs.ts",
        severity: "high" as const,
        firstSeen: daysAgo(4)
    },
    {
        id: "SEC-081",
        title: "shell.openExternal mit ungeprüfter URL",
        scope: "src/main/ipc/reports.ts",
        severity: "high" as const,
        firstSeen: daysAgo(12)
    },
    {
        id: "SEC-062",
        title: "contextIsolation nicht erzwungen",
        scope: "src/main/windows/report.ts",
        severity: "high" as const,
        firstSeen: daysAgo(30)
    }
];

export const complexityMetrics: NormalizedMetric[] = [
    {
        domain: "complexity",
        key: "complexity.cyclomatic",
        label: "Cyclomatic Ø",
        unit: "score",
        value: 4.2,
        status: "ok",
        threshold: { warn: 6, critical: 10 }
    },
    {
        domain: "complexity",
        key: "complexity.cognitive",
        label: "Cognitive Ø",
        unit: "score",
        value: 5.8,
        status: "warn",
        threshold: { warn: 5, critical: 12 }
    },
    {
        domain: "complexity",
        key: "complexity.halstead",
        label: "Halstead Ø",
        unit: "score",
        value: 1180,
        status: "ok",
        threshold: { warn: 2000, critical: 4000 }
    },
    {
        domain: "complexity",
        key: "complexity.loc",
        label: "LOC gesamt",
        unit: "count",
        value: 18420,
        status: "unknown"
    }
];

export const complexityHotspots = [
    { name: "normalizeMetric", file: "src/renderer/metrics/normalize.ts", value: 27, unit: "score" as const },
    { name: "resolvePathWithinRoots", file: "src/main/fs/guard.ts", value: 24, unit: "score" as const },
    { name: "aggregateSeries", file: "src/main/aggregator/series.ts", value: 19, unit: "score" as const },
    { name: "ReportBuilder.render", file: "src/main/reports/builder.ts", value: 16, unit: "score" as const },
    { name: "useMetricsPolling", file: "src/renderer/hooks/useMetrics.ts", value: 12, unit: "score" as const }
];

export const smellMetrics: NormalizedMetric[] = [
    {
        domain: "smells",
        key: "smells.duplicates",
        label: "Duplikate",
        unit: "count",
        value: 6,
        status: "warn",
        threshold: { warn: 3, critical: 10 }
    },
    {
        domain: "smells",
        key: "smells.long-method",
        label: "Lange Methoden",
        unit: "count",
        value: 5,
        status: "ok",
        threshold: { warn: 6, critical: 15 }
    },
    {
        domain: "smells",
        key: "smells.dead-branch",
        label: "Tote Bedingungen",
        unit: "count",
        value: 3,
        status: "ok",
        threshold: { warn: 4, critical: 10 }
    },
    {
        domain: "smells",
        key: "smells.god-object",
        label: "God Objects",
        unit: "count",
        value: 3,
        status: "warn",
        threshold: { warn: 1, critical: 5 }
    }
];

export const smellRows = [
    { rule: "Long Method", hits: 5, files: 3, since: daysAgo(14), effort: "Mittel" },
    { rule: "Duplicated Block", hits: 6, files: 4, since: daysAgo(30), effort: "Hoch" },
    { rule: "God Object", hits: 3, files: 2, since: daysAgo(45), effort: "Hoch" },
    { rule: "Dead Branch", hits: 3, files: 3, since: daysAgo(7), effort: "Niedrig" },
    { rule: "Complex Condition", hits: 4, files: 3, since: daysAgo(21), effort: "Mittel" }
];

export const benchmarkMetrics: NormalizedMetric[] = [
    {
        domain: "benchmarks",
        key: "benchmarks.build",
        label: "Build p50",
        unit: "milliseconds",
        value: 84200,
        status: "ok",
        threshold: { warn: 90000, critical: 150000 },
        delta: { absolute: -3100, percent: -3.6 }
    },
    {
        domain: "benchmarks",
        key: "benchmarks.build.p95",
        label: "Build p95",
        unit: "milliseconds",
        value: 121400,
        status: "warn",
        threshold: { warn: 110000, critical: 180000 }
    },
    {
        domain: "benchmarks",
        key: "benchmarks.bundle",
        label: "Bundle",
        unit: "bytes",
        value: 581000,
        status: "warn",
        threshold: { warn: 500000, critical: 900000 }
    },
    {
        domain: "benchmarks",
        key: "benchmarks.tests",
        label: "Testlauf",
        unit: "milliseconds",
        value: 23400,
        status: "ok",
        threshold: { warn: 40000, critical: 90000 }
    }
];

export const benchmarkRuns = [
    { id: "#1284", pipeline: "ci-github-actions", branch: "main", duration: 82100, result: "success" },
    { id: "#1283", pipeline: "ci-github-actions", branch: "feat/thresholds", duration: 96800, result: "success" },
    { id: "#1282", pipeline: "benchmark-runner", branch: "main", duration: 241200, result: "failed" },
    { id: "#1281", pipeline: "ci-github-actions", branch: "main", duration: 80500, result: "success" },
    { id: "#1280", pipeline: "ci-github-actions", branch: "fix/path-guard", duration: 119700, result: "success" }
];

export const reportRows = [
    { id: "RPT-2026-014", scope: "devmetrics", created: hoursAgo(6), format: "PDF", size: 412000, status: "ready" },
    { id: "RPT-2026-013", scope: "devmetrics", created: daysAgo(2), format: "HTML", size: 288000, status: "ready" },
    { id: "RPT-2026-012", scope: "api-gateway", created: daysAgo(6), format: "PDF", size: 640000, status: "ready" },
    { id: "RPT-2026-011", scope: "api-gateway", created: daysAgo(13), format: "CSV", size: 96000, status: "stale" }
];

export const projects: ProjectSummary[] = [
    {
        id: "devmetrics",
        name: "DevMetrics",
        path: "C:/git/_toolings/bun/DevMetrics",
        lastAnalyzedAt: hoursAgo(6),
        commitRate: 3.4,
        qualityScore: 87,
        status: "ok"
    },
    {
        id: "api-gateway",
        name: "api-gateway",
        path: "C:/git/_toolings/node/api-gateway",
        lastAnalyzedAt: daysAgo(6),
        commitRate: 1.1,
        qualityScore: 64,
        status: "critical"
    },
    {
        id: "design-system",
        name: "design-system",
        path: "C:/git/_toolings/bun/design-system",
        lastAnalyzedAt: daysAgo(11),
        commitRate: 2.2,
        qualityScore: 78,
        status: "warn"
    }
];

export const domainScores = [
    { domain: "Security", score: 62, status: "critical" as const },
    { domain: "Complexity", score: 79, status: "ok" as const },
    { domain: "Code Smells", score: 74, status: "warn" as const },
    { domain: "Benchmarks", score: 88, status: "ok" as const },
    { domain: "Testabdeckung", score: 71, status: "warn" as const }
];
