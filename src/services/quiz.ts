import { prisma } from "../initializers/database";
import {
  IQuizListResponse,
  IQuizDetailResponse,
  IQuizResultResponse,
  IQuizResponse,
} from "../interfaces/quiz.interface";
import { ApiError } from "../utils/api-error";
import logger from "../initializers/logger";
import { auditLog } from "../utils/audit-logger";

export class QuizService {
  /**
   * Get all quizzes accessible by user
   */
  static async getAccessibleQuizzes(
    userId: string
  ): Promise<IQuizListResponse[]> {
    try {
      // Get user's groups
      const userGroups = await prisma.groupUser.findMany({
        where: { userId },
        select: { groupId: true },
      });

      const groupIds = userGroups.map((ug) => ug.groupId);

      if (groupIds.length === 0) {
        return [];
      }

      // Get quizzes user has access to
      const quizPermissions = await prisma.quizGroupPermission.findMany({
        where: {
          groupId: { in: groupIds },
          permission: "attempt",
        },
        include: {
          quiz: true,
        },
      });

      const quizzes = quizPermissions.map((qp) => qp.quiz);

      // Get user's submissions for these quizzes
      const submissions = await prisma.quizSubmission.findMany({
        where: {
          userId,
          quizId: { in: quizzes.map((q) => q.id) },
        },
        orderBy: { createdAt: "desc" },
      });

      // Build response
      const response: IQuizListResponse[] = quizzes.map((quiz) => {
        const quizSubmissions = submissions.filter((s) => s.quizId === quiz.id);
        const completedSubmissions = quizSubmissions.filter(
          (s) => s.submittedAt !== null
        );
        const inProgressSubmission = quizSubmissions.find(
          (s) => s.submittedAt === null
        );

        const meta = quiz.meta as any;
        const maxAttempts = meta.max_attempts || 0;
        const attemptCount = completedSubmissions.length;
        const canAttempt =
          quiz.acceptingResponses &&
          (maxAttempts === 0 || attemptCount < maxAttempts);

        return {
          id: quiz.id,
          name: quiz.name,
          type: meta.type,
          acceptingResponses: quiz.acceptingResponses,
          hasAccess: true,
          attemptStatus: {
            attempted: attemptCount > 0,
            attemptCount,
            maxAttempts,
            canAttempt,
            hasInProgressAttempt: !!inProgressSubmission,
          },
        };
      });

      logger.info("Fetched accessible quizzes", {
        userId,
        count: response.length,
      });

      return response;
    } catch (error) {
      logger.error("Error fetching accessible quizzes:", error);
      throw error;
    }
  }

  /**
   * Get quiz details by ID
   */
  static async getQuizById(
    quizId: string,
    userId: string
  ): Promise<IQuizDetailResponse> {
    try {
      // Check if user has access
      const hasAccess = await this.checkUserAccess(userId, quizId);

      if (!hasAccess) {
        throw ApiError.forbidden("You do not have access to this quiz");
      }

      // Get quiz with questions
      const quiz = await prisma.quiz.findUnique({
        where: { id: quizId },
        include: {
          questions: {
            orderBy: { order: "asc" },
          },
        },
      });

      if (!quiz) {
        throw ApiError.notFound("Quiz not found");
      }

      // Get user's submissions
      const submissions = await prisma.quizSubmission.findMany({
        where: { userId, quizId },
        orderBy: { createdAt: "desc" },
      });

      const completedSubmissions = submissions.filter(
        (s) => s.submittedAt !== null
      );
      const inProgressSubmission = submissions.find(
        (s) => s.submittedAt === null
      );

      const meta = quiz.meta as any;
      const maxAttempts = meta.max_attempts || 0;
      const attemptCount = completedSubmissions.length;
      const canAttempt =
        quiz.acceptingResponses &&
        (maxAttempts === 0 || attemptCount < maxAttempts);

      const response: IQuizDetailResponse = {
        id: quiz.id,
        name: quiz.name,
        type: meta.type,
        acceptingResponses: quiz.acceptingResponses,
        maxAttempts,
        attemptStatus: {
          attempted: attemptCount > 0,
          attemptCount,
          canAttempt,
          hasInProgressAttempt: !!inProgressSubmission,
          inProgressSubmissionId: inProgressSubmission?.id,
        },
      };

      // Include questions only if accepting responses and can attempt
      if (quiz.acceptingResponses && canAttempt) {
        response.questions = quiz.questions.map((q) => ({
          id: q.id,
          quizId: q.quizId,
          questionText: q.questionText,
          options: q.options as any[],
          answerType: q.answerType as "mcq" | "scale",
          meta: q.meta,
          order: q.order,
        }));
      }

      logger.info("Fetched quiz details", { userId, quizId });

      return response;
    } catch (error) {
      logger.error("Error fetching quiz details:", error);
      throw error;
    }
  }

