"use client"

import * as React from "react"
import { Moon, Sun, ChevronLeft } from "lucide-react"
import { useTheme } from "next-themes"
import { motion, AnimatePresence } from "framer-motion"

import { Button } from "@/components/ui/button"

export function ThemeToggle() {
  const { setTheme, theme } = useTheme()
  const [isExpanded, setIsExpanded] = React.useState(true)

  React.useEffect(() => {
    let timer: NodeJS.Timeout

    if (isExpanded) {
      timer = setTimeout(() => {
        setIsExpanded(false)
      }, 5000)
    }

    return () => clearTimeout(timer)
  }, [isExpanded])

  const handleExpand = () => {
    setIsExpanded(true)
  }

  const handleToggle = (e: React.MouseEvent) => {
    e.stopPropagation()
    setTheme(theme === "light" ? "dark" : "light")
    setIsExpanded(true) // Reset timer
  }

  return (
    <div
      className="fixed top-20 md:top-28 right-0 z-50 flex items-center justify-end pr-4 pointer-events-none"
    // Container handles positioning area but let events pass through empty space
    >
      <div className="pointer-events-auto">
        {/* Wrapper allows interaction */}
        <AnimatePresence mode="wait">
          {isExpanded ? (
            <motion.div
              key="toggle"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.2 }}
            >
              <Button
                variant="outline"
                size="icon"
                onClick={handleToggle}
                className="rounded-full shadow-md bg-background/80 backdrop-blur-sm border-2 border-primary/20 hover:shadow-lg transition-all"
              >
                <Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
                <Moon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
                <span className="sr-only">Toggle theme</span>
              </Button>
            </motion.div>
          ) : (
            <motion.div
              key="arrow"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.2 }}
            >
              <Button
                variant="ghost"
                size="sm"
                onClick={handleExpand}
                className="h-8 w-6 p-0 bg-background/50 hover:bg-background/80 backdrop-blur-[2px] rounded-l-md rounded-r-none border-y border-l border-primary/10 shadow-sm"
              >
                <ChevronLeft className="h-4 w-4 text-muted-foreground" />
              </Button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}