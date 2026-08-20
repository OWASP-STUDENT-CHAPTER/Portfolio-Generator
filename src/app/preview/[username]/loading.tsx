import React from 'react';
import { Skeleton } from '@/components/dashboard/SkeletonLoader';

export default function PreviewLoading() {
  return (
    <div
      style={{
        minHeight: '100vh',
        background: '#070a12',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        padding: '5rem 1.5rem',
      }}
    >
      <div style={{ maxWidth: '720px', width: '100%', display: 'flex', flexDirection: 'column', gap: '2rem' }}>
        <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'center' }}>
          <Skeleton width="80px" height="80px" borderRadius="50%" />
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', flex: 1 }}>
            <Skeleton width="220px" height="32px" borderRadius="8px" />
            <Skeleton width="340px" height="18px" borderRadius="6px" />
          </div>
        </div>

        <Skeleton width="100%" height="70px" borderRadius="10px" />

        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', marginTop: '1rem' }}>
          <Skeleton width="180px" height="24px" />
          {[1, 2].map((i) => (
            <div
              key={i}
              style={{
                background: 'rgba(255, 255, 255, 0.03)',
                border: '1px solid rgba(255, 255, 255, 0.06)',
                borderRadius: '16px',
                padding: '1.75rem',
                display: 'flex',
                flexDirection: 'column',
                gap: '0.75rem',
              }}
            >
              <Skeleton width="160px" height="24px" />
              <Skeleton width="90%" height="16px" />
              <Skeleton width="70%" height="16px" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
