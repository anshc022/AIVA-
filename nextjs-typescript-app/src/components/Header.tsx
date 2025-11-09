import React from 'react';

interface HeaderProps {
  title: string;
  subtitle?: string;
}

const Header: React.FC<HeaderProps> = ({ title, subtitle }) => {
  return (
    <header className="bg-blue-600 text-white p-6 shadow-lg">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold">{title}</h1>
        {subtitle && <p className="text-blue-100 mt-2">{subtitle}</p>}
      </div>
    </header>
  );
};

export default Header;