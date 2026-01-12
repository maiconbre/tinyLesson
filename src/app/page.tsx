'use client';

import React from 'react';
import Link from 'next/link'; // Import Link for navigation
import { motion } from 'framer-motion';
import { Button } from "@/components/ui/button"; // Import Shadcn Button

export default function LandingPage() {
  return (
    // Main container set to relative to position the background absolutely within it
    // Changed overflow-x-hidden to overflow-hidden
    <div className="relative text-foreground transition-colors duration-300 overflow-hidden flex items-center justify-center min-h-[calc(100vh-80px)]">

      {/* Animated Background Element */}
      <div
        className="absolute inset-0 -z-10 bg-gradient-radial from-primary/30 via-background to-background animate-pulse-gradient-bg"
        style={{ backgroundPosition: 'center center' }} // Center the gradient
      />

      {/* Content container - already had relative z-10, which is good */}
      <div className="relative z-10 text-center px-4 sm:px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="max-w-3xl mx-auto"
        >
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold text-primary mb-6 sm:mb-8">
            Crie Mini Cursos Instantâneos com IA
          </h1>
          <p className="text-lg sm:text-xl md:text-2xl text-muted-foreground mb-8 sm:mb-12">
            Transforme qualquer tópico em um mini curso estruturado e pronto para estudo em questão de segundos. Totalmente grátis e inovador.
          </p>
          <Link href="/generate" passHref>
            <Button asChild size="lg" className="text-lg px-8 py-6">
              <motion.div // motion.div can be used with asChild for animations if needed
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Experimente Grátis
              </motion.div>
            </Button>
          </Link>
        </motion.div>
      </div>
    </div>
  );
}
