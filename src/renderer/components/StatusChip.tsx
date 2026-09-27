import { Chip } from "@mui/material";
import type { ChipProps } from "@mui/material";

import { statusPalette } from "../metrics/status";
import type { MetricStatus } from "../metrics/types";

interface StatusChipProps {
    status: MetricStatus;
    size?: ChipProps["size"];
}

function StatusChip({ status, size = "small" }: StatusChipProps) {

    const { color, label } = statusPalette(status);

    return (
        <Chip
            size={size}
            label={label}
            color={color}
            variant={status === "unknown" ? "outlined" : "filled"}
        />
    );

}

export default StatusChip;
