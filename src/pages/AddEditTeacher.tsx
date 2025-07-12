import { useNavigate, useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import MainLayout from "../layouts/MainLayout";
import API from "../services/api";
import { toast } from "react-toastify";
import { ClipLoader } from "react-spinners";

const LOCATIONS = ["Delhi", "Mumbai", "Chennai", "Bangalore", "Hyderabad"];

const AddEditTeacher = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditMode = Boolean(id);

  const [formData, setFormData] = useState({
    name: "",
    role: "",
    status: "Active",
    location: "",
  });

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isEditMode && id) {
      setLoading(true);
      API.get(`/teachers/${id}`)
        .then((res) => setFormData(res.data))
        .catch(() => toast.error("Failed to load teacher details"))
        .finally(() => setLoading(false));
    }
  }, [id, isEditMode]);

  const toTitleCase = (str: string) =>
    str.replace(/\w\S*/g, (txt) => txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase());

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    const updatedValue = name === "name" ? toTitleCase(value) : value;
    setFormData({ ...formData, [name]: updatedValue });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const nameRegex = /^[A-Za-z ]+$/;
    if (!formData.name || !formData.location) {
      toast.error("Please fill all fields");
      return;
    }
    if (!nameRegex.test(formData.name)) {
      toast.error("Name should contain only letters and spaces");
      return;
    }

    setLoading(true);
    const request = isEditMode
      ? API.put(`/teachers/${id}`, formData)
      : API.post("/teachers", formData);

    request
      .then(() => {
        toast.success(`Teacher ${isEditMode ? "updated" : "added"}`);
        navigate("/teachers");
      })
      .catch(() => toast.error("Operation failed"))
      .finally(() => setLoading(false));
  };

  const handleDelete = () => {
    if (!id || !window.confirm("Delete this teacher?")) return;

    setLoading(true);
    API.delete(`/teachers/${id}`)
      .then(() => {
        toast.success("Teacher deleted");
        navigate("/teachers");
      })
      .catch(() => toast.error("Delete failed"))
      .finally(() => setLoading(false));
  };

  return (
    <MainLayout>
      <div className="max-w-xl mx-auto bg-white dark:bg-gray-800 shadow p-6 rounded text-gray-800 dark:text-gray-100">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">
            {isEditMode ? "Edit" : "Add"} Teacher
          </h2>
          {isEditMode && (
            <button
              onClick={handleDelete}
              className="text-red-600 border border-red-600 px-3 py-1 rounded hover:bg-red-50 dark:hover:bg-red-900"
              disabled={loading}
            >
              Delete
            </button>
          )}
        </div>

        {loading ? (
          <div className="flex justify-center py-8">
            <ClipLoader color="#4F46E5" size={40} />
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block mb-1">Name</label>
              <input
                type="text"
                name="name"
                className="w-full border p-2 rounded bg-white dark:bg-gray-800 dark:border-gray-600 dark:text-white"
                value={formData.name}
                onChange={handleChange}
              />
            </div>

            <div>
              <label className="block mb-1">Role</label>
              <input
                type="text"
                name="role"
                className="w-full border p-2 rounded bg-white dark:bg-gray-800 dark:border-gray-600 dark:text-white"
                value={formData.role}
                onChange={handleChange}
              />
            </div>


            <div>
              <label className="block mb-1">Location</label>
              <select
                name="location"
                className="w-full border p-2 rounded bg-white dark:bg-gray-800 dark:border-gray-600 dark:text-white"
                value={formData.location}
                onChange={handleChange}
              >
                <option value="">-- Select Location --</option>
                {LOCATIONS.map((loc) => (
                  <option key={loc} value={loc}>{loc}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block mb-1">Status</label>
              <select
                name="status"
                className="w-full border p-2 rounded bg-white dark:bg-gray-800 dark:border-gray-600 dark:text-white"
                value={formData.status}
                onChange={handleChange}
              >
                <option value="Active">Active</option>
                <option value="Inactive">Inactive</option>
              </select>
            </div>

            <button
              type="submit"
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 dark:hover:bg-blue-500"
              disabled={loading}
            >
              {isEditMode ? "Update" : "Add"} Teacher
            </button>
          </form>
        )}
      </div>
    </MainLayout>
  );
};

export default AddEditTeacher;
