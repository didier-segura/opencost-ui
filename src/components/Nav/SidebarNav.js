import * as React from "react";
import {
  Drawer,
  List,
  Typography,
  ListItem,
  ListItemText,
  Collapse,
} from "@material-ui/core";
import { NavItem } from "./NavItem";
import {
  AttachMoney,
  BarChart,
  CloudQueue,
  DeviceHub,
  ExpandLess,
  ExpandMore,
  Speed,
  Timeline,
  AllInbox,
} from "@material-ui/icons";
import { makeStyles } from "@material-ui/styles";

const logo = new URL("../../images/logo.png", import.meta.url).href;

const DRAWER_WIDTH = 260;

const SidebarNav = ({ active }) => {
  const useStyles = makeStyles({
    drawer: {
      width: DRAWER_WIDTH,
      flexShrink: 0,
    },
    drawerPaper: {
      backgroundColor: "var(--sidebar-bg)",
      border: 0,
      borderRight: `1px solid var(--sidebar-border)`,
      color: "var(--sidebar-text)",
      display: "flex",
      flexDirection: "column",
      paddingBottom: "2rem",
      width: DRAWER_WIDTH,
      paddingLeft: "1.5rem",
      paddingRight: "1.5rem",
      paddingTop: "2.5rem",
    },
    brand: {
      alignItems: "center",
      display: "flex",
      flexDirection: "column",
      gap: "0.75rem",
      paddingBottom: "2.5rem",
    },
    brandText: {
      alignItems: "center",
      display: "flex",
      flexDirection: "column",
      gap: "0.25rem",
      textAlign: "center",
    },
    sectionHeader: {
      borderRadius: 14,
      color: "#cbd5f5",
      fontWeight: 600,
      letterSpacing: "0.08em",
      marginBottom: 8,
      paddingLeft: 12,
      paddingRight: 12,
      textTransform: "uppercase",
      "&:hover": {
        backgroundColor: "rgba(148, 163, 184, 0.12)",
      },
    },
    sectionHeaderActive: {
      backgroundColor: "rgba(148, 163, 184, 0.12)",
    },
    sectionHeaderIcon: {
      color: "#94a3b8",
    },
    nestedList: {
      paddingTop: 2,
      paddingBottom: 2,
    },
  });

  const classes = useStyles();

  const [init, setInit] = React.useState(false);

  React.useEffect(() => {
    if (!init) {
      setInit(true);
    }
  }, [init]);

  const sections = React.useMemo(
    () => [
      {
        key: "monitor",
        title: "Monitor",
        items: [
          {
            name: "Allocations",
            href: "allocation",
            icon: <BarChart />,
            isActive: (path) => path === "/allocation" || path === "/",
          },
          { name: "Assets", href: "assets", icon: <AllInbox /> },
          { name: "Clusters", href: "clusters", icon: <DeviceHub /> },
          { name: "Efficiency", href: "efficiency", icon: <Speed /> },
          { name: "Network", href: "network", icon: <Timeline /> },
        ],
      },
      {
        key: "cloud-spend",
        title: "Cloud Spend",
        items: [{ name: "Cloud Costs", href: "cloud", icon: <CloudQueue /> }],
      },
      {
        key: "off-cluster-spend",
        title: "Off-Cluster Spend",
        items: [
          { name: "External Costs", href: "external-costs", icon: <AttachMoney /> },
        ],
      },
    ],
    []
  );

  const isItemActive = React.useCallback((item, path) => {
    if (typeof item.isActive === "function") {
      return item.isActive(path);
    }
    return path === `/${item.href}`;
  }, []);

  const [openSections, setOpenSections] = React.useState(() => {
    const initial = {};
    sections.forEach((section) => {
      const hasActive = section.items.some((item) => isItemActive(item, active));
      initial[section.key] = hasActive || section.defaultOpen || false;
    });
    return initial;
  });

  React.useEffect(() => {
    setOpenSections((prev) => {
      const next = { ...prev };
      sections.forEach((section) => {
        if (section.items.some((item) => isItemActive(item, active))) {
          next[section.key] = true;
        }
      });
      return next;
    });
  }, [active, sections, isItemActive]);

  const toggleSection = (sectionKey) => {
    setOpenSections((prev) => ({
      ...prev,
      [sectionKey]: !prev[sectionKey],
    }));
  };

  return (
    <Drawer
      anchor={"left"}
      className={classes.drawer}
      classes={{ paper: classes.drawerPaper }}
      variant={"permanent"}
    >
      <div className={classes.brand}>
        <img src={logo} alt="OpenCost" style={{ height: 36 }} />
        <div className={classes.brandText}>
          <Typography variant="subtitle2" style={{ color: "#94a3b8" }}>
            Powered by
          </Typography>
          <Typography variant="h6" style={{ color: "#f8fafc" }}>
            OpenCost
          </Typography>
        </div>
      </div>
      <List style={{ flexGrow: 1 }} disablePadding>
        {sections.map((section) => {
          const open = !!openSections[section.key];
          return (
            <React.Fragment key={section.key}>
              <ListItem
                button
                onClick={() => toggleSection(section.key)}
                className={`${classes.sectionHeader} ${
                  open ? classes.sectionHeaderActive : ""
                }`}
              >
                <ListItemText primary={section.title} />
                {open ? (
                  <ExpandLess className={classes.sectionHeaderIcon} />
                ) : (
                  <ExpandMore className={classes.sectionHeaderIcon} />
                )}
              </ListItem>
              <Collapse in={open} timeout="auto" unmountOnExit>
                <List component="div" disablePadding className={classes.nestedList}>
                  {section.items.map((item) => (
                    <NavItem
                      active={isItemActive(item, active)}
                      key={item.name}
                      nested
                      {...item}
                    />
                  ))}
                </List>
              </Collapse>
            </React.Fragment>
          );
        })}
      </List>
    </Drawer>
  );
};

export { SidebarNav };
