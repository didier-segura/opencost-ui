import Paper from "@material-ui/core/Paper";
import Typography from "@material-ui/core/Typography";
import { makeStyles } from "@material-ui/styles";
import { toCurrency } from "../util";

const useStyles = makeStyles({
  root: {
    display: "grid",
    gap: "1.5rem",
    gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
  },
  card: {
    background:
      "linear-gradient(135deg, rgba(74, 222, 128, 0.12), rgba(45, 212, 191, 0.08))",
    border: 0,
    borderRadius: 20,
    boxShadow: "0 20px 30px rgba(15, 23, 42, 0.08)",
    boxSizing: "border-box",
    color: "#0f172a",
    display: "flex",
    flexDirection: "column",
    gap: "0.75rem",
    padding: "1.75rem",
  },
  mutedCard: {
    background:
      "linear-gradient(135deg, rgba(148, 163, 184, 0.08), rgba(203, 213, 225, 0.12))",
  },
  label: {
    fontSize: "0.75rem",
    fontWeight: 600,
    letterSpacing: "0.08em",
    textTransform: "uppercase",
  },
  value: {
    fontSize: "1.9rem",
    fontWeight: 700,
  },
  secondary: {
    color: "#475569",
    fontSize: "0.9rem",
  },
});

function formatEfficiency(totalData) {
  if (
    totalData.totalEfficiency === 1 &&
    totalData.cpuReqCoreHrs === 0 &&
    totalData.ramReqByteHrs === 0
  ) {
    return "Inf%";
  }
  if (typeof totalData.totalEfficiency === "number") {
    return `${(totalData.totalEfficiency * 100).toFixed(1)}%`;
  }
  return "—";
}

const AllocationSummaryCards = ({
  currency,
  loading,
  totalData,
  aggregateBy,
  allocationRange,
  aggregationLabel,
  topEntityLabel,
}) => {
  const classes = useStyles();

  const initialized = totalData && Object.keys(totalData).length > 0;

  const displayAggregation =
    aggregationLabel || aggregateBy || "group";
  const displayAggregationLower = displayAggregation.toLowerCase();
  const topLabel = topEntityLabel || displayAggregation;

  let topEntityValue = "—";
  if (allocationRange?.length > 0) {
    const latest = allocationRange[allocationRange.length - 1] || [];
    const sorted =
      latest?.slice()?.sort((a, b) => b.totalCost - a.totalCost) || [];
    if (sorted.length > 0) {
      topEntityValue = `${sorted[0].name} • ${toCurrency(
        sorted[0].totalCost,
        currency,
      )}`;
    }
  }

  const cards = [
    {
      label: "Total Spend",
      value: initialized ? toCurrency(totalData.totalCost, currency) : "—",
      secondary: `Across all ${displayAggregationLower}`,
    },
    {
      label: "CPU Spend",
      value: initialized ? toCurrency(totalData.cpuCost, currency) : "—",
      secondary: "Compute requests & usage",
    },
    {
      label: "Memory Spend",
      value: initialized ? toCurrency(totalData.ramCost, currency) : "—",
      secondary: "Includes RAM allocation & usage",
    },
    {
      label: "Storage Spend",
      value: initialized ? toCurrency(totalData.pvCost, currency) : "—",
      secondary: "Persistent volume allocation",
    },
    {
      label: "Efficiency",
      value: initialized ? formatEfficiency(totalData) : "—",
      secondary: "Allocation vs. requests",
      muted: true,
    },
    {
      label: `Top ${topLabel}`,
      value: initialized ? topEntityValue : "—",
      secondary: "Highest cost contributor",
      muted: true,
    },
  ];

  if (loading) {
    cards.forEach((c) => {
      c.value = "—";
      c.secondary = "Loading data…";
    });
  }

  return (
    <div className={classes.root}>
      {cards.map((card) => (
        <Paper
          key={card.label}
          elevation={0}
          className={`${classes.card} ${card.muted ? classes.mutedCard : ""}`}
        >
          <Typography className={classes.label}>{card.label}</Typography>
          <Typography className={classes.value}>{card.value}</Typography>
          <Typography className={classes.secondary}>
            {card.secondary}
          </Typography>
        </Paper>
      ))}
    </div>
  );
};

export default AllocationSummaryCards;
