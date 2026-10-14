import React from 'react';

interface MathExpressionProps {
  expression: string;
  className?: string;
}

/**
 * Beautiful MathExpression component that parses and elegantly displays
 * mathematical formulas and LaTeX-style fractions (e.g. \frac{1}{2} + \frac{1}{3} = ?)
 * without raw LaTeX syntax clutter.
 */
export const MathExpression: React.FC<MathExpressionProps> = ({ expression, className = '' }) => {
  if (!expression) return null;

  // Function to render math tokens
  const renderFormattedMath = (expr: string) => {
    // Check if the expression contains \frac{...}{...}
    const fracRegex = /\\frac\{([^{}]+)\}\{([^{}]+)\}/g;
    
    // Split text by \frac{a}{b}
    const parts: React.ReactNode[] = [];
    let lastIndex = 0;
    let match: RegExpExecArray | null;

    while ((match = fracRegex.exec(expr)) !== null) {
      // Add text before fraction
      if (match.index > lastIndex) {
        const textBefore = expr.substring(lastIndex, match.index);
        parts.push(
          <span key={`text-${lastIndex}`} className="mx-2 text-neutral-800 font-medium">
            {cleanMathSymbols(textBefore)}
          </span>
        );
      }

      const numerator = match[1];
      const denominator = match[2];

      // Add styled visual fraction
      parts.push(
        <span
          key={`frac-${match.index}`}
          className="inline-flex flex-col items-center justify-center align-middle mx-1.5"
          style={{ verticalAlign: '-0.45em' }}
        >
          <span className="text-base sm:text-lg font-bold border-b-2 border-neutral-800 px-1.5 pb-0.5 leading-none text-neutral-900">
            {numerator}
          </span>
          <span className="text-base sm:text-lg font-bold px-1.5 pt-0.5 leading-none text-neutral-900">
            {denominator}
          </span>
        </span>
      );

      lastIndex = fracRegex.lastIndex;
    }

    // Add trailing text
    if (lastIndex < expr.length) {
      const textAfter = expr.substring(lastIndex);
      parts.push(
        <span key={`text-${lastIndex}`} className="mx-2 text-neutral-800 font-medium">
          {cleanMathSymbols(textAfter)}
        </span>
      );
    }

    return parts.length > 0 ? parts : cleanMathSymbols(expr);
  };

  const cleanMathSymbols = (str: string) => {
    return str
      .replace(/\\cdot/g, '·')
      .replace(/\\times/g, '×')
      .replace(/\\div/g, '÷')
      .replace(/\\pm/g, '±')
      .replace(/\\leq/g, '≤')
      .replace(/\\geq/g, '≥')
      .replace(/\\neq/g, '≠')
      .replace(/\\approx/g, '≈')
      .replace(/\\/g, '');
  };

  return (
    <div
      className={`my-4 p-5 sm:p-6 bg-gradient-to-r from-emerald-50/50 via-white to-emerald-50/50 border border-emerald-200/80 rounded-xl shadow-xs text-center flex items-center justify-center flex-wrap select-none ${className}`}
    >
      <div className="text-xl sm:text-2xl font-serif tracking-wide text-neutral-900 flex items-center justify-center flex-wrap gap-1">
        {renderFormattedMath(expression)}
      </div>
    </div>
  );
};
