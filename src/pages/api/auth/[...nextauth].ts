import NextAuth, { Awaitable, Session } from 'next-auth'
import DiscordProvider from 'next-auth/providers/discord'

// https://discord.com/developers/docs/topics/oauth2#shared-resources-oauth2-scopes
const scopes = ['identify', 'guilds', 'email'].join(' ')


export default NextAuth({
  providers: [
    DiscordProvider({
      clientId: process.env.DISCORD_CLIENT_ID || '',
      clientSecret: process.env.DISCORD_CLIENT_SECRET || '',
      authorization: { params: { scope: scopes } },
      profile: (profile) => {
        return {
          id: profile.id,
          name: profile.username,
          email: profile.email,
          image: `https://cdn.discordapp.com/avatars/${profile.id}/${profile.avatar}.png`,
        }
      },
    }),
  ],
  secret: process.env.SECRET,
  callbacks: {
    session: async ({ session, token }): Promise<Session> => {
      const discordSession = session as Session;

      // The sub on the token is the user id, set it on the session
      if (token) {
        discordSession.user.id = token.sub
      }

      return discordSession;
    }
  }
})
