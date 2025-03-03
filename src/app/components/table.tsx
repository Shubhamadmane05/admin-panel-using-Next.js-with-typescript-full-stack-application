import { useState, useEffect } from "react";
import axios from "axios";
import { BarChart } from "@mui/x-charts";
import { HiChevronLeft, HiChevronRight, HiArrowUp, HiArrowDown } from "react-icons/hi";

interface User {
    id: number;
    name: string;
    email: string;
    status: string;
}

const Table = () => {
    const [rows, setRows] = useState<User[]>([]);
    const [filteredRows, setFilteredRows] = useState<User[]>([]);
    const [searchQuery, setSearchQuery] = useState("");
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [page, setPage] = useState(0);
    const [pageSize, setPageSize] = useState(4);
    const [sortConfig, setSortConfig] = useState<{ key: keyof User; direction: "asc" | "desc" } | null>(null);

    const fetchUsers = async () => {
        try {
            const response = await axios.get<User[]>("/users/api");
            setRows(response.data);
            setFilteredRows(response.data);
            setLoading(false);
        } catch (error) {
            console.error("Error fetching users:", error);
            setError("Failed to fetch users.");
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchUsers();
    }, []);

    useEffect(() => {
        const filtered = rows.filter(user =>
            user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            user.email.toLowerCase().includes(searchQuery.toLowerCase())
        );
        setFilteredRows(filtered);
    }, [searchQuery, rows]);

    const sortedRows = [...filteredRows];
    if (sortConfig !== null) {
        sortedRows.sort((a, b) => {
            if (a[sortConfig.key] < b[sortConfig.key]) {
                return sortConfig.direction === "asc" ? -1 : 1;
            }
            if (a[sortConfig.key] > b[sortConfig.key]) {
                return sortConfig.direction === "asc" ? 1 : -1;
            }
            return 0;
        });
    }

    const requestSort = (key: keyof User) => {
        let direction: "asc" | "desc" = "asc";
        if (sortConfig && sortConfig.key === key && sortConfig.direction === "asc") {
            direction = "desc";
        }
        setSortConfig({ key, direction });
        setFilteredRows([...sortedRows]);
    };

    const paginatedRows = sortedRows.slice(page * pageSize, (page + 1) * pageSize);

    if (loading) return <p className="text-center bg-blue-100 p-4 rounded-lg shadow-md">Loading...</p>;
    if (error) return <p className="text-center p-4 text-red-500 rounded-lg shadow-md">{error}</p>;

    return (
        <div className="flex flex-col w-full h-auto pr-6 pt-4 mb-0 pd-0 ">
            <h1 className="text-2xl font-serif text-gray-800 mb-4">User Management</h1>
            <div className="flex w-full gap-6 ">
                <div className="w-full bg-white rounded-lg shadow-lg p-2">
                    <h2 className="text-xl font-serif text-gray-700 mb-2">User List</h2>

                    <div className="overflow-x-auto">
                        <table className="w-full border-collapse border border-gray-300">
                            <thead className="font-serif text-black">
                                <tr>
                                    {["id", "name", "email", "status"].map((key) => (
                                        <th
                                            key={key}
                                            className="border border-gray-300 px-4 py-2 text-left cursor-pointer"
                                            onClick={() => requestSort(key as keyof User)}
                                        >
                                            <span className="flex items-center justify-between">
                                                {key.charAt(0).toUpperCase() + key.slice(1)}
                                                {sortConfig?.key === key && (
                                                    sortConfig.direction === "asc" ? <HiArrowUp className="ml-1" /> : <HiArrowDown className="ml-1" />
                                                )}
                                            </span>
                                        </th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {paginatedRows.length > 0 ? (
                                    paginatedRows.map((user) => (
                                        <tr key={user.id} className="hover:bg-gray-100 font-serif text-black">
                                            <td className="border border-gray-300 px-4 py-2">{user.id}</td>
                                            <td className="border border-gray-300 px-4 py-2">{user.name}</td>
                                            <td className="border border-gray-300 px-4 py-2">{user.email}</td>
                                            <td className="border border-gray-300 px-4 py-2">{user.status}</td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan={4} className="text-center py-4 text-black font-serif">No results found</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                    <div className="flex justify-between items-center mt-7 px-2 ">
                        <button onClick={() => setPage((prev) => Math.max(prev - 1, 0))} disabled={page === 0} className="px-4 py-2 bg-blue-200 text-black rounded-md hover:bg-blue-200 disabled:bg-gray-300">
                            <HiChevronLeft size={20} />
                        </button>
                        <span className="text-gray-700">Page {page + 1} of {Math.ceil(filteredRows.length / pageSize)}</span>
                        <button onClick={() => setPage((prev) => prev < Math.ceil(filteredRows.length / pageSize) - 1 ? prev + 1 : prev)} disabled={page >= Math.ceil(filteredRows.length / pageSize) - 1} className="px-4 py-2 bg-blue-200 text-black rounded-md hover:bg-blue-200 disabled:bg-gray-300">
                            <HiChevronRight size={20} />
                        </button>
                    </div>
                </div>
                <div className="w-full mr-4 pl-3 h-[130px] md-0 pd-0">
                    <div className="bg-white rounded-lg shadow-lg p-4 h-[325px] ">
                        <h2 className="text-xl font-serif text-gray-700 ">User Status Chart</h2>
                        <BarChart
                            xAxis={[{ scaleType: "band", data: ["Active", "Inactive"] }]}
                            series={[
                                {
                                    data: [filteredRows.filter(user => user.status.toLowerCase() === "active").length],
                                    label: 'Active',
                                    color: '#4CAF50'
                                },
                                {
                                    data: [filteredRows.filter(user => user.status.toLowerCase() === "inactive").length],
                                    label: 'Inactive',
                                    color: '#F44336'
                                },
                            ]}
                            width={400}
                            height={300}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Table;