'use client'

import { Button } from "@/shadcn/components/ui/button"
import { Check, Loader2, X } from "lucide-react"
import { useRouter } from "next/navigation"
import React, { useEffect } from "react"

interface NotificationPreferencesModalProps {
  userId: string;
  email: string;
  isOpen: boolean;
  onClose: () => void;
  mode?: 'onboarding' | 'edit';
}

export function NotificationPreferencesModal({ 
  userId, 
  email, 
  isOpen, 
  onClose,
  mode = 'edit'
}: NotificationPreferencesModalProps) {
  const router = useRouter();
  const [loading, setLoading] = React.useState(false);
  const [saving, setSaving] = React.useState(false);
  const [success, setSuccess] = React.useState(false);
  
  const [preferences, setPreferences] = React.useState({
    globalEmailNotifications: true,
    alertOnNewGroup: true,
    alertOnExpenseCreation: true,
    emailSummaryFrequency: 'weekly' as 'daily' | 'weekly' | 'never'
  });

  // Cargar preferencias existentes al abrir
  useEffect(() => {
    if (isOpen && mode === 'edit') {
      const fetchPreferences = async () => {
        setLoading(true);
        try {
          const url = `/api/notifications/preferences/${userId}`;
          const res = await fetch(url);
          if (res.ok) {
            const data = await res.json();
            // Solo actualizamos si hay datos, si no, usamos defaults
            if (Object.keys(data).length > 0) {
                setPreferences(prev => ({
                    ...prev,
                    ...data
                }));
            }
          }
        } catch (error) {
          console.error("Failed to load preferences", error);
        } finally {
          setLoading(false);
        }
      };
      fetchPreferences();
    }
  }, [isOpen, mode, userId]);

  const togglePreference = (key: keyof typeof preferences) => {
    setPreferences(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const url = '/api/notifications/preferences';
      const body = {
        userId,
        email,
        ...preferences,
        alertOnLowBudget: true, // Default for now
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
        if (mode === 'onboarding') {
            router.push('/me');
        } else {
            setSuccess(false); // Reset para la próxima
            onClose();
        }
      }, 1500);
      
    } catch (error) {
      alert('An error occurred while saving your preferences. Please try again.');
    } finally {
        setSaving(false);
    }
  };

  if (!isOpen) return null;

  if (success) {
    return (
      <div className="fixed inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center z-100 p-4">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary mb-4 animate-in zoom-in duration-300">
            <Check className="w-8 h-8 text-primary-foreground" />
          </div>
          <h2 className="text-foreground text-3xl font-bold mb-2 tracking-tight">Preferences saved</h2>
          <p className="text-muted-foreground">Your notification settings have been updated.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center z-100 p-4 animate-in fade-in duration-200">
      <div className="bg-card text-card-foreground rounded-3xl border border-border shadow-xl max-w-md w-full overflow-hidden relative">
        
        {/* Close button for edit mode */}
        {mode === 'edit' && (
            <button 
                onClick={onClose}
                className="absolute top-6 right-6 p-2 rounded-full hover:bg-muted transition-colors"
            >
                <X className="w-6 h-6 text-muted-foreground" />
            </button>
        )}

        <div className="p-8 sm:p-10">
          <div className="flex justify-between items-start mb-10">
            <div className="space-y-1">
              <h2 className="text-3xl font-bold tracking-tight">Preferences</h2>
              <p className="text-muted-foreground text-lg">Choose your alerts.</p>
            </div>
          </div>

          {loading ? (
            <div className="py-20 flex flex-col items-center justify-center space-y-4">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <p className="text-muted-foreground animate-pulse">Loading preferences...</p>
            </div>
          ) : (
            <div className="space-y-4">
                <PreferenceItem
                title="New groups"
                desc="Notify when invited to a new group"
                active={preferences.alertOnNewGroup}
                onClick={() => togglePreference('alertOnNewGroup')}
                />
                <PreferenceItem 
                title="New expenses" 
                desc="Alerts for shared payments"
                active={preferences.alertOnExpenseCreation}
                onClick={() => togglePreference('alertOnExpenseCreation')}
                />
            </div>
          )}

          <div className="mt-12 flex justify-center">
            <Button 
              onClick={handleSave}
              disabled={saving || loading}
              className="w-full h-11 rounded-xl transition-all flex items-center justify-center"
            >
              {saving ? (
                <Loader2 className="h-5 w-5 animate-spin text-primary-foreground" />
              ) : (
                "Save preferences"
              )}
            </Button>
            {mode === 'onboarding' && (
                <p className="text-center text-xs text-muted-foreground mt-6 font-medium">
                You can manage these settings in your profile.
                </p>
            )}
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
    className={`flex items-center justify-between p-4 rounded-xl border cursor-pointer transition-all duration-300 ${
      active ? 'border-primary/50 bg-primary/5' : 'border-border bg-transparent hover:bg-muted/50'
    }`}
  >
    <div className="space-y-0.5 text-left">
      <p className={`font-semibold text-base transition-colors ${active ? 'text-foreground' : 'text-muted-foreground'}`}>{title}</p>
      <p className="text-xs text-muted-foreground font-medium">{desc}</p>
    </div>
    <div className={`w-10 h-6 rounded-full relative transition-all duration-300 ${active ? 'bg-primary' : 'bg-muted'}`}>
      <div className={`absolute top-1 w-4 h-4 rounded-full transition-all duration-300 ${active ? 'translate-x-5 bg-primary-foreground' : 'translate-x-1 bg-muted-foreground'}`} />
    </div>
  </div>
);
