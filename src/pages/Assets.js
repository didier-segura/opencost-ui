import CircularProgress from "@material-ui/core/CircularProgress";
import IconButton from "@material-ui/core/IconButton";
import Paper from "@material-ui/core/Paper";
import TextField from "@material-ui/core/TextField";
import MenuItem from "@material-ui/core/MenuItem";
import Typography from "@material-ui/core/Typography";
import RefreshIcon from "@material-ui/icons/Refresh";
import { makeStyles } from "@material-ui/styles";
import { format, parseISO } from "date-fns";
import { get, startCase } from "lodash";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useHistory, useLocation } from "react-router";

import Page from "../components/Page";
import Header from "../components/Header";
import Subtitle from "../components/Subtitle";
import Warnings from "../components/Warnings";
import Footer from "../components/Footer";
import SelectWindow from "../components/SelectWindow";
import AssetReport from "../components/assets/AssetReport";
import AssetService from "../services/assets";
import { currencyCodes } from "../constants/currencyCodes";
import { toVerboseTimeRange } from "../util";

const windowOptions = [
  { name: "Today", value: "today" },
  { name: "Yesterday", value: "yesterday" },
  { name: "Last 24h", value: "24h" },
  { name: "Last 48h", value: "48h" },
  { name: "Week-to-date", value: "week" },
  { name: "Last week", value: "lastweek" },
  { name: "Last 7 days", value: "7d" },
  { name: "Last 14 days", value: "14d" },
];

const aggregationOptions = [
  { name: "Type", value: "type" },
  { name: "Category", value: "category" },
  { name: "Cluster", value: "cluster" },
  { name: "Provider", value: "provider" },
  { name: "Unaggregated", value: "unaggregated" },
];

const useStyles = makeStyles({
  reportWrapper: {
    display: "flex",
    flexDirection: "column",
    gap: "1.75rem",
  },
  reportHeader: {
    alignItems: "flex-start",
    borderBottom: `1px solid var(--card-border)`,
    display: "flex",
    flexWrap: "wrap",
    gap: "1.5rem",
    justifyContent: "space-between",
    paddingBottom: "1.5rem",
  },
  titles: {
    flexGrow: 1,
    minWidth: 200,
  },
  controls: {
    alignItems: "center",
    display: "flex",
    flexWrap: "wrap",
    gap: "0.75rem",
    justifyContent: "flex-end",
  },
  controlInput: {
    minWidth: 160,
  },
});

const aggKeyResolvers = {
  type: (asset) => asset.type || "Uncategorized",
  category: (asset) => get(asset, "properties.category") || "Uncategorized",
  cluster: (asset) => get(asset, "properties.cluster") || "Unclustered",
  provider: (asset) => get(asset, "properties.provider") || "Unknown Provider",
};

const formatTypeLabel = (type) => {
  if (!type) {
    return "Uncategorized";
  }
  const lookup = type.toLowerCase();
  switch (lookup) {
    case "node":
      return "Node";
    case "disk":
      return "Disk";
    case "loadbalancer":
      return "Load Balancer";
    case "clustermanagement":
      return "Cluster Management";
    case "network":
      return "Network";
    default:
      return startCase(type);
  }
};

const MS_IN_MINUTE = 60 * 1000;
const MS_IN_DAY = 24 * 60 * 60 * 1000;

const startOfUTC = (date) =>
  new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()));

const addDaysUTC = (date, days) =>
  new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate() + days));

const buildDailyBuckets = (windowStart, windowEnd) => {
  if (!windowStart || !windowEnd) {
    return new Map();
  }

  const start = startOfUTC(windowStart);
  const end = new Date(windowEnd.getTime() - 1);
  const endDay = startOfUTC(end);

  const buckets = new Map();
  for (
    let cursor = new Date(start);
    cursor <= endDay;
    cursor = addDaysUTC(cursor, 1)
  ) {
    buckets.set(format(cursor, "yyyy-MM-dd"), 0);
  }

  return buckets;
};

