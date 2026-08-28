export function ProgressCard({
  title,
  progress,
}: {
  title: string;
  progress: number;
}) {
  return (
    <div className="card">
      <h3>{title}</h3>
      <p className="muted">{progress}% completed</p>
      <div className="progress">
        <div style={{ width: `${progress}%` }} />
      </div>
    </div>
  );
}
