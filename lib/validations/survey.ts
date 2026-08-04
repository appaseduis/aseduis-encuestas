import { z } from "zod"

export const surveySchema = z.object({
  title: z.string().min(3, "Mínimo 3 caracteres"),
  description: z.string().optional(),
  cover_image_url: z.string().url().optional().or(z.literal("")),
  slug: z.string().min(3).regex(/^[a-z0-9-]+$/, "Solo minúsculas, números y guiones"),
  start_date: z.string().optional().or(z.literal("")),
  end_date: z.string().optional().or(z.literal("")),
  thank_you_message: z.string().optional(),
  allow_duplicate_responses: z.boolean(),
  is_public: z.boolean(),
}).refine(
  (data) => !data.start_date || !data.end_date || data.start_date <= data.end_date,
  { message: "La fecha de fin debe ser posterior a la de inicio", path: ["end_date"] }
)

export type SurveyFormValues = z.infer<typeof surveySchema>

export function slugify(text: string) {
  return text
    .toLowerCase()
    .normalize("NFD").replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-")
}