import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

export default function ({
  preview,
  onCancel,
}: {
  preview: string | null;
  onCancel: () => void;
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
          </DialogDescription>
        </DialogHeader>
      </DialogContent>
    </Dialog>
  );
}
