import React from 'react';

export function Skeleton({
  width = '100%',
  height = '20px',
  borderRadius = '8px',
  style,
}: {
  width?: string | number;
  height?: string | number;
  borderRadius?: string | number;
  style?: React.CSSProperties;
}) {
  return (
    <div
      style={{
        width,
        height,
        borderRadius,
        background: 'linear-gradient(90deg, rgba(255, 255, 255, 0.04) 25%, rgba(255, 255, 255, 0.09) 37%, rgba(255, 255, 255, 0.04) 63%)',
        backgroundSize: '400% 100%',
        animation: 'skeleton-shimmer 1.4s ease infinite',
        ...style,
      }}
    />
  );
}

export function DashboardPageSkeleton() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem', maxWidth: '1100px' }}>
      {/* Top Banner Skeleton */}
      <div
        style={{
          background: 'rgba(17, 24, 39, 0.6)',
          border: '1px solid rgba(255, 255, 255, 0.08)',
          borderRadius: '20px',
          padding: '2rem',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '1.5rem',
        }}
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', width: '60%' }}>
          <Skeleton width="140px" height="24px" borderRadius="9999px" />
          <Skeleton width="280px" height="36px" borderRadius="10px" />
          <Skeleton width="400px" height="20px" borderRadius="6px" />
        </div>
        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <Skeleton width="160px" height="44px" borderRadius="10px" />
          <Skeleton width="130px" height="44px" borderRadius="10px" />
        </div>
      </div>

      {/* Grid Cards Skeleton */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1rem' }}>
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            style={{
              background: 'rgba(17, 24, 39, 0.6)',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              borderRadius: '14px',
              padding: '1.25rem',
              display: 'flex',
              flexDirection: 'column',
              gap: '0.5rem',
            }}
          >
            <Skeleton width="90px" height="16px" />
            <Skeleton width="60px" height="28px" />
            <Skeleton width="110px" height="14px" />
          </div>
        ))}
      </div>

      {/* Large Live Preview Skeleton */}
      <div
        style={{
          background: 'rgba(17, 24, 39, 0.6)',
          border: '1px solid rgba(255, 255, 255, 0.08)',
          borderRadius: '20px',
          height: '480px',
          padding: '1.5rem',
          display: 'flex',
          flexDirection: 'column',
          gap: '1rem',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Skeleton width="200px" height="24px" />
          <Skeleton width="120px" height="32px" borderRadius="8px" />
        </div>
        <Skeleton width="100%" height="100%" borderRadius="12px" />
      </div>
    </div>
  );
}

export function FormPageSkeleton({ title = 'Loading...' }: { title?: string }) {
  return (
    <div style={{ maxWidth: '850px', display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      <div>
        <Skeleton width="240px" height="32px" borderRadius="8px" style={{ marginBottom: '0.5rem' }} />
        <Skeleton width="380px" height="18px" borderRadius="6px" />
      </div>

      <div
        style={{
          background: 'rgba(17, 24, 39, 0.7)',
          border: '1px solid rgba(255, 255, 255, 0.08)',
          borderRadius: '16px',
          padding: '2rem',
          display: 'flex',
          flexDirection: 'column',
          gap: '1.5rem',
        }}
      >
        {[1, 2, 3].map((i) => (
          <div key={i} style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <Skeleton width="120px" height="16px" />
            <Skeleton width="100%" height="44px" borderRadius="8px" />
          </div>
        ))}

        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '1rem' }}>
          <Skeleton width="150px" height="44px" borderRadius="10px" />
        </div>
      </div>
    </div>
  );
}
