import { useState } from "react";
import { Slide, SlideProps, Snackbar, SnackbarContent } from "@mui/material";

function SlideTransition(props: SlideProps) {
  return <Slide {...props} direction="down" />;
}

export type SnackbarType = "success" | "error" | "warning" | "info";

export type SnackbarData = {
  key: number;
  msg: string;
  type: SnackbarType;
  marginTop?: string;
};

export const useSnackbarState = () => {
  const [snackbars, setSnackbars] = useState<SnackbarData[]>([]);

  // 新增 marginTop 參數，預設 undefined
  const showSnackbar = (msg: string, type: SnackbarType = "info", marginTop?: string) => {
    const newSnackbar: SnackbarData = {
      key: Date.now() + Math.random(),
      msg,
      type,
      marginTop,
    };
    setSnackbars((prev) => {
      const newState = [...prev, newSnackbar];
      if (newState.length > 3) {
        newState.shift();
      }
      return newState;
    });
  };

  return { snackbars, setSnackbars, showSnackbar };
};

export default function PositionedSnackbar({
  snackbars,
  setSnackbars,
}: {
  snackbars: SnackbarData[];
  setSnackbars: React.Dispatch<React.SetStateAction<SnackbarData[]>>;
}) {
  const getSnackbarColor = (type: SnackbarType) => {
    switch (type) {
      case "success":
        return { backgroundColor: "#1f7a1f", color: "#fff" };
      case "error":
        return { backgroundColor: "#c4201d", color: "#fff" };
      case "warning":
        return { backgroundColor: "#fffde8", color: "#000" };
      default:
        return { backgroundColor: "#868686", color: "#fff" };
    }
  };

  const removeSnackbar = (key: number) => {
    setSnackbars((prev) => prev.filter((snackbar) => snackbar.key !== key));
  };

  return (
    <>
      {[...snackbars].reverse().map((snackbar, index) => {
        const baseTop = snackbar.marginTop ? `calc(${snackbar.marginTop} + ${index * 70}px)` : `${index * 70}px`;
        return (
          <Snackbar
            key={snackbar.key}
            open
            autoHideDuration={5000}
            onClose={(_: any, reason: string) => {
              if (reason === "clickaway") return;
              removeSnackbar(snackbar.key);
            }}
            TransitionComponent={SlideTransition}
            anchorOrigin={{ vertical: "top", horizontal: "center" }}
            sx={{
              top: baseTop,
              "&.MuiSnackbar-root": {
                maxWidth: "40%",
                margin: "0 auto",
              },
            }}
          >
            <SnackbarContent
              elevation={1}
              message={snackbar.msg}
              sx={{
                ...getSnackbarColor(snackbar.type),
                borderRadius: "4px",
                boxShadow: "0 2px 6px rgba(0,0,0,0.2)",
              }}
            />
          </Snackbar>
        );
      })}
    </>
  );
}
