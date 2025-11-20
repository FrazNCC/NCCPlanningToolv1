
import React, { useState } from 'react';
import { Teacher } from '../types';
import { PlusIcon, TrashIcon } from './Icons';

interface TeacherEditorProps {
  teachers: Teacher[];
  onAddTeacher: (name: string, allowance: number) => void;
  onUpdateTeacher: (id: string, name: string, allowance: number) => void;
  onDeleteTeacher: (id: string) => void;
}

const TeacherEditor: React.FC<TeacherEditorProps> = ({ teachers, onAddTeacher, onUpdateTeacher, onDeleteTeacher }) => {
  const [newName, setNewName] = useState('');
  const [newAllowance, setNewAllowance] = useState(0);

  const handleAddTeacher = (e: React.FormEvent) => {
    e.preventDefault();
    if (newName.trim() && newAllowance >= 0) {
      onAddTeacher(newName, newAllowance);
      setNewName('');
      setNewAllowance(0);
    }
  };

  return (
    <div className="p-4 md:p-6 bg-white dark:bg-gray-800 rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-6 text-gray-800 dark:text-gray-100">Manage Teachers</h2>
      
      <div className="space-y-4 mb-8">
        {teachers.map(teacher => (
          <div key={teacher.id} className="flex items-center space-x-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-md">
            <input
              type="text"
              value={teacher.name}
              onChange={(e) => onUpdateTeacher(teacher.id, e.target.value, teacher.allowance)}
              className="flex-grow p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-200 focus:ring-2 focus:ring-indigo-500"
              placeholder="Teacher Name/Initials"
            />
            <input
              type="number"
              value={teacher.allowance}
              onChange={(e) => onUpdateTeacher(teacher.id, teacher.name, parseFloat(e.target.value) || 0)}
              className="w-32 p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-200 focus:ring-2 focus:ring-indigo-500"
              placeholder="Allowance"
              step="0.1"
              min="0"
            />
            <button
              onClick={() => onDeleteTeacher(teacher.id)}
              className="p-2 text-red-500 hover:bg-red-100 dark:hover:bg-red-900/50 rounded-full transition-colors"
            >
              <TrashIcon />
            </button>
          </div>
        ))}
      </div>
      
      <form onSubmit={handleAddTeacher} className="p-4 border-t border-gray-200 dark:border-gray-700">
        <h3 className="text-lg font-semibold mb-3 text-gray-700 dark:text-gray-200">Add New Teacher</h3>
        <div className="flex items-center space-x-3">
          <input
            type="text"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            className="flex-grow p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-200 focus:ring-2 focus:ring-indigo-500"
            placeholder="Teacher Name/Initials"
          />
          <input
            type="number"
            value={newAllowance}
            onChange={(e) => setNewAllowance(parseFloat(e.target.value) || 0)}
            className="w-32 p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-200 focus:ring-2 focus:ring-indigo-500"
            placeholder="Allowance"
            step="0.1"
            min="0"
          />
          <button
            type="submit"
            className="flex items-center justify-center p-2 bg-indigo-600 text-white rounded-full hover:bg-indigo-700 transition-colors shadow"
          >
            <PlusIcon />
          </button>
        </div>
      </form>
    </div>
  );
};

export default TeacherEditor;
