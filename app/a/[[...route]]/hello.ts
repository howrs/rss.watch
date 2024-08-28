import { app } from "app/a/[[...route]]/app.ts"

app.get('/hello', (c) => {
  return c.json({
    message: 'Hello Next.js!',
  })
})
