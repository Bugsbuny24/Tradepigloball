import { Routes, Route } from "react-router-dom";
import AdminLayout from "./AdminLayout";

import Features from "./features";
import Audit from "./audit";
import System from "./system";
import God from "./god";

export default function AdminIndex() {
  return (
    <Routes>
      <Route element={<AdminLayout />}>
        <Route index element={<Features />} />
        <Route path="features" element={<Features />} />
        <Route path="system" element={<System />} />
        <Route path="audit" element={<Audit />} />
        <Route path="god/*" element={<God />} />
      </Route>
    </Routes>
  );
}
