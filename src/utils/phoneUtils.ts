/**
 * Phone Number & WhatsApp Utility for CorporateAcademy CRM
 * Handles normalization, validation, click-to-dial (tel:), and WhatsApp click-to-chat links.
 */

export interface NormalizedPhone {
  raw: string;
  display: string;
  e164: string; // E.g. "+919876511001"
  waDigits: string; // E.g. "919876511001" (digits only, no +)
  isValid: boolean;
  countryCode: string;
  nationalNumber: string;
}

/**
 * Normalizes phone numbers with robust Indian mobile support (+91 default).
 * Removes spaces, dashes, brackets, but preserves display formatting.
 */
export function normalizePhoneNumber(rawNumber?: string): NormalizedPhone {
  if (!rawNumber || typeof rawNumber !== 'string') {
    return {
      raw: '',
      display: '—',
      e164: '',
      waDigits: '',
      isValid: false,
      countryCode: '',
      nationalNumber: '',
    };
  }

  const trimmed = rawNumber.trim();
  // Strip non-digit characters except leading plus
  const hasLeadingPlus = trimmed.startsWith('+');
  const digitsOnly = trimmed.replace(/\D/g, '');

  if (digitsOnly.length < 10) {
    return {
      raw: trimmed,
      display: trimmed,
      e164: hasLeadingPlus ? `+${digitsOnly}` : digitsOnly,
      waDigits: digitsOnly,
      isValid: false,
      countryCode: '',
      nationalNumber: digitsOnly,
    };
  }

  let countryCode = '91';
  let nationalNumber = '';

  if (digitsOnly.startsWith('91') && digitsOnly.length === 12) {
    countryCode = '91';
    nationalNumber = digitsOnly.slice(2);
  } else if (digitsOnly.startsWith('0') && digitsOnly.length === 11) {
    countryCode = '91';
    nationalNumber = digitsOnly.slice(1);
  } else if (digitsOnly.length === 10) {
    countryCode = '91';
    nationalNumber = digitsOnly;
  } else if (hasLeadingPlus && digitsOnly.length > 10) {
    // Other country code
    nationalNumber = digitsOnly.slice(-10);
    countryCode = digitsOnly.slice(0, -10);
  } else {
    // Fallback: assume last 10 are Indian national digits
    nationalNumber = digitsOnly.slice(-10);
    countryCode = '91';
  }

  const e164 = `+${countryCode}${nationalNumber}`;
  const waDigits = `${countryCode}${nationalNumber}`;

  // Formatted display: +91 98765 11001
  const display = `+${countryCode} ${nationalNumber.slice(0, 5)} ${nationalNumber.slice(5)}`;

  return {
    raw: trimmed,
    display,
    e164,
    waDigits,
    isValid: nationalNumber.length === 10,
    countryCode,
    nationalNumber,
  };
}

/**
 * Builds standard tel: URI for one-tap calling
 */
export function getTelUri(rawNumber: string): string {
  const norm = normalizePhoneNumber(rawNumber);
  return norm.e164 ? `tel:${norm.e164}` : `tel:${rawNumber.replace(/\s+/g, '')}`;
}

/**
 * Generates prefilled WhatsApp message template
 */
export function generateWhatsAppMessage(
  template: string,
  candidateName: string,
  courseName?: string,
  counselorName?: string
): string {
  const cleanName = candidateName ? candidateName.split(' ')[0] : 'there';
  const cleanCourse = courseName || 'Professional Certification';
  const cleanCounselor = counselorName || 'CorporateAcademy';

  return template
    .replace(/{name}/g, cleanName)
    .replace(/{fullName}/g, candidateName)
    .replace(/{course}/g, cleanCourse)
    .replace(/{counselor}/g, cleanCounselor);
}

/**
 * Default templates for WhatsApp outreach
 */
export const DEFAULT_WHATSAPP_TEMPLATES = [
  {
    id: 'intro',
    title: 'Initial Welcome & Inquiry Follow-up',
    text: 'Hello {name}, this is {counselor} from CorporateAcademy regarding your interest in the {course} program. Let me know a convenient time to connect for a quick 5-min counseling call.',
  },
  {
    id: 'demo_invite',
    title: 'Live Demo & Webinar Slot',
    text: 'Hi {name}! We have scheduled a live interactive demo for {course}. Please let me know if today afternoon or tomorrow morning works better for you to join.',
  },
  {
    id: 'syllabus_share',
    title: 'Curriculum & Placement Stats',
    text: 'Hello {name}, sharing the comprehensive syllabus and placement report for {course} from CorporateAcademy. Feel free to review and let me know your thoughts!',
  },
  {
    id: 'callback_reminder',
    title: 'Callback Follow-up',
    text: 'Hi {name}, following up as discussed earlier regarding your admission to {course}. Are you available for a brief discussion today?',
  },
];

/**
 * Generates official WhatsApp click-to-chat link
 * Format: https://wa.me/919876543210?text=...
 */
export function getWhatsAppUrl(
  rawNumber: string,
  message?: string,
  isWeb: boolean = false
): string {
  const norm = normalizePhoneNumber(rawNumber);
  if (!norm.waDigits) return '';

  const encodedText = message ? encodeURIComponent(message) : '';

  if (isWeb) {
    return `https://web.whatsapp.com/send?phone=${norm.waDigits}${encodedText ? `&text=${encodedText}` : ''}`;
  }

  return `https://wa.me/${norm.waDigits}${encodedText ? `?text=${encodedText}` : ''}`;
}
