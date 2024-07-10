import { Button } from '~/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '~/components/ui/dialog';
import type { Image } from '~/lib/schema.server';

interface Props {
  image: Image;
}
export function ImageDialog({ image }: Props) {
  return (
    <Dialog>
      <DialogTrigger>
        <Button variant='link' size='sm'>
          {image.id}
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit {image.id}</DialogTitle>
        </DialogHeader>
        <div></div>
        <DialogFooter></DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
