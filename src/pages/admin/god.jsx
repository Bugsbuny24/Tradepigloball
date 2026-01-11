import { Routes, Route, NavLink } from "react-router-dom";
import Economy from "./god/economy";
import Emergency from "./god/emergency";
import Features from "./god/features";

export default function God() {
  return (
    <>
      <h2 style={{ color: "red" }}>☠ GOD MODE</h2>

      <NavLink to="economy">💳 Economy</NavLink>{" | "}
      <NavLink to="features">🎛 Override</NavLink>{" | "}
      <NavLink to="emergency">🚨 Emergency</NavLink>

      <hr/>

      <Routes>
        <Route path="economy" element={<Economy />} />
        <Route path="features" element={<Features />} />
        <Route path="emergency" element={<Emergency />} />
      </Routes>
    </>
  );
}
