import React from "react";
import { makeStyles } from "@material-ui/styles";
import Typography from "@material-ui/core/Typography";
import Paper from "@material-ui/core/Paper";
import {
  ResponsiveContainer,
  BarChart,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  Bar,
} from "recharts";
import { toCurrency } from "../../util";

const useStyles = makeStyles({
  root: {
    background: "linear-gradient(135deg, rgba(74, 222, 128, 0.08), rgba(56, 189, 248, 0.06))",
    borderRadius: 18,
    padding: "1.5rem",
  },
  chartContainer: {
    height: 280,
  },
});

const SHORT_CURRENCY_FORMATTER = (currency) =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
    notation: "compact",
    maximumFractionDigits: 1,
  });

const AssetTooltip = ({ active, payload, label, currency }) => {
  if (!active || !payload || payload.length === 0) {
    return null;
  }

  const value = payload[0].value;

  return (
    <Paper elevation={3} style={{ padding: "0.75rem 1rem" }}>
      <Typography variant="subtitle2">{label}</Typography>
      <Typography variant="body2">
        {toCurrency(value, currency, 2)}
      </Typography>
    </Paper>
  );
};

const AssetChart = ({ data, currency }) => {
  const classes = useStyles();

  if (!data || data.length === 0) {
    return (
      <Paper className={classes.root}>
        <Typography variant="body2">No asset cost data for this window.</Typography>
      </Paper>
    );
  }

  const axisFormatter = SHORT_CURRENCY_FORMATTER(currency);

  return (
    <Paper className={classes.root} elevation={0}>
      <div className={classes.chartContainer}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} />
            <XAxis dataKey="date" />
            <YAxis
              tickFormatter={(value) => axisFormatter.format(value)}
              width={80}
            />
            <Tooltip
              cursor={{ fill: "rgba(74, 222, 128, 0.12)" }}
              content={<AssetTooltip currency={currency} />}
            />
            <Bar dataKey="cost" fill="#22c55e" radius={[8, 8, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </Paper>
  );
};

export default React.memo(AssetChart);
