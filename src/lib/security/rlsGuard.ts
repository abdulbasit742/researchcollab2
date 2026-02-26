/**
 * RLS Guard — ensures service-layer calls always use session-derived user IDs.
 * No repository call should accept a raw userId from the client.
 */

import { supabase } from "@/integrations/supabase/client";
import { AuthenticationError, AuthorizationError } from "@/lib/core/errors";

/**
 * Get the current authenticated user ID from the session.
 * This is the ONLY source of truth for user identity.
 */
export async function getSessionUserId(): Promise<string> {
  const { data: { user }, error } = await supabase.auth.getUser();
  if (error || !user) throw new AuthenticationError();
  return user.id;
}

/**
 * Assert that the entity belongs to the current session user.
 */
export function assertOwnership(entityUserId: string, sessionUserId: string): void {
  if (entityUserId !== sessionUserId) {
    throw new AuthorizationError("You do not own this resource");
  }
}

/**
 * Assert that the session user is one of the allowed participants.
 */
export function assertParticipant(
  sessionUserId: string,
  ...allowedIds: (string | null | undefined)[]
): void {
  const valid = allowedIds.filter(Boolean) as string[];
  if (!valid.includes(sessionUserId)) {
    throw new AuthorizationError("You are not a participant in this operation");
  }
}
