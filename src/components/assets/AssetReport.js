import React from "react";
import { makeStyles } from "@material-ui/styles";
import AssetChart from "./AssetChart";
import AssetTable from "./AssetTable";

const useStyles = makeStyles({
  root: {
    display: "flex",
    flexDirection: "column",
    gap: "1.5rem",
  },
});

const AssetReport = ({ currency, dailyTotals, groups, totals, onSelectGroup }) => {
  const classes = useStyles();

  return (
    <div className={classes.root}>
      <AssetChart data={dailyTotals} currency={currency} />
      <AssetTable
        groups={groups}
        totals={totals}
        currency={currency}
        onRowSelect={onSelectGroup}
      />
    </div>
  );
};

export default React.memo(AssetReport);
