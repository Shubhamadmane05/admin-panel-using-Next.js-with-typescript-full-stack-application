"use client"; 
import React, { useState } from "react";

const DownloadCSV = () => {
  const [loading, setLoading] = useState(false);

  const fetchAndDownloadCSV = async (e: React.MouseEvent) => {
    e.preventDefault(); // prevent the default action when a user clicks a button or link.
    setLoading(true);

    try {
      const response = await fetch("download/api"); 
      if (!response.ok) throw new Error("Failed to fetch users");

      const users = await response.json();
      if (!users.length) {
        alert("No data available.");
        return;
      }

      // Ensure that we handle the headers properly
      const headers = ["id", "name", "email", "status"];

      // Convert JSON to CSV format (ensure consistent data)
      const csvHeader = headers.join(",") + "\n";
      const csvRows = users.map((user: Record<string, any>) =>
        headers.map((header) => user[header] || "").join(",") 
      );
      const csvContent = csvHeader + csvRows.join("\n");

      // Create and trigger the CSV download
      const blob = new Blob([csvContent], { type: "text/csv" });
      const url = URL.createObjectURL(blob);

      // Trigger file download
      const link = document.createElement("a");
      link.href = url;
      link.download = "users.csv";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url); // Cleanup

    } catch (error) {
      console.error("Error:", error);
      alert("Error downloading CSV");
    } finally {
      setLoading(false);
    }
  };

  return (
    <a
      href="#"
      onClick={fetchAndDownloadCSV}
      className="text-blue-600 underline mt-8 w-1/2 "
      style={{ pointerEvents: loading ? "none" : "auto", cursor: loading ? "not-allowed" : "pointer" }}
    >
      {loading ? "Downloading..." : "Download CSV"}
    </a>
  );
};

export default DownloadCSV;
