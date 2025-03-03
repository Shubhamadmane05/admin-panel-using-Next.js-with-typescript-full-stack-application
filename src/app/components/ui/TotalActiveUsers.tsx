"use client";
import React from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

const data = [
  { date: 'Jan 5', users: 50 },
  { date: 'Jan 6', users: 80 },
  { date: 'Jan 7', users: 70 },
  { date: 'Jan 8', users: 100 },
  { date: 'Jan 9', users: 130 },
  { date: 'Jan 10', users: 120 },
  { date: 'Jan 11', users: 60 },
  { date: 'Jan 12', users: 40 },
  { date: 'Jan 13', users: 50 },
  { date: 'Jan 14', users: 70 },
  { date: 'Jan 15', users: 90 },
];

const TotalActiveUsers = () => {
  return (
    <div className="bg-white w-[600px] rounded-lg shadow-md p-4 mr-10 ">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-serif text-black">Total Active Users</h2>
        <select className="bg-gray-50 border border-white-300 text-black text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block  p-2.5 dark:placeholder-gray-400 dark:text-black dark:focus:ring-blue-500 dark:focus:border-blue-500 border border-gray-300 rounded px-2 py-1 text-sm text-black border border-gray-300 rounded px-2 py-1 text-black">
          <option>January</option>
          <option>February</option>
          <option>March</option>
        </select>
      </div>
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="date" />
          <YAxis />
          <Tooltip />
          <Line
            type="monotone"
            dataKey="users"
            stroke="#3b82f6"
            activeDot={{ r: 8 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default TotalActiveUsers;
