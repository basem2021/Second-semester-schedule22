import React from 'react';

interface PeriodCardProps {
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
  isCurrentPeriod?: boolean;
}

export default function PeriodCard({
  period,
  time,
  subject,
  teacher,
  isCurrentPeriod = false,
}: PeriodCardProps) {
  if (!subject) {
    return (
      <div className="period-card" style={{ borderLeftColor: '#e5e7eb' }}>
        <div className="text-center text-gray-400 py-4">
          <p className="text-sm">---</p>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`period-card ${isCurrentPeriod ? 'ring-2 ring-blue-500' : ''}`}
      style={{
        backgroundColor: subject.color,
        borderLeftColor: subject.borderColor,
      }}
    >
      <div className="flex items-start justify-between mb-2">
        <div className="flex-1">
          <p className="period-time text-xs text-gray-500">{time}</p>
          <p className="subject-name text-lg" style={{ color: subject.textColor }}>
            <span className="mr-2">{subject.icon}</span>
            {subject.name}
          </p>
        </div>
        <span className="text-2xl ml-2">{subject.icon}</span>
      </div>
      {teacher && (
        <p className="teacher-name" style={{ color: subject.textColor, opacity: 0.75 }}>
          👨‍🏫 {teacher}
        </p>
      )}
      <p className="text-xs mt-2 text-gray-500">الحصة #{period}</p>
      {isCurrentPeriod && (
        <div className="mt-2 inline-block bg-green-500 text-white px-2 py-1 rounded text-xs font-semibold">
          الآن
        </div>
      )}
    </div>
  );
}
