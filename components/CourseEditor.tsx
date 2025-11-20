
import React, { useState } from 'react';
import { Course, Unit } from '../types';
import Modal from './Modal';
import { PlusIcon, TrashIcon, EditIcon, ChevronDownIcon, ChevronUpIcon } from './Icons';

interface CourseEditorProps {
  courses: Course[];
  onAddCourse: (name: string, targetHours: number) => void;
  onUpdateCourse: (id: string, name: string, targetHours: number) => void;
  onDeleteCourse: (id: string) => void;
  onAddUnit: (courseId: string, name: string) => void;
  onUpdateUnit: (courseId: string, unitId: string, name: string) => void;
  onDeleteUnit: (courseId: string, unitId: string) => void;
}

const CourseEditor: React.FC<CourseEditorProps> = ({ courses, onAddCourse, onUpdateCourse, onDeleteCourse, onAddUnit, onUpdateUnit, onDeleteUnit }) => {
  const [courseModalState, setCourseModalState] = useState<{isOpen: boolean, mode: 'add' | 'edit', course?: Course}>({isOpen: false, mode: 'add'});
  const [unitModalState, setUnitModalState] = useState<{isOpen: boolean, mode: 'add' | 'edit', courseId?: string, unit?: Unit}>({isOpen: false, mode: 'add'});
  
  const [courseName, setCourseName] = useState('');
  const [courseTargetHours, setCourseTargetHours] = useState(0);
  const [unitName, setUnitName] = useState('');
  
  const [expandedCourses, setExpandedCourses] = useState<Record<string, boolean>>({});

  // --- Course Modal Handlers ---
  const openAddCourseModal = () => {
    setCourseName('');
    setCourseTargetHours(0);
    setCourseModalState({isOpen: true, mode: 'add'});
  };

  const openEditCourseModal = (course: Course) => {
    setCourseName(course.name);
    setCourseTargetHours(course.targetHours || 0);
    setCourseModalState({isOpen: true, mode: 'edit', course});
  };

  const closeCourseModal = () => {
    setCourseModalState({isOpen: false, mode: 'add'});
    setCourseName('');
    setCourseTargetHours(0);
  };

  const handleCourseSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!courseName.trim()) return;

    if (courseModalState.mode === 'add') {
      onAddCourse(courseName.trim(), courseTargetHours);
    } else if (courseModalState.mode === 'edit' && courseModalState.course) {
      onUpdateCourse(courseModalState.course.id, courseName.trim(), courseTargetHours);
    }
    closeCourseModal();
  };

  // --- Unit Modal Handlers ---
  const openAddUnitModal = (courseId: string) => {
    setUnitName('');
    setUnitModalState({ isOpen: true, mode: 'add', courseId });
  };
  
  const openEditUnitModal = (courseId: string, unit: Unit) => {
    setUnitName(unit.name);
    setUnitModalState({ isOpen: true, mode: 'edit', courseId, unit });
  };

  const closeUnitModal = () => {
    setUnitModalState({ isOpen: false, mode: 'add' });
    setUnitName('');
  };

  const handleUnitSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!unitName.trim() || !unitModalState.courseId) return;

    if (unitModalState.mode === 'add') {
        onAddUnit(unitModalState.courseId, unitName.trim());
    } else if (unitModalState.mode === 'edit' && unitModalState.unit) {
        onUpdateUnit(unitModalState.courseId, unitModalState.unit.id, unitName.trim());
    }
    closeUnitModal();
  };

  const toggleExpand = (courseId: string) => {
    setExpandedCourses(prev => ({...prev, [courseId]: !prev[courseId]}));
  };

  return (
    <div className="p-4 md:p-6 bg-white dark:bg-gray-800 rounded-lg shadow-md">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100">Manage Courses</h2>
        <button
          onClick={openAddCourseModal}
          className="flex items-center space-x-2 px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors shadow"
        >
          <PlusIcon />
          <span>Add Course</span>
        </button>
      </div>

      <div className="space-y-4">
        {courses.map(course => (
          <div key={course.id} className="border border-gray-200 dark:border-gray-700 rounded-lg">
            <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/50 cursor-pointer" onClick={() => toggleExpand(course.id)}>
              <div>
                <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-200">{course.name}</h3>
                {course.targetHours && <p className="text-sm text-gray-500 dark:text-gray-400">Target: {course.targetHours} hours</p>}
              </div>
              <div className="flex items-center space-x-2">
                 <button
                  onClick={(e) => { e.stopPropagation(); openEditCourseModal(course); }}
                  className="p-1 text-blue-500 hover:text-blue-700"
                >
                  <EditIcon />
                </button>
                <button
                  onClick={(e) => { e.stopPropagation(); onDeleteCourse(course.id) }}
                  className="p-1 text-red-500 hover:text-red-700"
                >
                  <TrashIcon />
                </button>
                <button
                  onClick={(e) => { e.stopPropagation(); toggleExpand(course.id); }}
                  className="p-1 text-gray-500"
                >
                  {expandedCourses[course.id] ? <ChevronUpIcon/> : <ChevronDownIcon />}
                </button>
              </div>
            </div>
            {expandedCourses[course.id] && (
              <div className="p-4 border-t border-gray-200 dark:border-gray-700">
                <div className="flex justify-between items-center mb-3">
                    <h4 className="font-semibold text-gray-600 dark:text-gray-300">Units</h4>
                    <button onClick={() => openAddUnitModal(course.id)} className="text-sm flex items-center space-x-1 px-3 py-1 bg-green-500 text-white rounded-md hover:bg-green-600">
                        <PlusIcon/> <span>Add Unit</span>
                    </button>
                </div>
                <ul className="space-y-2">
                  {course.units.map(unit => (
                    <li key={unit.id} className="flex justify-between items-center p-2 bg-white dark:bg-gray-700 rounded-md">
                      <div>
                        <span className="font-medium text-gray-800 dark:text-gray-100">{unit.name}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <button onClick={() => openEditUnitModal(course.id, unit)} className="p-1 text-blue-500 hover:text-blue-700">
                           <EditIcon />
                        </button>
                        <button onClick={() => onDeleteUnit(course.id, unit.id)} className="p-1 text-red-500 hover:text-red-700">
                            <TrashIcon />
                        </button>
                      </div>
                    </li>
                  ))}
                  {course.units.length === 0 && <li className="text-gray-500 dark:text-gray-400 italic">No units yet.</li>}
                </ul>
              </div>
            )}
          </div>
        ))}
      </div>

      <Modal isOpen={courseModalState.isOpen} onClose={closeCourseModal} title={courseModalState.mode === 'add' ? "Add New Course" : "Edit Course"}>
        <form onSubmit={handleCourseSubmit} className="space-y-4">
          <div>
            <label htmlFor="courseName" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Course Name</label>
            <input
              type="text"
              id="courseName"
              value={courseName}
              onChange={(e) => setCourseName(e.target.value)}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-200"
              required
            />
          </div>
          <div>
            <label htmlFor="courseTargetHours" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Teaching Hours (Target)</label>
            <input
              type="number"
              id="courseTargetHours"
              value={courseTargetHours}
              onChange={(e) => setCourseTargetHours(parseFloat(e.target.value) || 0)}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-200"
              min="0"
              step="0.1"
            />
          </div>
          <div className="flex justify-end space-x-2 pt-2">
             <button type="button" onClick={closeCourseModal} className="px-4 py-2 border rounded-md text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700">Cancel</button>
            <button type="submit" className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700">{courseModalState.mode === 'add' ? "Add Course" : "Save Changes"}</button>
          </div>
        </form>
      </Modal>

      <Modal isOpen={unitModalState.isOpen} onClose={closeUnitModal} title={unitModalState.mode === 'add' ? "Add New Unit" : "Edit Unit"}>
        <form onSubmit={handleUnitSubmit}>
          <div className="mb-4">
            <label htmlFor="unitName" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Unit Name</label>
            <input
              type="text"
              id="unitName"
              value={unitName}
              onChange={(e) => setUnitName(e.target.value)}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-200"
              required
            />
          </div>
          <div className="flex justify-end space-x-2">
            <button type="button" onClick={closeUnitModal} className="px-4 py-2 border rounded-md text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700">Cancel</button>
            <button type="submit" className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700">{unitModalState.mode === 'add' ? "Add Unit" : "Save Changes"}</button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default CourseEditor;