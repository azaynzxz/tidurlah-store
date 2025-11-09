import { useState } from 'react'
import Header from "@/components/common/Header"
import { AnimatedElement } from "@/components/animations/AnimatedElement"
import Dashboard from '@/components/Layouter/src/components/Dashboard'
import FileSelection from '@/components/Layouter/src/components/FileSelection'
import '@/components/Layouter/src/App.css'
import '@/components/Layouter/src/index.css'
import '@/components/Layouter/src/components/Dashboard.css'
import '@/components/Layouter/src/components/FileSelection.css'
import '@/components/Layouter/src/components/ProgressBar.css'

type LayoutType = '1s' | '2s-sama' | 'kanan-kiri-beda'

const Layout = () => {
  const [selectedLayout, setSelectedLayout] = useState<LayoutType | null>(null)

  const handleLayoutSelect = (layout: string) => {
    setSelectedLayout(layout as LayoutType)
  }

  const handleBack = () => {
    setSelectedLayout(null)
  }

  return (
    <div className="min-h-screen relative overflow-hidden bg-background flex flex-col">
      {/* Universal Header */}
      <Header 
        cartItemsCount={0}
        onCartClick={() => window.location.href = '/'}
        onSearch={() => {}}
        showSearch={false}
      />

      {/* Main Content */}
      <div className="flex-1 pt-4 pb-12 px-4">
        {/* Animated gradient background */}
        <div className="absolute inset-0 -z-10 bg-gradient-to-br from-background via-primary/5 to-secondary/10" />
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_50%_120%,rgba(120,119,198,0.1),transparent_50%)]" />
        
        {!selectedLayout ? (
          <>
            {/* Header */}
            <AnimatedElement direction="up" delay={200} duration={300}>
              <header className="text-center mb-12">
                <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-6 tracking-tight">
                  Layout Otomatis ID Card
                </h1>
                
                {/* Brand Pills */}
                <div className="flex flex-wrap justify-center gap-2 max-w-xl mx-auto">
                  {["ID Card Lampung", "Papan ID Craft", "Tidurlah Grafika"].map((brand) => (
                    <div
                      key={brand}
                      className="px-4 py-1.5 bg-white/60 backdrop-blur-sm rounded-full text-xs font-medium text-foreground/80 border border-border/50"
                    >
                      {brand}
                    </div>
                  ))}
                </div>
              </header>
            </AnimatedElement>

            {/* Dashboard */}
            <AnimatedElement direction="up" delay={400} duration={300}>
              <div className="container max-w-4xl mx-auto">
                <Dashboard onSelectLayout={handleLayoutSelect} />
              </div>
            </AnimatedElement>

            {/* Footer */}
            <AnimatedElement direction="up" delay={600} duration={300}>
              <footer className="text-center mt-16 text-muted-foreground text-sm">
                <p>© 2025 Tidurlah Store. Hak Cipta Dilindungi.</p>
              </footer>
            </AnimatedElement>
          </>
        ) : (
          <AnimatedElement direction="up" delay={200} duration={300}>
            <div className="container max-w-4xl mx-auto">
              <FileSelection 
                layout={selectedLayout} 
                onBack={handleBack}
              />
            </div>
          </AnimatedElement>
        )}
      </div>
    </div>
  )
}

export default Layout

