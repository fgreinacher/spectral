import { isPlainObject } from '@stoplight/json';
import AggregateError = require('es-aggregate-error');

import type { FileRuleDefinition, RuleDefinition, RulesetDefinition } from '../types';
import { createValidator } from './ajv';
import { convertAjvErrors } from './errors';

import { RulesetValidationError } from './errors';

export { RulesetValidationError };

export function assertValidRuleset(
  ruleset: unknown,
  format: 'js' | 'json' = 'js',
): asserts ruleset is RulesetDefinition {
  if (!isPlainObject(ruleset)) {
    throw new RulesetValidationError('Provided ruleset is not an object', []);
  }

  if (!('rules' in ruleset) && !('extends' in ruleset) && !('overrides' in ruleset)) {
    throw new RulesetValidationError('Ruleset must have rules or extends or overrides defined', []);
  }

  const validate = createValidator(format);

  if (!validate(ruleset)) {
    throw new AggregateError(convertAjvErrors(validate.errors ?? []));
  }
}

function isRuleDefinition(rule: FileRuleDefinition): rule is RuleDefinition {
  return typeof rule === 'object' && rule !== null && !Array.isArray(rule) && ('given' in rule || 'then' in rule);
}

export function assertValidRule(rule: FileRuleDefinition, name: string): asserts rule is RuleDefinition {
  if (!isRuleDefinition(rule)) {
    throw new RulesetValidationError('Rule definition expected', ['rules', name]);
  }
}
