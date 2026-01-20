export interface QuizProgress {
  noteId: string;
  currentQuestionIndex: number;
  userAnswers: Record<number, number>; // questionId -> selectedOption
  startTime: number;
}

export class QuizProgressStorage {
  private static getKey(noteId: string): string {
    return `quiz_progress_${noteId}`;
  }

  static save(progress: QuizProgress): void {
    if (typeof window === 'undefined') return;
    localStorage.setItem(this.getKey(progress.noteId), JSON.stringify(progress));
  }

  static get(noteId: string): QuizProgress | null {
    if (typeof window === 'undefined') return null;
    const data = localStorage.getItem(this.getKey(noteId));
    if (!data) return null;
    try {
      return JSON.parse(data);
    } catch {
      return null;
    }
  }

  static remove(noteId: string): void {
    if (typeof window === 'undefined') return;
    localStorage.removeItem(this.getKey(noteId));
  }

  static exists(noteId: string): boolean {
    if (typeof window === 'undefined') return false;
    return localStorage.getItem(this.getKey(noteId)) !== null;
  }
}
