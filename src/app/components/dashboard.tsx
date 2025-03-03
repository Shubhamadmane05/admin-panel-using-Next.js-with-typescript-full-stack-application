"use client";

import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import { useState, useEffect } from "react";
import axios from "axios";
import PieChartComponent from "./pieChart";
import SearchComponent from "./SearchComponent";
import { PencilIcon, TrashIcon, PlusIcon } from "@heroicons/react/24/solid";

import { FiArrowUp, FiArrowDown } from 'react-icons/fi';

import { FiUsers, FiUserCheck, FiUserX } from "react-icons/fi";
import CSVUpload from "./uploadCSV/uploadCSV";
import ConfirmDeleteModal from './ui/ConfirmDeleteModal';
import DownloadCSV from './ui/downloadCSV';
import { useRouter } from 'next/navigation';
import "react-toastify/dist/ReactToastify.css";
import Logout from '../logout';
import Notification from '../notifications/userNotifications';


interface User {
  id: number;
  name: string;
  email: string;
  status: string;
  role: "user"
}

const Dashboard = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [editUser, setEditUser] = useState<User | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newUser, setNewUser] = useState({ name: "", email: "", status: "active", role: "user" });
  const [errorMessage, setErrorMessage] = useState<string>("");
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [preview, setPreview] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const router = useRouter();
  const [hoveredUserId, setHoveredUserId] = useState<number | null>(null);


  const activeUsers = users.filter((user) => user.status.toLowerCase() === "active").length;
  const inactiveUsers = users.filter((user) => user.status.toLowerCase() === "inactive").length;

  // Fetch Users
  const fetchUsers = async () => {
    try {
      const response = await axios.get("/users/api");
      setUsers(response.data);
    } catch (error) {
      console.error("Error fetching users:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers(); 

    const interval = setInterval(fetchUsers, 5000);
    return () => clearInterval(interval);
  }, []);


  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];

    if (!file) {
      toast.error("No file selected.");
      return;
    }
    if (!(file instanceof File)) {
      toast.error("Invalid file type.");
      return;
    }
    setSelectedFile(file);
    const imageUrl = URL.createObjectURL(file);
    setPreview(imageUrl);
  };

  // Add User
  const handleAddUser = async () => {
    setErrorMessage("");

    if (!newUser.name || !newUser.email || !newUser.status || !selectedFile) {
      setErrorMessage("Please fill in all fields and select an image.");
      toast.error("Please fill in all fields and select an image.");
      return;
    }

    if (!(selectedFile instanceof File)) {
      setErrorMessage("Invalid file selected. Please try again.");
      toast.error("Invalid file selected. Please try again.");
      return;
    }

    try {
      const formData = new FormData();
      formData.append("name", newUser.name);
      formData.append("email", newUser.email);
      formData.append("status", newUser.status);
      formData.append("role", newUser.role);
      formData.append("profilePicture", selectedFile);

      const response = await fetch("/users/api", {
        method: "POST",
        body: formData,
      });

      //Check if response body exists before parsing JSON
      let data;
      const text = await response.text();
      if (text) {
        data = JSON.parse(text);
      } else {
        data = {}; // No JSON returned, prevent error
      }

      if (!response.ok) {
        throw new Error(data.error || "Something went wrong");
      }

      console.log("User added:", data);
      fetchUsers();
      setNewUser({ name: "", email: "", status: "Active", role: "user" });
      setSelectedFile(null);
      setPreview(null);
      setShowAddForm(false);

      toast.success("User added successfully!");
    } catch (error) {

      setErrorMessage(error.message || "An error occurred.");
      toast.error(error.message || "An error occurred.");
    }
  };

  // Save Edited User
  const handleUpdate = async () => {
    if (editUser) {
      try {
        const response = await axios.put(`/users/${editUser.id}`, editUser);
        setErrorMessage(""); // Reset error message
        fetchUsers();
        setEditUser(null); // Close the edit form
        toast.success("User updated successfully!");
      } catch (error: any) {
        if (error.response?.data?.message) {
          setErrorMessage(error.response.data.message);
        } else {
          setErrorMessage("Error updating user. Please try again.");
        }
      }
    }
  };

  // Delete User
  const [showModal, setShowModal] = useState(false);
  const [userIdToDelete, setUserIdToDelete] = useState(null);

  const handleDelete = async (id: never) => {
    try {
      await axios.delete(`/users/${id}`);
      fetchUsers();
      setShowModal(false); // 
    } catch (error) {
      console.error("Error deleting user:", error);
    }
  };

  const handleConfirmDelete = () => {
    if (userIdToDelete !== null) {
      handleDelete(userIdToDelete);
    }
  };

  const handleCancelDelete = () => {
    setShowModal(false); // Close the modal if canceled
    setUserIdToDelete(null);
  };

  // Edit User
  const handleEdit = (user: User) => {
    setEditUser(user);
    setErrorMessage("");
  };

  const [sortConfig, setSortConfig] = useState<{ key: string, direction: 'asc' | 'desc' }>({
    key: 'id', direction: 'asc'
  });

  const handleSort = (key: string) => {
    let direction: 'asc' | 'desc' = 'asc';

    // If the column is already sorted, reverse the direction
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }

    setSortConfig({ key, direction });

    const sortedUsers = [...users].sort((a, b) => {
      if (a[key] < b[key]) {
        return direction === 'asc' ? -1 : 1;
      }
      if (a[key] > b[key]) {
        return direction === 'asc' ? 1 : -1;
      }
      return 0;
    });

    setUsers(sortedUsers);
  };
  const getSortIcon = (key: string) => {
    if (sortConfig.key === key) {
      return sortConfig.direction === 'asc' ? <FiArrowUp /> : <FiArrowDown />;
    }
    return null;
  };

  // Fetching initial user data
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await axios.get('/users/api');
        setUsers(response.data);
      } catch (error) {
        console.error('Error fetching users:', error);
      }
    };

    fetchUsers();
  }, []);


  // Filter users based on search query
  const filteredUsers = searchQuery
    ? users.filter(
      (user) =>
        user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.id.toString().includes(searchQuery)
    )
    : users;

  const [currentPage, setCurrentPage] = useState(1);
  const recordsPerPage = 10;

  // Calculate total pages
  const totalPages = Math.ceil(users.length / recordsPerPage);

  // Get current page's data
  const startIndex = (currentPage - 1) * recordsPerPage;
  const paginatedUsers = filteredUsers.slice(startIndex, startIndex + recordsPerPage);

  return (
    <div className="w-3/4 px-10 ml-[280px] bg-white-800">
       <div className="w-full flex justify-end items-center pt-4 pr-5 space-x-4">
        <Notification />
        <Logout />
      </div>

      <h2 className="text-2xl text-black font-serif mb-4 pt-3" > Dashboard</h2>

      {/* Stats Section */}
      <div className="grid grid-cols-1 sm:grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        <div className="h-32 w-72  bg-white shadow-md rounded-lg flex flex-col justify-center items-center text-center hover:shadow-xl transition-shadow duration-300">
          <FiUsers className="text-3xl text-blue-600 mb-1" />
          <h6 className="font-bold text-lg font-serif text-gray-800">Total Users</h6>
          <p className="text-2xl text-blue-600">{users.length}</p>
        </div>
        <div className="h-32 w-72  bg-white shadow-md rounded-lg flex flex-col justify-center items-center text-center text-white hover:shadow-xl transition-shadow duration-300">
          <FiUserCheck className="text-3xl text-green-600 mb-1" />
          <h6 className="font-bold text-lg font-serif text-gray-800">Active Users</h6>
          <p className="text-2xl text-blue-600">{activeUsers}</p>
        </div>
        <div className="h-32 w-72 bg-white shadow-md rounded-lg flex flex-col justify-center items-center text-center text-white hover:shadow-xl transition-shadow duration-300">
          <FiUserX className="text-3xl text-red-600 mb-1" />
          <h6 className="font-bold text-lg font-serif text-gray-800">Inactive Users</h6>
          <p className="text-2xl text-blue-600">{inactiveUsers}</p>
        </div>
      </div>

      <h2 className="text-xl text-black font-serif mt-5">User List</h2>
      <div className="w-full mt-10 ml-0">

        {/* User List Table */}
        <div className="flex justify-between items-center mt-4 w-full">
          {/*  Search Component on the left */}
          <div className="w-1/2 mr-4">
            <SearchComponent
              searchQuery={searchQuery}
              setSearchQuery={setSearchQuery}
              setSearchResults={setSearchResults}
            />
          </div>
          <div className="flex items-center space-x-4">
            <DownloadCSV />
            <CSVUpload />
            <button
              onClick={() => {
                router.push("/admin/userAdd"); // Navigate to the user form
              }}
              className="bg-blue-200 text-black px-4 mt-6 py-2 rounded flex items-center space-x-2 hover:bg-blue-300 transition duration-200"
            >
              <PlusIcon className="h-5 w-5" />

            </button>
          </div>
        </div>

        <table className="w-full border text-serif p-4 mb-4">
          <thead>
            <tr>
              <th className="p-2 text-black border cursor-pointer text-left" onClick={() => handleSort("id")}>
                <span className="flex items-center font-serif  justify-between">ID {getSortIcon("id")}</span>
              </th>
              <th className="p-2 text-black border cursor-pointer text-left" onClick={() => handleSort("name")}>
                <span className="flex items-center font-serif  justify-between">Name {getSortIcon("name")}</span>
              </th>
              <th className="p-2 text-black border cursor-pointer text-left" onClick={() => handleSort("email")}>
                <span className="flex items-center  font-serif justify-between">Email {getSortIcon("email")}</span>
              </th>
              <th className="p-2 text-black border cursor-pointer text-left" onClick={() => handleSort("status")}>
                <span className="flex items-center  font-serif justify-between">Status {getSortIcon("status")}</span>
              </th>
              <th className="p-2 text-black font-serif border">Actions</th>
            </tr>
          </thead>
          <tbody>
            {paginatedUsers.length > 0 ? (
              paginatedUsers.map((user) => (
                <tr key={user.id} className="text-center">
                  <td
                    className="p-2 text-black border font-serif relative cursor-pointer hover:bg-gray-100"
                    onMouseEnter={() => setHoveredUserId(user.id)}
                    onMouseLeave={() => setHoveredUserId(null)}
                    onClick={() => router.push(`/users/profile/${user.id}`)} // Navigate to UserProfile
                  >
                    {user.id}
                    {/* Tooltip - Show Profile */}
                    {hoveredUserId === user.id && (
                      <span className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-black text-white text-xs rounded px-2 py-1">
                        Show Profile
                      </span>
                    )}
                  </td>
                  <td className="p-2 text-black border font-serif">{user.name}</td>
                  <td className="p-2 text-black border font-serif">{user.email}</td>
                  <td className="p-2 text-black border font-serif">{user.status}</td>
                  <td className="p-2 text-black border font-serif">
                    <button onClick={() => handleEdit(user)} className="bg-blue-300 text-white px-2 py-1 rounded mr-2">
                      <PencilIcon className="h-5 w-5" />
                    </button>
                    <button onClick={() => { setUserIdToDelete(user.id); setShowModal(true); }} className="bg-red-400 text-white px-2 py-1 rounded">
                      <TrashIcon className="h-5 w-5" />
                    </button>
                    <ConfirmDeleteModal show={showModal} onConfirm={handleConfirmDelete} onCancel={handleCancelDelete} />
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="5" className="p-4 text-black text-center">
                  No users found
                </td>
              </tr>
            )}
          </tbody>
        </table>

        {/* Pagination */}
        <div className="flex justify-between items-center mt-4">
          <button
            onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
            disabled={currentPage === 1}
            className={`px-4 py-2 font-serif rounded ${currentPage === 1 ? "bg-gray-300 font-serif cursor-not-allowed text-black" : "bg-blue-200 font-serif text-black"}`}
          >
            Previous
          </button>
          <span className="text-black font-serif">Page {currentPage} of {totalPages}</span>
          <button
            onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
            disabled={currentPage === totalPages}
            className={`px-4 font-serif py-2 rounded ${currentPage === totalPages ? "bg-gray-300 font-serif cursor-not-allowed text-black" : "bg-blue-200 text-black font-serif"}`}
          >
            Next
          </button>
        </div>
      </div>


      {/* Edit User Modal */}
      {editUser && (
        <div className="fixed inset-0 bg-gray-800 bg-opacity-50 flex justify-center items-center">
          <div className="bg-white p-5 rounded shadow-lg w-1/3">
            <h2 className="text-lg text-black font-bold mb-2">Edit User</h2>

            <input
              type="text"
              value={editUser.name}
              onChange={(e) => setEditUser({ ...editUser, name: e.target.value })}
              className="border text-black p-2 w-full my-2"
            />

            <input
              type="email"
              value={editUser.email}
              onChange={(e) => setEditUser({ ...editUser, email: e.target.value })}
              className="border text-black p-2 w-full my-2"
            />

            <select
              value={editUser.status}
              onChange={(e) => setEditUser({ ...editUser, status: e.target.value })}
              className="border text-black p-2 w-full my-2"
            >
              <option value="Active">Active</option>
              <option value="Inactive">Inactive</option>
            </select>

            {/* Error Message  */}
            {errorMessage && (
              <div className="text-red-500 text-sm mb-4">{errorMessage}</div>
            )}

            {/* Modal Actions */}
            <div className="flex justify-end">
              <button
                onClick={() => setEditUser(null)}
                className="bg-gray-400 text-white px-4 py-2 rounded mr-2"
              >
                Cancel
              </button>
              <button
                onClick={handleUpdate}
                className="bg-blue-400 text-white px-4 py-2 rounded"
              >
                Update
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add User Modal */}
      {showAddForm && (
        <div className="fixed inset-0 bg-gray-800 bg-opacity-50 flex justify-center items-center">
          <div className="bg-white p-5 rounded shadow-lg w-1/3">
            <h2 className="text-lg font-bold text-black mb-2">Add New User</h2>

            {/* Error Message */}
            {errorMessage && (
              <div className="text-red-500 mb-4">
                <strong>{errorMessage}</strong>
              </div>
            )}

            <input
              type="text"
              placeholder="Name"
              value={newUser.name}
              onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
              className="border text-black p-2 w-full my-2"
              required
            />

            <input
              type="email"
              placeholder="Email"
              value={newUser.email}
              onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
              className="border text-black p-2 w-full my-2"
              required
            />

            <select
              value={newUser.status}
              onChange={(e) => setNewUser({ ...newUser, status: e.target.value })}
              className="border text-black p-2 w-full my-2"
              required
            >
              <option value="Active">Active</option>
              <option value="Inactive">Inactive</option>
            </select>
            <div className="flex flex-col items-center">
              <label className="relative cursor-pointer">
                {preview ? (
                  <img src={preview} alt="Profile Preview" className="w-24 h-24 rounded-full shadow-lg object-cover" />
                ) : (
                  <div className="w-24 h-24 flex items-center justify-center text-gray-500 border border-gray-300 rounded-full bg-gray-100 hover:bg-blue-200">
                    <span>Upload</span>
                  </div>
                )}
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleFileChange}
                />
              </label>
            </div>
            <div className="flex justify-end">
              <button
                onClick={() => setShowAddForm(false)}
                className="bg-gray-400 text-white px-4 py-2 rounded mr-2"
              >
                Cancel
              </button>
              <button
                onClick={handleAddUser}
                className="bg-blue-400 text-white px-4 py-2 rounded"
              >
                Add
              </button>
            </div>
          </div>
        </div>

      )}

      {/* Pie Chart Component */}
      <h2 className="text-xl text-black font-serif mt-10">User Distribution</h2>
      <PieChartComponent activeUsers={activeUsers} inactiveUsers={inactiveUsers} />
    </div>
  );
};

export default Dashboard;