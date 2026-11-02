import React from 'react';
import { ArrowLeft, Layers, CheckSquare, Clock, Award, Pause } from 'lucide-react';
import { playClick } from '../services/audioService';

interface HowToPlayProps {
  onBack: () => void;
}

export const HowToPlay: React.FC<HowToPlayProps> = ({ onBack }) => {
  const steps = [
    {
      title: "Choose a level that suits you.",
      desc: "Select from Beginner, Intermediate, or Advanced level. Questions get progressively trickier and reward higher XP multipliers.",
      icon: Layers,
      color: "bg-emerald-500/10 text-emerald-500 border-emerald-500/20"
    },
    {
      title: "Select the operations you want to practice.",
      desc: "Toggle Addition, Subtraction, Multiplication, and Division. You can select multiple operations concurrently to test your agility.",
      icon: CheckSquare,
      color: "bg-blue-500/10 text-blue-500 border-blue-500/20"
    },
    {
      title: "Solve the questions before time runs out.",
      desc: "Watch the countdown bar closely! Speed is rewarded: completing answers in under 1.2 seconds triggers the Speed Demon bonus (+50 XP).",
      icon: Clock,
      color: "bg-amber-500/10 text-amber-500 border-amber-500/20"
    },
    {
      title: "Earn higher score with better accuracy and speed.",
      desc: "Establish correct calculation streaks to build your multiplier. Combos multiply score outcomes significantly.",
      icon: Award,
      color: "bg-purple-500/10 text-purple-500 border-purple-500/20"
    },
    {
      title: "Pause anytime and continue when ready.",
      desc: "Tap the pause button during gameplay to take a breather, restart the current run, or change your configuration.",
      icon: Pause,
      color: "bg-rose-500/10 text-rose-500 border-rose-500/20"
    }
  ];

  return (
    <div className="max-w-2xl mx-auto flex flex-col gap-6 select-none text-left relative">
      
      {/* Header and Back Button */}
      <div className="flex items-center gap-4 border-b border-slate-100 dark:border-slate-800 pb-4">
        <button
          onClick={() => { playClick(); onBack(); }}
          className="p-2 bg-white dark:bg-zinc-800 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-zinc-700 rounded-full transition-all cursor-pointer text-slate-700 dark:text-neutral-300"
          title="Back to Lobby"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <span className="technical-label block">// PRACTICE TUTORIALS</span>
          <h1 className="text-xl font-extrabold text-charcoal dark:text-white mt-0.5">HOW TO PLAY</h1>
        </div>
      </div>

      {/* Main Checklist */}
      <div className="chunky-card flex flex-col gap-5">
        {steps.map((step, idx) => {
          const Icon = step.icon;
          return (
            <div key={idx} className="flex gap-4 items-start">
              <div className={`w-10 h-10 rounded-full border flex items-center justify-center shrink-0 ${step.color}`}>
                <Icon className="w-5 h-5" />
              </div>
              <div className="flex-1 mt-0.5">
                <h3 className="text-sm font-bold text-slate-800 dark:text-neutral-200 leading-tight">
                  {step.title}
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                  {step.desc}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
