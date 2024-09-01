import type * as Party from "partykit/server"

export default class Server implements Party.Server {
  constructor(readonly room: Party.Room) {}

  async onRequest(req: Party.Request) {
    const { message } = await req.json<{ message: string }>()

    if (message.includes("poke")) {
      this.room.broadcast(`poke`, [])
    }

    return new Response("hello from server")
  }
}

Server satisfies Party.Worker
