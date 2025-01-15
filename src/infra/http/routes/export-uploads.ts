import { exportUploads } from '@/app/functions/export-uploads'
import { unwrapEither } from '@/shared/either'
import type { FastifyPluginAsync } from 'fastify'
import { z } from 'zod'

const exportUploadsQuerySchema = z.object({
  searchQuery: z.string().optional(),
})

type ExportUploadsQuery = z.infer<typeof exportUploadsQuerySchema>

export const exportUploadsRoute: FastifyPluginAsync = async server => {
  server.post<{
    Querystring: ExportUploadsQuery
  }>(
    '/uploads/exports',
    {
      schema: {
        summary: 'Export uploads',
        tags: ['uploads'],
        querystring: exportUploadsQuerySchema,
        response: {
          200: z
            .object({
              reportUrl: z.string(),
            })
            .describe('Image Uploaded'),
        },
      },
    },
    async (request, reply) => {
      const { searchQuery } = request.query

      const result = await exportUploads({
        searchQuery,
      })

      const { reportUrl } = unwrapEither(result)

      return reply.status(200).send({ reportUrl })
    }
  )
}
