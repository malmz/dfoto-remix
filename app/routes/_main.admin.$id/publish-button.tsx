import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '~/components/ui/alert-dialog';
import { Button } from '~/components/ui/button';
import { toast } from 'sonner';

type Props = {
  album: {
    id: number;
    published: boolean;
  };
};
export function PublishButton({ album }: Props) {
  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button variant='outline'>
          {album.published ? 'Avpublicera' : 'Publicera'}
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>
            Är du säker på att du vill{' '}
            {album.published ? 'avpublicera' : 'publicera'}?
          </AlertDialogTitle>
          <AlertDialogDescription>
            Ändringar du gjort sparas inte automatisk innan publicering. Va
            säker på att du spara innan.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Avbryt</AlertDialogCancel>
          <AlertDialogAction>Fortsätt</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
