import { FC, useEffect, useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { ThemeToggle } from '@/components/ThemeToggle';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { GlassCard } from '@/components/ui/glass-card';
import { RecycleBin } from '@/components/RecycleBin';
import { DeletedItem } from '@/types';
import { useMobile } from '@/hooks/use-mobile';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import { SettingsGroup, SettingsItem } from '@/components/ui/settings-group';
import { TeacherProfile } from '@/components/TeacherSetup';
import { 
  tanzaniaEducationSystem, 
  getSubjectsByLevel, 
  getSubjectById
} from '@/data/tanzaniaSyllabus';
import { 
  Sun, 
  Upload, 
  Download,
  RefreshCw,
  Database,
  Volume2,
  User,
  BookOpen,
  Plus,
  X,
  Edit,
  School,
  GraduationCap
} from 'lucide-react';
import { importExcel, exportExcel, importCsv, exportCsv, syncWithGoogleSheets } from '@/lib/data-management';
import { useToast } from '@/components/ui/use-toast';
import { NotificationService } from '@/services/mobile/NotificationService';
import { playSound } from '@/lib/sound';

const Settings: FC = () => {
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { isMobile } = useMobile();
  
  // Teacher profile state
  const [teacherProfile, setTeacherProfile] = useLocalStorage<TeacherProfile | null>('teacherProfile', null);
  const [showProfileDialog, setShowProfileDialog] = useState(false);
  
  // Settings state
  const [volume, setVolume] = useState<number>(80);
  const [darkMode, setDarkMode] = useState<boolean>(false);
  const [deletedItems, setDeletedItems] = useLocalStorage<DeletedItem[]>('deletedItems', []);
  const [soundsEnabled, setSoundsEnabled] = useLocalStorage<boolean>('soundsEnabled', true);

  

  const handleProfileUpdate = (updates: Partial<TeacherProfile>) => {
    if (!teacherProfile) return;

    setTeacherProfile({
      ...teacherProfile,
      ...updates
    });

    toast({
      title: "Profile Updated",
      description: "Your profile has been updated successfully",
    });
  };
  
  // Handle mobile features
  const handleVolumeChange = (value: number) => {
    setVolume(value);
    if (isMobile && 'mediaDevices' in navigator) {
      // Update system volume if possible
    }
  };

  // Removed brightness/vibration/offline handlers

  useEffect(() => {
    if (isMobile) {
      if ('getBattery' in navigator) {
        (navigator as any).getBattery().then((battery: any) => {
          battery.addEventListener('levelchange', () => {
            if (battery.level < 0.2) {
              toast({
                title: "Low Battery",
                description: "Device battery is running low",
              });
            }
          });
        });
      }
    }
  }, [isMobile, toast]);

  const handleRestore = (item: DeletedItem) => {
    // Here you would implement the restore logic based on item.type
    setDeletedItems(deletedItems.filter(i => i.id !== item.id));
    playSound('restore');
    toast({
      title: "Item Restored",
      description: `${item.name} has been restored successfully`,
      type: "background",
    });
  };

  const handlePermanentDelete = (item: DeletedItem) => {
    const confirmed = window.confirm(`Permanently delete ${item.name}? This action cannot be undone.`);
    if (!confirmed) return;

    setDeletedItems(deletedItems.filter(i => i.id !== item.id));
    playSound('delete');
    toast({
      title: "Item Deleted",
      description: `${item.name} has been permanently deleted`,
      type: "background",
    });
  };

  return (
    <div className="space-y-6 px-4 pb-24">
      {/* Teacher Profile Section */}
      {teacherProfile && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <GlassCard className="p-4">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-base font-medium flex items-center gap-2 text-muted-foreground">
                <User className="w-4 h-4" />
                Profile
              </h2>
              <Dialog open={showProfileDialog} onOpenChange={setShowProfileDialog}>
                <DialogTrigger asChild>
                  <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                    <Edit className="w-3 h-3" />
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-md mx-auto">
                  <DialogHeader>
                    <DialogTitle>Edit Profile</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <label className="text-sm font-medium">Name</label>
                      <input
                        type="text"
                        value={teacherProfile.name}
                        onChange={(e) => handleProfileUpdate({ name: e.target.value })}
                        className="w-full mt-1 px-3 py-2 border rounded-lg"
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium">Phone</label>
                      <input
                        type="tel"
                        value={teacherProfile.phone || ''}
                        onChange={(e) => handleProfileUpdate({ phone: e.target.value })}
                        className="w-full mt-1 px-3 py-2 border rounded-lg"
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium">School</label>
                      <input
                        type="text"
                        value={teacherProfile.school || ''}
                        onChange={(e) => handleProfileUpdate({ school: e.target.value })}
                        className="w-full mt-1 px-3 py-2 border rounded-lg"
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium">Email</label>
                      <input
                        type="email"
                        value={teacherProfile.email || ''}
                        onChange={(e) => handleProfileUpdate({ email: e.target.value })}
                        className="w-full mt-1 px-3 py-2 border rounded-lg"
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium">Education Level</label>
                      <select
                        value={teacherProfile.educationLevel}
                        onChange={(e) => handleProfileUpdate({ educationLevel: e.target.value })}
                        className="w-full mt-1 px-3 py-2 border rounded-lg bg-white dark:bg-transparent"
                      >
                        {tanzaniaEducationSystem.map(level => (
                          <option key={level.id} value={level.id}>{level.name}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="text-sm font-medium">Experience</label>
                      <input
                        type="text"
                        value={teacherProfile.experience || ''}
                        onChange={(e) => handleProfileUpdate({ experience: e.target.value })}
                        className="w-full mt-1 px-3 py-2 border rounded-lg"
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium">Bio</label>
                      <textarea
                        value={teacherProfile.bio || ''}
                        onChange={(e) => handleProfileUpdate({ bio: e.target.value })}
                        className="w-full mt-1 px-3 py-2 border rounded-lg"
                        rows={3}
                      />
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-muted rounded-full flex items-center justify-center">
                  <User className="w-4 h-4 text-muted-foreground" />
                </div>
                <div className="flex-1">
                  <h3 className="text-sm font-medium">{teacherProfile.name}</h3>
                  <p className="text-xs text-muted-foreground">
                    {teacherProfile.school || 'No school specified'}
                  </p>
                </div>
              </div>

              <div className="text-xs text-muted-foreground">
                {tanzaniaEducationSystem.find(l => l.id === teacherProfile.educationLevel)?.name}
              </div>

              {teacherProfile.subjects.length > 0 && (
                <div className="flex flex-wrap gap-1">
                  {teacherProfile.subjects.slice(0, 3).map(subjectId => {
                    const subject = getSubjectById(subjectId);
                    return subject ? (
                      <Badge key={subjectId} variant="outline" className="text-xs px-2 py-0">
                        {subject.name}
                      </Badge>
                    ) : null;
                  })}
                  {teacherProfile.subjects.length > 3 && (
                    <Badge variant="outline" className="text-xs px-2 py-0">
                      +{teacherProfile.subjects.length - 3}
                    </Badge>
                  )}
                </div>
              )}
            </div>
          </GlassCard>
        </motion.div>
      )}

      {/* Subject Management removed - moved to Subjects page per user request */}

      {/* App Settings */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <SettingsGroup>
          <SettingsItem
            icon={<Sun className="w-5 h-5" strokeWidth={1.5} />}
            label="Appearance"
            value={
              <div className="flex items-center gap-2">
                <span className="text-xs text-muted-foreground">Dark Mode</span>
                <ThemeToggle />
              </div>
            }
            showDivider={false}
          />
          <SettingsItem
            icon={<Volume2 className="w-5 h-5" strokeWidth={1.5} />}
            label="Test Notifications"
            onClick={async () => {
              const ok = await NotificationService.requestWebPermission();
              if (ok) {
                await NotificationService.sendLocalNotification({ title: 'Test', body: 'This is a test notification from Class-Roll' });
                toast({ title: 'Notification sent', description: 'A test notification was dispatched.' });
              } else {
                toast({ title: 'Permission denied', description: 'Notification permission was not granted.' });
              }
            }}
          />
        </SettingsGroup>
      </motion.div>

      {/* Mobile Settings */}
      {isMobile && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <SettingsGroup>
            <SettingsItem
              icon={<Volume2 className="w-5 h-5" strokeWidth={1.5} />}
              label="Volume"
              value={
                <div className="w-32">
                  <Slider
                    value={[volume]}
                    onValueChange={(value) => handleVolumeChange(value[0])}
                    max={100}
                    step={1}
                    className="relative flex items-center select-none touch-none w-32"
                  />
                </div>
              }
              showDivider={false}
            />
            <SettingsItem
              icon={<Volume2 className="w-5 h-5" strokeWidth={1.5} />}
              label="Enable Sounds"
              value={
                <Switch
                  checked={!!soundsEnabled}
                  onCheckedChange={(v) => setSoundsEnabled(Boolean(v))}
                />
              }
              showDivider={false}
            />
            <SettingsItem
              icon={<Volume2 className="w-5 h-5" strokeWidth={1.5} />}
              label="Play sample"
              value={
                <Button variant="outline" size="sm" onClick={() => { playSound('success'); }}>
                  Play
                </Button>
              }
              showDivider={false}
            />
          </SettingsGroup>
        </motion.div>
      )}

      {/* Custom Topics moved to Subjects page per requirements */}

      {/* Data Management */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
      >
        <SettingsGroup>
          <SettingsItem
            icon={<Upload className="w-5 h-5" strokeWidth={1.5} />}
            label="Import Data"
            onClick={() => fileInputRef.current?.click()}
          />
          <SettingsItem
            icon={<Download className="w-5 h-5" strokeWidth={1.5} />}
            label="Export Data"
            onClick={() => exportExcel([])}
          />
          {/* Auto Sync and Data Saver removed per user request */}
        </SettingsGroup>
      </motion.div>

      <input
        type="file"
        ref={fileInputRef}
        className="hidden"
        accept=".xlsx,.csv"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) {
            if (file.name.endsWith('.xlsx')) {
              importExcel(file);
            } else if (file.name.endsWith('.csv')) {
              importCsv(file);
            }
          }
        }}
      />
      {/* Recycle Bin - restore or permanently delete items */}
      <section className="mt-8">
        <RecycleBin onRestore={handleRestore} onPermanentDelete={handlePermanentDelete} />
      </section>
    </div>
  );
};

export default Settings;
