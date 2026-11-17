export function ProductCardSkeleton() {
  return (
    <div className="product-card">
      <div className="skeleton" style={{ height: 210 }} />
      <div className="stack" style={{ padding: 20 }}>
        <div className="skeleton" style={{ height: 16, width: '85%' }} />
        <div className="skeleton" style={{ height: 12, width: '100%' }} />
        <div className="skeleton" style={{ height: 12, width: '70%' }} />
        <div className="skeleton" style={{ height: 40, marginTop: 12 }} />
      </div>
    </div>
  );
}

export function ProductGridSkeleton({ count = 8 }) {
  return (
    <div className="grid grid-4">
      {Array.from({ length: count }, (_, i) => <ProductCardSkeleton key={i} />)}
    </div>
  );
}

export function LineSkeleton({ width = '100%', height = 14 }) {
  return <div className="skeleton" style={{ width, height }} />;
}
