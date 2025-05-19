// src/pages/AppLayout.jsx
import { Outlet } from "react-router-dom";
import Header from "./Header"; // Corrected: Local import
import Footer from "./Footer"; // Corrected: Local import
import styles from "./AppLayout.module.css";

const AppLayout = () => {
  return (
    <div className={styles.appLayout}>
      <Header />
      <main className={styles.mainContent}>
        <Outlet />
      </main>
      <Footer />
    </div>
  );
};

export default AppLayout;