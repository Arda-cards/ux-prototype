/**
 * ESLint rule: no-hardcoded-colors
 *
 * Flags hex color literals (#RGB, #RRGGBB, #RRGGBBAA) found in JSX className
 * string values. Use design tokens from globals.css instead.
 *
 * Decision D5: Option A — Custom ESLint rule.
 */

const HEX_COLOR_REGEX = /#[0-9a-fA-F]{3,8}\b/g;

/** @type {import('eslint').Rule.RuleModule} */
const rule = {
  meta: {
    type: 'suggestion',
    docs: {
      description: 'Disallow hardcoded hex color values in JSX className props',
      recommended: false,
    },
    messages: {
      noHardcodedColor:
        'Hardcoded color "{{color}}" in className. Use a design token from globals.css instead (e.g., bg-primary, text-foreground, border-border).',
    },
    schema: [],
  },
  create(context) {
    return {
      JSXAttribute(node) {
        // Only check className attributes
        if (node.name.name !== 'className') return;

        // Only check string literal values
        if (!node.value) return;

        // Handle className="..." (string literal)
        if (node.value.type === 'Literal' && typeof node.value.value === 'string') {
          const value = node.value.value;
          let match;
          HEX_COLOR_REGEX.lastIndex = 0;
          while ((match = HEX_COLOR_REGEX.exec(value)) !== null) {
            context.report({
              node: node.value,
              messageId: 'noHardcodedColor',
              data: { color: match[0] },
            });
          }
        }

        // Handle className={"..."} (JSX expression with string literal)
        if (
          node.value.type === 'JSXExpressionContainer' &&
          node.value.expression.type === 'Literal' &&
          typeof node.value.expression.value === 'string'
        ) {
          const value = node.value.expression.value;
          let match;
          HEX_COLOR_REGEX.lastIndex = 0;
          while ((match = HEX_COLOR_REGEX.exec(value)) !== null) {
            context.report({
              node: node.value.expression,
              messageId: 'noHardcodedColor',
              data: { color: match[0] },
            });
          }
        }

        // Handle className={`...`} (template literal)
        if (
          node.value.type === 'JSXExpressionContainer' &&
          node.value.expression.type === 'TemplateLiteral'
        ) {
          for (const quasi of node.value.expression.quasis) {
            const value = quasi.value.raw;
            let match;
            HEX_COLOR_REGEX.lastIndex = 0;
            while ((match = HEX_COLOR_REGEX.exec(value)) !== null) {
              context.report({
                node: quasi,
                messageId: 'noHardcodedColor',
                data: { color: match[0] },
              });
            }
          }
        }
      },
    };
  },
};

export default rule;
