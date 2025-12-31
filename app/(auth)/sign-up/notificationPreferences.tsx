'use client'

import { Button } from "@/shadcn/components/ui/button"
import React from "react"
import { useRouter } from "next/navigation"

interface NotificationPreferencesProps {
  userId: string;
  email: string;
  onClose?: () => void;
}

export function NotificationPreferences({ userId, email, onClose }: NotificationPreferencesProps) {
  const router = useRouter();
  const [loading, setLoading] = React.useState(false);
  const [success, setSuccess] = React.useState(false);
  
  const [preferences, setPreferences] = React.useState({
    globalEmailNotifications: true,
    alertOnNewGroup: true,
    alertOnExpenseCreation: true,
    alertOnBalanceChange: true,
    emailSummaryFrequency: 'weekly' as 'daily' | 'weekly' | 'never'
  });

  const togglePreference = (key: keyof typeof preferences) => {
    setPreferences(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      const url = `${process.env.NEXT_PUBLIC_NOTIFICATIONS_SERVICE_URL}/preferences`;
      const body = {
        userId,
        email,
        ...preferences,
        alertOnLowBudget: true,
      };
      
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
      });

      if (!response.ok) {
        throw new Error('Error saving your preferences');
      }

      setSuccess(true);
      
      setTimeout(() => {
        router.push('/me');
      }, 1000);
      
    } catch (error) {
      alert('An error occurred while saving your preferences. Please try again.');
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="fixed inset-0 bg-black/95 backdrop-blur-xl flex items-center justify-center z-[100] p-4">
        <div className="text-center animate-in fade-in zoom-in duration-300">
          <h2 className="text-white text-3xl font-bold mb-2 tracking-tight">Preferences Saved</h2>
          <p className="text-zinc-500 font-medium">Redirecting to your profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center z-[100] p-4">
      <div className="bg-black text-white rounded-[2.5rem] border border-zinc-800 shadow-[0_0_80px_-20px_rgba(255,255,255,0.15)] max-w-md w-full overflow-hidden animate-in fade-in slide-in-from-bottom-8 duration-500">
        
        <div className="p-8 sm:p-10">
          <div className="flex justify-between items-start mb-10">
            <div className="space-y-1">
              <h2 className="text-4xl tracking-tight">Preferences</h2>
              <p className="text-zinc-500 text-lg">Choose your alerts.</p>
            </div>
          </div>

          <div className="space-y-4">
            <PreferenceItem 
              title="New Groups" 
              desc="Notify when invited to a new group"
              active={preferences.alertOnNewGroup}
              onClick={() => togglePreference('alertOnNewGroup')}
            />
            <PreferenceItem 
              title="New Expenses" 
              desc="Alerts for shared payments"
              active={preferences.alertOnExpenseCreation}
              onClick={() => togglePreference('alertOnExpenseCreation')}
            />
            <PreferenceItem 
              title="Balance Changes" 
              desc="Track your debts and groups"
              active={preferences.alertOnBalanceChange}
              onClick={() => togglePreference('alertOnBalanceChange')}
            />
          </div>

          <div className="mt-12">
            <Button 
              onClick={handleSave}
              disabled={loading}
              className="w-full bg-[#34d399] hover:bg-[#10b981] py-5 rounded-2xl text-xl transition-all shadow-[0_15px_30px_-10px_rgba(52,211,153,0.4)]"
            >
              {loading ? "Saving..." : "Save and continue"}
            </Button>
            <p className="text-center text-xs text-zinc-600 mt-6 font-medium">
              You can manage these settings in your profile.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

interface PreferenceItemProps {
  title: string;
  desc: string;
  active: boolean;
  onClick: () => void;
}

const PreferenceItem = ({ title, desc, active, onClick }: PreferenceItemProps) => (
  <div 
    onClick={onClick}
    className={`flex items-center justify-between p-5 rounded-2xl border cursor-pointer transition-all duration-300 ${
      active ? 'border-zinc-700 bg-zinc-900/50' : 'border-zinc-800 bg-transparent hover:bg-zinc-900/20'
    }`}
  >
    <div className="space-y-0.5 text-left">
      <p className={`font-bold text-base transition-colors ${active ? 'text-white' : 'text-zinc-500'}`}>{title}</p>
      <p className="text-xs text-zinc-600 font-medium">{desc}</p>
    </div>
    <div className={`w-12 h-6 rounded-full relative transition-all duration-300 ${active ? 'bg-[#34d399]' : 'bg-zinc-800'}`}>
      <div className={`absolute top-1 w-4 h-4 rounded-full transition-all duration-300 ${active ? 'left-7 bg-black' : 'left-1 bg-white'}`} />
    </div>
  </div>
);
