import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { fetchProjectTasks } from '../store/slices/taskSlice';
import TaskBoard from '../components/Tasks/TaskBoard';
import CreateTaskModal from '../components/Tasks/CreateTaskModal';
import ProjectSettingsModal from '../components/Projects/ProjectSettingsModal';

const ProjectBoard = () => {
  const { projectId } = useParams();
  const dispatch = useDispatch();
  const { currentProject } = useSelector(state => state.projects);
  const [showSettings, setShowSettings] = useState(false);

  useEffect(() => {
    if (projectId) {
      dispatch(fetchProjectTasks(projectId));
    }
  }, [projectId, dispatch]);

  return (
    <div className="container mx-auto px-4 py-6">
      {/* Header with Project Info and Actions */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
              {currentProject?.name || 'Project Board'}
            </h1>
            <button
              onClick={() => setShowSettings(true)}
              className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
              title="Project Settings"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </button>
          </div>
          <p className="text-gray-600">
            {currentProject?.description || 'Manage your project tasks'}
          </p>
        </div>
        <div className="w-full sm:w-auto">
          <CreateTaskModal projectId={projectId} />
        </div>
      </div>
      
      {/* Task Board */}
      <TaskBoard projectId={projectId} />

      {/* Project Settings Modal */}
      {currentProject && (
        <ProjectSettingsModal
          project={currentProject}
          isOpen={showSettings}
          onClose={() => setShowSettings(false)}
        />
      )}
    </div>
  );
};

export default ProjectBoard;
