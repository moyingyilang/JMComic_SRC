import React from "react";
import ReactDOM from "react-dom/client";
import { ErrorAlert } from "../components/Alert/Alert";

export const showErrorModal = (errorText: string) => {
  const container = document.createElement("div");
  document.body.appendChild(container);

  const root = ReactDOM.createRoot(container);

  const handleClose = () => {
    root.unmount();
    container.remove();
  };

  root.render(<ErrorAlert open={true} errorText={errorText} onClose={handleClose} />);
};
