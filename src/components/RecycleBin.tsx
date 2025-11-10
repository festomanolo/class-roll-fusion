import { FC } from 'react';
import { GlassCard } from './ui/glass-card';
import { Button } from './ui/button';
import { ScrollArea } from './ui/scroll-area';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import { DeletedItem } from '@/types';
import { Trash2, RefreshCw, Clock } from 'lucide-react';

interface RecycleBinProps {
  onRestore: (item: DeletedItem) => void;
  onPermanentDelete: (item: DeletedItem) => void;
}

export const RecycleBin: FC<RecycleBinProps> = ({ onRestore, onPermanentDelete }) => {
  const [deletedItems] = useLocalStorage<DeletedItem[]>('deletedItems', []);

  const formatDate = (date: string | number) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getItemTypeIcon = (type: string) => {
    switch (type.toLowerCase()) {
      case 'student':
        return '👤';
      case 'test':
        return '📝';
      case 'subject':
        return '📚';
      case 'class':
        return '🏫';
      default:
        return '📄';
    }
  };

  return (
    <GlassCard className="p-4">
      <h3 className="text-lg font-semibold mb-4">Recently Deleted Items</h3>
      <ScrollArea className="h-[300px]">
        <div className="space-y-3">
          {deletedItems.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-8">
              No items in recycle bin
            </p>
          ) : (
            deletedItems.map((item) => (
              <div
                key={item.id}
                className="flex items-center justify-between p-3 rounded-lg border bg-card hover:bg-accent/50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <span className="text-2xl" role="img" aria-label={item.type}>
                    {getItemTypeIcon(item.type)}
                  </span>
                  <div>
                    <p className="font-medium">{item.name}</p>
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                      <Clock className="h-3 w-3" />
                      <span>Deleted {formatDate(item.deletedAt)}</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onRestore(item)}
                  >
                    <RefreshCw className="h-4 w-4 mr-1" />
                    Restore
                  </Button>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => onPermanentDelete(item)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))
          )}
        </div>
      </ScrollArea>
    </GlassCard>
  );
};