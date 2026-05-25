import { startOfDay, startOfMonth, startOfWeek } from './dateUtils';

function completedSessions(sessions) {
  return sessions.filter((session) => session.status === 'completed');
}

function sumActualMinutes(sessions) {
  return sessions.reduce((sum, session) => sum + Number(session.actualMinutes || 0), 0);
}

function since(sessions, date) {
  const timestamp = date.getTime();
  return sessions.filter((session) => new Date(session.endedAt).getTime() >= timestamp);
}

export function calculateStats(sessions) {
  const completed = completedSessions(sessions);
  const totalSessions = sessions.length;
  const allTimeMinutes = sumActualMinutes(completed);
  const byTag = completed.reduce((acc, session) => {
    acc[session.tag] = (acc[session.tag] || 0) + Number(session.actualMinutes || 0);
    return acc;
  }, {});

  return {
    todayMinutes: sumActualMinutes(since(completed, startOfDay())),
    weekMinutes: sumActualMinutes(since(completed, startOfWeek())),
    monthMinutes: sumActualMinutes(since(completed, startOfMonth())),
    allTimeMinutes,
    completedCount: completed.length,
    completionRate: totalSessions ? Math.round((completed.length / totalSessions) * 100) : 0,
    byTag,
    averageCompletedMinutes: completed.length ? Math.round(allTimeMinutes / completed.length) : 0,
  };
}
