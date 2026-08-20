import React from 'react';
import { Skeleton } from '@/components/dashboard/SkeletonLoader';

export default function TemplatesLoading() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      <div>
        <Skeleton width="260px" height="32px" borderRadius="8px" style={{ marginBottom: '0.5rem' }} />
        <Skeleton width="420px" height="18px" borderRadius="6px" />
      </div>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
          gap: '1.5rem',
        }}
      >
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div
            key={i}
            style={{
              background: 'rgba(17, 24, 39, 0.6)',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              borderRadius: '16px',
              padding: '1.5rem',
              display: 'flex',
              flexDirection: 'column',
              gap: '1rem',
            }}
          >
            <Skeleton width="100%" height="140px" borderRadius="10px" />
            <Skeleton width="160px" height="24px" />
            <Skeleton width="100%" height="36px" />
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Skeleton width="80px" height="24px" />
              <Skeleton width="100px" height="36px" borderRadius="8px" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
