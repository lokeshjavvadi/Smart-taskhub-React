import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { fetchUserProjects } from '../store/slices/projectSlice';
import CreateProjectModal from '../components/Projects/CreateProjectModal';

const Dashboard = () => {
  const dispatch = useDispatch();
  const { projects, loading } = useSelector(state => state.projects);

  useEffect(() => {
    dispatch(fetchUserProjects());
  }, [dispatch]);

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-6">
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900">My Projects</h1>
        <CreateProjectModal />
      </div>

      {projects.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects.map(project => (
            <Link
              key={project._id}
              to={`/project/${project._id}`}
              className="bg-white p-6 rounded-lg shadow-sm border hover:shadow-md transition-shadow"
            >
              <div className="flex items-center mb-3">
                <div 
                  className="w-4 h-4 rounded-full mr-3"
                  style={{ backgroundColor: project.color }}
                ></div>
                <h3 className="text-xl font-semibold text-gray-900">
                  {project.name}
                </h3>
              </div>
              <p className="text-gray-600 text-sm mb-4">
                {project.description || 'No description'}
              </p>
              <div className="text-xs text-gray-500">
                Created by: {project.createdBy?.name || 'Unknown'}
              </div>
            </Link>
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <div className="bg-white rounded-lg p-8 max-w-md mx-auto">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl">📁</span>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              No Projects Yet
            </h2>
            <p className="text-gray-600 mb-6">
              Create your first project to start organizing your tasks and collaborating with your team.
            </p>
            <CreateProjectModal />
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;

/* 


import React from 'react';
import { Link } from 'react-router-dom';
import CreateProjectModal from '../components/Projects/CreateProjectModal';

const Dashboard = () => {
  // Temporary project data - in real app, this would come from Redux
  const projects = [
    { _id: 'project1', name: 'Website Redesign', description: 'Redesign company website' },
    { _id: 'project2', name: 'Mobile App', description: 'Develop new mobile application' },
  ];

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900">My Projects</h1>
        <CreateProjectModal />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {projects.map(project => (
          <Link
            key={project._id}
            to={`/project/${project._id}`}
            className="bg-white p-6 rounded-lg shadow-sm border hover:shadow-md transition-shadow"
          >
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              {project.name}
            </h3>
            <p className="text-gray-600">
              {project.description}
            </p>
          </Link>
        ))}
      </div>

      {projects.length === 0 && (
        <div className="text-center py-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            No Projects Yet
          </h2>
          <p className="text-gray-600 mb-6">
            Create your first project to start managing tasks.
          </p>
        </div>
      )}
    </div>
  );
};

export default Dashboard;  */