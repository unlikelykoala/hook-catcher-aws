import { BrowserRouter, Route, Routes } from "react-router-dom";

import { BinViewPage } from "@/features/bins/pages/BinViewPage";
import { HomePage } from "@/features/bins/pages/HomePage";

export function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/bins/:id" element={<BinViewPage />} />
      </Routes>
    </BrowserRouter>
  );
}
