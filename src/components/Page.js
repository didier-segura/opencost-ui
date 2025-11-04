import { makeStyles } from "@material-ui/styles";
import * as React from "react";
import { useLocation } from "react-router-dom";
import { SidebarNav } from "./Nav/SidebarNav";

const useStyles = makeStyles({
  body: {
    background: "var(--page-bg)",
    display: "flex",
    minHeight: "100vh",
  },
  content: {
    display: "flex",
    flexDirection: "column",
    flexGrow: 1,
    paddingBottom: "3rem",
    paddingTop: "3rem",
  },
  wrapper: {
    display: "flex",
    flexDirection: "column",
    flexGrow: 1,
    margin: "0 auto",
    maxWidth: "1440px",
    paddingLeft: "3rem",
    paddingRight: "3rem",
    width: "100%",
  },
  inner: {
    display: "flex",
    flexDirection: "column",
    gap: "24px",
  },
});

const Page = (props) => {
  const classes = useStyles();

  const { pathname } = useLocation();

  return (
    <div className={classes.body}>
      <SidebarNav active={pathname} />
      <div className={classes.content}>
        <div className={classes.wrapper}>
          <div className={classes.inner}>{props.children}</div>
        </div>
      </div>
    </div>
  );
};

export default Page;
