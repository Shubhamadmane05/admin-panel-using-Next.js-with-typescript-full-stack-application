"use client";
import React, { useEffect, useState, useRef } from "react";

const PageSearchComponent = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const searchRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const fetchUsers = async () => {
      setLoading(true);
      try {
        const response = await fetch(`/users/search/api?query=${searchQuery}`);
    
        if (!response.ok) {
          throw new Error(`API Error: ${response.statusText}`);
        }
    
        const text = await response.text();
        if (!text) {
          setUsers([]);
          return;
        }
    
        const data = JSON.parse(text);
        setUsers(data);
      } catch (error) {
        console.error("Error fetching users:", error);
      }
      setLoading(false);
    };
    

    if (searchQuery.trim()) {
      fetchUsers();
    } else {
      setUsers([]);
    }
  }, [searchQuery]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setUsers([]);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <div className="max-w-md mx-auto relative" ref={searchRef}>
      <div className="relative">
        {/* Search Icon */}
        <div className="absolute inset-y-0 start-0 flex items-center ps-3 pointer-events-none">
          <svg className="w-5 h-5 text-gray-500" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 20 20">
            <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="m19 19-4-4m0-7A7 7 0 1 1 1 8a7 7 0 0 1 14 0Z"/>
          </svg>
        </div>

        {/* Search Input */}
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search users..."
          className="block w-full p-3 ps-10 text-gray-900 border border-gray-300 rounded-3xl bg-white shadow-sm focus:ring-blue-500 focus:border-blue-500"
        />

        {/* Clear Button */}
        {searchQuery && (
          <button
            onClick={() => setSearchQuery("")}
            className="absolute end-2.5 top-2.5 bg-gray-200 hover:bg-gray-300 text-gray-700 font-medium rounded-lg text-sm px-3 py-1"
          >
            ✕
          </button>
        )}
      </div>

      {/* Dropdown Results */}
      {searchQuery && (
        <div className="absolute w-full mt-2 bg-white border border-gray-300 rounded-lg shadow-md max-h-60 overflow-auto">
          {loading ? (
            <p className="p-3 text-center text-gray-500">Loading...</p>
          ) : users.length > 0 ? (
            <ul className="divide-y divide-gray-200">
              {users.map((user) => (
                <li key={user.id} className="p-3 hover:bg-gray-100 cursor-pointer">
                  <p className="text-gray-500 text-sm">{user.id}</p>
                  <h3 className="text-gray-700 font-medium">{user.name}</h3>
                  <p className="text-gray-500 text-sm">{user.email}</p>
                </li>
              ))}
            </ul>
          ) : (
            <p className="p-3 text-center text-gray-500">No users found.</p>
          )}
        </div>
      )}
    </div>
  );
};

export default PageSearchComponent;
