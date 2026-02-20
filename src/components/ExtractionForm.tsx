import React from "react";
import { ExtractionData } from "../types";
import { MRSL_CLASS_CODES } from "../constants";
import { Send, AlertCircle } from "lucide-react";

interface ExtractionFormProps {
  data: ExtractionData;
  onChange: (data: ExtractionData) => void;
  onSubmit: () => void;
  isSubmitting: boolean;
}

export const ExtractionForm: React.FC<ExtractionFormProps> = ({
  data,
  onChange,
  onSubmit,
  isSubmitting,
}) => {
  const handleChange = (field: keyof ExtractionData, value: string) => {
    onChange({ ...data, [field]: value });
  };

  const inputClasses = "w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all outline-none text-slate-900 placeholder:text-slate-400";
  const labelClasses = "block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5 ml-1";

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* MRSL Class Code */}
        <div className="md:col-span-2">
          <label className={labelClasses}>MRSL Class Code</label>
          <select
            value={data.mrsl_class_code || ""}
            onChange={(e) => handleChange("mrsl_class_code", e.target.value)}
            className={inputClasses}
          >
            <option value="">Select a class code...</option>
            {MRSL_CLASS_CODES.map((item) => (
              <option key={item.code} value={item.code}>
                {item.code} - {item.description}
              </option>
            ))}
          </select>
        </div>

        {/* Insured */}
        <div className="md:col-span-2">
          <label className={labelClasses}>Insured</label>
          <input
            type="text"
            value={data.insured || ""}
            onChange={(e) => handleChange("insured", e.target.value)}
            placeholder="Enter insured name"
            className={inputClasses}
          />
        </div>

        {/* Dates */}
        <div>
          <label className={labelClasses}>Form Received Date</label>
          <input
            type="text"
            value={data.form_received_date || ""}
            onChange={(e) => handleChange("form_received_date", e.target.value)}
            placeholder="DD/MM/YYYY"
            className={inputClasses}
          />
        </div>

        <div>
          <label className={labelClasses}>Inception Date</label>
          <input
            type="text"
            value={data.inception_date || ""}
            onChange={(e) => handleChange("inception_date", e.target.value)}
            placeholder="DD/MM/YYYY"
            className={inputClasses}
          />
        </div>

        <div>
          <label className={labelClasses}>Renewal Date</label>
          <input
            type="text"
            value={data.renewal_date || ""}
            onChange={(e) => handleChange("renewal_date", e.target.value)}
            placeholder="DD/MM/YYYY"
            className={inputClasses}
          />
        </div>

        {/* Financials */}
        <div>
          <label className={labelClasses}>Total Due</label>
          <input
            type="text"
            value={data.total_due || ""}
            onChange={(e) => handleChange("total_due", e.target.value)}
            placeholder="0.00"
            className={inputClasses}
          />
        </div>

        <div>
          <label className={labelClasses}>Policy Fee</label>
          <input
            type="text"
            value={data.policy_fee || ""}
            onChange={(e) => handleChange("policy_fee", e.target.value)}
            placeholder="0.00"
            className={inputClasses}
          />
        </div>
      </div>

      <div className="pt-4 border-t border-slate-100">
        <button
          onClick={onSubmit}
          disabled={isSubmitting}
          className="w-full flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-300 text-white font-semibold py-3.5 rounded-2xl transition-all shadow-lg shadow-emerald-600/20 active:scale-[0.98]"
        >
          {isSubmitting ? (
            <div className="flex items-center gap-2">
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              <span>Submitting...</span>
            </div>
          ) : (
            <>
              <Send size={20} />
              <span>Submit to Webhook</span>
            </>
          )}
        </button>
        <p className="mt-4 text-center text-xs text-slate-400 flex items-center justify-center gap-1.5">
          <AlertCircle size={14} />
          Please review all fields before submitting.
        </p>
      </div>
    </div>
  );
};
