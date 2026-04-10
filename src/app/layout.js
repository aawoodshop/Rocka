import './globals.css';

export const metadata = {
  title: 'Stock Dashboard | Premium Analytics',
  description: 'Analyze HILO indicators and manage your stock portfolio effortlessly.',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body suppressHydrationWarning>
        <main className="app-wrapper">
          {children}
        </main>
      </body>
    </html>
  );
}
