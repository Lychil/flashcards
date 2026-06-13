import { StudyStats } from '../stats/StudyStats'

interface HomeStatsProps {
  cardsDue: number
  streakDays: number
  averageProgress: number
}

export function HomeStats({ cardsDue, streakDays, averageProgress }: HomeStatsProps) {
  return (
    <StudyStats
      layout="wide"
      cardsDue={cardsDue}
      streakDays={streakDays}
      progressPercent={averageProgress}
      progressCaption="по всем модулям"
    />
  )
}
