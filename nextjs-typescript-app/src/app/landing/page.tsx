import { Hero } from "@/components/ui/void-hero";

export default function LandingPage() {
  const navigationLinks = [
    { name: 'HOME', href: '/' },
    { name: 'WORK', href: '/work' },
    { name: 'ABOUT', href: '/about' },
    { name: 'CONTACT', href: '/contact' }
  ];

  return (
    <div className="h-svh w-screen relative">
      <Hero 
        title="Sculpted Light and Shadow"
        description="A dynamic form drifts through luminous voids — edges curve, surfaces gleam, and subtle glow pulses like a heartbeat. Motion and material merge, revealing the art hidden within geometry."
        links={navigationLinks}
      />
    </div>
  );
}