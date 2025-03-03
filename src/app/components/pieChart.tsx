"use client";
import { PieChart, Pie, Cell, Tooltip, Legend } from "recharts";

interface PieChartProps {
  activeUsers: number;
  inactiveUsers: number;
}

const PieChartComponent = ({ activeUsers, inactiveUsers }: PieChartProps) => {

  const pieData = [
    { name: "Active ", value: activeUsers },
    { name: "Inactive", value: inactiveUsers },
  ];

  const COLORS = ["#4CAF50", "#FF5733"]; 

  return (
    <div className=" p-4 rounded-lg  w-full font-serif flex justify-center">
      <PieChart width={400} height={300}>
        <Pie
          data={pieData}
          cx="50%"
          cy="50%"
          outerRadius={100}
          fill="#8884d8"
          dataKey="value"
          label
        >
          {pieData.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={COLORS[index]} />
          ))}
        </Pie>
        <Tooltip />
        <Legend />
      </PieChart>
    </div>
  );
};

export default PieChartComponent;
