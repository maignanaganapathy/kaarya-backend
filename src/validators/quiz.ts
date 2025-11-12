import { z } from "zod";

/**
 * Quiz Response Schema
 */
const quizResponseSchema = z.object({
  question_id: z.string().uuid("Invalid question ID"),
  selected_option_key: z.string().min(1, "Option key is required"),
  answer: z.string().min(1, "Answer is required"),
});

/**
 * Save Draft Request Validation
 */
export const saveDraftSchema = z.object({
  body: z.object({
    responses: z
      .array(quizResponseSchema)
      .min(1, "At least one response is required"),
  }),
});

/**
 * Submit Quiz Request Validation
 */
export const submitQuizSchema = z.object({
  body: z.object({
    responses: z
      .array(quizResponseSchema)
      .min(1, "At least one response is required"),
  }),
});

/**
 * Quiz ID Param Validation
 */
export const quizIdParamSchema = z.object({
  params: z.object({
    quizId: z.string().uuid("Invalid quiz ID"),
  }),
});

// Export types for TypeScript
export type SaveDraftInput = z.infer<typeof saveDraftSchema>;
export type SubmitQuizInput = z.infer<typeof submitQuizSchema>;
export type QuizIdParamInput = z.infer<typeof quizIdParamSchema>;
