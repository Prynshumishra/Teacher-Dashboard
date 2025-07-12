import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import MainLayout from "../layouts/MainLayout";
import API from "../services/api";
import { toast } from "react-toastify";
import { ArrowUp, ArrowDown } from "lucide-react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

interface Teacher {
  id: number;
  name: string;
  role: string;
  status: string;
  location: string;
  createdAt: string;
}

const Teachers = () => {
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [roleFilter, setRoleFilter] = useState("All");
  const [locationFilter, setLocationFilter] = useState("All");
  const [sortField, setSortField] = useState<keyof Teacher>("name");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");
  const [currentPage, setCurrentPage] = useState(1);
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);
  const itemsPerPage = 5;

  useEffect(() => {
    API.get("/teachers")
      .then((res) => setTeachers(res.data))
      .catch(() => toast.error("Failed to load teachers"));
  }, []);

  const uniqueLocations = Array.from(new Set(teachers.map((t) => t.location)));
  const uniqueRoles = Array.from(new Set(teachers.map((t) => t.role)));

  const handleDelete = (id: number) => {
    if (!window.confirm("Are you sure you want to delete this teacher?")) return;
    API.delete(`/teachers/${id}`)
      .then(() => {
        setTeachers((prev) => prev.filter((t) => t.id !== id));
        toast.success("Teacher deleted");
      })
      .catch(() => toast.error("Delete failed"));
  };

  const handleSort = (field: keyof Teacher) => {
    if (sortField === field) {
      setSortOrder((prev) => (prev === "asc" ? "desc" : "asc"));
    } else {
      setSortField(field);
      setSortOrder("asc");
    }
  };

  const clearFilters = () => {
    setQuery("");
    setStatusFilter("All");
    setRoleFilter("All");
    setLocationFilter("All");
    setStartDate(null);
    setEndDate(null);
    setCurrentPage(1);
  };

  const filtered = teachers
    .filter((t) => t.name.toLowerCase().includes(query.toLowerCase()))
    .filter((t) => statusFilter === "All" || t.status === statusFilter)
    .filter((t) => roleFilter === "All" || t.role === roleFilter)
    .filter((t) => locationFilter === "All" || t.location === locationFilter)
    .filter((t) => {
      const created = new Date(t.createdAt);
      if (startDate && created < startDate) return false;
      if (endDate && created > endDate) return false;
      return true;
    })
    .sort((a, b) => {
      const aValue = a[sortField];
      const bValue = b[sortField];
      let result = 0;
      if (typeof aValue === "string" && typeof bValue === "string") {
        result = aValue.localeCompare(bValue);
      } else if (typeof aValue === "number" && typeof bValue === "number") {
        result = aValue - bValue;
      }
      return sortOrder === "asc" ? result : -result;
    });

  const paginated = filtered.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );
  const totalPages = Math.ceil(filtered.length / itemsPerPage);

  return (
    <MainLayout>
      <div className="flex flex-col lg:flex-row flex-wrap gap-4 justify-between items-start lg:items-center mb-6">
        <input
          type="text"
          placeholder="Search by name..."
          className="border p-2 rounded w-full lg:w-64 bg-white dark:bg-gray-800 dark:border-gray-600 dark:text-white"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setCurrentPage(1);
          }}
        />

        <select
          value={statusFilter}
          onChange={(e) => {
            setStatusFilter(e.target.value);
            setCurrentPage(1);
          }}
          className="border p-2 rounded w-full sm:w-auto bg-white dark:bg-gray-800 dark:border-gray-600 dark:text-white"
        >
          <option value="All">All Statuses</option>
          <option value="Active">Active</option>
          <option value="Inactive">Inactive</option>
        </select>

        <select
          value={roleFilter}
          onChange={(e) => {
            setRoleFilter(e.target.value);
            setCurrentPage(1);
          }}
          className="border p-2 rounded w-full sm:w-auto bg-white dark:bg-gray-800 dark:border-gray-600 dark:text-white"
        >
          <option value="All">All Roles</option>
          {uniqueRoles.map((role) => (
            <option key={role} value={role}>
              {role}
            </option>
          ))}
        </select>

        <select
          value={locationFilter}
          onChange={(e) => {
            setLocationFilter(e.target.value);
            setCurrentPage(1);
          }}
          className="border p-2 rounded w-full sm:w-auto bg-white dark:bg-gray-800 dark:border-gray-600 dark:text-white"
        >
          <option value="All">All Locations</option>
          {uniqueLocations.map((loc) => (
            <option key={loc} value={loc}>
              {loc}
            </option>
          ))}
        </select>

        <DatePicker
          selected={startDate}
          onChange={(date) => {
            setStartDate(date);
            setCurrentPage(1);
          }}
          selectsStart
          startDate={startDate}
          endDate={endDate}
          placeholderText="Start date"
          className="border p-2 rounded w-full sm:w-auto dark:bg-gray-800 dark:border-gray-600 dark:text-white"
        />

        <DatePicker
          selected={endDate}
          onChange={(date) => {
            setEndDate(date);
            setCurrentPage(1);
          }}
          selectsEnd
          startDate={startDate}
          endDate={endDate}
          minDate={startDate ?? undefined}
          placeholderText="End date"
          className="border p-2 rounded w-full sm:w-auto dark:bg-gray-800 dark:border-gray-600 dark:text-white"
        />

        <button
          onClick={clearFilters}
          className="px-4 py-2 text-sm bg-gray-300 hover:bg-gray-400 dark:bg-gray-700 dark:hover:bg-gray-600 rounded text-gray-800 dark:text-gray-100 transition"
        >
          Clear
        </button>

        <Link
          to="/teacher"
          className="px-4 py-2 text-sm bg-green-600 text-white rounded hover:bg-green-700 dark:hover:bg-green-500 transition"
        >
          + Add Teacher
        </Link>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-[600px] w-full bg-white dark:bg-gray-800 shadow rounded text-gray-800 dark:text-gray-100 text-sm">
          <thead>
            <tr className="bg-gray-200 dark:bg-gray-700 text-left">
              {(["name", "role", "status", "location"] as (keyof Teacher)[]).map((field) => (
                <th
                  key={field}
                  className="p-3 cursor-pointer hover:underline capitalize"
                  onClick={() => handleSort(field)}
                >
                  <div className="flex items-center gap-1">
                    {field}
                    {sortField === field &&
                      (sortOrder === "asc" ? (
                        <ArrowUp size={16} />
                      ) : (
                        <ArrowDown size={16} />
                      ))}
                  </div>
                </th>
              ))}
              <th className="p-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {paginated.length === 0 ? (
              <tr>
                <td colSpan={5} className="p-4 text-center text-gray-500 dark:text-gray-400">
                  No teachers found.
                </td>
              </tr>
            ) : (
              paginated.map((teacher) => (
                <tr
                  key={teacher.id}
                  className="border-t hover:bg-gray-50 dark:hover:bg-gray-700 transition"
                >
                  <td className="p-3">{teacher.name}</td>
                  <td className="p-3">{teacher.role}</td>
                  <td className="p-3">{teacher.status}</td>
                  <td className="p-3">{teacher.location}</td>
                  <td className="p-3 space-x-2">
                    <Link
                      to={`/teacher/${teacher.id}`}
                      className="text-blue-600 hover:underline dark:text-blue-400"
                    >
                      Edit
                    </Link>
                    <button
                      onClick={() => handleDelete(teacher.id)}
                      className="text-red-600 hover:underline dark:text-red-400"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <div className="mt-6 flex flex-wrap justify-center gap-2">
        {Array.from({ length: totalPages }, (_, i) => (
          <button
            key={i}
            onClick={() => setCurrentPage(i + 1)}
            className={`px-3 py-1 rounded text-sm transition ${
              currentPage === i + 1
                ? "bg-blue-600 text-white"
                : "bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-white"
            }`}
          >
            {i + 1}
          </button>
        ))}
      </div>
    </MainLayout>
  );
};

export default Teachers;
