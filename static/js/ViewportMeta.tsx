import { Helmet } from "react-helmet";
import { useLocation } from "react-router-dom";

const ViewportMeta = () => {
  const location = useLocation();
  const pathSegments = location.pathname.split("/");
  const lastSegment = pathSegments[pathSegments.length - 1];

  const viewportContent =
    lastSegment === "read"
      ? "width=device-width, initial-scale=1, maximum-scale=4, user-scalable=yes, viewport-fit=cover"
      : "width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no, viewport-fit=cover";

  return (
    <Helmet>
      <meta name="viewport" content={viewportContent} />
    </Helmet>
  );
};

export default ViewportMeta;
