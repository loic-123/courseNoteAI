'use client';

import { useEffect, useState, useRef } from 'react';
import { useParams } from 'next/navigation';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import QuizContainer from '@/components/quiz/QuizContainer';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import 'katex/dist/katex.min.css';
import './notes-styles.css';
import { ThumbsUp, ThumbsDown, Download, Share2, Eye, FileText, Loader2, ImageIcon, Trash2 } from 'lucide-react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { Note } from '@/types';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';

export default function NotePage() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id as string;
  const [note, setNote] = useState<Note | null>(null);
  const [loading, setLoading] = useState(true);
  const [generatingPdf, setGeneratingPdf] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [adminPassword, setAdminPassword] = useState('');
  const [deleteError, setDeleteError] = useState('');
  const [deleting, setDeleting] = useState(false);
  const notesContentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    async function fetchNote() {
      try {
        const response = await fetch(`/api/notes/${id}`);
        if (!response.ok) throw new Error('Note not found');
        const data = await response.json();
        setNote(data);
      } catch (error) {
        console.error('Error fetching note:', error);
      } finally {
        setLoading(false);
      }
    }

    if (id) fetchNote();
  }, [id]);

  const handleVote = async (voteType: 'up' | 'down') => {
    try {
      const response = await fetch('/api/vote', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ noteId: id, voteType }),
      });

      const result = await response.json();
      if (result.success && note) {
        setNote({
          ...note,
          upvotes: result.upvotes,
          downvotes: result.downvotes,
        });
      }
    } catch (error) {
      console.error('Vote error:', error);
    }
  };

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    alert('Link copied to clipboard!');
  };

  const handleDelete = async () => {
    if (!adminPassword.trim()) {
      setDeleteError('Please enter the admin password');
      return;
    }

    setDeleting(true);
    setDeleteError('');

    try {
      const response = await fetch(`/api/notes/${id}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ adminPassword }),
      });

      const result = await response.json();

      if (!response.ok) {
        setDeleteError(result.error || 'Failed to delete note');
        return;
      }

      // Redirect to gallery on success
      router.push('/gallery');
    } catch (error) {
      setDeleteError('An error occurred while deleting');
    } finally {
      setDeleting(false);
    }
  };

  const openDeleteDialog = () => {
    setAdminPassword('');
    setDeleteError('');
    setDeleteDialogOpen(true);
  };

  const handleDownloadPDF = async () => {
    if (!note) {
      console.error('PDF generation failed: no note data');
      alert('Please wait for the note to load');
      return;
    }

    console.log('Starting PDF generation...');
    setGeneratingPdf(true);

    try {
      // Dynamic imports for PDF generation libraries
      console.log('Loading PDF libraries...');
      const [jsPDFModule, html2canvasModule] = await Promise.all([
        import('jspdf'),
        import('html2canvas')
      ]);
      const jsPDF = jsPDFModule.default;
      const html2canvas = html2canvasModule.default;
      console.log('PDF libraries loaded successfully');

      // Create a temporary container for PDF rendering
      const pdfContainer = document.createElement('div');
      pdfContainer.style.cssText = `
        position: absolute;
        left: -9999px;
        top: 0;
        width: 794px;
        background-color: white;
        font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      `;

      // Professional PDF Header
      const header = document.createElement('div');
      header.style.cssText = `
        padding: 40px 50px 30px 50px;
        border-bottom: 3px solid #1e40af;
        margin-bottom: 0;
      `;
      header.innerHTML = `
        <h1 style="font-size: 22pt; font-weight: bold; margin: 0 0 12px 0; color: #1e40af; line-height: 1.3;">
          ${note.title}
        </h1>
        <div style="font-size: 11pt; color: #4b5563; margin-bottom: 6px;">
          <strong>${note.course?.code || ''}</strong>${note.course?.name ? ` — ${note.course.name}` : ''}
        </div>
        <div style="font-size: 10pt; color: #6b7280;">
          By ${note.creator_name} • Generated on ${new Date(note.created_at).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
          })}
        </div>
      `;
      pdfContainer.appendChild(header);

      // Clone the actual rendered content (which includes KaTeX rendered formulas)
      const notesElement = notesContentRef.current;
      let contentClone: HTMLElement;

      if (notesElement) {
        // Clone the rendered content which has KaTeX already processed
        contentClone = notesElement.cloneNode(true) as HTMLElement;
        console.log('Cloned rendered notes content with KaTeX');
      } else {
        // Fallback: render markdown content using a temporary element
        console.log('Notes ref not available, creating fallback content');
        contentClone = document.createElement('div');
        contentClone.className = 'notes-content';

        // For fallback, we need to parse markdown - basic conversion
        // Note: This won't render LaTeX, but it's a fallback
        const basicHtml = note.notes_markdown
          .replace(/^### (.*$)/gim, '<h3>$1</h3>')
          .replace(/^## (.*$)/gim, '<h2>$1</h2>')
          .replace(/^# (.*$)/gim, '<h1>$1</h1>')
          .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
          .replace(/\*(.*?)\*/g, '<em>$1</em>')
          .replace(/^\- (.*$)/gim, '<li>$1</li>')
          .replace(/^\d+\. (.*$)/gim, '<li>$1</li>')
          .replace(/\n\n/g, '</p><p>')
          .replace(/`([^`]+)`/g, '<code>$1</code>');
        contentClone.innerHTML = `<p>${basicHtml}</p>`;
      }

      // Apply PDF-optimized styling to content
      const contentWrapper = document.createElement('div');
      contentWrapper.style.cssText = `
        padding: 30px 50px 40px 50px;
        font-size: 11pt;
        line-height: 1.7;
        color: #1f2937;
      `;

      // Style the cloned content for PDF
      contentClone.style.cssText = `
        font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      `;

      // Apply specific PDF styles to elements
      contentClone.querySelectorAll('h1').forEach((h) => {
        (h as HTMLElement).style.cssText = `
          font-size: 16pt; font-weight: 700; margin: 28px 0 14px 0;
          color: #1e40af; border-bottom: 2px solid #3b82f6;
          padding-bottom: 8px;
        `;
      });
      contentClone.querySelectorAll('h2').forEach((h) => {
        (h as HTMLElement).style.cssText = `
          font-size: 13pt; font-weight: 700; margin: 24px 0 12px 0;
          color: #1e3a8a; border-bottom: 1px solid #93c5fd;
          padding-bottom: 6px;
        `;
      });
      contentClone.querySelectorAll('h3').forEach((h) => {
        (h as HTMLElement).style.cssText = `
          font-size: 11pt; font-weight: 600; margin: 20px 0 10px 0;
          color: #1d4ed8;
        `;
      });
      contentClone.querySelectorAll('p').forEach((p) => {
        (p as HTMLElement).style.cssText = `
          margin: 0 0 12px 0; text-align: justify; line-height: 1.7;
        `;
      });
      contentClone.querySelectorAll('ul, ol').forEach((list) => {
        (list as HTMLElement).style.cssText = `
          margin: 8px 0 14px 20px; padding: 0;
        `;
      });
      contentClone.querySelectorAll('li').forEach((li) => {
        (li as HTMLElement).style.cssText = `
          margin: 0 0 6px 0; line-height: 1.6;
        `;
      });
      contentClone.querySelectorAll('pre').forEach((pre) => {
        (pre as HTMLElement).style.cssText = `
          background-color: #f3f4f6; color: #1f2937; padding: 12px;
          border-radius: 6px; margin: 12px 0; font-size: 9pt;
          overflow: hidden; border: 1px solid #d1d5db;
          font-family: 'Courier New', Consolas, monospace; line-height: 1.5;
        `;
      });
      contentClone.querySelectorAll('code').forEach((code) => {
        if ((code as HTMLElement).parentElement?.tagName !== 'PRE') {
          (code as HTMLElement).style.cssText = `
            background-color: #f3f4f6; padding: 2px 4px;
            border-radius: 3px; font-size: 9pt;
            font-family: 'Courier New', Consolas, monospace;
          `;
        }
      });
      contentClone.querySelectorAll('table').forEach((table) => {
        (table as HTMLElement).style.cssText = `
          width: 100%; border-collapse: collapse; margin: 14px 0;
          font-size: 9pt;
        `;
      });
      contentClone.querySelectorAll('th').forEach((th) => {
        (th as HTMLElement).style.cssText = `
          background-color: #1e40af; color: white; font-weight: 600;
          text-align: left; padding: 8px 10px; border: 1px solid #1e3a8a;
        `;
      });
      contentClone.querySelectorAll('td').forEach((td) => {
        (td as HTMLElement).style.cssText = `
          padding: 6px 10px; border: 1px solid #d1d5db; vertical-align: top;
        `;
      });
      contentClone.querySelectorAll('blockquote').forEach((bq) => {
        (bq as HTMLElement).style.cssText = `
          border-left: 4px solid #3b82f6; background-color: #eff6ff;
          padding: 10px 14px; margin: 14px 0; font-style: italic;
          color: #1e40af; border-radius: 0 6px 6px 0;
        `;
      });
      contentClone.querySelectorAll('strong').forEach((s) => {
        (s as HTMLElement).style.cssText = `font-weight: 700; color: #1e3a8a;`;
      });

      // Style KaTeX elements for better PDF rendering
      contentClone.querySelectorAll('.katex').forEach((katex) => {
        (katex as HTMLElement).style.cssText = `
          font-size: 1em;
        `;
      });
      contentClone.querySelectorAll('.katex-display').forEach((katex) => {
        (katex as HTMLElement).style.cssText = `
          margin: 14px 0; padding: 10px;
          background-color: #fafafa; border-radius: 6px;
          overflow-x: visible;
        `;
      });

      contentWrapper.appendChild(contentClone);
      pdfContainer.appendChild(contentWrapper);

      // Footer
      const footer = document.createElement('div');
      footer.style.cssText = `
        padding: 15px 50px 30px 50px;
        border-top: 1px solid #d1d5db;
        margin-top: 20px;
      `;
      footer.innerHTML = `
        <div style="font-size: 9pt; color: #6b7280; text-align: center;">
          Generated with CourseNotesAI • ${new Date().toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
          })}
        </div>
      `;
      pdfContainer.appendChild(footer);

      document.body.appendChild(pdfContainer);
      console.log('PDF container added to DOM');

      // Wait for fonts and KaTeX styles to load
      await new Promise(resolve => setTimeout(resolve, 300));

      // Generate canvas with higher quality
      console.log('Generating canvas...');
      const canvas = await html2canvas(pdfContainer, {
        scale: 2,
        useCORS: true,
        logging: false,
        backgroundColor: '#ffffff',
        windowWidth: 794,
      });
      console.log('Canvas generated:', canvas.width, 'x', canvas.height);

      // Create PDF with proper pagination
      console.log('Creating PDF with pagination...');
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4',
      });

      const pdfWidth = 210; // A4 width in mm
      const pdfHeight = 297; // A4 height in mm
      const margin = 10; // margin in mm
      const contentWidth = pdfWidth - (margin * 2);
      const contentHeight = pdfHeight - (margin * 2);

      // Calculate dimensions
      const imgWidth = contentWidth;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      const totalPages = Math.ceil(imgHeight / contentHeight);

      console.log('PDF dimensions:', { imgWidth, imgHeight, contentHeight, totalPages });

      // Split canvas into pages
      const pageCanvas = document.createElement('canvas');
      const pageCtx = pageCanvas.getContext('2d')!;
      const scaleFactor = canvas.width / imgWidth;
      const pageHeightPx = contentHeight * scaleFactor;

      pageCanvas.width = canvas.width;
      pageCanvas.height = pageHeightPx;

      for (let page = 0; page < totalPages; page++) {
        if (page > 0) {
          pdf.addPage();
        }

        // Calculate source position
        const sourceY = page * pageHeightPx;
        const sourceHeight = Math.min(pageHeightPx, canvas.height - sourceY);

        // Clear and draw page portion
        pageCtx.fillStyle = '#ffffff';
        pageCtx.fillRect(0, 0, pageCanvas.width, pageCanvas.height);
        pageCtx.drawImage(
          canvas,
          0, sourceY, canvas.width, sourceHeight,
          0, 0, canvas.width, sourceHeight
        );

        // Add to PDF
        const pageImgData = pageCanvas.toDataURL('image/jpeg', 0.92);
        const actualPageHeight = (sourceHeight / scaleFactor);
        pdf.addImage(pageImgData, 'JPEG', margin, margin, imgWidth, actualPageHeight);

        // Add page number
        pdf.setFontSize(9);
        pdf.setTextColor(150);
        pdf.text(`Page ${page + 1} of ${totalPages}`, pdfWidth / 2, pdfHeight - 5, { align: 'center' });
      }

      console.log('Total pages:', totalPages);

      // Save PDF
      const fileName = note.title
        .replace(/[^a-z0-9\s]/gi, '')
        .replace(/\s+/g, '_')
        .toLowerCase();

      console.log('Saving PDF as:', `${fileName}_notes.pdf`);
      pdf.save(`${fileName}_notes.pdf`);

      // Cleanup
      document.body.removeChild(pdfContainer);
      console.log('PDF generation complete!');
    } catch (error) {
      console.error('Error generating PDF:', error);
      alert(`Failed to generate PDF: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setGeneratingPdf(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-slate-500">Loading note...</p>
        </div>
      </div>
    );
  }

  if (!note) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-2 text-slate-800">Note Not Found</h1>
          <p className="text-slate-500">The note you're looking for doesn't exist.</p>
        </div>
      </div>
    );
  }

  const course = note.course;
  const institution = note.institution;

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-5xl mx-auto px-6 py-10">
        {/* Professional Header */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 mb-8 overflow-hidden">
          <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-8 py-6">
            <h1 className="text-3xl font-bold text-white mb-2">{note.title}</h1>
            <div className="flex flex-wrap items-center gap-3 text-blue-100">
              <span className="font-semibold">{course?.code}</span>
              <span>•</span>
              <span>{course?.name}</span>
              {institution && (
                <>
                  <span>•</span>
                  <span>{institution.short_name}</span>
                </>
              )}
            </div>
          </div>
          <div className="px-8 py-4 bg-slate-50 border-t border-slate-100">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-4 text-sm text-slate-600">
                <span>By <strong>{note.creator_name}</strong></span>
                <span>•</span>
                <span>{new Date(note.created_at).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}</span>
              </div>
              <div className="flex items-center gap-3">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleVote('up')}
                  className="h-9"
                >
                  <ThumbsUp className="h-4 w-4 mr-1.5" />
                  {note.upvotes}
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleVote('down')}
                  className="h-9"
                >
                  <ThumbsDown className="h-4 w-4 mr-1.5" />
                  {note.downvotes}
                </Button>
                <div className="flex items-center gap-1.5 px-3 h-9 text-sm text-slate-500 bg-slate-100 rounded-md">
                  <Eye className="h-4 w-4" />
                  {note.views_count}
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleShare}
                  className="h-9"
                >
                  <Share2 className="h-4 w-4 mr-1.5" />
                  Share
                </Button>
                <Button
                  size="sm"
                  onClick={handleDownloadPDF}
                  disabled={generatingPdf}
                  className="h-9 bg-blue-600 hover:bg-blue-700"
                >
                  {generatingPdf ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-1.5 animate-spin" />
                      Generating...
                    </>
                  ) : (
                    <>
                      <Download className="h-4 w-4 mr-1.5" />
                      Download PDF
                    </>
                  )}
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={openDeleteDialog}
                  className="h-9 text-red-600 border-red-200 hover:bg-red-50 hover:border-red-300"
                >
                  <Trash2 className="h-4 w-4 mr-1.5" />
                  Delete
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Content Tabs */}
        <Tabs defaultValue="notes" className="w-full">
          <TabsList className="w-full justify-start bg-white border border-slate-200 rounded-lg p-1 mb-6 h-auto">
            <TabsTrigger
              value="notes"
              className="flex-1 py-3 text-base font-medium data-[state=active]:bg-blue-600 data-[state=active]:text-white rounded-md"
            >
              <FileText className="h-4 w-4 mr-2" />
              Course Notes
            </TabsTrigger>
            <TabsTrigger
              value="qcm"
              className="flex-1 py-3 text-base font-medium data-[state=active]:bg-blue-600 data-[state=active]:text-white rounded-md"
            >
              ✅ Quiz (QCM)
            </TabsTrigger>
            <TabsTrigger
              value="visual"
              className="flex-1 py-3 text-base font-medium data-[state=active]:bg-blue-600 data-[state=active]:text-white rounded-md"
            >
              <ImageIcon className="h-4 w-4 mr-2" />
              Visual Summary
            </TabsTrigger>
          </TabsList>

          {/* Notes Tab */}
          <TabsContent value="notes">
            <Card className="shadow-sm border-slate-200">
              <CardContent className="p-0">
                <div
                  ref={notesContentRef}
                  className="notes-content px-10 py-10 md:px-14 md:py-12 lg:px-16"
                >
                  <ReactMarkdown
                    remarkPlugins={[remarkGfm, remarkMath]}
                    rehypePlugins={[rehypeKatex]}
                  >
                    {note.notes_markdown}
                  </ReactMarkdown>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* QCM Tab */}
          <TabsContent value="qcm">
            <QuizContainer noteId={note.id} qcmData={note.qcm_json} />
          </TabsContent>

          {/* Visual Tab */}
          <TabsContent value="visual">
            {note.visual_image_url ? (
              <Card className="shadow-sm border-slate-200">
                <CardContent className="p-8">
                  <div className="relative w-full rounded-lg overflow-hidden bg-slate-100" style={{ minHeight: '600px' }}>
                    <Image
                      src={note.visual_image_url}
                      alt={`Visual study sheet for ${note.title}`}
                      fill
                      className="object-contain"
                    />
                  </div>
                  <div className="mt-6 text-center">
                    <Button
                      asChild
                      size="lg"
                      className="bg-blue-600 hover:bg-blue-700"
                    >
                      <a href={note.visual_image_url} download target="_blank" rel="noopener noreferrer">
                        <Download className="h-5 w-5 mr-2" />
                        Download Visual
                      </a>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <Card className="shadow-sm border-slate-200 border-dashed">
                <CardContent className="py-16 text-center">
                  <div className="max-w-md mx-auto">
                    <div className="h-16 w-16 rounded-full bg-slate-100 flex items-center justify-center mx-auto mb-4">
                      <ImageIcon className="h-8 w-8 text-slate-400" />
                    </div>
                    <h3 className="text-lg font-semibold text-slate-800 mb-2">Visual Not Available</h3>
                    <p className="text-slate-500 mb-4">
                      The visual study sheet could not be generated for this note.
                    </p>
                    <p className="text-sm text-slate-400">
                      You can still use the comprehensive notes and quiz to study.
                    </p>
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </div>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="text-red-600">Delete Note</DialogTitle>
            <DialogDescription>
              This action cannot be undone. This will permanently delete the note
              &quot;{note.title}&quot; and its associated visual.
            </DialogDescription>
          </DialogHeader>
          <div className="px-6 py-4">
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Admin Password
            </label>
            <Input
              type="password"
              value={adminPassword}
              onChange={(e) => setAdminPassword(e.target.value)}
              placeholder="Enter admin password"
              className="w-full"
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  handleDelete();
                }
              }}
            />
            {deleteError && (
              <p className="mt-2 text-sm text-red-600">{deleteError}</p>
            )}
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDeleteDialogOpen(false)}
              disabled={deleting}
            >
              Cancel
            </Button>
            <Button
              onClick={handleDelete}
              disabled={deleting}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              {deleting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-1.5 animate-spin" />
                  Deleting...
                </>
              ) : (
                <>
                  <Trash2 className="h-4 w-4 mr-1.5" />
                  Delete Note
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
