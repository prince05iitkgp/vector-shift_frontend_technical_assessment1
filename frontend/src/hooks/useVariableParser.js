// hooks/useVariableParser.js
// Extracts unique {{variable}} names from a text string.
// Returns a stable array used to render dynamic Handle components.

import { useMemo } from 'react';

/**
 * Parses a text string for {{variable}} patterns and returns
 * an array of unique, valid JavaScript identifier variable names.
 *
 * Rules:
 *   - Must match exactly {{identifier}} — no spaces, no numbers as first char
 *   - Duplicate variable names are deduplicated (first occurrence wins)
 *   - Order of first appearance is preserved
 *
 * Examples:
 *   "Hello {{name}}"                → ['name']
 *   "{{a}} and {{b}} and {{a}}"     → ['a', 'b']
 *   "No vars here"                  → []
 *   "{{123invalid}}"               → []
 *   "{{ spaces }}"                 → []
 *
 * @param {string} text
 * @returns {string[]} unique variable names in order of first appearance
 */
export const useVariableParser = (text) => {
  return useMemo(() => {
    if (!text || typeof text !== 'string') return [];

    // Strict: must start with letter or underscore, followed by word chars
    const regex = /\{\{([a-zA-Z_][a-zA-Z0-9_]*)\}\}/g;
    const variables = [];
    const seen = new Set();
    let match;

    while ((match = regex.exec(text)) !== null) {
      const varName = match[1];
      if (!seen.has(varName)) {
        seen.add(varName);
        variables.push(varName);
      }
    }

    return variables;
  }, [text]);
};
