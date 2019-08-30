import React from "react";

import "./Backdrop.scss";

const Backdrop = React.forwardRef((props, ref) => (
  <div className="backdrop" onClick={props.onClick} ref={ref} />
));

export default Backdrop;
