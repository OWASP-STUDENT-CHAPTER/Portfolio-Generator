import React from 'react';
import { Skeleton } from '@/components/dashboard/SkeletonLoader';

export default function ProjectsLoading() {
  return (
    <div style={{ maxWidth: '900px', display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <Skeleton width="220px" height="32px" borderRadius="8px" style={{ marginBottom: '0.5rem' }} />
          <Skeleton width="340px" height="18px" borderRadius="6px" />
        </div>
        <Skeleton width="140px" height="42px" borderRadius="10px" />
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            style={{
              background: 'rgba(17, 24, 39, 0.7)',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              borderRadius: '16px',
              padding: '1.5rem',
              display: 'flex',
              flexDirection: 'column',
              gap: '0.75rem',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Skeleton width="180px" height="22px" />
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <Skeleton width="32px" height="32px" borderRadius="8px" />
                <Skeleton width="32px" height="32px" borderRadius="8px" />
              </div>
            </div>
            <Skeleton width="80%" height="16px" />
            <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem' }}>
              <Skeleton width="60px" height="24px" borderRadius="4px" />
              <Skeleton width="60px" height="24px" borderRadius="4px" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
