import React, { useMemo } from 'react';
import PeriodCard from './PeriodCard';
import timetableData from '../data/timetable.json';

interface DayScheduleProps {
  dayId: string;
  className: string;
}

interface ScheduleItem {
  period: number;
  time: string;
  subject: {
    name: string;
    icon: string;
    color: string;
    textColor: string;
    borderColor: string;
  } | null;
  teacher: string | null;
}

export default function DaySchedule({ dayId, className }: DayScheduleProps) {
  const schedule = useMemo(() => {
    const rawData = timetableData.rawData as Record<string, Record<string, Array<{
      period: string;
      time: string;
      subject: string;
      teacher: string;
    }>>>;

    const dayName = timetableData.days.find((d) => d.id === dayId)?.name;
    if (!dayName || !rawData[dayName] || !rawData[dayName][className]) return [];

    const daySchedule = rawData[dayName][className];
    const subjectsMap = timetableData.subjects as Record<string, any>;

    return daySchedule.map((period: any) => {
      const subjectName = period.subject;
      
      // البحث عن المادة في قائمة المواد بملف JSON
      let subjectInfo = null;
      const subjectKey = Object.keys(subjectsMap).find(key => subjectsMap[key].name === subjectName);
      
      if (subjectKey) {
        subjectInfo = subjectsMap[subjectKey];
      } else if (subjectName !== '---') {
        // مادة افتراضية إذا لم توجد في القائمة (للاحتياط)
        subjectInfo = {
          name: subjectName,
          icon: '📚',
          color: '#f5f5f5',
          textColor: '#333',
          borderColor: '#ddd'
        };
      }

      return {
        period: parseInt(period.period),
        time: period.time,
        subject: subjectInfo,
        teacher: period.teacher && period.teacher !== '' ? period.teacher : null,
      };
    });
  }, [dayId, className]);

  const getCurrentPeriodIndex = () => {
    const now = new Date();
    const currentHour = now.getHours();
    const currentMinute = now.getMinutes();
    const currentTime = currentHour * 60 + currentMinute;

    return schedule.findIndex((item: ScheduleItem) => {
      const [startTime] = item.time.split(' - ');
      if (!startTime) return false;
      const [hour, minute] = startTime.split(':').map(Number);
      const itemTime = hour * 60 + minute;
      const endTime = itemTime + 40; // Each period is 40 minutes

      return currentTime >= itemTime && currentTime < endTime;
    });
  };

  const currentPeriodIndex = getCurrentPeriodIndex();

  return (
    <div className="day-section">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {schedule.map((item: ScheduleItem, index: number) => (
          <PeriodCard
            key={`${dayId}-${item.period}`}
            period={item.period}
            time={item.time}
            subject={item.subject}
            teacher={item.teacher}
            isCurrentPeriod={index === currentPeriodIndex}
          />
        ))}
      </div>
    </div>
  );
}
