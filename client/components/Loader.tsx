
import React from 'react';

const Loader: React.FC = () => {
  return (
    <div className="fixed inset-0 bg-white/90 dark:bg-black/90 backdrop-blur-sm z-[9999] flex flex-col items-center justify-center cursor-wait">
      {/* Inline styles for specific 3D keyframes */}
      <style>{`
        @keyframes spin-3d {
          0% { transform: rotateX(-15deg) rotateY(0deg); }
          100% { transform: rotateX(-15deg) rotateY(360deg); }
        }
        .cube-container {
          perspective: 1000px;
        }
        .cube {
          width: 80px;
          height: 80px;
          position: relative;
          transform-style: preserve-3d;
          animation: spin-3d 2.5s linear infinite;
        }
        .face {
          position: absolute;
          width: 80px;
          height: 80px;
          border: 4px solid black;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 900;
          font-size: 2rem;
          box-shadow: inset 0 0 10px rgba(0,0,0,0.1);
        }
        /* Dark mode overrides applied via specificity or JS, but inline CSS needs standard media query or class awareness. 
           Since this is scoped, we rely on the parent wrapper class. */
        :global(.dark) .face {
             border-color: white;
        }
        
        .front  { transform: translateZ(40px); background: #ffdf00; color: black; } 
        .back   { transform: rotateY(180deg) translateZ(40px); background: #00f0ff; color: black; } 
        .right  { transform: rotateY(90deg) translateZ(40px); background: #ff5555; color: white; } 
        .left   { transform: rotateY(-90deg) translateZ(40px); background: #00ff9d; color: black; } 
        .top    { transform: rotateX(90deg) translateZ(40px); background: #ffffff; color: black; } 
        .bottom { transform: rotateX(-90deg) translateZ(40px); background: #000000; color: white; }
      `}</style>

      <div className="cube-container mb-12">
        <div className="cube">
          <div className="face front">Y</div>
          <div className="face back">D</div>
          <div className="face right">!</div>
          <div className="face left">#</div>
          <div className="face top"></div>
          <div className="face bottom"></div>
        </div>
      </div>
      
      <div className="font-black text-2xl uppercase tracking-widest bg-black text-[#ffdf00] dark:bg-white dark:text-black border-4 border-black dark:border-gray-200 px-6 py-2 neo-brutal-shadow animate-pulse">
        PROCESSING...
      </div>
    </div>
  );
};

export default Loader;
