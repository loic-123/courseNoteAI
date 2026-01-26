'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import { ApiKeyStorage } from '@/lib/storage/api-key-storage';
import { Upload, Loader2, X, Sparkles, FileText, Settings, ChevronDown, ChevronRight, CreditCard, Tag, Check, Key } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { calculatePrice, formatPrice, VisualModel } from '@/lib/pricing/config';

const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50MB for local dev (Vercel limit is 4.5MB)

function GeneratePageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [files, setFiles] = useState<File[]>([]);
  const [useOwnKey, setUseOwnKey] = useState(true); // true = use own key, false = use server key
  const [visualModel, setVisualModel] = useState<VisualModel>('ideogram'); // 'ideogram' or 'nano-banana'
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

  // Payment state (only for users without API key)
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [promoCode, setPromoCode] = useState('');
  const [promoValidating, setPromoValidating] = useState(false);
  const [promoResult, setPromoResult] = useState<{
    valid: boolean;
    discount: number;
    finalPrice: string;
    message: string;
  } | null>(null);
  const [isPaid, setIsPaid] = useState(false);
  const [checkingPayment, setCheckingPayment] = useState(false);

  // Load saved API key and form data
  useEffect(() => {
    const savedKey = ApiKeyStorage.get();
    if (savedKey) {
      setApiKey(savedKey);
      setUseOwnKey(true);
    }

    // Restore form data from sessionStorage (after Stripe redirect)
    const savedFormData = sessionStorage.getItem('generateFormData');
    if (savedFormData) {
      try {
        const data = JSON.parse(savedFormData);
        setCreatorName(data.creatorName || '');
        setTitle(data.title || '');
        setCourseCode(data.courseCode || '');
        setCourseName(data.courseName || '');
        setDetailLevel(data.detailLevel || 8);
        setUseMetaphors(data.useMetaphors ?? true);
        setTechnicalLevel(data.technicalLevel || 'intermediate');
        setLength(data.length || 'medium');
        setLanguage(data.language || 'en');
        setCustomPrompt(data.customPrompt || '');
        setVisualModel(data.visualModel || 'ideogram');
        setUseOwnKey(data.useOwnKey ?? false); // Restore their choice
      } catch (e) {
        console.error('Failed to restore form data:', e);
      }
    }
  }, []);

  // Check for successful payment on return from Stripe
  useEffect(() => {
    const sessionId = searchParams.get('session_id');
    const success = searchParams.get('success');

    if (success === 'true' && sessionId) {
      verifyPayment(sessionId);
    }
  }, [searchParams]);

  const verifyPayment = async (sessionId: string) => {
    setCheckingPayment(true);
    try {
      const response = await fetch('/api/verify-payment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionId }),
      });

      const data = await response.json();
      if (data.paid) {
        setIsPaid(true);
        // Clear saved form data and URL params
        sessionStorage.removeItem('generateFormData');
        router.replace('/generate');
      }
    } catch (error) {
      console.error('Payment verification error:', error);
    } finally {
      setCheckingPayment(false);
    }
  };

  // Calculate dynamic price
  const currentPrice = calculatePrice(visualModel, useOwnKey, length, detailLevel);

  // Save form data before going to Stripe
  const saveFormData = () => {
    const formData = {
      creatorName,
      title,
      courseCode,
      courseName,
      detailLevel,
      useMetaphors,
      technicalLevel,
      length,
      language,
      customPrompt,
      visualModel,
      useOwnKey,
    };
    sessionStorage.setItem('generateFormData', JSON.stringify(formData));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files);
      const validFiles = newFiles.filter(file => {
        if (file.size > MAX_FILE_SIZE) {
          alert(`${file.name} is too large (max 4MB). Please use a smaller file.`);
          return false;
        }
        return true;
      });
      setFiles(prev => [...prev, ...validFiles]);
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
      const validFiles = newFiles.filter(file => {
        if (file.size > MAX_FILE_SIZE) {
          alert(`${file.name} is too large (max 4MB). Please use a smaller file.`);
          return false;
        }
        return true;
      });
      setFiles(prev => [...prev, ...validFiles]);
    }
  };

  const removeFile = (index: number) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
  };

  const validatePromoCode = async () => {
    if (!promoCode.trim()) return;

    setPromoValidating(true);
    try {
      const response = await fetch('/api/validate-promo', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          promoCode: promoCode.trim(),
          basePrice: currentPrice,
        }),
      });

      const data = await response.json();
      setPromoResult(data);

      // If 100% discount, grant free access
      if (data.valid && data.discount === 100) {
        setIsPaid(true);
        setShowPaymentModal(false);
      }
    } catch (error) {
      console.error('Promo validation error:', error);
      setPromoResult({ valid: false, discount: 0, finalPrice: formatPrice(currentPrice), message: 'Error validating code' });
    } finally {
      setPromoValidating(false);
    }
  };

  const handleCheckout = async () => {
    try {
      // Save form data before redirecting to Stripe
      saveFormData();

      const response = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          promoCode: promoResult?.valid ? promoCode : undefined,
          returnUrl: window.location.origin + '/generate',
          priceInCents: currentPrice,
          visualModel,
          hasApiKey: useOwnKey,
        }),
      });

      const data = await response.json();

      if (data.freeAccess) {
        setIsPaid(true);
        setShowPaymentModal(false);
        sessionStorage.removeItem('generateFormData'); // No redirect needed
        return;
      }

      if (data.url) {
        window.location.href = data.url;
      }
    } catch (error) {
      console.error('Checkout error:', error);
      alert('Failed to start checkout');
    }
  };

  const handleGenerateClick = () => {
    // Check required fields (API key only required if using own key)
    if (files.length === 0 || !creatorName || !title || !courseCode || !courseName) {
      alert('Please fill in all required fields and upload at least one file');
      return;
    }

    if (useOwnKey && !apiKey) {
      alert('Please enter your Claude API key or switch to paid generation');
      return;
    }

    // Always require payment (price is lower with own API key)
    if (!isPaid) {
      setShowPaymentModal(true);
      return;
    }

    handleGenerate();
  };

  const handleGenerate = async () => {
    if (rememberKey && apiKey) {
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
      // Only send API key if user is using their own
      if (useOwnKey && apiKey) {
        formData.append('claudeApiKey', apiKey);
      }
      formData.append('useServerKey', (!useOwnKey).toString());
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
      formData.append('visualModel', visualModel);
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

  if (checkingPayment) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-flex items-center justify-center h-16 w-16 rounded-full bg-gradient-to-br from-blue-500/20 to-purple-500/20 border border-blue-500/30 mb-6">
            <Loader2 className="h-8 w-8 text-blue-400 animate-spin" />
          </div>
          <p className="text-slate-400">Verifying payment...</p>
        </div>
      </div>
    );
  }

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

        {/* Payment Status Banner - only show when using paid mode */}
        {!useOwnKey && isPaid && (
          <div className="mb-6 p-4 bg-green-500/10 border border-green-500/30 rounded-xl flex items-center gap-3">
            <div className="h-8 w-8 rounded-full bg-green-500/20 flex items-center justify-center">
              <Check className="h-4 w-4 text-green-400" />
            </div>
            <div>
              <p className="text-green-400 font-medium">Payment confirmed!</p>
              <p className="text-green-400/70 text-sm">
                {files.length === 0
                  ? 'Please re-upload your files to generate notes.'
                  : 'You can now generate your notes.'}
              </p>
            </div>
          </div>
        )}

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
                    PDF, DOCX, TXT, or images (max 4MB each)
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

            {/* Visual Model Selection */}
            <div className="space-y-4">
              <label className="block text-sm font-medium text-slate-300">Visual Quality</label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setVisualModel('ideogram')}
                  className={`p-4 rounded-xl border-2 text-left transition-all ${
                    visualModel === 'ideogram'
                      ? 'border-blue-500 bg-blue-500/10'
                      : 'border-slate-700 bg-slate-800/50 hover:border-slate-600'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className={`font-medium ${visualModel === 'ideogram' ? 'text-white' : 'text-slate-300'}`}>
                      Standard
                    </span>
                    <span className={`text-sm font-semibold ${visualModel === 'ideogram' ? 'text-blue-400' : 'text-slate-400'}`}>
                      {formatPrice(calculatePrice('ideogram', useOwnKey, length, detailLevel))}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500">Ideogram v3 - Good quality visuals</p>
                </button>

                <button
                  type="button"
                  onClick={() => setVisualModel('nano-banana')}
                  className={`p-4 rounded-xl border-2 text-left transition-all ${
                    visualModel === 'nano-banana'
                      ? 'border-purple-500 bg-purple-500/10'
                      : 'border-slate-700 bg-slate-800/50 hover:border-slate-600'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className={`font-medium ${visualModel === 'nano-banana' ? 'text-white' : 'text-slate-300'}`}>
                      Premium
                    </span>
                    <span className={`text-sm font-semibold ${visualModel === 'nano-banana' ? 'text-purple-400' : 'text-slate-400'}`}>
                      {formatPrice(calculatePrice('nano-banana', useOwnKey, length, detailLevel))}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500">Nano Banana Pro - Perfect text rendering</p>
                </button>
              </div>
            </div>

            {/* API Key Option */}
            <div className="space-y-4">
              <label className="block text-sm font-medium text-slate-300">API Key</label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setUseOwnKey(true)}
                  className={`p-4 rounded-xl border-2 text-left transition-all ${
                    useOwnKey
                      ? 'border-green-500 bg-green-500/10'
                      : 'border-slate-700 bg-slate-800/50 hover:border-slate-600'
                  }`}
                >
                  <div className="flex items-center gap-3 mb-2">
                    <div className={`h-8 w-8 rounded-lg flex items-center justify-center ${
                      useOwnKey ? 'bg-green-500/20' : 'bg-slate-700'
                    }`}>
                      <Key className={`h-4 w-4 ${useOwnKey ? 'text-green-400' : 'text-slate-400'}`} />
                    </div>
                    <span className={`font-medium ${useOwnKey ? 'text-white' : 'text-slate-300'}`}>
                      I have my own Claude API key
                    </span>
                  </div>
                  <p className="text-xs text-slate-500">Lower price - you pay Anthropic for AI separately</p>
                </button>

                <button
                  type="button"
                  onClick={() => setUseOwnKey(false)}
                  className={`p-4 rounded-xl border-2 text-left transition-all ${
                    !useOwnKey
                      ? 'border-orange-500 bg-orange-500/10'
                      : 'border-slate-700 bg-slate-800/50 hover:border-slate-600'
                  }`}
                >
                  <div className="flex items-center gap-3 mb-2">
                    <div className={`h-8 w-8 rounded-lg flex items-center justify-center ${
                      !useOwnKey ? 'bg-orange-500/20' : 'bg-slate-700'
                    }`}>
                      <CreditCard className={`h-4 w-4 ${!useOwnKey ? 'text-orange-400' : 'text-slate-400'}`} />
                    </div>
                    <span className={`font-medium ${!useOwnKey ? 'text-white' : 'text-slate-300'}`}>
                      No API key
                    </span>
                  </div>
                  <p className="text-xs text-slate-500">Higher price - AI usage included</p>
                </button>
              </div>

              {/* API Key Input - only show if using own key */}
              {useOwnKey && (
                <div className="space-y-2">
                  <Input
                    type="password"
                    value={apiKey}
                    onChange={(e) => setApiKey(e.target.value)}
                    placeholder="sk-ant-..."
                    className="bg-slate-800 border-slate-700 text-white placeholder:text-slate-500 focus:border-blue-500"
                  />
                  <div className="flex items-center">
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
                  <p className="text-xs text-slate-500">
                    Get your API key from{' '}
                    <a
                      href="https://console.anthropic.com/settings/keys"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-400 hover:underline"
                    >
                      console.anthropic.com
                    </a>
                  </p>
                </div>
              )}

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

            {/* Dynamic Price Display - shown at bottom after all customization */}
            <div className="p-4 bg-gradient-to-r from-blue-500/10 to-purple-500/10 rounded-xl border border-blue-500/30">
              <div className="flex items-center justify-between">
                <span className="text-slate-300">Total Price:</span>
                <span className="text-2xl font-bold text-white">{formatPrice(currentPrice)}</span>
              </div>
              <p className="text-xs text-slate-500 mt-2">
                Based on: {visualModel === 'nano-banana' ? 'Premium visual' : 'Standard visual'} • {length} length • {detailLevel}/10 detail
                {useOwnKey ? ' • Using your API key' : ''}
              </p>
            </div>

            {/* Generate Button */}
            <Button
              onClick={handleGenerateClick}
              disabled={isGenerating}
              className="w-full py-6 text-lg bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 border-0"
              size="lg"
            >
              {isGenerating ? (
                <span className="flex items-center">
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Generating...
                </span>
              ) : isPaid ? (
                <span className="flex items-center">
                  <Sparkles className="mr-2 h-5 w-5" />
                  Generate Notes
                </span>
              ) : (
                <span className="flex items-center">
                  <CreditCard className="mr-2 h-5 w-5" />
                  Continue to Payment ({formatPrice(currentPrice)})
                </span>
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

      {/* Payment Modal */}
      <Dialog open={showPaymentModal} onOpenChange={setShowPaymentModal}>
        <DialogContent className="bg-slate-900 border-slate-800 text-white max-w-md p-6 sm:p-8">
          <DialogHeader className="space-y-3">
            <DialogTitle className="flex items-center gap-2 text-xl">
              <CreditCard className="h-5 w-5 text-blue-400" />
              Complete Your Purchase
            </DialogTitle>
            <DialogDescription className="text-slate-400">
              Pay once to generate comprehensive notes, quizzes, and visual summaries.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6 pt-4">
            {/* Price Display */}
            <div className="p-4 bg-slate-800/50 rounded-xl border border-slate-700">
              <div className="flex justify-between items-center">
                <span className="text-slate-300">Note Generation</span>
                <div className="text-right">
                  {promoResult?.valid && promoResult.discount > 0 ? (
                    <>
                      <span className="text-slate-500 line-through text-sm mr-2">{formatPrice(currentPrice)}</span>
                      <span className="text-2xl font-bold text-white">{formatPrice(Math.round(currentPrice * (1 - promoResult.discount / 100)))}</span>
                    </>
                  ) : (
                    <span className="text-2xl font-bold text-white">{formatPrice(currentPrice)}</span>
                  )}
                </div>
              </div>
              {promoResult?.valid && (
                <div className="mt-2 text-sm text-green-400">
                  {promoResult.message}
                </div>
              )}
            </div>

            {/* Promo Code */}
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                <Tag className="h-4 w-4 inline mr-1" />
                Promo Code
              </label>
              <div className="flex gap-2">
                <Input
                  value={promoCode}
                  onChange={(e) => {
                    setPromoCode(e.target.value.toUpperCase());
                    setPromoResult(null);
                  }}
                  placeholder="Enter promo code"
                  className="flex-1 bg-slate-800 border-slate-700 text-white placeholder:text-slate-500"
                />
                <Button
                  onClick={validatePromoCode}
                  disabled={promoValidating || !promoCode.trim()}
                  variant="outline"
                  className="bg-slate-800 border-slate-700 text-white hover:bg-slate-700"
                >
                  {promoValidating ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Apply'}
                </Button>
              </div>
              {promoResult && !promoResult.valid && (
                <p className="mt-2 text-sm text-red-400">{promoResult.message}</p>
              )}
            </div>

            {/* What's Included */}
            <div className="space-y-2">
              <p className="text-sm font-medium text-slate-300">What&apos;s included:</p>
              <ul className="space-y-2 text-sm text-slate-400">
                <li className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-green-400" />
                  Comprehensive course notes in Markdown
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-green-400" />
                  Interactive quiz with explanations
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-green-400" />
                  AI-generated visual summary
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-green-400" />
                  Downloadable PDF export
                </li>
              </ul>
            </div>

            {/* Checkout Button */}
            <Button
              onClick={handleCheckout}
              className="w-full py-5 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 border-0"
            >
              <CreditCard className="mr-2 h-5 w-5" />
              {promoResult?.valid && promoResult.discount === 100
                ? 'Get Free Access'
                : `Pay ${promoResult?.valid ? formatPrice(Math.round(currentPrice * (1 - promoResult.discount / 100))) : formatPrice(currentPrice)}`}
            </Button>

            <p className="text-xs text-center text-slate-500">
              Secure payment powered by Stripe
            </p>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default function GeneratePage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-flex items-center justify-center h-16 w-16 rounded-full bg-gradient-to-br from-blue-500/20 to-purple-500/20 border border-blue-500/30 mb-6">
            <Loader2 className="h-8 w-8 text-blue-400 animate-spin" />
          </div>
          <p className="text-slate-400">Loading...</p>
        </div>
      </div>
    }>
      <GeneratePageContent />
    </Suspense>
  );
}
