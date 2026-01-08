import React from "react";

export default function PageShell({ title, subtitle, right, children }) {
  return (
    <div className="container">
      <div className="row" style={{ justifyContent: "space-between", marginBottom: 14 }}>
        <div className="col" style={{ gap: 6 }}>
          <h1 className="h1">{title}</h1>
          {subtitle ? <p className="p">{subtitle}</p> : null}
        </div>
        {right ? <div className="row">{right}</div> : null}
      </div>

      <div className="card cardPad">{children}</div>
    </div>
  );
}
