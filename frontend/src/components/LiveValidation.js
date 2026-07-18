// components/LiveValidation.js
import { memo } from 'react';

export const LiveValidation = memo(({ validation }) => {
  if (!validation) return null;

  const { status, errors, warnings } = validation;

  if (status === 'empty') return null;

  let icon = '✅';
  let message = 'DAG Valid';
  let color = '#39C98A';
  let bgColor = 'rgba(57, 201, 138, 0.08)';
  let borderColor = 'rgba(57, 201, 138, 0.2)';

  if (status === 'error') {
    icon = '❌';
    message = errors[0]?.message || 'Invalid Pipeline';
    color = '#ef4444';
    bgColor = 'rgba(239, 68, 68, 0.08)';
    borderColor = 'rgba(239, 68, 68, 0.2)';
  } else if (status === 'warning') {
    icon = '⚠️';
    message = warnings[0]?.message || 'Warnings detected';
    color = '#F5A623';
    bgColor = 'rgba(245, 166, 35, 0.08)';
    borderColor = 'rgba(245, 166, 35, 0.2)';
  }

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 6,
        padding: '6px 12px',
        background: bgColor,
        border: `1px solid ${borderColor}`,
        borderRadius: 8,
        fontSize: 12,
        fontWeight: 500,
        color: color,
        transition: 'all 0.2s ease',
      }}
    >
      <span>{icon}</span>
      <span>{message}</span>
    </div>
  );
});
