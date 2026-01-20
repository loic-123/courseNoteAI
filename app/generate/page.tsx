'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import { ApiKeyStorage } from '@/lib/storage/api-key-storage';
import { Upload, Loader2, X } from 'lucide-react';

export default function GeneratePage() {
  const router = useRouter();
  const [files, setFiles] = useState<File[]>([]);
  const [apiKey, setApiKey] = useState('');
  const [rememberKey, setRememberKey] = useState(true);
  const [creatorName, setCreatorName] = useState('');
  const [title, setTitle] = useState('');
  const [courseCode, setCourseCode] = useState('');
  const [courseName, setCourseName] = useState('');
  const [detailLevel, setDetailLevel] = useState(8);
  const [useMetaphors, setUseMetaphors] = useState(true);
  const [technicalLevel, setTechnicalLevel] = useState<'beginner' | 'intermediate' | 'advanced'>('intermediate');
  const [length, setLength] = useState<'short' | 'medium' | 'long'>('medium');
  const [language, setLanguage] = useState<'en' | 'fr'>('en');
  const [customPrompt, setCustomPrompt] = useState('');
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [progress, setProgress] = useState(0);
  const [statusMessage, setStatusMessage] = useState('');
  const [isDragging, setIsDragging] = useState(false);

  useState(() => {
    const savedKey = ApiKeyStorage.get();
    if (savedKey) setApiKey(savedKey);
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files);
      setFiles(prev => [...prev, ...newFiles]);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    if (e.dataTransfer.files) {
      const newFiles = Array.from(e.dataTransfer.files);
      setFiles(prev => [...prev, ...newFiles]);
    }
  };

  const removeFile = (index: number) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleGenerate = async () => {
    if (files.length === 0 || !apiKey || !creatorName || !title || !courseCode || !courseName) {
      alert('Please fill in all required fields and upload at least one file');
      return;
    }

    if (rememberKey) {
      ApiKeyStorage.save(apiKey);
    }

    setIsGenerating(true);
    setProgress(5);
    setStatusMessage('Parsing files...');

    try {
      const formData = new FormData();
      // Append all files
      files.forEach(file => {
        formData.append('file', file);
      });
      formData.append('claudeApiKey', apiKey);
      formData.append('institutionId', '00000000-0000-0000-0000-000000000001'); // Default to first institution
      formData.append('courseCode', courseCode);
      formData.append('courseName', courseName);
      formData.append('creatorName', creatorName);
      formData.append('title', title);
      formData.append('detailLevel', detailLevel.toString());
      formData.append('useMetaphors', useMetaphors.toString());
      formData.append('technicalLevel', technicalLevel);
      formData.append('length', length);
      formData.append('language', language);
      if (customPrompt.trim()) {
        formData.append('customPrompt', customPrompt.trim());
      }

      setProgress(20);
      setStatusMessage('Analyzing content with Claude AI...');

      // Simulate progressive status updates
      const statusMessages = [
        'Analyzing content with Claude AI...',
        'Extracting key concepts...',
        'Generating comprehensive notes...',
        'Creating quiz questions...',
        'Preparing visual summary...',
      ];

      let messageIndex = 0;
      const statusInterval = setInterval(() => {
        messageIndex = (messageIndex + 1) % statusMessages.length;
        setStatusMessage(statusMessages[messageIndex]);
        setProgress(prev => Math.min(prev + 10, 85));
      }, 3000);

      const response = await fetch('/api/generate', {
        method: 'POST',
        body: formData,
      });

      clearInterval(statusInterval);

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Generation failed');
      }

      setProgress(90);
      setStatusMessage('Finalizing...');

      const result = await response.json();

      setProgress(100);
      setStatusMessage('Complete!');

      // Redirect to note page
      setTimeout(() => {
        router.push(`/notes/${result.noteId}`);
      }, 500);
    } catch (error) {
      console.error('Generation error:', error);
      alert(`Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
      setIsGenerating(false);
      setProgress(0);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <h1 className="text-4xl font-bold mb-2">Generate Course Notes</h1>
        <p className="text-muted-foreground mb-8">
          Upload your course materials and get comprehensive notes, quizzes, and visual sheets.
        </p>

        <Card>
          <CardHeader>
            <CardTitle>Upload & Configure</CardTitle>
            <CardDescription>
              Fill in the details below to generate your study materials
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* File Upload */}
            <div>
              <label className="block text-sm font-medium mb-2">Upload Files *</label>
              <div
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors cursor-pointer ${
                  isDragging ? 'border-primary bg-primary/10' : 'hover:border-primary'
                }`}
              >
                <input
                  type="file"
                  accept=".pdf,.docx,.txt,text/*,image/*"
                  onChange={handleFileChange}
                  className="hidden"
                  id="file-upload"
                  multiple
                />
                <label htmlFor="file-upload" className="cursor-pointer">
                  <Upload className="mx-auto h-12 w-12 text-muted-foreground mb-2" />
                  <p className="text-sm text-muted-foreground">
                    {isDragging
                      ? 'Drop files here...'
                      : 'Click to upload or drag & drop'}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    PDF, DOCX, TXT, or images (max 50MB each)
                  </p>
                </label>
              </div>

              {/* File List */}
              {files.length > 0 && (
                <div className="mt-4 space-y-2">
                  {files.map((file, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-3 bg-secondary rounded-lg"
                    >
                      <div className="flex items-center gap-2 flex-1 min-w-0">
                        <Upload className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                        <span className="text-sm truncate">{file.name}</span>
                        <span className="text-xs text-muted-foreground flex-shrink-0">
                          ({(file.size / 1024 / 1024).toFixed(2)} MB)
                        </span>
                      </div>
                      <button
                        onClick={() => removeFile(index)}
                        className="ml-2 text-muted-foreground hover:text-destructive transition-colors flex-shrink-0"
                        type="button"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* API Key */}
            <div>
              <label className="block text-sm font-medium mb-2">Claude API Key *</label>
              <Input
                type="password"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                placeholder="sk-ant-..."
              />
              <div className="flex items-center mt-2">
                <input
                  type="checkbox"
                  id="remember-key"
                  checked={rememberKey}
                  onChange={(e) => setRememberKey(e.target.checked)}
                  className="mr-2"
                />
                <label htmlFor="remember-key" className="text-sm text-muted-foreground">
                  Remember my key
                </label>
              </div>
            </div>

            {/* Creator Name */}
            <div>
              <label className="block text-sm font-medium mb-2">Your Name *</label>
              <Input
                value={creatorName}
                onChange={(e) => setCreatorName(e.target.value)}
                placeholder="e.g., John Doe"
              />
            </div>

            {/* Title */}
            <div>
              <label className="block text-sm font-medium mb-2">Note Title *</label>
              <Input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g., Lecture 1: Introduction to Machine Learning"
              />
            </div>

            {/* Course Code */}
            <div>
              <label className="block text-sm font-medium mb-2">Course Code *</label>
              <Input
                value={courseCode}
                onChange={(e) => setCourseCode(e.target.value)}
                placeholder="e.g., ELEC70122"
              />
            </div>

            {/* Course Name */}
            <div>
              <label className="block text-sm font-medium mb-2">Course Name *</label>
              <Input
                value={courseName}
                onChange={(e) => setCourseName(e.target.value)}
                placeholder="e.g., Machine Learning for Safety-Critical Systems"
              />
            </div>

            {/* Detail Level */}
            <div>
              <label className="block text-sm font-medium mb-2">
                Detail Level: {detailLevel}/10
              </label>
              <input
                type="range"
                min="1"
                max="10"
                value={detailLevel}
                onChange={(e) => setDetailLevel(parseInt(e.target.value))}
                className="w-full"
              />
            </div>

            {/* Technical Level */}
            <div>
              <label className="block text-sm font-medium mb-2">Technical Level</label>
              <select
                value={technicalLevel}
                onChange={(e) => setTechnicalLevel(e.target.value as any)}
                className="w-full border rounded-md p-2"
              >
                <option value="beginner">Beginner</option>
                <option value="intermediate">Intermediate</option>
                <option value="advanced">Advanced</option>
              </select>
            </div>

            {/* Length */}
            <div>
              <label className="block text-sm font-medium mb-2">Length</label>
              <div className="flex gap-4">
                {(['short', 'medium', 'long'] as const).map((len) => (
                  <label key={len} className="flex items-center">
                    <input
                      type="radio"
                      value={len}
                      checked={length === len}
                      onChange={() => setLength(len)}
                      className="mr-2"
                    />
                    {len.charAt(0).toUpperCase() + len.slice(1)}
                  </label>
                ))}
              </div>
            </div>

            {/* Language */}
            <div>
              <label className="block text-sm font-medium mb-2">Language</label>
              <div className="flex gap-4">
                <label className="flex items-center">
                  <input
                    type="radio"
                    value="en"
                    checked={language === 'en'}
                    onChange={() => setLanguage('en')}
                    className="mr-2"
                  />
                  English
                </label>
                <label className="flex items-center">
                  <input
                    type="radio"
                    value="fr"
                    checked={language === 'fr'}
                    onChange={() => setLanguage('fr')}
                    className="mr-2"
                  />
                  French
                </label>
              </div>
            </div>

            {/* Use Metaphors */}
            <div className="flex items-center">
              <input
                type="checkbox"
                id="use-metaphors"
                checked={useMetaphors}
                onChange={(e) => setUseMetaphors(e.target.checked)}
                className="mr-2"
              />
              <label htmlFor="use-metaphors" className="text-sm">
                Use creative metaphors and analogies
              </label>
            </div>

            {/* Advanced Options Toggle */}
            <div>
              <button
                type="button"
                onClick={() => setShowAdvanced(!showAdvanced)}
                className="text-sm text-primary hover:underline flex items-center gap-1"
              >
                {showAdvanced ? '▼' : '▶'} Advanced Options
              </button>
            </div>

            {/* Custom Prompt (Advanced) */}
            {showAdvanced && (
              <div className="p-4 bg-secondary/50 rounded-lg border border-border">
                <label className="block text-sm font-medium mb-2">
                  Custom Instructions (Optional)
                </label>
                <textarea
                  value={customPrompt}
                  onChange={(e) => setCustomPrompt(e.target.value)}
                  placeholder="Add specific instructions for generating your notes...&#10;&#10;Examples:&#10;- Focus on practical examples&#10;- Include more diagrams descriptions&#10;- Emphasize mathematical proofs&#10;- Add comparison tables"
                  className="w-full h-32 p-3 border rounded-md text-sm resize-none"
                />
                <p className="text-xs text-muted-foreground mt-2">
                  These instructions will guide how Claude generates your notes, quiz, and visual summary.
                </p>
              </div>
            )}

            {/* Generate Button */}
            <Button
              onClick={handleGenerate}
              disabled={isGenerating}
              className="w-full"
              size="lg"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Generating...
                </>
              ) : (
                'Generate Notes'
              )}
            </Button>

            {/* Progress */}
            {isGenerating && (
              <div className="space-y-4 p-6 bg-secondary/30 rounded-lg border border-primary/20">
                <div className="flex items-center justify-center gap-3">
                  <Loader2 className="h-5 w-5 animate-spin text-primary" />
                  <p className="text-sm font-medium text-foreground animate-pulse">
                    {statusMessage}
                  </p>
                </div>
                <Progress value={progress} className="h-2" />
                <p className="text-xs text-center text-muted-foreground">
                  {progress}% complete - This may take 30-60 seconds...
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
