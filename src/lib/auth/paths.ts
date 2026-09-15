export const PROFILE_PATH = "/profile";
export const PROFILE_SETUP_PATH = "/profile/setup";

export function afterAuthPath(user: { username: string | null }) {
  return user.username ? "/tasks" : PROFILE_SETUP_PATH;
}
