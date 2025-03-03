"use client";
import React, { useEffect, useState } from 'react';

interface Project {
  name: string;
  progress: number;
  time: string;
  color: string;
}

const RunningProjects: React.FC = () => {
  const [projects, setProjects] = useState<Project[]>([]);

  // Fetch data from project.json
  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch('/project.json');
        const data = await response.json();
        setProjects(data);
      } catch (error) {
        console.error('Error fetching project data:', error);
      }
    };

    fetchData();
  }, []);

  return (
    <div className="bg-white rounded-lg shadow-md p-4 w-1/3">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-serif text-black">Running Projects</h2>
        <select className="bg-gray-50 border border-white-300 text-black text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block  p-2.5 dark:placeholder-gray-400 dark:text-black dark:focus:ring-blue-500 dark:focus:border-blue-500 border border-gray-300 rounded px-2 py-1 text-sm text-black">
          <option>Working Time</option>
          <option>Completion</option>
        </select>
      </div>

      <ul>
        {projects.map((project, index) => (
          <li key={index} className="flex items-center justify-between mb-3">
            <div className="flex items-center">
              <div
                className={`w-8 h-8 rounded-full flex items-center text-black justify-center ${project.color}`}
              >
                {project.name[0]}
              </div>
              <div className="ml-3">
                <p className="text-sm font-semibold text-black">{project.name}</p>
                <span className="text-xs text-blue-600 bg-blue-100 rounded px-1">
                  {project.progress}%
                </span>
              </div>
            </div>
            <div className="flex items-center">
              <span className="text-sm text-black">{project.time}</span>
              <div className="w-16 h-2 bg-gray-200 rounded-full ml-2">
                <div
                  className="h-2 bg-blue-600 rounded-full"
                  style={{ width: `${project.progress}%` }}
                ></div>
              </div>
            </div>
          </li>
        ))}
      </ul>

      <div className="text-center mt-4">
        <a href="#" className="text-blue-600 text-sm hover:underline">
          Show all projects
        </a>
      </div>
    </div>
  );
};

export default RunningProjects;
