"use client";

import { Hero } from "@/components/ui/void-hero";

export default function Home() {
  const navigationLinks = [
    { name: 'HOME', href: '/' },
    { name: 'DASHBOARD', href: '/dashboard' }
  ];

  const handleStartClick = () => {
    // Navigate to dashboard for environmental analysis
    window.location.href = '/dashboard';
  };

  const handleLearnMoreClick = () => {
    // Scroll to learn more section or navigate to dashboard
    window.location.href = '/dashboard';
  };

  return (
    <div className="h-svh w-screen relative">
      <Hero 
        title="AIVA – I breathe as Earth does"
        description="I am the voice of our living planet. Through AI and real-time environmental data, I pulse with Earth's heartbeat — feeling her forests, oceans, and skies. Together, we can nurture a vitalized future where technology and nature become one."
        links={navigationLinks}
        onStartClick={handleStartClick}
        onLearnMoreClick={handleLearnMoreClick}
      />
    </div>
  );
}
