import { ActionFunction } from "remix";
import invariant from "tiny-invariant";
import { sendEvent } from "~/graphJSON.server";
import { updateDocument } from "~/jsonDoc.server";

export const action: ActionFunction = async ({ params, request, context }) => {
  invariant(params.id, "expected params.id");

  const title = (await request.formData()).get("title");

  invariant(typeof title === "string", "expected title");

  try {
    const document = await updateDocument(params.id, title);

    if (!document) {
      return new Response(
        JSON.stringify({ error: "No document with that slug" }), 
        { headers: { "Content-Type": "application/json" } }
      );
    }

    context.waitUntil(
      sendEvent({
        type: "update-doc",
        id: document.id,
        title,
      })
    );

    return new Response(
      JSON.stringify(document),
      { headers: { "Content-Type": "application/json" } }
    );
  } catch (error) {
    if (error instanceof Error) {
      return new Response(
        JSON.stringify({ error: error.message }),
        { headers: { "Content-Type": "application/json" } }
      );
    } else {
      return new Response(
        JSON.stringify({ error: "Unknown error" }),
        { headers: { "Content-Type": "application/json" } }
      );
    }
  }
};
