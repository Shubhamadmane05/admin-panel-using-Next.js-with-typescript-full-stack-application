"use client"
import React, { useState, useEffect } from 'react';

const ProgressList = () => {
  const [data, setData] = useState([]);
  useEffect(() => {
    fetch('/project.json')
      .then(response => response.json())
      .then(data => setData(data))
      .catch(error => console.error('Error fetching the JSON data:', error));
  }, []);

  return (
    <div className="p-6 space-y-4">
      {data.map((item, index) => (
        <div key={index} className="flex items-center space-x-4 p-4 bg-white shadow-lg rounded-lg">
          <div className={`w-3 h-3 ${item.color} rounded-full`} />
          <div className="flex-grow">
            <h3 className="text-xl font-semibold">{item.name}</h3>
            <p className="text-gray-500">{item.time}</p>
          </div>
          <div className="flex items-center space-x-2 w-32">
            <div className="relative w-full bg-gray-300 rounded-full h-2">
              <div
                className={`absolute top-0 left-0 h-2 ${item.color} rounded-full`}
                style={{ width: `${item.progress}%` }}
              />
            </div>
            <span className="text-sm">{item.progress}%</span>
          </div>
        </div>
      ))}
    </div>
  );
};

export default ProgressList;
