import React, { useMemo } from 'react';
import timetableData from '../data/timetable.json';

interface PeriodViewByTimeProps {
  dayId: string;
}

export default function PeriodViewByTime({ dayId }: PeriodViewByTimeProps) {
  const periodsByTime = useMemo(() => {
    const rawData = timetableData.rawData as Record<string, Record<string, Array<{
      period: string;
      time: string;
      subject: string;
      teacher: string;
    }>>>;

    const dayName = timetableData.days.find(d => d.id === dayId)?.name;
    if (!dayName || !rawData[dayName]) return [];

    const dayData = rawData[dayName];
    
    // Get all unique periods and times
    const periodsMap = new Map<string, Array<{ className: string; subject: string; teacher: string }>>();
    
    Object.entries(dayData).forEach(([className, schedule]) => {
      schedule.forEach((item) => {
        const key = `${item.period}|${item.time}`;
        if (!periodsMap.has(key)) {
          periodsMap.set(key, []);
        }
        periodsMap.get(key)!.push({
          className,
          subject: item.subject,
          teacher: item.teacher,
        });
      });
    });

    // Sort by period number
    return Array.from(periodsMap.entries())
      .sort((a, b) => {
        const periodA = parseInt(a[0].split('|')[0]);
        const periodB = parseInt(b[0].split('|')[0]);
        return periodA - periodB;
      })
      .map(([key, classes]) => {
        const [period, time] = key.split('|');
        return { period, time, classes };
      });
  }, [dayId]);

  const getSubjectColors = (subjectName: string) => {
    const subjectsMap = timetableData.subjects as Record<string, any>;
    const subjectKey = Object.keys(subjectsMap).find(key => subjectsMap[key].name === subjectName);
    
    if (subjectKey) {
      return {
        color: subjectsMap[subjectKey].color,
        textColor: subjectsMap[subjectKey].textColor,
        borderColor: subjectsMap[subjectKey].borderColor
      };
    }
    
    if (subjectName === '---') {
      return { color: '#fafafa', textColor: '#ccc', borderColor: '#e0e0e0' };
    }

    return { color: '#f5f5f5', textColor: '#666', borderColor: '#ddd' };
  };

  return (
    <div className="space-y-6">
      {periodsByTime.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-500">لا توجد بيانات لهذا اليوم</p>
        </div>
      ) : (
        periodsByTime.map((periodData, idx) => (
          <div key={idx} className="bg-white rounded-lg shadow-md overflow-hidden">
            {/* Period Header */}
            <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white px-6 py-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xl font-bold">الحصة #{periodData.period}</h3>
                  <p className="text-blue-100 text-sm">⏰ {periodData.time}</p>
                </div>
                <div className="text-3xl">📚</div>
              </div>
            </div>

            {/* Classes Grid */}
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {periodData.classes.map((classData, classIdx) => {
                  const colors = getSubjectColors(classData.subject);
                  return (
                    <div
                      key={classIdx}
                      className="p-4 rounded-lg border-l-4 transition-all duration-300 hover:shadow-lg"
                      style={{
                        backgroundColor: colors.color,
                        borderLeftColor: colors.borderColor,
                      }}
                    >
                      <div className="mb-2">
                        <p className="text-sm font-semibold text-gray-600">{classData.className}</p>
                      </div>
                      <div className="mb-3">
                        <p
                          className="text-lg font-bold"
                          style={{ color: colors.textColor }}
                        >
                          {classData.subject}
                        </p>
                      </div>
                      {classData.teacher && classData.teacher !== '' && (
                        <div className="flex items-center gap-2">
                          <span className="text-lg">👨‍🏫</span>
                          <p
                            className="text-sm"
                            style={{ color: colors.textColor, opacity: 0.8 }}
                          >
                            {classData.teacher}
                          </p>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        ))
      )}
    </div>
  );
}
