import React from "react";
import "../../styles/AppLayout.scss";
import Header from "./Header";

interface AppLayoutProps {
  children: React.ReactNode;
}

const AppLayout: React.FC<AppLayoutProps> = ({ children }) => {
  return (
    <div className="app-layout">
      <Header />
      <main className="content-area">{children}</main>
    </div>
  );
};

export default AppLayout;
