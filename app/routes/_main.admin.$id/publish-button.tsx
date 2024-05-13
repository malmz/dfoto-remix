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

interface Props {
  formId?: string;
  dirty: boolean;
  album: {
    id: number;
    published: boolean;
  };
}
export function PublishButton({ formId, album, dirty }: Props) {
  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button variant='outline' type='button'>
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
            säker på att du spara innan.{' '}
            {dirty && (
              <span className='font-semibold text-destructive'>
                Du har osparade ändringar!
              </span>
            )}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Avbryt</AlertDialogCancel>
          <AlertDialogAction
            form={formId}
            type='submit'
            name='intent'
            value='publish'
          >
            Fortsätt
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
