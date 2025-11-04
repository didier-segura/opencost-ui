import React from "react";
import { makeStyles } from "@material-ui/styles";
import Paper from "@material-ui/core/Paper";
import Table from "@material-ui/core/Table";
import TableBody from "@material-ui/core/TableBody";
import TableCell from "@material-ui/core/TableCell";
import TableContainer from "@material-ui/core/TableContainer";
import TableHead from "@material-ui/core/TableHead";
import TableRow from "@material-ui/core/TableRow";
import Typography from "@material-ui/core/Typography";
import Chip from "@material-ui/core/Chip";
import {
  DeveloperBoard,
  Storage,
  Router,
  SettingsApplications,
  NetworkCheck,
} from "@material-ui/icons";
import { toCurrency } from "../../util";

const useStyles = makeStyles({
  container: {
    borderRadius: 16,
    border: `1px solid var(--card-border)`,
    overflow: "hidden",
  },
  tableHead: {
    backgroundColor: "#f8fafc",
  },
  headerCell: {
    color: "var(--text-secondary)",
    fontWeight: 600,
    letterSpacing: "0.05em",
    textTransform: "uppercase",
  },
  totalRow: {
    backgroundColor: "rgba(74, 222, 128, 0.08)",
    fontWeight: 600,
  },
  emptyState: {
    padding: "2rem",
    textAlign: "center",
  },
  nameCell: {
    display: "flex",
    flexDirection: "column",
    gap: "0.4rem",
  },
  nameRow: {
    alignItems: "center",
    display: "flex",
    gap: "0.6rem",
  },
  iconBubble: {
    alignItems: "center",
    background: "rgba(34, 197, 94, 0.12)",
    borderRadius: 12,
    color: "#16a34a",
    display: "inline-flex",
    height: 32,
    justifyContent: "center",
    width: 32,
  },
  detailsRow: {
    display: "flex",
    flexWrap: "wrap",
    gap: "0.4rem",
  },
  detailChip: {
    background: "rgba(148, 163, 184, 0.14)",
    color: "#475569",
    fontWeight: 500,
  },
});

const typeIconMap = {
  node: DeveloperBoard,
  disk: Storage,
  loadbalancer: Router,
  clustermanagement: SettingsApplications,
  network: NetworkCheck,
};

const AssetTable = ({ groups, totals, currency, onRowSelect }) => {
  const classes = useStyles();

  if (!groups || groups.length === 0) {
    return (
      <Paper className={classes.emptyState} elevation={0}>
        <Typography variant="body2">
          No assets matched the selected filters.
        </Typography>
      </Paper>
    );
  }

  return (
    <TableContainer component={Paper} elevation={0} className={classes.container}>
      <Table stickyHeader size="medium">
        <TableHead className={classes.tableHead}>
          <TableRow>
            <TableCell className={classes.headerCell}>Name</TableCell>
            <TableCell className={classes.headerCell} align="right">
              Credits
            </TableCell>
            <TableCell className={classes.headerCell} align="right">
              Adjusted
            </TableCell>
            <TableCell className={classes.headerCell} align="right">
              Cost
            </TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          <TableRow className={classes.totalRow}>
            <TableCell>Total</TableCell>
            <TableCell align="right">
              {toCurrency(totals.credit || 0, currency, 2)}
            </TableCell>
            <TableCell align="right">
              {toCurrency(
                (totals.totalCost || 0) + (totals.adjustment || 0),
                currency,
                2,
              )}
            </TableCell>
            <TableCell align="right">
              {toCurrency(totals.totalCost || 0, currency, 2)}
            </TableCell>
          </TableRow>
          {groups.map((group) => {
            const isClickable = typeof onRowSelect === "function";
            return (
              <TableRow
                key={group.key}
                hover={isClickable}
                onClick={
                  isClickable ? () => onRowSelect && onRowSelect(group) : undefined
                }
                style={{ cursor: isClickable ? "pointer" : "default" }}
              >
                <TableCell>
                  <div className={classes.nameCell}>
                    <div className={classes.nameRow}>
                      {group.iconKey && typeIconMap[group.iconKey.toLowerCase()] && (
                        <span className={classes.iconBubble}>
                        {React.createElement(
                          typeIconMap[group.iconKey.toLowerCase()],
                          { fontSize: "small" },
                        )}
                      </span>
                    )}
                    <Typography variant="subtitle1">{group.name}</Typography>
                  </div>
                  {group.details && group.details.length > 0 && (
                    <div className={classes.detailsRow}>
                      {group.details.map((detail) => (
                        <Chip
                          key={detail}
                          label={detail}
                          size="small"
                          className={classes.detailChip}
                        />
                      ))}
                    </div>
                  )}
                </div>
              </TableCell>
              <TableCell align="right">
                {toCurrency(group.credit || 0, currency, 2)}
              </TableCell>
              <TableCell align="right">
                {toCurrency(
                  (group.totalCost || 0) + (group.adjustment || 0),
                  currency,
                  2,
                )}
              </TableCell>
                  <TableCell align="right">
                    {toCurrency(group.totalCost || 0, currency, 2)}
                  </TableCell>
                </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

export default React.memo(AssetTable);
