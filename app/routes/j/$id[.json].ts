import invariant from "tiny-invariant";
import { getDocument } from "~/jsonDoc.server";

export const loader = async ({ params, request }: { params: Record<string, string>; request: Request }) => {
  console.log("API JSON loader called with params:", params);
  invariant(params.id, "expected params.id");

  console.log("API: Calling getDocument with id:", params.id);
  const doc = await getDocument(params.id);
  console.log("API: getDocument result:", doc ? "Document found" : "Document not found");

  if (!doc) {
    console.log("API: Document not found, throwing 404");
    throw new Response("Not Found", {
      status: 404,
    });
  }

  console.log("API: Returning JSON response");
  return new Response(doc.contents, {
    headers: {
      "Content-Type": "application/json",
    },
  });
};
