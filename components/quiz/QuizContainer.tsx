'use client';

import { useState, useEffect } from 'react';
import { QCMData, QuizQuestion } from '@/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { QuizProgressStorage } from '@/lib/storage/quiz-progress';

type QuizMode = 'intro' | 'taking' | 'results' | 'review';

interface QuizContainerProps {
  noteId: string;
  qcmData: QCMData;
}

export default function QuizContainer({ noteId, qcmData }: QuizContainerProps) {
  const [mode, setMode] = useState<QuizMode>('intro');
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [userAnswers, setUserAnswers] = useState<Record<number, number>>({});
  const [startTime, setStartTime] = useState(0);
  const [elapsedTime, setElapsedTime] = useState(0);

  // Load saved progress
  useEffect(() => {
    const saved = QuizProgressStorage.get(noteId);
    if (saved && mode === 'intro') {
      setUserAnswers(saved.userAnswers);
      setCurrentQuestionIndex(saved.currentQuestionIndex);
      setStartTime(saved.startTime);
    }
  }, [noteId, mode]);

  // Auto-save progress
  useEffect(() => {
    if (mode === 'taking' && startTime > 0) {
      QuizProgressStorage.save({
        noteId,
        currentQuestionIndex,
        userAnswers,
        startTime,
      });
    }
  }, [noteId, currentQuestionIndex, userAnswers, startTime, mode]);

  const handleStartQuiz = () => {
    setMode('taking');
    setStartTime(Date.now());
  };

  const handleSelectAnswer = (questionId: number, optionIndex: number) => {
    setUserAnswers({ ...userAnswers, [questionId]: optionIndex });
  };

  const handleNext = () => {
    if (currentQuestionIndex < qcmData.questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    }
  };

  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
    }
  };

  const handleSubmit = () => {
    const unanswered = qcmData.questions.filter((q) => !(q.id in userAnswers));
    if (unanswered.length > 0) {
      const confirm = window.confirm(
        `You have ${unanswered.length} unanswered questions. Submit anyway?`
      );
      if (!confirm) return;
    }

    setElapsedTime(Date.now() - startTime);
    setMode('results');
    QuizProgressStorage.remove(noteId);
  };

  const handleRetry = () => {
    setUserAnswers({});
    setCurrentQuestionIndex(0);
    setMode('intro');
  };

  const handleReview = () => {
    setCurrentQuestionIndex(0);
    setMode('review');
  };

  const calculateScore = () => {
    let correct = 0;
    qcmData.questions.forEach((q) => {
      if (userAnswers[q.id] === q.correct_answer) correct++;
    });
    return {
      correct,
      total: qcmData.questions.length,
      percentage: Math.round((correct / qcmData.questions.length) * 100),
    };
  };

  const getGrade = (percentage: number) => {
    if (percentage >= 90) return { stars: 5, text: 'Perfect!' };
    if (percentage >= 80) return { stars: 4, text: 'Excellent!' };
    if (percentage >= 70) return { stars: 3, text: 'Good job!' };
    if (percentage >= 60) return { stars: 2, text: 'Pass' };
    return { stars: 1, text: 'Needs review' };
  };

  // Intro Mode
  if (mode === 'intro') {
    return (
      <Card>
        <CardContent className="p-8 text-center space-y-4">
          <h2 className="text-2xl font-bold">Ready to Test Your Knowledge?</h2>
          <div className="text-muted-foreground space-y-2">
            <p>{qcmData.metadata.total_questions} questions</p>
            <p>Estimated time: ~{qcmData.metadata.estimated_time_minutes} minutes</p>
            <p>Passing score: {qcmData.metadata.passing_score_percentage}%</p>
          </div>
          <Button onClick={handleStartQuiz} size="lg">
            Start Quiz
          </Button>
        </CardContent>
      </Card>
    );
  }

  // Taking Mode
  if (mode === 'taking') {
    const currentQuestion = qcmData.questions[currentQuestionIndex];
    const answeredCount = Object.keys(userAnswers).length;
    const progressPercentage = (answeredCount / qcmData.questions.length) * 100;

    return (
      <div className="space-y-4">
        {/* Progress Bar */}
        <div>
          <div className="flex justify-between text-sm mb-2">
            <span>Question {currentQuestionIndex + 1}/{qcmData.questions.length}</span>
            <span>Answered: {answeredCount}/{qcmData.questions.length}</span>
          </div>
          <Progress value={progressPercentage} />
        </div>

        {/* Question Card */}
        <Card>
          <CardContent className="p-8 space-y-6">
            <div>
              <span className="text-sm text-muted-foreground">
                {currentQuestion.topic} • {currentQuestion.difficulty}
              </span>
              <h3 className="text-xl font-semibold mt-2">{currentQuestion.question}</h3>
            </div>

            {/* Options */}
            <div className="space-y-3">
              {currentQuestion.options.map((option, index) => (
                <label
                  key={index}
                  className={`flex items-center p-4 border-2 rounded-lg cursor-pointer transition-colors ${
                    userAnswers[currentQuestion.id] === index
                      ? 'border-primary bg-primary/5'
                      : 'border-border hover:border-primary/50'
                  }`}
                >
                  <input
                    type="radio"
                    name={`question-${currentQuestion.id}`}
                    checked={userAnswers[currentQuestion.id] === index}
                    onChange={() => handleSelectAnswer(currentQuestion.id, index)}
                    className="mr-3"
                  />
                  <span>{option}</span>
                </label>
              ))}
            </div>

            {/* Navigation */}
            <div className="flex justify-between pt-4">
              <Button
                variant="outline"
                onClick={handlePrevious}
                disabled={currentQuestionIndex === 0}
              >
                Previous
              </Button>

              {currentQuestionIndex === qcmData.questions.length - 1 ? (
                <Button onClick={handleSubmit} disabled={answeredCount === 0}>
                  Submit Quiz
                </Button>
              ) : (
                <Button onClick={handleNext}>Next</Button>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Results Mode
  if (mode === 'results') {
    const score = calculateScore();
    const grade = getGrade(score.percentage);
    const timeMinutes = Math.floor(elapsedTime / 60000);
    const timeSeconds = Math.floor((elapsedTime % 60000) / 1000);

    return (
      <Card>
        <CardContent className="p-8 text-center space-y-6">
          <h2 className="text-3xl font-bold">Quiz Completed!</h2>

          <div className="text-6xl font-bold text-primary">
            {score.correct}/{score.total}
          </div>

          <div>
            <div className="text-4xl mb-2">
              {'⭐'.repeat(grade.stars)}
            </div>
            <div className="text-2xl font-semibold">{score.percentage}%</div>
            <div className="text-lg text-muted-foreground">{grade.text}</div>
          </div>

          <div className="flex justify-center gap-8 text-sm">
            <div>
              <div className="text-green-600 font-semibold">Correct: {score.correct}</div>
            </div>
            <div>
              <div className="text-red-600 font-semibold">
                Incorrect: {score.total - score.correct}
              </div>
            </div>
            <div>
              <div className="text-muted-foreground">
                Time: {timeMinutes}m {timeSeconds}s
              </div>
            </div>
          </div>

          <div className="flex gap-4 justify-center">
            <Button onClick={handleReview}>Review Answers</Button>
            <Button variant="outline" onClick={handleRetry}>
              Retry Quiz
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Review Mode
  if (mode === 'review') {
    const currentQuestion = qcmData.questions[currentQuestionIndex];
    const userAnswer = userAnswers[currentQuestion.id];
    const isCorrect = userAnswer === currentQuestion.correct_answer;

    return (
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <span className="text-sm text-muted-foreground">
            Question {currentQuestionIndex + 1}/{qcmData.questions.length}
          </span>
          <Button variant="outline" size="sm" onClick={() => setMode('results')}>
            Back to Summary
          </Button>
        </div>

        <Card>
          <CardContent className="p-8 space-y-6">
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <span className="text-sm text-muted-foreground">
                  {currentQuestion.topic} • {currentQuestion.difficulty}
                </span>
                <h3 className="text-xl font-semibold mt-2">{currentQuestion.question}</h3>
              </div>
              <div
                className={`px-3 py-1 rounded-full text-sm font-semibold ${
                  isCorrect ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                }`}
              >
                {isCorrect ? '✓ Correct' : '✗ Wrong'}
              </div>
            </div>

            {/* Options */}
            <div className="space-y-3">
              {currentQuestion.options.map((option, index) => {
                const isUserAnswer = userAnswer === index;
                const isCorrectAnswer = currentQuestion.correct_answer === index;

                return (
                  <div
                    key={index}
                    className={`p-4 border-2 rounded-lg ${
                      isCorrectAnswer
                        ? 'border-green-500 bg-green-50 text-gray-900'
                        : isUserAnswer
                        ? 'border-red-500 bg-red-50 text-gray-900'
                        : 'border-border'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span>{option}</span>
                      {isCorrectAnswer && <span className="text-green-700 font-semibold">✓ Correct</span>}
                      {isUserAnswer && !isCorrectAnswer && (
                        <span className="text-red-700 font-semibold">✗ Your answer</span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Explanation */}
            <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded">
              <div className="flex items-start">
                <span className="text-blue-600 mr-2">💡</span>
                <div>
                  <div className="font-semibold text-blue-900 mb-1">Explanation</div>
                  <p className="text-sm text-blue-800">{currentQuestion.explanation}</p>
                </div>
              </div>
            </div>

            {/* Navigation */}
            <div className="flex justify-between pt-4">
              <Button
                variant="outline"
                onClick={handlePrevious}
                disabled={currentQuestionIndex === 0}
              >
                Previous
              </Button>
              <Button
                onClick={handleNext}
                disabled={currentQuestionIndex === qcmData.questions.length - 1}
              >
                Next
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return null;
}
