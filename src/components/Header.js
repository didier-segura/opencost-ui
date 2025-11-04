import * as React from "react";
import { makeStyles } from "@material-ui/styles";
import Breadcrumbs from "@material-ui/core/Breadcrumbs";
import Link from "@material-ui/core/Link";
import Typography from "@material-ui/core/Typography";

const useStyles = makeStyles({
  root: {
    alignItems: "flex-start",
    display: "flex",
    flexWrap: "wrap",
    gap: "1.5rem",
    justifyContent: "space-between",
    width: "100%",
  },
  titleGroup: {
    display: "flex",
    flexDirection: "column",
    gap: "0.4rem",
  },
  actions: {
    alignItems: "center",
    display: "flex",
    gap: "0.5rem",
  },
  eyebrow: {
    backgroundColor: "rgba(74, 222, 128, 0.16)",
    borderRadius: 999,
    color: "#4ade80",
    display: "inline-flex",
    fontSize: "0.75rem",
    fontWeight: 600,
    letterSpacing: "0.08em",
    padding: "0.35rem 0.85rem",
    textTransform: "uppercase",
    width: "fit-content",
  },
  breadcrumbs: {
    "& a": {
      color: "#94a3b8",
    },
    "& li:last-child": {
      color: "var(--text-primary)",
      fontWeight: 500,
    },
  },
});

const Header = (props) => {
  const classes = useStyles();
  const { title, breadcrumbs, headerTitle, eyebrow } = props;

  return (
    <div className={classes.root}>
      <div className={classes.titleGroup}>
        {eyebrow && <span className={classes.eyebrow}>{eyebrow}</span>}
        <Typography variant="h3">{headerTitle}</Typography>
        {title && (
          <Typography variant="subtitle1" color="textSecondary">
            {title}
          </Typography>
        )}
        {breadcrumbs && breadcrumbs.length > 0 && (
          <Breadcrumbs
            aria-label="breadcrumb"
            className={classes.breadcrumbs}
            separator="›"
          >
            {breadcrumbs.slice(0, breadcrumbs.length - 1).map((b) => (
              <Link color="inherit" href={b.href} key={b.name}>
                {b.name}
              </Link>
            ))}
            <Typography color="textPrimary">
              {breadcrumbs[breadcrumbs.length - 1].name}
            </Typography>
          </Breadcrumbs>
        )}
      </div>
      <div className={classes.actions}>{props.children}</div>
    </div>
  );
};

export default Header;
