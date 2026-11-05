import './globals.css';

export const metadata = { title: 'Not found · CodeBridge' };

export default function GlobalNotFound() {
  return (
    <html lang="en">
      <body>
        <main className="wrap" style={{ minHeight: '100vh', justifyContent: 'center', alignItems: 'flex-start' }}>
          <h1>404</h1>
          <a className="btn pri" href="/">CodeBridge</a>
        </main>
      </body>
    </html>
  );
}