  /**
   * Save draft responses
   */
  static async saveDraft(
    quizId: string,
    userId: string,
    responses: IQuizResponse[],
    ip?: string,
    userAgent?: string
  ): Promise<{ submissionId: string; message: string }> {
    try {
      // Check access and if can attempt
      await this.validateQuizAccess(userId, quizId, true);

      // Check if there's an in-progress submission
      let submission = await prisma.quizSubmission.findFirst({
        where: {
          userId,
          quizId,
          submittedAt: null,
        },
      });

      if (submission) {
        // Update existing draft
        submission = await prisma.quizSubmission.update({
          where: { id: submission.id },
          data: {
            responses: responses as any,
            updatedAt: new Date(),
          },
        });

        logger.info("Updated draft submission", {
          userId,
          quizId,
          submissionId: submission.id,
        });
      } else {
        // Create new draft
        submission = await prisma.quizSubmission.create({
          data: {
            userId,
            quizId,
            responses: responses as any,
            submittedAt: null,
            validated: false,
          },
        });

        logger.info("Created draft submission", {
          userId,
          quizId,
          submissionId: submission.id,
        });
      }

      auditLog({
        userId,
        action: "QUIZ_DRAFT_SAVED",
        resource: "Quiz",
        details: { quizId, submissionId: submission.id },
        ip,
        userAgent,
      });

      return {
        submissionId: submission.id,
        message: "Draft saved successfully",
      };
    } catch (error) {
      logger.error("Error saving draft:", error);
      throw error;
    }
  }

  /**
   * Submit quiz responses
   */
  static async submitQuiz(
    quizId: string,
    userId: string,
    responses: IQuizResponse[],
    ip?: string,
    userAgent?: string
  ): Promise<{ submissionId: string; score: number | null; message: string }> {
    try {
      // Check access and if can attempt
      await this.validateQuizAccess(userId, quizId, true);

      // Get quiz with questions
      const quiz = await prisma.quiz.findUnique({
        where: { id: quizId },
        include: { questions: true },
      });

      if (!quiz) {
        throw ApiError.notFound("Quiz not found");
      }

      const meta = quiz.meta as any;
      const isEvaluative = meta.type === "evaluative";

      // Calculate score for evaluative quizzes
      let totalScore: number | null = null;

      if (isEvaluative) {
        totalScore = this.calculateScore(responses, quiz.questions);
      }

      // Check for in-progress submission
      const inProgressSubmission = await prisma.quizSubmission.findFirst({
        where: {
          userId,
          quizId,
          submittedAt: null,
        },
      });

      let submission;

      if (inProgressSubmission) {
        // Update existing submission
        submission = await prisma.quizSubmission.update({
          where: { id: inProgressSubmission.id },
          data: {
            responses: responses as any,
            score: totalScore,
            submittedAt: new Date(),
            validated: isEvaluative, // Auto-validate evaluative quizzes
          },
        });
      } else {
        // Create new submission
        submission = await prisma.quizSubmission.create({
          data: {
            userId,
            quizId,
            responses: responses as any,
            score: totalScore,
            submittedAt: new Date(),
            validated: isEvaluative,
          },
        });
      }

      logger.info("Quiz submitted", {
        userId,
        quizId,
        submissionId: submission.id,
        score: totalScore,
      });

      auditLog({
        userId,
        action: "QUIZ_SUBMITTED",
        resource: "Quiz",
        details: { quizId, submissionId: submission.id, score: totalScore },
        ip,
        userAgent,
      });

      return {
        submissionId: submission.id,
        score: totalScore,
        message: "Quiz submitted successfully",
      };
    } catch (error) {
      logger.error("Error submitting quiz:", error);
      throw error;
    }
  }

