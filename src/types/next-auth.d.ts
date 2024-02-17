import NextAuth, { DefaultSession } from "next-auth/next";

declare module "next-auth" {
  /**
   * Returned by `useSession`, `getSession` and received as a prop on the `SessionProvider` React Context
   */
  interface Session {
    user: {
      /** The user's id */
      id: string | undefined
    } & DefaultSession["user"]
  }
}