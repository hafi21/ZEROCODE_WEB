import { WebsiteLayout } from '../types';

export type HistoryState = WebsiteLayout;

export class HistoryManager {
  private stack: HistoryState[] = [];
  private index: number = -1;
  private maxHistory: number = 50;

  constructor(initialState: HistoryState) {
    this.push(initialState);
  }

  push(state: HistoryState) {
    // Deep copy to avoid reference issues
    const newState = JSON.parse(JSON.stringify(state));
    
    // If we're not at the end of the stack, remove future states
    if (this.index < this.stack.length - 1) {
      this.stack = this.stack.slice(0, this.index + 1);
    }

    // Add new state
    this.stack.push(newState);
    this.index++;

    // Limit history size
    if (this.stack.length > this.maxHistory) {
      this.stack.shift();
      this.index--;
    }
  }

  undo(): HistoryState | null {
    if (this.index > 0) {
      this.index--;
      return JSON.parse(JSON.stringify(this.stack[this.index]));
    }
    return null;
  }

  redo(): HistoryState | null {
    if (this.index < this.stack.length - 1) {
      this.index++;
      return JSON.parse(JSON.stringify(this.stack[this.index]));
    }
    return null;
  }

  canUndo(): boolean {
    return this.index > 0;
  }

  canRedo(): boolean {
    return this.index < this.stack.length - 1;
  }
}
