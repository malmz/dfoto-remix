import { LoaderFunctionArgs } from "@remix-run/node";

export const loader = async ({ params }: LoaderFunctionArgs) => {
  const id = Number(params.id);
  if (Number.isNaN(id)) return Response.error();
  //const image = getImage(id);
  return [];
};
