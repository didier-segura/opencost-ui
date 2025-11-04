import * as React from "react";
import { ListItem, ListItemIcon, ListItemText } from "@material-ui/core";
import { Link } from "react-router-dom";
import { makeStyles } from "@material-ui/styles";

const NavItem = ({
  active,
  href,
  name,
  onClick,
  secondary,
  title,
  icon,
  nested = false,
}) => {
  const useStyles = makeStyles({
    root: {
      borderRadius: 14,
      color: "var(--sidebar-text)",
      cursor: "pointer",
      marginBottom: 6,
      paddingLeft: 12,
      paddingRight: 12,
      transition: "background-color 120ms ease, color 120ms ease",
      "&:hover": {
        backgroundColor: "rgba(148, 163, 184, 0.12)",
        color: "#e2e8f0",
      },
    },
    nested: {
      paddingLeft: nested ? 24 : 12,
    },
    active: {
      backgroundColor: "rgba(74, 222, 128, 0.14)",
      color: "#f8fafc",
    },
    text: {
      fontWeight: 500,
      maxWidth: 200,
      overflow: "hidden",
      textOverflow: "ellipsis",
      whiteSpace: "nowrap",
    },
    icon: {
      color: "inherit",
      minWidth: 42,
    },
    secondary: {
      color: "#94a3b8",
    },
  });
  const classes = useStyles();

  const listItemClasses = {
    root: `${classes.root} ${classes.nested} ${active ? classes.active : ""}`,
  };
  const listItemIconClasses = { root: classes.icon };
  const listItemTextClasses = {
    primary: classes.text,
    secondary: classes.secondary,
  };

  const renderListItemCore = () => (
    <ListItem
      className={active ? "active" : ""}
      classes={listItemClasses}
      onClick={(e) => {
        if (onClick) {
          onClick();
          e.stopPropagation();
        }
      }}
      selected={active}
      button
      title={title}
    >
      <ListItemIcon classes={listItemIconClasses}>{icon}</ListItemIcon>
      <ListItemText
        classes={listItemTextClasses}
        primary={name}
        secondary={secondary}
      />
    </ListItem>
  );

  return href && !active ? (
    <Link
      style={{ textDecoration: "none", color: "inherit" }}
      to={`/${href}`}
    >
      {renderListItemCore()}
    </Link>
  ) : (
    renderListItemCore()
  );
};

export { NavItem };
