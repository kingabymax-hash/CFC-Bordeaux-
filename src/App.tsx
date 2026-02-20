/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from "react";
import { FileUploader } from "./components/FileUploader";
import { ExtractionForm } from "./components/ExtractionForm";
import { ExtractionData, WebhookPayload } from "./types";
import { extractDataFromPDF } from "./services/gemini";
import { WEBHOOK_URL } from "./constants";
import { Toaster, toast } from "react-hot-toast";
import { ShieldCheck, FileSearch } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

export default function App() {
  const [file, setFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [extractedData, setExtractedData] = useState<ExtractionData | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleFileSelect = async (selectedFile: File) => {
    setFile(selectedFile);
    setIsProcessing(true);
    setExtractedData(null);

    try {
      // Convert file to base64
      const reader = new FileReader();
      const base64Promise = new Promise<string>((resolve, reject) => {
        reader.onload = () => {
          const result = reader.result as string;
          const base64 = result.split(",")[1];
          resolve(base64);
        };
        reader.onerror = reject;
      });
      reader.readAsDataURL(selectedFile);
      
      const base64 = await base64Promise;
      const data = await extractDataFromPDF(base64);
      setExtractedData(data);
      toast.success("Data extracted successfully!");
    } catch (error) {
      console.error("Extraction error:", error);
      toast.error(error instanceof Error ? error.message : "Failed to extract data from PDF");
      setFile(null);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleClear = () => {
    setFile(null);
    setExtractedData(null);
    setIsProcessing(false);
  };

  const handleSubmit = async () => {
    if (!extractedData || !file) return;

    setIsSubmitting(true);
    try {
      const payload: WebhookPayload = {
        ...extractedData,
        source_filename: file.name,
        extracted_at: new Date().toISOString(),
      };

      const response = await fetch(WEBHOOK_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error("Webhook submission failed");
      }

      toast.success("Data submitted successfully.");
      // Optional: Reset form after success
      // handleClear();
    } catch (error) {
      console.error("Submission error:", error);
      toast.error("Submission failed. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-900 font-sans selection:bg-emerald-100 selection:text-emerald-900">
      <Toaster position="top-right" />
      
      <main className="max-w-3xl mx-auto px-6 py-12 md:py-20">
        <header className="text-center mb-12">
          <motion.div 
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="inline-flex items-center justify-center p-3 bg-emerald-600 text-white rounded-2xl mb-6 shadow-xl shadow-emerald-600/20"
          >
            <ShieldCheck size={32} />
          </motion.div>
          <motion.h1 
            initial={{ y: 10, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.1 }}
            className="text-3xl md:text-4xl font-bold tracking-tight text-slate-900 mb-3"
          >
            MRSL Insurance Document Processor
          </motion.h1>
          <motion.p 
            initial={{ y: 10, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="text-slate-500 text-lg max-w-lg mx-auto"
          >
            Upload your insurance documents for instant AI-powered data extraction and review.
          </motion.p>
        </header>

        <section className="bg-white rounded-[2rem] shadow-sm border border-slate-100 p-8 md:p-10">
          <div className="space-y-10">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full" />
                <h2 className="text-sm font-bold text-slate-400 uppercase tracking-widest">
                  1. Upload Document
                </h2>
              </div>
              <FileUploader
                onFileSelect={handleFileSelect}
                isProcessing={isProcessing}
                selectedFile={file}
                onClear={handleClear}
              />
            </div>

            <AnimatePresence mode="wait">
              {extractedData && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.4, ease: "easeOut" }}
                >
                  <div className="flex items-center gap-2 mb-6">
                    <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full" />
                    <h2 className="text-sm font-bold text-slate-400 uppercase tracking-widest">
                      2. Review & Edit Data
                    </h2>
                  </div>
                  <ExtractionForm
                    data={extractedData}
                    onChange={setExtractedData}
                    onSubmit={handleSubmit}
                    isSubmitting={isSubmitting}
                  />
                </motion.div>
              )}

              {!extractedData && !isProcessing && !file && (
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="py-12 flex flex-col items-center justify-center text-slate-300 border-2 border-dashed border-slate-100 rounded-3xl"
                >
                  <FileSearch size={48} strokeWidth={1.5} />
                  <p className="mt-4 text-sm font-medium">No document processed yet</p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </section>

        <footer className="mt-12 text-center">
          <p className="text-slate-400 text-sm">
            Powered by Gemini 3.1 Pro • Secure Data Processing
          </p>
        </footer>
      </main>
    </div>
  );
}
