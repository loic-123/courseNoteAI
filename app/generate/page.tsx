'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import { ApiKeyStorage } from '@/lib/storage/api-key-storage';
import { Upload, Loader2, X, Sparkles, FileText, Settings, ChevronDown, ChevronRight } from 'lucide-react';

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

  useEffect(() => {
    const savedKey = ApiKeyStorage.get();
    if (savedKey) setApiKey(savedKey);
  }, []);

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
      files.forEach(file => {
        formData.append('file', file);
      });
      formData.append('claudeApiKey', apiKey);
      formData.append('institutionId', '00000000-0000-0000-0000-000000000001');
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
    <div className="min-h-screen bg-slate-950">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-sm font-medium mb-6">
            <Sparkles className="h-4 w-4" />
            AI-Powered Generation
          </div>
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            Generate{' '}
            <span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
              Course Notes
            </span>
          </h1>
          <p className="text-slate-400 text-lg max-w-2xl mx-auto">
            Upload your course materials and get comprehensive notes, quizzes, and visual sheets.
          </p>
        </div>

        <Card className="bg-slate-900/50 border-slate-800">
          <CardHeader className="border-b border-slate-800">
            <CardTitle className="flex items-center gap-2 text-white">
              <Upload className="h-5 w-5 text-blue-400" />
              Upload & Configure
            </CardTitle>
            <CardDescription className="text-slate-400">
              Fill in the details below to generate your study materials
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6 pt-6">
            {/* File Upload */}
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Upload Files *</label>
              <div
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                className={`border-2 border-dashed rounded-xl p-8 text-center transition-all cursor-pointer ${
                  isDragging
                    ? 'border-blue-500 bg-blue-500/10'
                    : 'border-slate-700 hover:border-slate-600 hover:bg-slate-800/50'
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
                  <div className="h-12 w-12 rounded-full bg-gradient-to-br from-blue-500/20 to-purple-500/20 border border-blue-500/30 flex items-center justify-center mx-auto mb-4">
                    <Upload className="h-6 w-6 text-blue-400" />
                  </div>
                  <p className="text-slate-300 font-medium">
                    {isDragging ? 'Drop files here...' : 'Click to upload or drag & drop'}
                  </p>
                  <p className="text-sm text-slate-500 mt-1">
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
                      className="flex items-center justify-between p-3 bg-slate-800/50 rounded-lg border border-slate-700"
                    >
                      <div className="flex items-center gap-3 flex-1 min-w-0">
                        <div className="h-8 w-8 rounded-lg bg-blue-500/10 border border-blue-500/20 flex items-center justify-center flex-shrink-0">
                          <FileText className="h-4 w-4 text-blue-400" />
                        </div>
                        <span className="text-sm text-slate-300 truncate">{file.name}</span>
                        <span className="text-xs text-slate-500 flex-shrink-0">
                          ({(file.size / 1024 / 1024).toFixed(2)} MB)
                        </span>
                      </div>
                      <button
                        onClick={() => removeFile(index)}
                        className="ml-2 text-slate-500 hover:text-red-400 transition-colors flex-shrink-0"
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
              <label className="block text-sm font-medium text-slate-300 mb-2">Claude API Key *</label>
              <Input
                type="password"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                placeholder="sk-ant-..."
                className="bg-slate-800 border-slate-700 text-white placeholder:text-slate-500 focus:border-blue-500"
              />
              <div className="flex items-center mt-2">
                <input
                  type="checkbox"
                  id="remember-key"
                  checked={rememberKey}
                  onChange={(e) => setRememberKey(e.target.checked)}
                  className="mr-2 rounded border-slate-600 bg-slate-800 text-blue-500 focus:ring-blue-500"
                />
                <label htmlFor="remember-key" className="text-sm text-slate-400">
                  Remember my key
                </label>
              </div>
            </div>

            {/* Creator Name */}
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Your Name *</label>
              <Input
                value={creatorName}
                onChange={(e) => setCreatorName(e.target.value)}
                placeholder="e.g., John Doe"
                className="bg-slate-800 border-slate-700 text-white placeholder:text-slate-500 focus:border-blue-500"
              />
            </div>

            {/* Title */}
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Note Title *</label>
              <Input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g., Lecture 1: Introduction to Machine Learning"
                className="bg-slate-800 border-slate-700 text-white placeholder:text-slate-500 focus:border-blue-500"
              />
            </div>

            {/* Course Code & Name */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Course Code *</label>
                <Input
                  value={courseCode}
                  onChange={(e) => setCourseCode(e.target.value)}
                  placeholder="e.g., ELEC70122"
                  className="bg-slate-800 border-slate-700 text-white placeholder:text-slate-500 focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Course Name *</label>
                <Input
                  value={courseName}
                  onChange={(e) => setCourseName(e.target.value)}
                  placeholder="e.g., Machine Learning"
                  className="bg-slate-800 border-slate-700 text-white placeholder:text-slate-500 focus:border-blue-500"
                />
              </div>
            </div>

            {/* Detail Level */}
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Detail Level: <span className="text-blue-400">{detailLevel}/10</span>
              </label>
              <input
                type="range"
                min="1"
                max="10"
                value={detailLevel}
                onChange={(e) => setDetailLevel(parseInt(e.target.value))}
                className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-blue-500"
              />
              <div className="flex justify-between text-xs text-slate-500 mt-1">
                <span>Concise</span>
                <span>Detailed</span>
              </div>
            </div>

            {/* Technical Level */}
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Technical Level</label>
              <div className="grid grid-cols-3 gap-2">
                {(['beginner', 'intermediate', 'advanced'] as const).map((level) => (
                  <button
                    key={level}
                    type="button"
                    onClick={() => setTechnicalLevel(level)}
                    className={`py-2 px-4 rounded-lg text-sm font-medium transition-all ${
                      technicalLevel === level
                        ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white'
                        : 'bg-slate-800 text-slate-400 border border-slate-700 hover:border-slate-600'
                    }`}
                  >
                    {level.charAt(0).toUpperCase() + level.slice(1)}
                  </button>
                ))}
              </div>
            </div>

            {/* Length */}
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Length</label>
              <div className="grid grid-cols-3 gap-2">
                {(['short', 'medium', 'long'] as const).map((len) => (
                  <button
                    key={len}
                    type="button"
                    onClick={() => setLength(len)}
                    className={`py-2 px-4 rounded-lg text-sm font-medium transition-all ${
                      length === len
                        ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white'
                        : 'bg-slate-800 text-slate-400 border border-slate-700 hover:border-slate-600'
                    }`}
                  >
                    {len.charAt(0).toUpperCase() + len.slice(1)}
                  </button>
                ))}
              </div>
            </div>

            {/* Language */}
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Language</label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setLanguage('en')}
                  className={`py-2 px-4 rounded-lg text-sm font-medium transition-all ${
                    language === 'en'
                      ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white'
                      : 'bg-slate-800 text-slate-400 border border-slate-700 hover:border-slate-600'
                  }`}
                >
                  English
                </button>
                <button
                  type="button"
                  onClick={() => setLanguage('fr')}
                  className={`py-2 px-4 rounded-lg text-sm font-medium transition-all ${
                    language === 'fr'
                      ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white'
                      : 'bg-slate-800 text-slate-400 border border-slate-700 hover:border-slate-600'
                  }`}
                >
                  French
                </button>
              </div>
            </div>

            {/* Use Metaphors */}
            <div className="flex items-center p-4 bg-slate-800/50 rounded-lg border border-slate-700">
              <input
                type="checkbox"
                id="use-metaphors"
                checked={useMetaphors}
                onChange={(e) => setUseMetaphors(e.target.checked)}
                className="mr-3 rounded border-slate-600 bg-slate-800 text-blue-500 focus:ring-blue-500"
              />
              <label htmlFor="use-metaphors" className="text-sm text-slate-300">
                Use creative metaphors and analogies to explain concepts
              </label>
            </div>

            {/* Advanced Options Toggle */}
            <button
              type="button"
              onClick={() => setShowAdvanced(!showAdvanced)}
              className="flex items-center gap-2 text-sm text-blue-400 hover:text-blue-300 transition-colors"
            >
              <Settings className="h-4 w-4" />
              Advanced Options
              {showAdvanced ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
            </button>

            {/* Custom Prompt (Advanced) */}
            {showAdvanced && (
              <div className="p-5 bg-slate-800/50 rounded-xl border border-slate-700">
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Custom Instructions (Optional)
                </label>
                <textarea
                  value={customPrompt}
                  onChange={(e) => setCustomPrompt(e.target.value)}
                  placeholder="Add specific instructions for generating your notes...&#10;&#10;Examples:&#10;- Focus on practical examples&#10;- Include more diagrams descriptions&#10;- Emphasize mathematical proofs&#10;- Add comparison tables"
                  className="w-full h-32 p-4 bg-slate-900 border border-slate-700 rounded-lg text-sm text-white placeholder:text-slate-500 resize-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                />
                <p className="text-xs text-slate-500 mt-2">
                  These instructions will guide how Claude generates your notes, quiz, and visual summary.
                </p>
              </div>
            )}

            {/* Generate Button */}
            <Button
              onClick={handleGenerate}
              disabled={isGenerating}
              className="w-full py-6 text-lg bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 border-0"
              size="lg"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Sparkles className="mr-2 h-5 w-5" />
                  Generate Notes
                </>
              )}
            </Button>

            {/* Progress */}
            {isGenerating && (
              <div className="space-y-4 p-6 bg-gradient-to-br from-blue-500/10 to-purple-500/10 rounded-xl border border-blue-500/20">
                <div className="flex items-center justify-center gap-3">
                  <Loader2 className="h-5 w-5 animate-spin text-blue-400" />
                  <p className="text-sm font-medium text-white animate-pulse">
                    {statusMessage}
                  </p>
                </div>
                <Progress value={progress} className="h-2 bg-slate-800" />
                <p className="text-xs text-center text-slate-400">
                  {progress}% complete
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
