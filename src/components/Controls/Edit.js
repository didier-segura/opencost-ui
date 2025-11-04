import React from "react";
import { makeStyles } from "@material-ui/styles";
import MenuItem from "@material-ui/core/MenuItem";
import TextField from "@material-ui/core/TextField";

import SelectWindow from "../SelectWindow";

const useStyles = makeStyles({
  wrapper: {
    alignItems: "center",
    display: "inline-flex",
    flexWrap: "wrap",
    gap: "0.75rem",
  },
  input: {
    minWidth: 150,
  },
});

function EditControl({
  windowOptions,
  window,
  setWindow,
  aggregationOptions,
  aggregateBy,
  setAggregateBy,
  accumulateOptions,
  accumulate,
  setAccumulate,
  currencyOptions,
  currency,
  setCurrency,
}) {
  const classes = useStyles();
  return (
    <div className={classes.wrapper}>
      <SelectWindow
        windowOptions={windowOptions}
        window={window}
        setWindow={setWindow}
      />
      <TextField
        select
        label="Breakdown"
        variant="outlined"
        size="small"
        value={aggregateBy}
        onChange={(e) => setAggregateBy(e.target.value)}
        className={classes.input}
      >
        {aggregationOptions.map((opt) => (
          <MenuItem key={opt.value} value={opt.value}>
            {opt.name}
          </MenuItem>
        ))}
      </TextField>

      <TextField
        select
        label="Resolution"
        variant="outlined"
        size="small"
        value={accumulate}
        onChange={(e) => setAccumulate(e.target.value)}
        className={classes.input}
      >
        {accumulateOptions.map((opt) => (
          <MenuItem key={opt.value} value={opt.value}>
            {opt.name}
          </MenuItem>
        ))}
      </TextField>

      <TextField
        select
        label="Currency"
        variant="outlined"
        size="small"
        value={currency}
        onChange={(e) => setCurrency(e.target.value)}
        className={classes.input}
      >
        {currencyOptions?.map((code) => (
          <MenuItem key={code} value={code}>
            {code}
          </MenuItem>
        ))}
      </TextField>
    </div>
  );
}

export default React.memo(EditControl);
