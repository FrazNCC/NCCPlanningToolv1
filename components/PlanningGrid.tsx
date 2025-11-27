
import React, { useMemo } from 'react';
import { Teacher, Course, Unit } from '../types';
import { XCircleIcon, TrashIcon } from './Icons';

interface PlanningGridProps {
  teachers: Teacher[];
  courses: Course[];
  onUpdateAssignment: (courseId: string, unitId: string, teacherId: string, hours: number) => void;
  onClearAllAssignments: () => void;
}

const PlanningGrid: React.FC<PlanningGridProps> = ({ teachers, courses, onUpdateAssignment, onClearAllAssignments }) => {
  const teacherTotals = useMemo(() => {
    const totals: Record<string, number> = {};
    teachers.forEach(t => totals[t.id] = 0);

    courses.forEach(course => {
      course.units.forEach(unit => {
        Object.entries(unit.assignments).forEach(([teacherId, hours]) => {
          if (totals[teacherId] !== undefined) {
            totals[teacherId] += hours as number;
          }
        });
      });
    });

    return totals;
  }, [teachers, courses]);

  const courseTotals = useMemo(() => {
    const totals: Record<string, { assigned: number }> = {};
    courses.forEach(course => {
        let assigned = 0;
        course.units.forEach(unit => {
            Object.values(unit.assignments).forEach(hours => {
                assigned += hours as number;
            });
        });
        totals[course.id] = { assigned };
    });
    return totals;
  }, [courses]);

  return (
    <div className="p-4 md:p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100">Planning Grid</h2>
        <button
          onClick={() => {
            if (window.confirm('Are you sure you want to clear all assignments? This cannot be undone.')) {
              onClearAllAssignments();
            }
          }}
          className="flex items-center space-x-2 px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 shadow transition-colors"
        >
          <TrashIcon />
          <span>Clear All</span>
        </button>
      </div>
      <div className="overflow-x-auto shadow-lg rounded-lg">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700 bg-white dark:bg-gray-800">
          <thead className="bg-gray-50 dark:bg-gray-700">
            <tr>
              <th scope="col" className="sticky left-0 bg-gray-50 dark:bg-gray-700 z-20 px-6 py-3 text-left text-xs font-bold text-gray-500 dark:text-gray-300 uppercase tracking-wider w-64">
                Course / Unit
              </th>
              {teachers.map(teacher => (
                <th key={teacher.id} scope="col" className="px-6 py-3 text-center text-xs font-bold text-gray-500 dark:text-gray-300 uppercase tracking-wider min-w-[100px]">
                  {teacher.name}
                </th>
              ))}
            </tr>
            {/* Summary Rows */}
            <tr className="bg-gray-100 dark:bg-gray-900/50">
                <th className="sticky left-0 bg-gray-100 dark:bg-gray-900/50 z-20 px-6 py-2 text-left text-xs font-medium text-gray-600 dark:text-gray-300">Teaching Hours</th>
                {teachers.map(t => <td key={t.id} className="px-6 py-2 text-center text-sm font-medium text-gray-800 dark:text-gray-200">{t.allowance}</td>)}
            </tr>
            <tr className="bg-gray-100 dark:bg-gray-900/50">
                <th className="sticky left-0 bg-gray-100 dark:bg-gray-900/50 z-20 px-6 py-2 text-left text-xs font-medium text-gray-600 dark:text-gray-300">Total Assigned</th>
                {teachers.map(t => <td key={t.id} className="px-6 py-2 text-center text-sm font-medium text-gray-800 dark:text-gray-200">{teacherTotals[t.id].toFixed(1)}</td>)}
            </tr>
             <tr className="bg-gray-100 dark:bg-gray-900/50 border-b-2 border-gray-300 dark:border-gray-600">
                <th className="sticky left-0 bg-gray-100 dark:bg-gray-900/50 z-20 px-6 py-2 text-left text-xs font-medium text-gray-600 dark:text-gray-300">Left</th>
                {teachers.map(t => {
                    const left = t.allowance - teacherTotals[t.id];
                    const textColor = left < 0 ? 'text-red-500' : 'text-green-500';
                    return <td key={t.id} className={`px-6 py-2 text-center text-sm font-bold ${textColor}`}>{left.toFixed(1)}</td>
                })}
            </tr>

          </thead>
          <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
            {courses.map(course => {
              const totalAssigned = courseTotals[course.id]?.assigned || 0;
              const targetHours = course.targetHours;
              const isOverBudget = targetHours !== undefined && totalAssigned > targetHours;

              return (
              <React.Fragment key={course.id}>
                <tr className="bg-indigo-100 dark:bg-indigo-900/30">
                  <td className="sticky left-0 bg-indigo-100 dark:bg-indigo-900/30 z-10 px-6 py-3 text-sm text-indigo-800 dark:text-indigo-200 w-64">
                    <div className="flex justify-between items-center flex-wrap gap-x-4 gap-y-1">
                        <div className="flex items-center gap-x-4 flex-wrap">
                            <span className="font-semibold">{course.name}</span>
                            <div className={`flex items-center gap-x-2 text-xs font-mono px-2 py-1 rounded ${isOverBudget ? 'bg-red-200 text-red-800 dark:bg-red-900/50 dark:text-red-200' : 'bg-indigo-200 dark:bg-indigo-800/50'}`}>
                               Assigned: {totalAssigned.toFixed(1)}
                               {targetHours !== undefined && ` / ${targetHours}`}
                            </div>
                        </div>
                    </div>
                  </td>
                  {/* Empty cells for teacher columns */}
                  {teachers.map(teacher => (
                    <td key={teacher.id} className="px-6 py-3"></td>
                  ))}
                </tr>
                {course.units.map(unit => {
                   const unitTotalAssigned = Object.values(unit.assignments).reduce<number>((sum, hours) => sum + (hours as number), 0);
                   return (
                  <tr key={unit.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                    <td className="sticky left-0 bg-white dark:bg-gray-800 z-10 px-6 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 w-64 whitespace-nowrap">
                        {unit.name}
                        <span className="ml-2 text-gray-400 dark:text-gray-500 text-xs">({unitTotalAssigned.toFixed(1)})</span>
                    </td>
                    {teachers.map(teacher => (
                      <td key={teacher.id} className="px-2 py-1 whitespace-nowrap text-sm text-gray-500">
                        <div className="relative">
                          <input
                            type="number"
                            step="0.5"
                            min="0"
                            value={unit.assignments[teacher.id] || ''}
                            onChange={(e) => onUpdateAssignment(course.id, unit.id, teacher.id, parseFloat(e.target.value) || 0)}
                            className="w-20 p-1 text-center border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-200 focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500"
                            placeholder="0"
                          />
                          {(unit.assignments[teacher.id] || 0) > 0 && (
                            <button onClick={() => onUpdateAssignment(course.id, unit.id, teacher.id, 0)} className="absolute right-1 top-1/2 -translate-y-1/2 text-gray-400 hover:text-red-500">
                               <XCircleIcon />
                            </button>
                          )}
                        </div>
                      </td>
                    ))}
                  </tr>
                )})}
              </React.Fragment>
            )})}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default PlanningGrid;
