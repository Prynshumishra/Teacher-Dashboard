import { useEffect, useState } from "react";
import MainLayout from "../layouts/MainLayout";
import API from "../services/api";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";

interface Teacher {
  id: number;
  name: string;
  role: string;
  status: string;
  location: string;
  createdAt: string;
}

const COLORS = ["#22c55e", "#ef4444", "#3b82f6", "#f97316", "#a855f7"];

const Analytics = () => {
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [loading, setLoading] = useState(true);
  const [chartTab, setChartTab] = useState<"status" | "location" | "trend">("status");
  const [filterRole, setFilterRole] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [filterLocation, setFilterLocation] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  useEffect(() => {
    API.get("/teachers")
      .then((res) => setTeachers(res.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const filteredTeachers = teachers.filter((t) => {
    const matchesStatus = filterStatus ? t.status === filterStatus : true;
    //const matchesRole = filterRole ? t.role === filterRole : true;
    const matchesLocation = filterLocation ? t.location === filterLocation : true;
    const created = new Date(t.createdAt).getTime();
    const afterStart = startDate ? created >= new Date(startDate).getTime() : true;
    const beforeEnd = endDate ? created <= new Date(endDate).getTime() : true;
    return matchesStatus && matchesLocation && afterStart && beforeEnd;
  });

  const statusData = [
    { name: "Active", value: filteredTeachers.filter((t) => t.status === "Active").length },
    { name: "Inactive", value: filteredTeachers.filter((t) => t.status === "Inactive").length },
  ];

  const locationCounts = filteredTeachers.reduce<Record<string, number>>((acc, t) => {
    acc[t.location] = (acc[t.location] || 0) + 1;
    return acc;
  }, {});
   
  const locationData = Object.entries(locationCounts).map(([name, value]) => ({ name, value }));

  const trendData = filteredTeachers.reduce((acc, t) => {
    const date = new Date(t.createdAt);
    const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
    acc[key] = (acc[key] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const trendChartData = Object.entries(trendData)
    .map(([month, value]) => ({ month, value }))
    .sort((a, b) => a.month.localeCompare(b.month));

  const handleExportImage = () => {
    const chartSection = document.getElementById("chart-section");
    if (!chartSection) return;

    html2canvas(chartSection).then((canvas) => {
      const link = document.createElement("a");
      link.download = "analytics.png";
      link.href = canvas.toDataURL();
      link.click();
    });
  };

  const handleExportPDF = () => {
    const chartSection = document.getElementById("chart-section");
    if (!chartSection) return;

    html2canvas(chartSection).then((canvas) => {
      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF("landscape");
      pdf.addImage(imgData, "PNG", 10, 10, 280, 160);
      pdf.save("analytics.pdf");
    });
  };

  if (loading) {
    return (
      <MainLayout>
        <div className="text-center text-lg mt-20 text-gray-500 dark:text-gray-400">
          Loading analytics...
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <h2 className="text-2xl font-semibold mb-6">Teacher Analytics</h2>

      <div className="mb-4 text-lg font-medium text-gray-700 dark:text-gray-200">
        Total Teachers: {filteredTeachers.length}
      </div>

      <div className="flex flex-wrap gap-4 mb-6">
        <select
          className="border p-2 rounded dark:bg-gray-800 dark:text-white"
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
        >
          <option value="">All Statuses</option>
          <option value="Active">Active</option>
          <option value="Inactive">Inactive</option>
        </select>
        <select
  className="border p-2 rounded dark:bg-gray-800 dark:text-white"
  value={filterRole}
  onChange={(e) => setFilterRole(e.target.value)}
>
  <option value="">All Roles</option>
  {[...new Set(teachers.map((t) => t.role))].map((role) => (
    <option key={role} value={role}>
      {role}
    </option>
  ))}
</select>


        <select
          className="border p-2 rounded dark:bg-gray-800 dark:text-white"
          value={filterLocation}
          onChange={(e) => setFilterLocation(e.target.value)}
        >
          <option value="">All Locations</option>
          {[...new Set(teachers.map((t) => t.location))].map((loc) => (
            <option key={loc} value={loc}>
              {loc}
            </option>
          ))}
        </select>

        <input
          type="date"
          className="border p-2 rounded dark:bg-gray-800 dark:text-white"
          value={startDate}
          onChange={(e) => setStartDate(e.target.value)}
        />
        <input
          type="date"
          className="border p-2 rounded dark:bg-gray-800 dark:text-white"
          value={endDate}
          onChange={(e) => setEndDate(e.target.value)}
        />

        <button
          className="text-sm text-red-600 hover:underline"
          onClick={() => {
          setFilterStatus("");
          setFilterRole("");
          setFilterLocation("");
          setStartDate("");
          setEndDate("");
        }}
        >
          Clear Filters
        </button>
      </div>

      <div className="flex gap-3 mb-4 flex-wrap">
        <button
          onClick={handleExportImage}
          className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm"
        >
          📷 Export Image
        </button>
        <button
          onClick={handleExportPDF}
          className="px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700 text-sm"
        >
          📄 Export PDF
        </button>
      </div>

      <div className="flex gap-2 mb-4 flex-wrap">
        {["status", "location", "trend"].map((tab) => (
          <button
            key={tab}
            className={`px-3 py-1 rounded text-sm ${
              chartTab === tab
                ? "bg-blue-600 text-white"
                : "bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-white"
            }`}
            onClick={() => setChartTab(tab as "status" | "location" | "trend")}
          >
            {tab.charAt(0).toUpperCase() + tab.slice(1)}
          </button>
        ))}
      </div>

      <div id="chart-section">
        {chartTab === "status" && (
          <div className="bg-white dark:bg-gray-800 p-4 shadow rounded text-gray-800 dark:text-gray-100">
            <h3 className="text-lg font-medium mb-3">Teacher Status</h3>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={statusData}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  label
                >
                  {statusData.map((_, i) => (
                    <Cell key={i} fill={COLORS[i % COLORS.length]} />
                  ))}
                </Pie>
                <Legend />
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        )}

        {chartTab === "location" && (
          <div className="bg-white dark:bg-gray-800 p-4 shadow rounded text-gray-800 dark:text-gray-100">
            <h3 className="text-lg font-medium mb-3">Teachers by Location</h3>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={locationData}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  label
                >
                  {locationData.map((_, i) => (
                    <Cell key={i} fill={COLORS[i % COLORS.length]} />
                  ))}
                </Pie>
                <Legend />
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        )}

        {chartTab === "trend" && (
          <div className="bg-white dark:bg-gray-800 p-4 shadow rounded text-gray-800 dark:text-gray-100">
            <h3 className="text-lg font-medium mb-3">Teachers Over Time</h3>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={trendChartData}>
                <XAxis dataKey="month" />
                <YAxis allowDecimals={false} />
                <Tooltip />
                <Line type="monotone" dataKey="value" stroke="#06b6d4" strokeWidth={3} dot />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>
    </MainLayout>
  );
};

export default Analytics;
