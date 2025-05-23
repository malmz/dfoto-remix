import { useFetcher } from 'react-router';
import { CircleX, Loader2 } from 'lucide-react';
import { useCallback, useEffect, useId, useRef, useState } from 'react';
import { toast } from 'sonner';
import type { ButtonProps } from '~/components/ui/button';
import { Button } from '~/components/ui/button';
import { cn, maxFileSize } from '~/lib/utils';
import type { action } from '~/routes/api/upload';

interface Props extends ButtonProps {
	albumId: number;
}
export function UploadButton({
	children,
	albumId,
	className,
	...props
}: Props) {
	const id = useId();
	const formRef = useRef<HTMLFormElement>(null);
	const fetcher = useFetcher<typeof action>();
	const [large, setLarge] = useState(false);

	useEffect(() => {
		if (fetcher.data?.success) {
			toast('Upload successful');
			formRef.current?.reset();
		}
	}, [fetcher.data]);

	return (
		<fetcher.Form
			ref={formRef}
			action='/api/upload'
			method='post'
			encType='multipart/form-data'
		>
			<Button
				asChild
				className={cn(large ? 'text-red-500' : '', className)}
				{...props}
			>
				<label htmlFor={id}>
					{fetcher.state !== 'idle' ? (
						<Loader2 className='mr-2 h-4 w-4 animate-spin' />
					) : large ? (
						<CircleX className='mr-2 h-4 w-4' />
					) : null}
					{large ? 'Bilden är för stor' : children}
				</label>
			</Button>
			<input
				onChange={(event) => {
					const files = event.target.files;
					if (!files) return;
					for (const file of files) {
						if (file.size > maxFileSize) {
							setLarge(true);
							return;
						}
					}
					setLarge(false);
					fetcher.submit(event.currentTarget.form);
				}}
				id={id}
				type='file'
				name='files'
				multiple
				accept='image/jpeg,image/png'
				hidden
			/>
			<input type='text' name='id' defaultValue={albumId} hidden />
		</fetcher.Form>
	);
}
