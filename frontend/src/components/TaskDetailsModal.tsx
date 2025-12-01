import React, { useState, useEffect } from 'react';
import { X, Calendar, User, AlignLeft, CheckSquare, Clock, AlertCircle } from 'lucide-react';
import { Task } from '../types/task';

interface UserOption {
  id: number;
  name: string;
  email: string;
  role: string;
}

interface TaskDetailsModalProps {
  task: Task | null;
  onClose: () => void;
  onTaskUpdate: () => Promise<void>;
}

const TaskDetailsModal: React.FC<TaskDetailsModalProps> = ({ task, onClose, onTaskUpdate }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editedTask, setEditedTask] = useState<Partial<Task>>({});
  const [users, setUsers] = useState<UserOption[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(false);

  useEffect(() => {
    if (task) {
      setEditedTask(task);
    }
  }, [task]);

  useEffect(() => {
    // Fetch users when modal opens
    const fetchUsers = async () => {
      setLoadingUsers(true);
      try {
        const response = await fetch('/api/auth/users', {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
          },
        });
        if (response.ok) {
          const result = await response.json();
          setUsers(result.data || []);
        }
      } catch (error) {
        console.error('Error fetching users:', error);
      } finally {
        setLoadingUsers(false);
      }
    };

    if (task) {
      fetchUsers();
    }
  }, [task]);

  if (!task) return null;

  const handleSave = async () => {
    if (task.id) {
      // Update task via API
      await fetch(`/api/tasks/${task.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify(editedTask),
      });
      await onTaskUpdate();
      setIsEditing(false);
    }
  };

  const statusOptions = [
    { value: 'TODO', label: 'To Do', icon: AlertCircle, color: 'text-gray-500' },
    { value: 'IN_PROGRESS', label: 'In Progress', icon: Clock, color: 'text-blue-500' },
    { value: 'DONE', label: 'Done', icon: CheckSquare, color: 'text-green-500' }
  ];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b">
            {isEditing ? (
                <input
                    type="text"
                    value={editedTask.title}
                    onChange={(e) => setEditedTask({ ...editedTask, title: e.target.value })}
                    className="text-xl font-bold w-full border rounded px-2 py-1"
                />
            ) : (
                <h2 className="text-xl font-bold text-gray-800">{task.title}</h2>
            )}
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <X size={24} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          
          {/* Status Selector (The New Feature) */}
          <div className="flex items-center space-x-3">
             <div className="w-full">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                    Status
                </label>
                {isEditing ? (
                    <select
                        value={editedTask.status}
                        onChange={(e) => setEditedTask({ ...editedTask, status: e.target.value })}
                        className="w-full p-2 border border-gray-300 rounded-md shadow-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                    >
                        {statusOptions.map((option) => (
                            <option key={option.value} value={option.value}>
                                {option.label}
                            </option>
                        ))}
                    </select>
                ) : (
                    <div className={`flex items-center space-x-2 px-3 py-1 rounded-full bg-gray-100 w-fit ${statusOptions.find(o => o.value === task.status)?.color}`}>
                        <span className="font-medium">
                            {statusOptions.find(o => o.value === task.status)?.label || task.status}
                        </span>
                    </div>
                )}
             </div>
          </div>

          {/* Description */}
          <div className="space-y-2">
            <div className="flex items-center text-gray-600">
              <AlignLeft size={20} className="mr-2" />
              <h3 className="font-semibold">Description</h3>
            </div>
            {isEditing ? (
              <textarea
                value={editedTask.description || ''}
                onChange={(e) => setEditedTask({ ...editedTask, description: e.target.value })}
                className="w-full h-32 p-3 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Add a more detailed description..."
              />
            ) : (
              <div className="bg-gray-50 p-4 rounded-md text-gray-700 min-h-[5rem] whitespace-pre-wrap">
                {task.description || "No description provided."}
              </div>
            )}
          </div>

          {/* Assignee Selection */}
          <div className="space-y-2">
            <div className="flex items-center text-gray-600">
              <User size={20} className="mr-2" />
              <h3 className="font-semibold">Assignee</h3>
            </div>
            {isEditing ? (
              <select
                value={editedTask.assigneeId || ''}
                onChange={(e) => setEditedTask({ ...editedTask, assigneeId: e.target.value ? Number(e.target.value) : null })}
                className="w-full p-2 border border-gray-300 rounded-md shadow-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                disabled={loadingUsers}
              >
                <option value="">Unassigned</option>
                {users.map((user) => (
                  <option key={user.id} value={user.id}>
                    {user.name} ({user.role})
                  </option>
                ))}
              </select>
            ) : (
              <div className="bg-gray-50 p-3 rounded-md text-gray-700">
                {task.assigneeId ?
                  users.find(u => u.id === task.assigneeId)?.name || `User #${task.assigneeId}` :
                  "Unassigned"
                }
              </div>
            )}
          </div>

          {/* Meta Information */}
          <div className="grid grid-cols-2 gap-4 text-sm text-gray-500 pt-4 border-t">
            <div className="flex items-center">
              <Calendar size={16} className="mr-2" />
              <span>Created: {task.createdAt ? new Date(task.createdAt).toLocaleDateString() : 'N/A'}</span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 border-t bg-gray-50 flex justify-end space-x-3 rounded-b-lg">
          {isEditing ? (
            <>
              <button
                onClick={() => setIsEditing(false)}
                className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                className="px-4 py-2 text-white bg-blue-600 rounded-md hover:bg-blue-700"
              >
                Save
              </button>
            </>
          ) : (
            <button
              onClick={() => setIsEditing(true)}
              className="px-4 py-2 text-white bg-blue-600 rounded-md hover:bg-blue-700"
            >
              Edit
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default TaskDetailsModal;