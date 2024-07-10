export default function Debug({ children }: { children: unknown }) {
	return (
		<pre className='overflow-scroll'>
			{JSON.stringify(children, undefined, 2)}
		</pre>
	);
}
