import { getUploads } from '@/app/functions/get-uploads'
import { unwrapEither } from '@/shared/either'
import type { FastifyPluginAsync } from 'fastify'
import { z } from 'zod'

const getUploadsQuerySchema = z.object({
  searchQuery: z.string().optional(),
  sortBy: z.enum(['createdAt']).optional(),
  sortDirection: z.enum(['asc', 'desc']).optional(),
  page: z.coerce.number().optional().default(1),
  pageSize: z.coerce.number().optional().default(20),
})

type GetUploadsQuery = z.infer<typeof getUploadsQuerySchema>

export const getUploadsRoute: FastifyPluginAsync = async server => {
  server.get<{
    Querystring: GetUploadsQuery
  }>(
    '/uploads',
    {
      schema: {
        summary: 'Get uploads',
        tags: ['uploads'],
        querystring: getUploadsQuerySchema,
        response: {
          200: z
            .object({
              uploads: z.array(
                z.object({
                  id: z.string(),
                  name: z.string(),
                  remoteKey: z.string(),
                  remoteUrl: z.string(),
                  createdAt: z.date(),
                })
              ),
              total: z.number(),
            })
            .describe('Image Uploaded'),
        },
      },
    },
    async (request, reply) => {
      const { page, pageSize, searchQuery, sortBy, sortDirection } =
        request.query

      const result = await getUploads({
        page,
        pageSize,
        searchQuery,
        sortBy,
        sortDirection,
      })

      const { total, uploads } = unwrapEither(result)

      return reply.status(200).send({ total, uploads })
    }
  )
}
