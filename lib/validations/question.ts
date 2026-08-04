import { z } from "zod"

export const questionTypes = [
  "section",
  "short_text", "long_text", "number", "email", "phone", "date", "time",
  "radio", "dropdown", "checkbox", "scale_1_5", "scale_custom", "yes_no", "rating_stars",
] as const

export const questionTypeLabels: Record<string, string> = {
  section: "Título de sección",
  short_text: "Respuesta corta",
  long_text: "Respuesta larga",
  number: "Número",
  email: "Correo electrónico",
  phone: "Teléfono",
  date: "Fecha",
  time: "Hora",
  radio: "Selección única",
  dropdown: "Lista desplegable",
  checkbox: "Selección múltiple",
  scale_1_5: "Escala 1 a 5",
  scale_custom: "Escala personalizada",
  yes_no: "Sí / No",
  rating_stars: "Calificación con estrellas",
}

export const typesWithOptions = ["radio", "dropdown", "checkbox"]
export const typesWithPlaceholder = ["short_text", "long_text", "number", "email", "phone"]

export const questionSchema = z.object({
  type: z.enum(questionTypes),
  label: z.string().min(3, "Mínimo 3 caracteres"),
  help_text: z.string().optional(),
  placeholder: z.string().optional(),
  is_required: z.boolean(),
})

export type QuestionFormValues = z.infer<typeof questionSchema>