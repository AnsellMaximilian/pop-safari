"use client";

import privateRoute from "@/hooks/privateRoute";
import React from "react";

function Dashboard() {
  return <div>Dashboard</div>;
}

export default privateRoute(Dashboard);
