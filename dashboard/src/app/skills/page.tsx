import { fetchSkills } from '../actions/skills';
import SkillsClient from './SkillsClient';

// Enable dynamic rendering
export const dynamic = 'force-dynamic';

export default async function SkillsPage() {
  const skills = await fetchSkills();
  
  return <SkillsClient initialSkills={skills} />;
}
