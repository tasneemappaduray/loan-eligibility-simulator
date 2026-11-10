import { Route, Routes } from "react-router-dom";
import Layout from "./components/Layout/Layout";
import { ROUTES } from "./config/routes";
import HowItWorksPage from "./pages/HowItWorksPage";
import NotFoundPage from "./pages/NotFoundPage";
import ProductsPage from "./pages/ProductsPage";
import SimulatorPage from "./pages/SimulatorPage";

// Which page shows for which address.
export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path={ROUTES.products} element={<ProductsPage />} />
        <Route path={ROUTES.simulator} element={<SimulatorPage />} />
        <Route path={ROUTES.howItWorks} element={<HowItWorksPage />} />
        <Route path={ROUTES.notFound} element={<NotFoundPage />} />
      </Route>
    </Routes>
  );
}