  /**
   * Get quiz result
   */
  static async getQuizResult(
    quizId: string,
    userId: string
  ): Promise<IQuizResultResponse> {
    try {
      // Get latest completed submission
      const submission = await prisma.quizSubmission.findFirst({
        where: {
          userId,
          quizId,
          submittedAt: { not: null },
        },
        orderBy: { submittedAt: "desc" },
        include: {
          quiz: {
            include: {
              questions: true,
              inference: true,
            },
          },
        },
      });

      if (!submission) {
        throw ApiError.notFound("No submission found for this quiz");
      }

      const quiz = submission.quiz;
      const meta = quiz.meta as any;

      // Calculate inference
      let inference: string | null = null;

      if (
        meta.type === "evaluative" &&
        submission.score !== null &&
        quiz.inference
      ) {
        inference = this.calculateInference(
          submission.score,
          quiz.inference.inferenceLogic as any
        );
      }

      const response: IQuizResultResponse = {
        quizId: quiz.id,
        quizName: quiz.name,
        quizType: meta.type,
        score: submission.score,
        totalQuestions: quiz.questions.length,
        responses: submission.responses as any,
        inference,
        submittedAt: submission.submittedAt!,
      };

      logger.info("Fetched quiz result", { userId, quizId });

      return response;
    } catch (error) {
      logger.error("Error fetching quiz result:", error);
      throw error;
    }
  }

  /**
   * Check if user has access to quiz
   */
  private static async checkUserAccess(
    userId: string,
    quizId: string
  ): Promise<boolean> {
    const userGroups = await prisma.groupUser.findMany({
      where: { userId },
      select: { groupId: true },
    });

    const groupIds = userGroups.map((ug) => ug.groupId);

    if (groupIds.length === 0) {
      return false;
    }

    const permission = await prisma.quizGroupPermission.findFirst({
      where: {
        quizId,
        groupId: { in: groupIds },
        permission: "attempt",
      },
    });

    return !!permission;
  }

  /**
   * Validate quiz access and attempt eligibility
   */
  private static async validateQuizAccess(
    userId: string,
    quizId: string,
    checkAttemptLimit: boolean = false
  ): Promise<void> {
    // Check access
    const hasAccess = await this.checkUserAccess(userId, quizId);

    if (!hasAccess) {
      throw ApiError.forbidden("You do not have access to this quiz");
    }

    // Get quiz
    const quiz = await prisma.quiz.findUnique({
      where: { id: quizId },
    });

    if (!quiz) {
      throw ApiError.notFound("Quiz not found");
    }

    if (!quiz.acceptingResponses) {
      throw ApiError.badRequest("This quiz is not accepting responses");
    }

    if (checkAttemptLimit) {
      const meta = quiz.meta as any;
      const maxAttempts = meta.max_attempts || 0;

      if (maxAttempts > 0) {
        const completedSubmissions = await prisma.quizSubmission.count({
          where: {
            userId,
            quizId,
            submittedAt: { not: null },
          },
        });

        if (completedSubmissions >= maxAttempts) {
          throw ApiError.badRequest(
            "You have reached the maximum number of attempts for this quiz"
          );
        }
      }
    }
  }

  /**
   * Calculate score based on responses
   */
  private static calculateScore(
    responses: IQuizResponse[],
    questions: any[]
  ): number {
    let totalScore = 0;

    responses.forEach((response) => {
      const question = questions.find((q) => q.id === response.question_id);

      if (question) {
        const options = question.options as any[];
        const selectedOption = options.find(
          (opt) => opt.option_key === response.selected_option_key
        );

        if (selectedOption) {
          totalScore += selectedOption.value || 0;
        }
      }
    });

    return totalScore;
  }

  /**
   * Calculate inference based on score
   */
  private static calculateInference(
    score: number,
    inferenceLogic: any
  ): string | null {
    if (!inferenceLogic || !inferenceLogic.rules) {
      return null;
    }

    const rule = inferenceLogic.rules.find(
      (r: any) => score >= r.min && score <= r.max
    );

    return rule ? rule.inference : null;
  }
}
