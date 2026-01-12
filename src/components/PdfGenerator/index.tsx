import React, { useState } from 'react';
import { Button } from '@/components/ui/button'; // Import Shadcn Button
import { Loader2, Download } from 'lucide-react'; // Import Loader2 and Download icons
import { jsPDF } from 'jspdf';
import { MiniCourse } from '@/hooks/useMiniCourse';

interface PdfGeneratorProps {
  courseData: MiniCourse;
  onGenerateStart?: () => void;
  onGenerateEnd?: () => void;
}

export const generatePdf = async ({
  courseData,
  onGenerateStart,
  onGenerateEnd,
}: PdfGeneratorProps) => {
  try {
    onGenerateStart?.();

    const pdf = new jsPDF();
    let yPosition = 20;
    const margin = 20;
    const pageWidth = pdf.internal.pageSize.width;
    const contentWidth = pageWidth - 2 * margin;

    // Configurações de estilo
    const titleSize = 24;
    const headingSize = 16;
    const normalSize = 12;
    const smallSize = 10;
    const lineHeight = 7;

    // Função helper para adicionar texto com quebra de linha
    const addWrappedText = (text: string, y: number, size: number = normalSize) => {
      pdf.setFontSize(size);
      const lines = pdf.splitTextToSize(text, contentWidth);
      pdf.text(lines, margin, y);
      return y + (lines.length * lineHeight);
    };

    // Adiciona nova página se necessário
    const checkPageBreak = (requiredSpace: number) => {
      if (yPosition + requiredSpace > pdf.internal.pageSize.height - margin) {
        pdf.addPage();
        yPosition = margin;
      }
    };

    // Título do Curso
    pdf.setFont("helvetica", "bold");
    yPosition = addWrappedText(courseData.title.toUpperCase(), yPosition, titleSize);
    yPosition += 10;

    // Objetivos
    checkPageBreak(30);
    pdf.setFont("helvetica", "bold");
    yPosition = addWrappedText("Objetivos", yPosition, headingSize);
    yPosition += 5;
    pdf.setFont("helvetica", "normal");
    courseData.objectives.forEach(objective => {
      checkPageBreak(15);
      yPosition = addWrappedText(`• ${objective}`, yPosition, normalSize);
      yPosition += 3;
    });
    yPosition += 10;

    // Módulos
    courseData.modules.forEach((module, moduleIndex) => {
      checkPageBreak(40);

      // Título do Módulo
      pdf.setFont("helvetica", "bold");
      yPosition = addWrappedText(`Módulo ${moduleIndex + 1}: ${module.module_title}`, yPosition, headingSize);
      yPosition += 5;

      // Introdução do Módulo
      pdf.setFont("helvetica", "normal");
      yPosition = addWrappedText(module.introduction, yPosition);
      yPosition += 10;

      // Lições
      module.lessons.forEach((lesson, lessonIndex) => {
        checkPageBreak(30);

        // Título da Lição
        pdf.setFont("helvetica", "bold");
        yPosition = addWrappedText(`${lessonIndex + 1}. ${lesson.lesson_title}`, yPosition, normalSize);
        yPosition += 5;

        // Conteúdo da Lição
        pdf.setFont("helvetica", "normal");
        yPosition = addWrappedText(lesson.content, yPosition);
        yPosition += 5;

        // Exemplo
        if (lesson.example) {
          checkPageBreak(15);
          pdf.setFont("helvetica", "italic");
          yPosition = addWrappedText(`Exemplo: ${lesson.example}`, yPosition, smallSize);
          yPosition += 5;
        }
      });

      // Quiz
      if (module.quiz.length > 0) {
        checkPageBreak(30);
        pdf.setFont("helvetica", "bold");
        yPosition = addWrappedText("Quiz do Módulo", yPosition, normalSize);
        yPosition += 5;

        module.quiz.forEach((question, qIndex) => {
          checkPageBreak(40);
          
          // Questão
          pdf.setFont("helvetica", "normal");
          yPosition = addWrappedText(`${qIndex + 1}. ${question.question}`, yPosition, smallSize);
          yPosition += 5;

          // Opções
          question.options.forEach((option, oIndex) => {
            checkPageBreak(10);
            const isCorrect = option === question.answer;
            pdf.setFont("helvetica", isCorrect ? "bold" : "normal");
            yPosition = addWrappedText(`${String.fromCharCode(97 + oIndex)}) ${option}`, yPosition, smallSize);
            yPosition += 3;
          });

          yPosition += 5;
        });
      }

      yPosition += 10;
    });

    // Glossário
    if (courseData.glossary.length > 0) {
      checkPageBreak(40);
      
      pdf.setFont("helvetica", "bold");
      yPosition = addWrappedText("Glossário", yPosition, headingSize);
      yPosition += 10;

      courseData.glossary.forEach(item => {
        checkPageBreak(20);
        pdf.setFont("helvetica", "bold");
        yPosition = addWrappedText(item.term, yPosition, smallSize);
        yPosition += 3;
        pdf.setFont("helvetica", "normal");
        yPosition = addWrappedText(item.definition, yPosition, smallSize);
        yPosition += 5;
      });
    }

    // Resumo Final
    if (courseData.final_summary) {
      checkPageBreak(40);
      pdf.setFont("helvetica", "bold");
      yPosition = addWrappedText("Resumo Final", yPosition, headingSize);
      yPosition += 5;
      pdf.setFont("helvetica", "normal");
      yPosition = addWrappedText(courseData.final_summary, yPosition);
      yPosition += 10;
    }

    // Dicas de Estudo
    if (courseData.study_tips.length > 0) {
      checkPageBreak(40);
      pdf.setFont("helvetica", "bold");
      yPosition = addWrappedText("Dicas de Estudo", yPosition, headingSize);
      yPosition += 5;

      courseData.study_tips.forEach((tip, index) => {
        checkPageBreak(15);
        pdf.setFont("helvetica", "normal");
        yPosition = addWrappedText(`${index + 1}. ${tip}`, yPosition);
        yPosition += 3;
      });
    }

    // Salva o PDF
    pdf.save(`${courseData.title.toLowerCase().replace(/\s+/g, '-')}.pdf`);
  } catch (error) {
    console.error('Erro ao gerar PDF:', error);
  } finally {
    onGenerateEnd?.();
  }
};

export const PdfButton: React.FC<{ courseData: MiniCourse; className?: string }> = ({ courseData, className }) => {
  const [isGenerating, setIsGenerating] = useState(false);

  const handleGenerate = async () => {
    await generatePdf({
      courseData,
      onGenerateStart: () => setIsGenerating(true),
      onGenerateEnd: () => setIsGenerating(false),
    });
  };

  return (
    <Button
      onClick={handleGenerate}
      disabled={isGenerating}
      variant="outline" // Example variant, can be adjusted
      size="sm" // Example size
      className={className} // Allow passing custom classes
    >
      {isGenerating ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Gerando...
        </>
      ) : (
        <>
          <Download className="mr-2 h-4 w-4" />
          Baixar PDF
        </>
      )}
    </Button>
  );
};