const distributeCostAcrossDays = (asset, buckets) => {
  if (!asset.start || !asset.end || asset.totalCost === undefined) {
    return;
  }

  const start = new Date(asset.start);
  const end = new Date(asset.end);

  if (!(start < end)) {
    return;
  }

  const minutes = asset.minutes || (end.getTime() - start.getTime()) / MS_IN_MINUTE;
  if (!minutes || minutes <= 0) {
    return;
  }

  const costPerMs = asset.totalCost / (minutes * MS_IN_MINUTE);
  let cursor = startOfUTC(start);

  while (cursor < end) {
    const dayStart = cursor;
    const dayEnd = new Date(dayStart.getTime() + MS_IN_DAY);
    const overlapStart = Math.max(start.getTime(), dayStart.getTime());
    const overlapEnd = Math.min(end.getTime(), dayEnd.getTime());
    if (overlapEnd > overlapStart) {
      const key = format(dayStart, "yyyy-MM-dd");
      const existing = buckets.get(key) || 0;
      buckets.set(key, existing + costPerMs * (overlapEnd - overlapStart));
    }
    cursor = dayEnd;
  }
};

const formatWindowTitle = (window, aggregateBy) => {
  const aggOption =
    aggregationOptions.find((opt) => opt.value === aggregateBy)?.name || aggregateBy;
  return `${toVerboseTimeRange(window)} by ${aggOption}`;
};

