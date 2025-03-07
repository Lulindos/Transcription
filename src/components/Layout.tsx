import React, { useState } from "react";
import { Outlet } from "react-router-dom";
import Sidebar from "./Sidebar";
import Header from "./Header";
import Footer from "./Footer";

const Layout = () => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(true);

  const toggleSidebar = () => {
    setSidebarCollapsed(!sidebarCollapsed);
  };

  return (
    <div className="flex flex-col min-h-screen bg-white">
      <Header 
        onSettingsClick={() => console.log("Settings clicked")} 
        onHelpClick={() => console.log("Help clicked")} 
      />

      <div className="flex flex-1 overflow-hidden">
        <Sidebar
          collapsed={sidebarCollapsed}
          onToggleCollapse={toggleSidebar}
          onNoiseReductionChange={() => {}}
          onMicSensitivityChange={() => {}}
          onAutoDetectLanguageChange={() => {}}
          onAutoSaveChange={() => {}}
          onSaveIntervalChange={() => {}}
        />

        <main className="flex-grow p-4 md:p-6 overflow-auto">
          <Outlet />
        </main>
      </div>

      <Footer version="1.0.0" />
    </div>
  );
};

export default Layout;
