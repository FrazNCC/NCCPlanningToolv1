
import React, { useState, useCallback, useEffect } from 'react';
import { Teacher, Course, Unit, AppView, User } from './types';
import PlanningGrid from './components/PlanningGrid';
import TeacherEditor from './components/TeacherEditor';
import CourseEditor from './components/CourseEditor';
import AuthPage from './components/AuthPage';
import AdminPage from './components/AdminPage';
import { GridIcon, BookIcon, UsersIcon } from './components/Icons';

const App: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [activeView, setActiveView] = useState<AppView>('grid');
  const [isDataLoaded, setIsDataLoaded] = useState(false);

  // --- Auth & Persistence Logic ---

  // Check for existing session on mount
  useEffect(() => {
    const savedUser = localStorage.getItem('planner_active_user');
    if (savedUser) {
        const parsedUser = JSON.parse(savedUser);
        if (parsedUser.isAdmin) {
            setIsAdmin(true);
        } else {
            setUser(parsedUser);
        }
    }
  }, []);

  // Load user data when user logs in
  useEffect(() => {
    if (user) {
      const userData = localStorage.getItem(`planner_data_${user.username}`);
      if (userData) {
        const parsedData = JSON.parse(userData);
        setTeachers(parsedData.teachers);
        setCourses(parsedData.courses);
      } else {
        // Initialize new user with empty data
        setTeachers([]);
        setCourses([]);
      }
      setIsDataLoaded(true);
    } else {
      setTeachers([]);
      setCourses([]);
      setIsDataLoaded(false);
    }
  }, [user]);

  // Save user data whenever it changes (debounced by React's nature effectively here)
  useEffect(() => {
    if (user && isDataLoaded) {
      localStorage.setItem(`planner_data_${user.username}`, JSON.stringify({ teachers, courses }));
    }
  }, [teachers, courses, user, isDataLoaded]);

  const handleLogin = (loggedInUser: User) => {
    setUser(loggedInUser);
    localStorage.setItem('planner_active_user', JSON.stringify(loggedInUser));
  };

  const handleAdminLogin = () => {
      setIsAdmin(true);
      localStorage.setItem('planner_active_user', JSON.stringify({ isAdmin: true, username: 'Admin' }));
  }

  const handleLogout = () => {
    setUser(null);
    setIsAdmin(false);
    localStorage.removeItem('planner_active_user');
    setActiveView('grid');
  };

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

  const clearAllAssignments = useCallback(() => {
    setCourses(prevCourses => 
        prevCourses.map(course => ({
            ...course,
            units: course.units.map(unit => ({
                ...unit,
                assignments: {}
            }))
        }))
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
                  onClearAllAssignments={clearAllAssignments}
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

  if (isAdmin) {
      return <AdminPage onLogout={handleLogout} />;
  }

  if (!user) {
    return <AuthPage onLogin={handleLogin} onAdminLogin={handleAdminLogin} />;
  }

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-gray-100">
      <header className="bg-white dark:bg-gray-800 shadow-md p-4">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
            <h1 className="text-2xl md:text-3xl font-bold text-indigo-600 dark:text-indigo-400">
                Course Planner
            </h1>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600 dark:text-gray-400 hidden sm:inline">
                User: <span className="font-semibold text-gray-800 dark:text-gray-200">{user.username}</span>
              </span>
              <button 
                onClick={handleLogout}
                className="text-sm text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300 font-medium"
              >
                Logout
              </button>
            </div>
        </div>
      </header>
      
      {/* Secondary Nav Bar */}
      <div className="bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4">
            <nav className="flex space-x-2 py-2">
                <NavButton view="grid" label="Planning Grid" icon={<GridIcon/>}/>
                <NavButton view="courses" label="Courses" icon={<BookIcon/>}/>
                <NavButton view="teachers" label="Teachers" icon={<UsersIcon/>}/>
            </nav>
        </div>
      </div>

      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        {renderView()}
      </main>
    </div>
  );
};

export default App;
