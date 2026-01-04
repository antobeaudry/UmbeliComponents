import { TrophyOutline, FlameOutline, RocketOutline, StarOutline, HeartOutline, RibbonOutline } from 'react-ionicons';

interface Badge {
  id: string;
  name: string;
  description: string;
  icon: 'trophy' | 'flame' | 'rocket' | 'star' | 'heart' | 'ribbon';
  unlocked: boolean;
  progress?: number;
  maxProgress?: number;
}

interface BadgesCardProps {
  currentStreak: number;
  totalPosts: number;
  weeklyGoalMet: number;
}

const getBadges = (currentStreak: number, totalPosts: number, weeklyGoalMet: number): Badge[] => {
  return [
    {
      id: 'first-post',
      name: 'Premier Pas',
      description: 'Publie ton premier post',
      icon: 'star',
      unlocked: totalPosts >= 1,
      progress: Math.min(totalPosts, 1),
      maxProgress: 1,
    },
    {
      id: 'streak-3',
      name: 'En Route',
      description: 'Atteins une streak de 3 jours',
      icon: 'flame',
      unlocked: currentStreak >= 3,
      progress: Math.min(currentStreak, 3),
      maxProgress: 3,
    },
    {
      id: 'streak-7',
      name: 'Semaine Parfaite',
      description: 'Atteins une streak de 7 jours',
      icon: 'trophy',
      unlocked: currentStreak >= 7,
      progress: Math.min(currentStreak, 7),
      maxProgress: 7,
    },
    {
      id: 'posts-10',
      name: 'Productif',
      description: 'Publie 10 posts',
      icon: 'rocket',
      unlocked: totalPosts >= 10,
      progress: Math.min(totalPosts, 10),
      maxProgress: 10,
    },
    {
      id: 'posts-50',
      name: 'Créateur',
      description: 'Publie 50 posts',
      icon: 'heart',
      unlocked: totalPosts >= 50,
      progress: Math.min(totalPosts, 50),
      maxProgress: 50,
    },
    {
      id: 'weekly-4',
      name: 'Régulier',
      description: 'Atteins ton objectif hebdo 4 fois',
      icon: 'ribbon',
      unlocked: weeklyGoalMet >= 4,
      progress: Math.min(weeklyGoalMet, 4),
      maxProgress: 4,
    },
  ];
};

const BadgeIcon = ({ icon, unlocked }: { icon: Badge['icon']; unlocked: boolean }) => {
  const color = unlocked ? '#eab308' : '#9ca3af';
  const size = '24px';
  
  switch (icon) {
    case 'trophy': return <TrophyOutline color={color} width={size} height={size} />;
    case 'flame': return <FlameOutline color={color} width={size} height={size} />;
    case 'rocket': return <RocketOutline color={color} width={size} height={size} />;
    case 'star': return <StarOutline color={color} width={size} height={size} />;
    case 'heart': return <HeartOutline color={color} width={size} height={size} />;
    case 'ribbon': return <RibbonOutline color={color} width={size} height={size} />;
    default: return <StarOutline color={color} width={size} height={size} />;
  }
};

export function BadgesCard({ currentStreak, totalPosts, weeklyGoalMet }: BadgesCardProps) {
  const badges = getBadges(currentStreak, totalPosts, weeklyGoalMet);
  const unlockedCount = badges.filter(b => b.unlocked).length;

  return (
    <div className="badges-card">
      <div className="badges-card__header">
        <h3 className="badges-card__title">🏆 Badges</h3>
        <span className="badges-card__count">{unlockedCount}/{badges.length}</span>
      </div>

      <div className="badges-card__grid">
        {badges.map((badge) => (
          <div 
            key={badge.id} 
            className={`badges-card__badge ${badge.unlocked ? 'badges-card__badge--unlocked' : ''}`}
            title={badge.description}
          >
            <div className="badges-card__badge-icon">
              <BadgeIcon icon={badge.icon} unlocked={badge.unlocked} />
            </div>
            <span className="badges-card__badge-name">{badge.name}</span>
            {!badge.unlocked && badge.progress !== undefined && (
              <div className="badges-card__badge-progress">
                <div 
                  className="badges-card__badge-progress-fill"
                  style={{ width: `${(badge.progress / (badge.maxProgress || 1)) * 100}%` }}
                />
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

export default BadgesCard;
