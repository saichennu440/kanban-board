/**
 * Storage Module
 * Handles all localStorage operations for persisting Kanban board data
 */

const STORAGE_KEY = 'kanban_tasks';

/**
 * Storage utility class for managing task persistence
 */
export class Storage {
  /**
   * Save tasks to localStorage
   * @param {Array} tasks - Array of task objects to save
   */
  static saveTasks(tasks) {
    try {
      const tasksJson = JSON.stringify(tasks);
      localStorage.setItem(STORAGE_KEY, tasksJson);
    } catch (error) {
      console.error('Error saving tasks to localStorage:', error);
    }
  }

  /**
   * Load tasks from localStorage
   * @returns {Array} Array of task objects, empty array if none found
   */
  static loadTasks() {
    try {
      const tasksJson = localStorage.getItem(STORAGE_KEY);
      return tasksJson ? JSON.parse(tasksJson) : [];
    } catch (error) {
      console.error('Error loading tasks from localStorage:', error);
      return [];
    }
  }

  /**
   * Clear all tasks from localStorage
   */
  static clearTasks() {
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch (error) {
      console.error('Error clearing tasks from localStorage:', error);
    }
  }

  /**
   * Check if localStorage is available
   * @returns {boolean} True if localStorage is available
   */
  static isAvailable() {
    try {
      const test = 'localStorage_test';
      localStorage.setItem(test, test);
      localStorage.removeItem(test);
      return true;
    } catch (error) {
      console.warn('localStorage is not available:', error);
      return false;
    }
  }
}

// Make Storage available globally for other modules
window.KanbanStorage = Storage;