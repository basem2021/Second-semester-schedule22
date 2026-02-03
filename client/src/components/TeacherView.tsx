import React, { useMemo } from 'react';
import timetableData from '../data/timetable.json';
import PeriodCard from './PeriodCard';

interface TeacherViewProps {
  dayId: string;
  teacherName: string;
}

export default function TeacherView({ dayId, teacherName }: TeacherViewProps) {
  const teacherSchedule = useMemo(() => {
    const rawData = timetableData.rawData as Record<string, Record<string, Array<{
      period: string;
      time: string;
      subject: string;
      teacher: string;
    }>>>;

    const dayName = timetableData.days.find(d => d.id === dayId)?.name;
    if (!dayName || !rawData[dayName] || !teacherName) return [];

    const dayData = rawData[dayName];
    const scheduleMap: Record<string, {
      period: number;
      time: string;
      classNames: string[];
      subject: any;
    }> = {};

    const subjectsMap = timetableData.subjects as Record<string, any>;

    Object.entries(dayData).forEach(([className, periods]) => {
      periods.forEach((p) => {
        // Check if the teacher matches, including split names like "مريم/سارة"
        const teachers = p.teacher.split('/').map(t => t.trim());
        
        if (teachers.includes(teacherName)) {
          // Find subject info
          let subjectInfo = null;
          const subjectKey = Object.keys(subjectsMap).find(key => subjectsMap[key].name === p.subject);
          
          if (subjectKey) {
            subjectInfo = subjectsMap[subjectKey];
          } else {
            subjectInfo = {
              name: p.subject,
              icon: '📚',
              color: '#f5f5f5',
              textColor: '#333',
              borderColor: '#ddd'
            };
          }

          const periodKey = p.period;
          if (!scheduleMap[periodKey]) {
            scheduleMap[periodKey] = {
              period: parseInt(p.period),
              time: p.time,
              classNames: [className],
              subject: subjectInfo
            };
          } else {
            if (!scheduleMap[periodKey].classNames.includes(className)) {
              scheduleMap[periodKey].classNames.push(className);
            }
          }
        }
      });
    });

    // Convert map to array and sort by period
    return Object.values(scheduleMap).sort((a, b) => a.period - b.period);
  }, [dayId, teacherName]);

  if (!teacherName) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">يرجى اختيار مدرس لعرض الجدول</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {teacherSchedule.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-500">لا توجد حصص للمدرس {teacherName} في هذا اليوم</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {teacherSchedule.map((item, idx) => (
            <div key={idx} className="relative">
              <div className="absolute -top-2 -right-2 z-10 bg-blue-600 text-white text-xs font-bold px-2 py-1 rounded shadow-md">
                {item.classNames.join(' + ')}
              </div>
              <PeriodCard
                period={item.period}
                time={item.time}
                subject={item.subject}
                teacher={null} // Don't show teacher name again in their own view
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
