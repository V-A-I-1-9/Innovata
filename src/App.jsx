import { lazy, Suspense } from "react";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import Spinner from "./pages/Spinner";
import "./App.css";

const AppLayout = lazy(() => import("./pages/AppLayout"));
const Home = lazy(() => import("./components/home/Home"));
const Project = lazy(() => import("./components/project/Project"));
const Announcements = lazy(() =>
  import("./components/announcements/Announcements")
);
const Prizes = lazy(() => import("./components/prizes/Prizes"));
const Formats = lazy(() => import("./components/formats/Formats"));
const PageNotFound = lazy(() => import("./pages/PageNotFound"));

function App() {
  return (
    <BrowserRouter>
      <Suspense fallback={<Spinner />}>
        <Routes>
          <Route path="/" element={<AppLayout />}>
            <Route index element={<Home />} />
            <Route path="project" element={<Project />} />
            <Route path="announcements" element={<Announcements />} />
            <Route path="prizes" element={<Prizes />} />
            <Route path="formats" element={<Formats />} />
            <Route path="*" element={<PageNotFound />} />
          </Route>
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
}

export default App;
