import { useEffect, useState } from "react";
import MainLayout from "../layouts/MainLayout";
import API from "../services/api";
import dayjs from "dayjs";
import { RefreshCcw } from "lucide-react";

interface Teacher {
  status: string;
  createdAt: string;
  location: string;
}

const Dashboard = () => {
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [lastUpdated, setLastUpdated] = useState<string>("");
  const [refreshing, setRefreshing] = useState(false);

  const fetchData = async () => {
    try {
      setRefreshing(true);
      const res = await API.get("/teachers");
      const data: Teacher[] = res.data;
      setTeachers(data);
      setLastUpdated(dayjs().format("HH:mm:ss"));
    } catch (err) {
      console.error("Failed to fetch teachers", err);
    } finally {
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 10000);
    return () => clearInterval(interval);
  }, []);

  const total = teachers.length;
  const active = teachers.filter((t) => t.status === "Active").length;
  const inactive = teachers.filter((t) => t.status === "Inactive").length;
  const thisMonth = teachers.filter((t) => dayjs(t.createdAt).month() === dayjs().month()).length;
  const thisWeek = teachers.filter((t) =>
    dayjs(t.createdAt).isAfter(dayjs().startOf("week"))
  ).length;
  const lastMonth = teachers.filter((t) =>
    dayjs(t.createdAt).month() === dayjs().subtract(1, "month").month()
  ).length;

  const uniqueLocations = new Set(teachers.map((t) => t.location)).size;

  const growthRate =
    lastMonth === 0 ? 100 : ((thisMonth - lastMonth) / lastMonth) * 100;

  const progress = (value: number) => (total ? (value / total) * 100 : 0);

  return (
    <MainLayout>
      <div className="text-gray-800 dark:text-gray-100">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold">📊 Teacher Dashboard Overview</h1>
          <button
            onClick={fetchData}
            className="flex items-center gap-2 px-3 py-2 rounded bg-gray-800 text-white dark:bg-gray-200 dark:text-black hover:opacity-80 transition"
          >
            <RefreshCcw className={`w-4 h-4 ${refreshing ? "animate-spin" : ""}`} />
            Refresh
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
          <StatCard label="Total Teachers" value={total} />
          <StatCard label="Active Teachers" value={active} progress={progress(active)} />
          <StatCard label="Inactive Teachers" value={inactive} progress={progress(inactive)} />
          <StatCard label="Added This Month" value={thisMonth} />
          <StatCard label="Added This Week" value={thisWeek} />
          <StatCard label="Unique Locations" value={uniqueLocations} />
        </div>

        <div className="text-sm text-green-500 flex items-center gap-2">
          📈 Monthly Growth: {growthRate.toFixed(1)}%
        </div>
        <div className="text-xs mt-1 text-gray-400">Last updated at: {lastUpdated}</div>
      </div>
    </MainLayout>
  );
};

export default Dashboard;

const StatCard = ({
  label,
  value,
  progress,
}: {
  label: string;
  value: number;
  progress?: number;
}) => (
  <div className="p-4 bg-white dark:bg-gray-800 rounded shadow transition">
    <p className="text-sm text-gray-500 dark:text-gray-400">{label}</p>
    <h2 className="text-2xl font-bold mb-2">{value}</h2>
    {typeof progress === "number" && (
      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
        <div
          className="bg-blue-600 h-2 rounded-full transition-all"
          style={{ width: `${progress}%` }}
        />
      </div>
    )}
  </div>
);
