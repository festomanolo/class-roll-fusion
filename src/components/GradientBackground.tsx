import React from 'react';

export const GradientBackground: React.FC = () => {
  return (
    <div className="fixed inset-0 w-full h-full -z-10">
      <div 
        className="absolute inset-0 w-full h-full bg-[radial-gradient(circle_at_10%_20%,rgb(236,242,255)_0%,rgb(252,239,255)_25%,rgb(255,244,238)_50%,rgb(240,255,244)_75%,rgb(255,252,236)_100%)] opacity-70"
        style={{
          background: `
            radial-gradient(circle at 60% 20%, rgba(191, 219, 254, 0.3) 0%, rgba(191, 219, 254, 0) 40%),
            radial-gradient(circle at 30% 50%, rgba(233, 213, 255, 0.3) 0%, rgba(233, 213, 255, 0) 40%),
            radial-gradient(circle at 70% 80%, rgba(254, 215, 170, 0.3) 0%, rgba(254, 215, 170, 0) 40%),
            radial-gradient(circle at 20% 70%, rgba(187, 247, 208, 0.3) 0%, rgba(187, 247, 208, 0) 40%),
            radial-gradient(circle at 80% 40%, rgba(254, 240, 138, 0.3) 0%, rgba(254, 240, 138, 0) 40%)
          `
        }}
      />
      <div className="absolute inset-0 backdrop-blur-[100px]" />
    </div>
  );
}