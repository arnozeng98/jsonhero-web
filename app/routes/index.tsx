interface LoaderArgs {
  request: Request;
}

export function loader({ request }: LoaderArgs) {
  const url = new URL(request.url);
  const baseUrl = `${url.protocol}//${url.host}`;
  const redirectUrl = `${baseUrl}/j/criminal-cases`;
  
  console.log("Root index route loaded");
  console.log("Current URL:", request.url);
  console.log("Base URL:", baseUrl);
  console.log("Redirecting to:", redirectUrl);
  
  return Response.redirect(redirectUrl, 302);
}

export default function Index() {
  return (
    <div className="flex items-center justify-center w-screen h-screen bg-[rgb(56,52,139)]">
      <div className="text-white text-xl">
        Redirecting to Criminal Cases Viewer...
      </div>
    </div>
  );
}
