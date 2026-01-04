import { FlameOutline, TrophyOutline, RocketOutline } from 'react-ionicons';

interface StreakCardProps {
  currentStreak: number;
  longestStreak: number;
  postsThisWeek: number;
  weeklyGoal: number;
  lastPostDate?: Date;
}

export function StreakCard({ 
  currentStreak, 
  longestStreak, 
  postsThisWeek, 
  weeklyGoal,
  lastPostDate 
}: StreakCardProps) {
  const progress = Math.min((postsThisWeek / weeklyGoal) * 100, 100);
  const isOnFire = currentStreak >= 3;
  const isGoalMet = postsThisWeek >= weeklyGoal;
  
  const getMotivationMessage = () => {
    if (isGoalMet) return "🎉 Objectif atteint ! Continue comme ça !";
    if (currentStreak === 0) return "Publie ton premier post pour démarrer ta streak !";
    if (currentStreak >= 7) return "🔥 Une semaine complète ! Tu es en feu !";
    if (currentStreak >= 3) return "💪 Belle régularité, continue !";
    return `Plus que ${weeklyGoal - postsThisWeek} post${weeklyGoal - postsThisWeek > 1 ? 's' : ''} cette semaine`;
  };

  const getDaysSinceLastPost = () => {
    if (!lastPostDate) return null;
    const now = new Date();
    const diff = Math.floor((now.getTime() - lastPostDate.getTime()) / (1000 * 60 * 60 * 24));
    if (diff === 0) return "Aujourd'hui";
    if (diff === 1) return "Hier";
    return `Il y a ${diff} jours`;
  };

  return (
    <div className={`streak-card ${isOnFire ? 'streak-card--on-fire' : ''}`}>
      <div className="streak-card__header">
        <div className="streak-card__icon-wrapper">
          <FlameOutline 
            color={isOnFire ? "#ef4444" : "#9ca3af"} 
            width="28px" 
            height="28px" 
          />
        </div>
        <div className="streak-card__title-group">
          <h3 className="streak-card__title">Régularité</h3>
          <span className="streak-card__subtitle">{getMotivationMessage()}</span>
        </div>
      </div>

      <div className="streak-card__stats">
        <div className="streak-card__stat streak-card__stat--main">
          <span className="streak-card__stat-value">{currentStreak}</span>
          <span className="streak-card__stat-label">Streak actuel</span>
        </div>
        
        <div className="streak-card__stat">
          <TrophyOutline color="#eab308" width="18px" height="18px" />
          <span className="streak-card__stat-value">{longestStreak}</span>
          <span className="streak-card__stat-label">Record</span>
        </div>
        
        <div className="streak-card__stat">
          <RocketOutline color="#3b82f6" width="18px" height="18px" />
          <span className="streak-card__stat-value">{postsThisWeek}/{weeklyGoal}</span>
          <span className="streak-card__stat-label">Cette semaine</span>
        </div>
      </div>

      <div className="streak-card__progress">
        <div className="streak-card__progress-header">
          <span>Objectif hebdo</span>
          <span>{Math.round(progress)}%</span>
        </div>
        <div className="streak-card__progress-bar">
          <div 
            className={`streak-card__progress-fill ${isGoalMet ? 'streak-card__progress-fill--complete' : ''}`}
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {lastPostDate && (
        <div className="streak-card__last-post">
          Dernier post : {getDaysSinceLastPost()}
        </div>
      )}
    </div>
  );
}

export default StreakCard;
