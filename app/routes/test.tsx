import {
	Carousel,
	CarouselContent,
	CarouselItem,
} from '~/components/ui/carousel';

const elements = Array.from({ length: 10 }, (_, i) => i);

export default function Page() {
	return (
		<div className='p-8'>
			<Carousel
				opts={{
					startIndex: 4,
				}}
			>
				<CarouselContent>
					{elements.map((index) => (
						<CarouselItem key={index}>{index + 1}</CarouselItem>
					))}
				</CarouselContent>
			</Carousel>
		</div>
	);
}
