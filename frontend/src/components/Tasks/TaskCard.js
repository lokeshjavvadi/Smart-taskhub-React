import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import { updateTask, deleteTask } from '../../store/slices/taskSlice';
import toast from 'react-hot-toast';

const TaskCard = ({ task }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({
    title: task.title,
    description: task.description,
    priority: task.priority
  });
  const dispatch = useDispatch();

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800 border-red-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low': return 'bg-green-100 text-green-800 border-green-200';
      case 'critical': return 'bg-purple-100 text-purple-800 border-purple-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusButtons = () => {
    switch (task.status) {
      case 'todo':
        return [
          { label: 'Start', status: 'in-progress', color: 'bg-blue-100 text-blue-700 hover:bg-blue-200' },
          { label: 'Complete', status: 'completed', color: 'bg-green-100 text-green-700 hover:bg-green-200' }
        ];
      case 'in-progress':
        return [
          { label: 'Review', status: 'review', color: 'bg-yellow-100 text-yellow-700 hover:bg-yellow-200' },
          { label: 'Complete', status: 'completed', color: 'bg-green-100 text-green-700 hover:bg-green-200' }
        ];
      case 'review':
        return [
          { label: 'In Progress', status: 'in-progress', color: 'bg-blue-100 text-blue-700 hover:bg-blue-200' },
          { label: 'Complete', status: 'completed', color: 'bg-green-100 text-green-700 hover:bg-green-200' }
        ];
      case 'completed':
        return [
          { label: 'Reopen', status: 'todo', color: 'bg-gray-100 text-gray-700 hover:bg-gray-200' }
        ];
      default:
        return [];
    }
  };

  const handleEdit = async () => {
    if (!editData.title.trim()) {
      toast.error('Title is required');
      return;
    }

    try {
      await dispatch(updateTask({
        taskId: task._id,
        taskData: editData
      })).unwrap();
      toast.success('Task updated successfully!');
      setIsEditing(false);
    } catch (error) {
      toast.error('Failed to update task');
    }
  };

  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this task?')) {
      try {
        await dispatch(deleteTask(task._id)).unwrap();
        toast.success('Task deleted successfully!');
      } catch (error) {
        toast.error('Failed to delete task');
      }
    }
  };

  const handleStatusChange = async (newStatus) => {
    try {
      await dispatch(updateTask({
        taskId: task._id,
        taskData: { status: newStatus }
      })).unwrap();
      
      const statusMessages = {
        'todo': 'moved to To Do',
        'in-progress': 'started',
        'review': 'moved to Review',
        'completed': 'completed'
      };
      
      toast.success(`Task ${statusMessages[newStatus] || 'updated'}!`);
    } catch (error) {
      toast.error('Failed to update task status');
    }
  };

  const statusButtons = getStatusButtons();

  return (
    <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-all duration-200">
      {/* Header with Priority and Menu */}
      <div className="flex justify-between items-start mb-3">
        <div className="flex items-center gap-2">
          <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getPriorityColor(task.priority)}`}>
            {task.priority}
          </span>
          <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
            {task.status.replace('-', ' ')}
          </span>
        </div>
        
        {/* AI Score and Menu */}
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center text-white text-xs font-medium">
            {task.aiPriorityScore}
          </div>
          
          {/* Three-dot Menu */}
          <div className="relative">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="text-gray-400 hover:text-gray-600 p-1 rounded hover:bg-gray-100"
            >
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 16 16">
                <path d="M9.5 13a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0zm0-5a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0zm0-5a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0z"/>
              </svg>
            </button>

            {isMenuOpen && (
              <div className="absolute right-0 mt-1 w-48 bg-white rounded-md shadow-lg border border-gray-200 z-10">
                <div className="py-1">
                  <button
                    onClick={() => {
                      setIsEditing(true);
                      setIsMenuOpen(false);
                    }}
                    className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left"
                  >
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                    Edit Task
                  </button>
                  <button
                    onClick={handleDelete}
                    className="flex items-center px-4 py-2 text-sm text-red-600 hover:bg-gray-100 w-full text-left"
                  >
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                    Delete Task
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Task Content */}
      {isEditing ? (
        <div className="space-y-3">
          <input
            type="text"
            value={editData.title}
            onChange={(e) => setEditData({...editData, title: e.target.value})}
            className="w-full p-2 border border-gray-300 rounded text-sm font-medium"
            placeholder="Task title"
          />
          <textarea
            value={editData.description}
            onChange={(e) => setEditData({...editData, description: e.target.value})}
            rows="2"
            className="w-full p-2 border border-gray-300 rounded text-sm"
            placeholder="Task description"
          />
          <select
            value={editData.priority}
            onChange={(e) => setEditData({...editData, priority: e.target.value})}
            className="w-full p-2 border border-gray-300 rounded text-sm"
          >
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
            <option value="critical">Critical</option>
          </select>
          <div className="flex gap-2">
            <button
              onClick={handleEdit}
              className="px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700"
            >
              Save
            </button>
            <button
              onClick={() => {
                setIsEditing(false);
                setEditData({
                  title: task.title,
                  description: task.description,
                  priority: task.priority
                });
              }}
              className="px-3 py-1 text-gray-600 text-sm border border-gray-300 rounded hover:bg-gray-50"
            >
              Cancel
            </button>
          </div>
        </div>
      ) : (
        <>
          <h4 className="font-medium text-gray-900 mb-2 line-clamp-2 cursor-pointer hover:text-blue-600 transition-colors">
            {task.title}
          </h4>
          {task.description && (
            <p className="text-sm text-gray-600 mb-2 line-clamp-2">
              {task.description}
            </p>
          )}
          {task.dueDate && (
            <p className="text-sm text-gray-500 mb-3">
              Due: {new Date(task.dueDate).toLocaleDateString()}
            </p>
          )}

          {/* Dynamic Status Actions */}
          {statusButtons.length > 0 && (
            <div className={`grid gap-1 mb-3 ${statusButtons.length === 2 ? 'grid-cols-2' : 'grid-cols-1'}`}>
              {statusButtons.map((button) => (
                <button
                  key={button.status}
                  onClick={() => handleStatusChange(button.status)}
                  className={`px-2 py-1 text-xs rounded transition-colors ${button.color}`}
                >
                  {button.label}
                </button>
              ))}
            </div>
          )}

          {/* Assigned Users */}
          <div className="flex items-center">
            {task.assignedTo && task.assignedTo.map(user => (
              <img
                key={user._id}
                src={user.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}&background=random`}
                alt={user.name}
                className="w-6 h-6 rounded-full -ml-2 first:ml-0 border-2 border-white"
                title={user.name}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
};

export default TaskCard;