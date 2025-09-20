export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen py-8">
      <div className="container mx-auto">{children}</div>
    </div>
  )
}


