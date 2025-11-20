
import React, { useState, useCallback } from 'react';
import { Teacher, Course, Unit, AppView } from './types';
import { initialTeachers, initialCourses } from './data';
import PlanningGrid from './components/PlanningGrid';
import TeacherEditor from './components/TeacherEditor';
import CourseEditor from './components/CourseEditor';
import { GridIcon, BookIcon, UsersIcon } from './components/Icons';

const App: React.FC = () => {
  const [teachers, setTeachers] = useState<Teacher[]>(initialTeachers);
  const [courses, setCourses] = useState<Course[]>(initialCourses);
  const [activeView, setActiveView] = useState<AppView>('grid');

  // --- Teacher Management ---
  const addTeacher = useCallback((name: string, allowance: number) => {
    const newTeacher: Teacher = { id: name.toUpperCase() + Date.now(), name, allowance };
    setTeachers(prev => [...prev, newTeacher]);
  }, []);

  const updateTeacher = useCallback((id: string, name: string, allowance: number) => {
    setTeachers(prev => prev.map(t => t.id === id ? { ...t, name, allowance } : t));
  }, []);

  const deleteTeacher = useCallback((id: string) => {
    setTeachers(prev => prev.filter(t => t.id !== id));
    // Also remove their assignments from courses
    setCourses(prevCourses => prevCourses.map(course => ({
        ...course,
        units: course.units.map(unit => {
            const newAssignments = { ...unit.assignments };
            delete newAssignments[id];
            return { ...unit, assignments: newAssignments };
        })
    })));
  }, []);

  // --- Course & Unit Management ---
  const addCourse = useCallback((name: string, targetHours: number) => {
    const newCourse: Course = { id: `c${Date.now()}`, name, targetHours, units: [] };
    setCourses(prev => [...prev, newCourse]);
  }, []);

  const updateCourse = useCallback((id: string, name: string, targetHours: number) => {
    setCourses(prev => prev.map(c => c.id === id ? { ...c, name, targetHours } : c));
  }, []);
  
  const deleteCourse = useCallback((id: string) => {
    setCourses(prev => prev.filter(c => c.id !== id));
  }, []);

  const addUnit = useCallback((courseId: string, name: string) => {
    const newUnit: Unit = { id: `u${Date.now()}`, name, assignments: {} };
    setCourses(prev => prev.map(c => c.id === courseId ? { ...c, units: [...c.units, newUnit] } : c));
  }, []);

  const updateUnit = useCallback((courseId: string, unitId: string, name: string) => {
    setCourses(prev => prev.map(c => {
      if (c.id !== courseId) return c;
      return {
        ...c,
        units: c.units.map(u => u.id === unitId ? { ...u, name } : u),
      };
    }));
  }, []);

  const deleteUnit = useCallback((courseId: string, unitId: string) => {
    setCourses(prev => prev.map(c => c.id === courseId ? { ...c, units: c.units.filter(u => u.id !== unitId) } : c));
  }, []);

  // --- Assignment Management ---
  const updateAssignment = useCallback((courseId: string, unitId: string, teacherId: string, hours: number) => {
    setCourses(prevCourses =>
      prevCourses.map(course => {
        if (course.id !== courseId) return course;
        return {
          ...course,
          units: course.units.map(unit => {
            if (unit.id !== unitId) return unit;
            const newAssignments = { ...unit.assignments };
            if (hours > 0) {
              newAssignments[teacherId] = hours;
            } else {
              delete newAssignments[teacherId];
            }
            return { ...unit, assignments: newAssignments };
          }),
        };
      })
    );
  }, []);

  const renderView = () => {
    switch (activeView) {
      case 'courses':
        return <CourseEditor 
                    courses={courses} 
                    onAddCourse={addCourse} 
                    onUpdateCourse={updateCourse}
                    onDeleteCourse={deleteCourse} 
                    onAddUnit={addUnit} 
                    onUpdateUnit={updateUnit}
                    onDeleteUnit={deleteUnit} />;
      case 'teachers':
        return <TeacherEditor teachers={teachers} onAddTeacher={addTeacher} onUpdateTeacher={updateTeacher} onDeleteTeacher={deleteTeacher} />;
      case 'grid':
      default:
        return <PlanningGrid 
                  teachers={teachers} 
                  courses={courses} 
                  onUpdateAssignment={updateAssignment}
                />;
    }
  };

  const NavButton: React.FC<{view: AppView; label: string; icon: React.ReactNode}> = ({view, label, icon}) => (
    <button
        onClick={() => setActiveView(view)}
        className={`flex-1 sm:flex-none flex items-center justify-center sm:justify-start space-x-2 px-3 sm:px-4 py-3 text-sm font-medium rounded-md transition-colors ${
        activeView === view
            ? 'bg-indigo-600 text-white shadow'
            : 'text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
        }`}
    >
        {icon}
        <span className="hidden sm:inline">{label}</span>
    </button>
  );

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-gray-100">
      <header className="bg-white dark:bg-gray-800 shadow-md p-4">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
            <h1 className="text-2xl md:text-3xl font-bold text-indigo-600 dark:text-indigo-400">
                Course Planner
            </h1>
            <nav className="flex space-x-2 bg-gray-100 dark:bg-gray-900 p-1 rounded-lg">
                <NavButton view="grid" label="Planning Grid" icon={<GridIcon/>}/>
                <NavButton view="courses" label="Courses" icon={<BookIcon/>}/>
                <NavButton view="teachers" label="Teachers" icon={<UsersIcon/>}/>
            </nav>
        </div>
      </header>
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        {renderView()}
      </main>
    </div>
  );
};

export default App;
