export interface ExtractionData {
  mrsl_class_code: string | null;
  insured: string | null;
  form_received_date: string | null;
  inception_date: string | null;
  renewal_date: string | null;
  total_due: string | null;
  policy_fee: string | null;
}

export interface WebhookPayload extends ExtractionData {
  source_filename: string;
  extracted_at: string;
}

export interface MRSLClassCode {
  code: string;
  description: string;
}
