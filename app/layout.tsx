export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ru">
      <body style={{fontFamily:"system-ui",padding:24,background:"#fafafa"}}>
        {children}
      </body>
    </html>
  );
}

