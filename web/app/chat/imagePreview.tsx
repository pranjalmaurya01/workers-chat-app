import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Send } from 'lucide-react';

export default function ({
  preview,
  onCancel,
  onUpload,
}: {
  preview: string | null;
  onCancel: () => void;
  onUpload: () => void;
}) {
  if (!preview) return;

  return (
    <Dialog
      open={!!preview}
      onOpenChange={(e) => {
        if (!e) onCancel();
      }}
    >
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Preview Image</DialogTitle>
          <DialogDescription>
            <img src={preview} alt='Preview' className='max-w-xs rounded' />
            <span className='flex justify-end'>
              <Button
                autoFocus
                onClick={onUpload}
                className='bg-green-500 hover:bg-green-600 text-white rounded-full h-8 w-8 p-0'
              >
                <Send className='h-4 w-4' />
              </Button>
            </span>
          </DialogDescription>
        </DialogHeader>
      </DialogContent>
    </Dialog>
  );
}
