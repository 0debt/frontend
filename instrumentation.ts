export async function register() {
  try {
    const res = await fetch("https://api.github.com/repos/0debt/frontend/releases/latest");
    const data = await res.json();
    console.log(`Frontend version: ${data.tag_name}`);
  } catch {
    console.log("Frontend version: unknown");
  }

  const gatewayUrl =
    process.env.API_GATEWAY_URL ||
    process.env.NEXT_PUBLIC_API_GATEWAY_URL ||
    'http://api-gateway:8000';
  console.log(`API Gateway URL: ${gatewayUrl}`);
}

