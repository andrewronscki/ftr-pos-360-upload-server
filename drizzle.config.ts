import { env } from '@/env'
import type { Config } from 'drizzle-kit'

export default {
  dialect: 'postgresql',
  schema: 'src/infra/db/schemas/*.ts',
  out: 'src/infra/db/migrations',
  dbCredentials: {
    url: env.DATABASE_URL,
  },
} satisfies Config
