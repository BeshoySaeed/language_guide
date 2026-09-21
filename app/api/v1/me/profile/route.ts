import { getChatGPTUser } from "@/app/chatgpt-auth";
import { apiError } from "@/lib/api-response";

export async function GET() {
  const user = await getChatGPTUser();
  if (!user) return apiError("UNAUTHENTICATED", "Sign in to view your profile.", 401);
  return Response.json({ data: { id: user.userId, email: user.email, displayName: user.displayName } });
}

