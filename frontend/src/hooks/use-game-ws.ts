import { auth } from "@/lib/auth";
import { getGameWs } from "@/lib/socket";

export default function useGameWs(gameId: string | null) {
  const { data, error } = auth.useSession();
  if (error || !gameId || !data) return;
  const userId = data.user.id;

  const ws = getGameWs({ gameId, userId });
}
