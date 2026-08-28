import Link from "next/link";

export default function ProfilePage() {
  return (
    <main className="page narrow">
      <Link href="/">← Dashboard</Link>
      <div className="profile">
        <div className="avatar">U</div>
        <h1>Student Profile</h1>
        <p className="muted">student@example.com</p>
      </div>

      <div className="stats">
        <div className="card"><strong>3</strong><span>Courses</span></div>
        <div className="card"><strong>18</strong><span>Lessons</span></div>
        <div className="card"><strong>72%</strong><span>Mastery</span></div>
      </div>
    </main>
  );
}
