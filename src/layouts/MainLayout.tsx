import { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  Menu,
  X,
  LayoutDashboard,
  Users,
  BarChart,
  LogOut,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

const MainLayout = ({ children }: { children: React.ReactNode }) => {
  const navigate = useNavigate();
  const location = useLocation();

  const [isSidebarOpen, setIsSidebarOpen] = useState(false); // mobile
  const [isCollapsed, setIsCollapsed] = useState(false); // desktop

  // Lock scroll when mobile sidebar is open
  useEffect(() => {
    document.body.style.overflow = isSidebarOpen ? "hidden" : "auto";
  }, [isSidebarOpen]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/");
  };

  const navItems = [
    { path: "/dashboard", label: "Dashboard", icon: <LayoutDashboard size={20} /> },
    { path: "/teachers", label: "Teachers", icon: <Users size={20} /> },
    { path: "/analytics", label: "Analytics", icon: <BarChart size={20} /> },
  ];

  const isActive = (path: string) => location.pathname.startsWith(path);

  return (
    <div className="min-h-screen flex bg-white dark:bg-gray-900 text-gray-800 dark:text-gray-100">
      {/* Sidebar - Desktop */}
      <aside
        className={`hidden md:flex flex-col h-screen bg-gray-100 dark:bg-gray-900 text-gray-800 dark:text-white p-4 sticky top-0 shadow transition-all duration-300 ${
          isCollapsed ? "w-20" : "w-64"
        }`}
      >
        <div className="flex justify-between items-center mb-8">
          {!isCollapsed ? (
            <h1 className="text-2xl font-bold">Teacher</h1>
          ) : (
            <h1 className="text-xl font-bold">T</h1>
          )}
          <button onClick={() => setIsCollapsed(!isCollapsed)}>
            {isCollapsed ? <ChevronRight /> : <ChevronLeft />}
          </button>
        </div>

        <nav className="flex flex-col gap-4 text-sm">
          {navItems.map(({ path, label, icon }) => (
            <Link
              key={path}
              to={path}
              className={`flex items-center gap-3 p-2 rounded hover:bg-blue-100 dark:hover:bg-gray-700 ${
                isActive(path) ? "bg-blue-200 dark:bg-gray-700 font-semibold" : ""
              }`}
              title={isCollapsed ? label : ""}
            >
              {icon}
              {!isCollapsed && <span>{label}</span>}
            </Link>
          ))}
        </nav>

        <button
          onClick={handleLogout}
          className={`mt-auto flex items-center gap-3 text-red-600 dark:text-red-400 hover:underline text-sm ${
            isCollapsed ? "justify-center" : ""
          }`}
          title={isCollapsed ? "Logout" : ""}
        >
          <LogOut size={20} />
          {!isCollapsed && "Logout"}
        </button>
      </aside>

      {/* Sidebar - Mobile */}
      {isSidebarOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-40" onClick={() => setIsSidebarOpen(false)} />
      )}
      <div
        className={`fixed inset-y-0 left-0 w-64 bg-white dark:bg-gray-900 text-gray-800 dark:text-white z-50 p-6 shadow transform transition-transform duration-300 md:hidden ${
          isSidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-2xl font-bold">Teacher</h1>
          <button onClick={() => setIsSidebarOpen(false)}>
            <X />
          </button>
        </div>

        <nav className="flex flex-col gap-4 text-sm">
          {navItems.map(({ path, label, icon }) => (
            <Link
              key={path}
              to={path}
              onClick={() => setIsSidebarOpen(false)}
              className={`flex items-center gap-3 p-2 rounded hover:bg-blue-100 dark:hover:bg-gray-700 ${
                isActive(path) ? "bg-blue-200 dark:bg-gray-700 font-semibold" : ""
              }`}
            >
              {icon}
              <span>{label}</span>
            </Link>
          ))}
        </nav>

        <button
          onClick={handleLogout}
          className="mt-auto text-left text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-600 text-sm"
        >
          <LogOut size={20} className="inline mr-2" />
          Logout
        </button>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col">
        {/* Topbar */}
        <nav className="flex items-center justify-between px-6 py-4 shadow bg-white dark:bg-gray-800">
          <div className="md:hidden">
            <button onClick={() => setIsSidebarOpen(true)}>
              <Menu />
            </button>
          </div>
          <h1 className="text-xl font-semibold">Teacher Dashboard</h1>
        </nav>

        {/* Page Content */}
        <main className="flex-1 p-6 overflow-y-auto">{children}</main>
      </div>
    </div>
  );
};

export default MainLayout;
