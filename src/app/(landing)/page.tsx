import { HomePageClient } from './home-page-client';
import { homeFeatures, teamMembers } from './home-data';

export default function HomePage() {
  return <HomePageClient features={homeFeatures} team={teamMembers} />;
}