const AssetsPage = () => {
  const classes = useStyles();
  const routerLocation = useLocation();
  const routerHistory = useHistory();
  const searchParams = new URLSearchParams(routerLocation.search);

  const win = searchParams.get("window") || "7d";
  const aggregateBy = searchParams.get("agg") || "type";
  const currency = searchParams.get("currency") || "USD";

  const [assets, setAssets] = useState([]);
  const [windowInfo, setWindowInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [errors, setErrors] = useState([]);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setErrors([]);
    try {
      const resp = await AssetService.fetchAssets(win);
      const assetSet = resp?.data;
      const assetsMap = assetSet?.assets || {};
      const normalizedAssets = Object.values(assetsMap).map((asset) => ({
        ...asset,
        start: asset.start ? parseISO(asset.start) : null,
        end: asset.end ? parseISO(asset.end) : null,
      }));
      setAssets(normalizedAssets);
      setWindowInfo(assetSet?.window || null);
    } catch (err) {
      setErrors([
        {
          primary: "Failed to load asset data",
          secondary: err?.message || "Please try again.",
        },
      ]);
      setAssets([]);
      setWindowInfo(null);
    } finally {
      setLoading(false);
    }
  }, [win]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const groupedData = useMemo(() => {
    if (!assets || assets.length === 0) {
      return [];
    }

    if (aggregateBy === "unaggregated") {
      return assets
        .map((asset, index) => {
          const typeLabel = formatTypeLabel(asset.type);
          const name =
            get(asset, "properties.name") ||
            get(asset, "properties.providerID") ||
            `${typeLabel} ${index + 1}`;
          const detailsSet = new Set();
          const providerId = get(asset, "properties.providerID");
          const service = get(asset, "properties.service");
          const cluster = get(asset, "properties.cluster");
          if (providerId) {
            detailsSet.add(providerId);
          }
          if (service) {
            detailsSet.add(service);
          }
          if (cluster) {
            detailsSet.add(cluster);
          }

          return {
            key:
              providerId ||
              get(asset, "properties.name") ||
              `${asset.type || "asset"}-${index}`,
            name,
            totalCost: asset.totalCost || 0,
            adjustment: asset.adjustment || 0,
            credit: asset.credit || 0,
            iconKey: asset.type || null,
            details: Array.from(detailsSet),
          };
        })
        .sort((a, b) => (b.totalCost || 0) - (a.totalCost || 0));
    }

    const resolver = aggKeyResolvers[aggregateBy] || aggKeyResolvers.type;
    const groups = new Map();

    assets.forEach((asset) => {
      const key = resolver(asset);
      const iconKey = aggregateBy === "type" ? asset.type : null;
      if (!groups.has(key)) {
        groups.set(key, {
          key,
          name:
            aggregateBy === "type"
              ? formatTypeLabel(asset.type)
              : key || "Uncategorized",
          totalCost: 0,
          adjustment: 0,
          credit: 0,
          iconKey: iconKey || null,
          details: new Set(),
        });
      }

      const group = groups.get(key);
      group.totalCost += asset.totalCost || 0;
      group.adjustment += asset.adjustment || 0;
      group.credit += asset.credit || 0;
      if (aggregateBy === "type") {
        const detailCandidate =
          get(asset, "properties.name") ||
          get(asset, "properties.providerID") ||
          get(asset, "properties.service");
        if (detailCandidate) {
          group.details.add(detailCandidate);
        }
      }
    });

    return Array.from(groups.values())
      .map((group) => ({
        ...group,
        details: Array.from(group.details).slice(0, 3),
      }))
      .sort((a, b) => (b.totalCost || 0) - (a.totalCost || 0));
  }, [assets, aggregateBy]);

  const totals = useMemo(() => {
    return groupedData.reduce(
      (acc, group) => {
        acc.totalCost += group.totalCost || 0;
        acc.adjustment += group.adjustment || 0;
        acc.credit += group.credit || 0;
        return acc;
      },
      { totalCost: 0, adjustment: 0, credit: 0 },
    );
  }, [groupedData]);

  const dailyTotals = useMemo(() => {
    if (!assets || assets.length === 0) {
      return [];
    }

    let windowStart = windowInfo?.start ? parseISO(windowInfo.start) : null;
    let windowEnd = windowInfo?.end ? parseISO(windowInfo.end) : null;
    let buckets = buildDailyBuckets(windowStart, windowEnd);

    if (buckets.size === 0) {
      // Fallback to derive range directly from asset timestamps if window data is unavailable
      const validAssets = assets.filter((asset) => asset.start && asset.end);
      if (validAssets.length === 0) {
        return [];
      }

      windowStart = validAssets.reduce(
        (acc, asset) =>
          acc && acc < asset.start ? acc : asset.start,
        validAssets[0].start,
      );
      windowEnd = validAssets.reduce(
        (acc, asset) =>
          acc && acc > asset.end ? acc : asset.end,
        validAssets[0].end,
      );

      buckets = buildDailyBuckets(windowStart, windowEnd);
    }

    if (buckets.size === 0) {
      return [];
    }

    assets.forEach((asset) => distributeCostAcrossDays(asset, buckets));

    return Array.from(buckets.entries()).map(([date, cost]) => ({
      date,
      cost,
    }));
  }, [assets, windowInfo]);

  const handleSelectGroup = useCallback(
    (group) => {
      if (aggregateBy !== "type") {
        return;
      }
      const nextParams = new URLSearchParams(routerLocation.search);
      nextParams.set("agg", "unaggregated");
      nextParams.set("filters", `assetType:"${group.key}"`);
      routerHistory.push({
        search: `?${nextParams.toString()}`,
      });
    },
    [aggregateBy, routerHistory, routerLocation.search],
  );

  const selectableHandler =
    aggregateBy === "type" ? handleSelectGroup : undefined;

  const title = formatWindowTitle(win, aggregateBy);

  return (
    <Page active="reports.html">
      <Header headerTitle="Assets" eyebrow="Monitor">
        <IconButton aria-label="refresh" onClick={fetchData}>
          <RefreshIcon />
        </IconButton>
      </Header>

      {errors.length > 0 && !loading && (
        <div style={{ marginBottom: 20 }}>
          <Warnings warnings={errors} />
        </div>
      )}

      <Paper elevation={0} className={classes.reportWrapper}>
        <div className={classes.reportHeader}>
          <div className={classes.titles}>
            <Typography variant="h5">{title}</Typography>
            <Subtitle report={{ window: win, aggregateBy }} />
          </div>
          <div className={classes.controls}>
            <SelectWindow
              windowOptions={windowOptions}
              window={win}
              setWindow={(value) => {
                searchParams.set("window", value);
                routerHistory.push({
                  search: `?${searchParams.toString()}`,
                });
              }}
            />
            <TextField
              select
              label="Group By"
              variant="outlined"
              size="small"
              value={aggregateBy}
              onChange={(event) => {
                searchParams.set("agg", event.target.value);
                routerHistory.push({
                  search: `?${searchParams.toString()}`,
                });
              }}
              className={classes.controlInput}
            >
              {aggregationOptions.map((opt) => (
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
              onChange={(event) => {
                searchParams.set("currency", event.target.value);
                routerHistory.push({
                  search: `?${searchParams.toString()}`,
                });
              }}
              className={classes.controlInput}
            >
              {currencyCodes.map((code) => (
                <MenuItem key={code} value={code}>
                  {code}
                </MenuItem>
              ))}
            </TextField>
          </div>
        </div>

        {loading ? (
          <div style={{ display: "flex", justifyContent: "center" }}>
            <div style={{ paddingTop: 100, paddingBottom: 100 }}>
              <CircularProgress />
            </div>
          </div>
        ) : (
          <AssetReport
            currency={currency}
            dailyTotals={dailyTotals}
            groups={groupedData}
            totals={totals}
            onSelectGroup={selectableHandler}
          />
        )}
      </Paper>

      <Footer />
    </Page>
  );
};

export default React.memo(AssetsPage);
