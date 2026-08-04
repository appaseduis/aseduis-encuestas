"use client"

import { useState } from "react"
import QuestionForm from "./question-form"
import { questionTypeLabels } from "@/lib/validations/question"
import {
  createQuestion, updateQuestion, deleteQuestion, duplicateQuestion, moveQuestion,
} from "@/lib/actions/questions"

type Question = {
  id: string
  type: string
  label: string
  help_text: string | null
  is_required: boolean
  question_options: { label: string }[]
}

export default function QuestionList({ surveyId, questions }: { surveyId: string; questions: Question[] }) {
  const [adding, setAdding] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)

  return (
    <div className="space-y-3">
      {questions.map((q, i) => (
        <div key={q.id} className="rounded border bg-white p-4">
          {editingId === q.id ? (
            <QuestionForm
              question={q}
              action={updateQuestion.bind(null, surveyId, q.id)}
              onDone={() => setEditingId(null)}
            />
          ) : (
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-400">{questionTypeLabels[q.type]}</p>
                <p className="font-medium">
                  {q.label} {q.is_required && <span className="text-red-500">*</span>}
                </p>
                {q.question_options?.length > 0 && (
                  <p className="mt-1 text-xs text-gray-500">
                    {q.question_options.map((o) => o.label).join(", ")}
                  </p>
                )}
              </div>
              <div className="flex gap-3 text-sm">
                <form action={moveQuestion.bind(null, surveyId, q.id, "up")}>
                  <button disabled={i === 0} className="disabled:opacity-30">↑</button>
                </form>
                <form action={moveQuestion.bind(null, surveyId, q.id, "down")}>
                  <button disabled={i === questions.length - 1} className="disabled:opacity-30">↓</button>
                </form>
                <button onClick={() => setEditingId(q.id)} className="text-blue-600">Editar</button>
                <form action={duplicateQuestion.bind(null, surveyId, q.id)}>
                  <button className="text-blue-600">Duplicar</button>
                </form>
                <form action={deleteQuestion.bind(null, surveyId, q.id)}>
                  <button className="text-red-600">Eliminar</button>
                </form>
              </div>
            </div>
          )}
        </div>
      ))}

      {adding ? (
        <QuestionForm
          action={createQuestion.bind(null, surveyId)}
          onDone={() => setAdding(false)}
        />
      ) : (
        <button
          onClick={() => setAdding(true)}
          className="w-full rounded border-2 border-dashed py-3 text-sm text-gray-500 hover:border-black hover:text-black"
        >
          + Agregar pregunta
        </button>
      )}
    </div>
  )
}