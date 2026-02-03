import React, { useState, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import DaySchedule from '@/components/DaySchedule';
import PeriodViewByTime from '@/components/PeriodViewByTime';
import TeacherView from '@/components/TeacherView';
import timetableData from '@/data/timetable.json';

/**
 * Design Philosophy: Modern Professional
 * - Clean, hierarchical interface with sidebar navigation
 * - Color-coded subjects for quick identification
 * - Responsive grid layout for different screen sizes
 * - Smooth transitions and hover effects
 * - Three view modes: by class, by period time, and by teacher
 */

export default function Home() {
  const [selectedDay, setSelectedDay] = useState('sunday');
  const [selectedClass, setSelectedClass] = useState('1 ابتدائي (عربي)');
  const [selectedTeacher, setSelectedTeacher] = useState('');
  const [viewMode, setViewMode] = useState<'class' | 'period' | 'teacher'>('class');

  const currentDay = useMemo(
    () => timetableData.days.find((d) => d.id === selectedDay),
    [selectedDay]
  );

  // Get all classes from rawData
  const allClasses = useMemo(() => {
    const rawData = timetableData.rawData as Record<string, Record<string, any>>;
    const dayName = timetableData.days.find(d => d.id === selectedDay)?.name;
    if (!dayName || !rawData[dayName]) return [];
    return Object.keys(rawData[dayName]).sort();
  }, [selectedDay]);

  // Extract unique teachers from rawData
  const allTeachers = useMemo(() => {
    const rawData = timetableData.rawData as Record<string, Record<string, Array<any>>>;
    const teachers = new Set<string>();
    
    Object.values(rawData).forEach(dayData => {
      Object.values(dayData).forEach(classSchedule => {
        classSchedule.forEach(period => {
          if (period.teacher && period.teacher !== '' && period.teacher !== '---') {
            // Split names like "مريم/سارة" and add each teacher separately
            const names = period.teacher.split('/').map(t => t.trim());
            names.forEach(name => {
              if (name) teachers.add(name);
            });
          }
        });
      });
    });
    
    return Array.from(teachers).sort();
  }, []);

  // Set initial teacher if not set
  useMemo(() => {
    if (!selectedTeacher && allTeachers.length > 0) {
      setSelectedTeacher(allTeachers[0]);
    }
  }, [allTeachers, selectedTeacher]);

  // Update selected class if it doesn't exist in the new day
  useMemo(() => {
    if (allClasses.length > 0 && !allClasses.includes(selectedClass)) {
      setSelectedClass(allClasses[0]);
    }
  }, [allClasses, selectedClass]);

  // Get subjects for legend
  const subjects = useMemo(() => {
    const subjectsMap = timetableData.subjects as Record<string, any>;
    return Object.values(subjectsMap).filter(s => s.name !== '---');
  }, []);

  // Calculate weekly periods for each teacher
  const teacherStats = useMemo(() => {
    const rawData = timetableData.rawData as Record<string, Record<string, Array<any>>>;
    const stats: Record<string, number> = {};
    
    // Logic: If a teacher has multiple periods at the same time (same day and period number),
    // it should be counted as a single session.
    
    // First, collect all unique (day, periodNumber, teacher) combinations
    const teacherSessions = new Set<string>();
    
    Object.entries(rawData).forEach(([dayName, dayData]) => {
      Object.values(dayData).forEach(classSchedule => {
        classSchedule.forEach(period => {
          if (period.teacher && period.teacher !== '' && period.teacher !== '---') {
            // Split names like "مريم/سارة" and count for each teacher separately
            const names = period.teacher.split('/').map(t => t.trim());
            names.forEach(name => {
              if (name) {
                // Create a unique key for the session: "Day|PeriodNumber|Teacher"
                const sessionKey = `${dayName}|${period.period}|${name}`;
                teacherSessions.add(sessionKey);
              }
            });
          }
        });
      });
    });
    
    // Now count the unique sessions for each teacher
    teacherSessions.forEach(sessionKey => {
      const [,, teacherName] = sessionKey.split('|');
      stats[teacherName] = (stats[teacherName] || 0) + 1;
    });
    
    return Object.entries(stats)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count); // Sort by most periods
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-blue-900">الجدول المدرسي الذكي</h1>
              <p className="text-gray-600 mt-1">نظام عرض الجدول الدراسي المتقدم</p>
            </div>
            <div className="text-4xl">📅</div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Sidebar - Navigation */}
          <div className="lg:col-span-1">
            <div className="space-y-6 sticky top-8">
              {/* Day Selection */}
              <Card className="p-6 bg-white shadow-md">
                <h2 className="text-lg font-bold text-gray-900 mb-4">اختر اليوم</h2>
                <div className="space-y-2">
                  {timetableData.days.map((day) => (
                    <Button
                      key={day.id}
                      onClick={() => setSelectedDay(day.id)}
                      variant={selectedDay === day.id ? 'default' : 'outline'}
                      className="w-full justify-start text-right"
                    >
                      <span className="text-lg mr-2">📆</span>
                      {day.name}
                    </Button>
                  ))}
                </div>
              </Card>

              {/* Class Selection - Only show for class view */}
              {viewMode === 'class' && allClasses.length > 0 && (
                <Card className="p-6 bg-white shadow-md">
                  <h2 className="text-lg font-bold text-gray-900 mb-4">اختر الصف</h2>
                  <div className="space-y-2 max-h-96 overflow-y-auto">
                    {allClasses.map((cls) => (
                      <Button
                        key={cls}
                        onClick={() => setSelectedClass(cls)}
                        variant={selectedClass === cls ? 'default' : 'outline'}
                        className="w-full justify-start text-right text-sm"
                      >
                        <span className="text-lg mr-2">🎓</span>
                        {cls}
                      </Button>
                    ))}
                  </div>
                </Card>
              )}

              {/* Teacher Selection - Only show for teacher view */}
              {viewMode === 'teacher' && allTeachers.length > 0 && (
                <Card className="p-6 bg-white shadow-md">
                  <h2 className="text-lg font-bold text-gray-900 mb-4">اختر المدرس</h2>
                  <div className="space-y-2 max-h-96 overflow-y-auto">
                    {allTeachers.map((teacher) => (
                      <Button
                        key={teacher}
                        onClick={() => setSelectedTeacher(teacher)}
                        variant={selectedTeacher === teacher ? 'default' : 'outline'}
                        className="w-full justify-start text-right text-sm"
                      >
                        <span className="text-lg mr-2">👨‍🏫</span>
                        {teacher}
                      </Button>
                    ))}
                  </div>
                </Card>
              )}

              {/* Legend */}
              <Card className="p-6 bg-white shadow-md">
                <h2 className="text-lg font-bold text-gray-900 mb-4">المواد الدراسية</h2>
                <div className="space-y-2 text-sm max-h-64 overflow-y-auto pr-2">
                  {subjects.map((subject) => (
                    <div key={subject.name} className="flex items-center gap-2">
                      <div
                        className="w-4 h-4 rounded shrink-0"
                        style={{ backgroundColor: subject.color }}
                      />
                      <span className="text-gray-700 truncate">{subject.name}</span>
                    </div>
                  ))}
                </div>
              </Card>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            {/* Day Header */}
            <div className="mb-8">
              <div className="bg-gradient-to-r from-blue-600 to-blue-800 text-white rounded-lg p-8 shadow-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-4xl font-bold mb-2">{currentDay?.name}</h2>
                    <p className="text-blue-100">
                      {viewMode === 'class' 
                        ? `جدول اليوم - ${selectedClass}`
                        : viewMode === 'teacher'
                        ? `جدول المدرس - ${selectedTeacher}`
                        : 'عرض الحصص حسب الترتيب الزمني'
                      }
                    </p>
                  </div>
                  <div className="text-6xl">📚</div>
                </div>
              </div>
            </div>

            {/* View Mode Tabs */}
            <div className="bg-white rounded-lg shadow-lg p-8">
              <Tabs value={viewMode} onValueChange={(value) => setViewMode(value as 'class' | 'period' | 'teacher')} className="w-full">
                <TabsList className="grid w-full grid-cols-3 mb-6">
                  <TabsTrigger value="class" className="text-right">
                    <span className="mr-2">🎓</span>
                    عرض حسب الصف
                  </TabsTrigger>
                  <TabsTrigger value="period" className="text-right">
                    <span className="mr-2">⏰</span>
                    عرض حسب الحصة
                  </TabsTrigger>
                  <TabsTrigger value="teacher" className="text-right">
                    <span className="mr-2">👨‍🏫</span>
                    عرض حسب المدرس
                  </TabsTrigger>
                </TabsList>

                {/* Class View */}
                <TabsContent value="class" className="space-y-6">
                  <div className="mb-6">
                    <h3 className="text-2xl font-bold text-gray-900 mb-2">
                      الحصص الدراسية
                    </h3>
                    <p className="text-gray-600">
                      عرض الحصص الدراسية لـ {currentDay?.name} - {selectedClass}
                    </p>
                  </div>

                  {selectedDay && selectedClass ? (
                    <DaySchedule dayId={selectedDay} className={selectedClass} />
                  ) : (
                    <div className="text-center py-12">
                      <p className="text-gray-500">يرجى اختيار يوم وصف</p>
                    </div>
                  )}
                </TabsContent>

                {/* Period View */}
                <TabsContent value="period" className="space-y-6">
                  <div className="mb-6">
                    <h3 className="text-2xl font-bold text-gray-900 mb-2">
                      الحصص حسب الترتيب الزمني
                    </h3>
                    <p className="text-gray-600">
                      عرض جميع الصفوف في كل حصة لـ {currentDay?.name}
                    </p>
                  </div>

                  {selectedDay ? (
                    <PeriodViewByTime dayId={selectedDay} />
                  ) : (
                    <div className="text-center py-12">
                      <p className="text-gray-500">يرجى اختيار يوم</p>
                    </div>
                  )}
                </TabsContent>

                {/* Teacher View */}
                <TabsContent value="teacher" className="space-y-6">
                  <div className="mb-6">
                    <h3 className="text-2xl font-bold text-gray-900 mb-2">
                      جدول المدرس
                    </h3>
                    <p className="text-gray-600">
                      عرض حصص المدرس {selectedTeacher} لـ {currentDay?.name}
                    </p>
                  </div>

                  {selectedDay && selectedTeacher ? (
                    <TeacherView dayId={selectedDay} teacherName={selectedTeacher} />
                  ) : (
                    <div className="text-center py-12">
                      <p className="text-gray-500">يرجى اختيار يوم ومدرس</p>
                    </div>
                  )}
                </TabsContent>
              </Tabs>
            </div>

            {/* Info Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mt-8">
              <Card className="p-6 bg-gradient-to-br from-green-50 to-green-100 border-green-200">
                <div className="text-3xl mb-2">⏰</div>
                <h3 className="font-bold text-gray-900">وقت الدوام</h3>
                <p className="text-sm text-gray-600 mt-1">من 09:00 إلى 01:30</p>
              </Card>

              <Card className="p-6 bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
                <div className="text-3xl mb-2">📖</div>
                <h3 className="font-bold text-gray-900">عدد الحصص</h3>
                <p className="text-sm text-gray-600 mt-1">{timetableData.periods.length} حصص يومية</p>
              </Card>

              <Card className="p-6 bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
                <div className="text-3xl mb-2">👨‍🏫</div>
                <h3 className="font-bold text-gray-900">عدد المدرسين</h3>
                <p className="text-sm text-gray-600 mt-1">{allTeachers.length} مدرسين</p>
              </Card>

              <Card className="p-6 bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200">
                <div className="text-3xl mb-2">📊</div>
                <h3 className="font-bold text-gray-900">نصاب الحصص</h3>
                <p className="text-sm text-gray-600 mt-1">إجمالي حصص المدرسين أسبوعياً</p>
              </Card>
            </div>

            {/* Teacher Weekly Stats Table */}
            <Card className="mt-8 p-6 bg-white shadow-md">
              <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                <span>📋</span> إحصائيات الحصص الأسبوعية للمدرسين
              </h2>
              <div className="overflow-x-auto">
                <table className="w-full text-right border-collapse">
                  <thead>
                    <tr className="bg-gray-50 border-b">
                      <th className="py-3 px-4 font-bold text-gray-700">المدرس</th>
                      <th className="py-3 px-4 font-bold text-gray-700">إجمالي الحصص الأسبوعية</th>
                      <th className="py-3 px-4 font-bold text-gray-700">الحالة</th>
                    </tr>
                  </thead>
                  <tbody>
                    {teacherStats.map((stat, index) => (
                      <tr key={stat.name} className={`border-b hover:bg-gray-50 transition-colors ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50/30'}`}>
                        <td className="py-3 px-4 text-gray-800 font-medium">👨‍🏫 {stat.name}</td>
                        <td className="py-3 px-4 text-blue-600 font-bold">{stat.count} حصة</td>
                        <td className="py-3 px-4">
                          <div className="w-full bg-gray-200 rounded-full h-2 max-w-[100px]">
                            <div 
                              className="bg-blue-600 h-2 rounded-full" 
                              style={{ width: `${Math.min((stat.count / 24) * 100, 100)}%` }}
                            ></div>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-gray-900 text-white mt-16 py-8">
        <div className="container mx-auto px-4 text-center">
          <p className="text-gray-400">© 2026 الجدول المدرسي الذكي - نظام متقدم لإدارة الجداول الدراسية</p>
        </div>
      </footer>
    </div>
  );
}
