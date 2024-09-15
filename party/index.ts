import type * as Party from "partykit/server"

export default class Server implements Party.Server {
  constructor(readonly room: Party.Room) {}

  async onRequest(req: Party.Request) {
    const json = await req.json<{ message: string }>()

    const { message } = json

    if (message.includes("poke")) {
      this.room.broadcast(`poke`, [])
    }

    return new Response()
  }
}

Server satisfies Party.Worker
