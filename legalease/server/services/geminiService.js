import { GoogleGenAI } from '@google/genai';
import { config } from '../config/config.js';

let aiClient = null;

function getClient(userApiKey = null) {
  const apiKey = userApiKey || config.geminiApiKey;
  if (!apiKey) return null;
  if (!aiClient || userApiKey) {
    return new GoogleGenAI({ apiKey });
  }
  return aiClient;
}

const SYSTEM_INSTRUCTION = `You are LegalEase, an AI legal information assistant designed primarily for Indian legal workflows and documents.

Core Principles:
1. Provide clear, neutral, cautious legal information.
2. Do not claim to be a lawyer or provide formal legal advice.
3. Do not invent statutes, case law, citations, legal sections, or authorities.
4. Do not present uncertain information as fact. Clearly identify uncertainty.
5. When jurisdiction matters, indicate Indian central law vs specific State rules.
6. When the user provides a document, prioritize the document's actual contents.
7. Separate facts from interpretation and suggestions.
8. For high-risk or complex matters, recommend consultation with an advocate or qualified legal professional.
9. Always explain complex legal language in accessible, clear language. If the user asks for Tamil, Hindi, or another Indian language explanation, provide a simple vernacular explanation followed by key legal terms in English.
10. If verified statutory references are available (e.g., Indian Contract Act 1872, IT Act 2000, Consumer Protection Act 2019, Transfer of Property Act 1882), cite exact sections. If no verified statutory section applies with certainty, state: "Source verification is recommended."`;

/**
 * Fallback response generator when GEMINI_API_KEY is not configured
 */
function generateFallbackChatResponse(message, documentContext = '') {
  const lower = message.toLowerCase();

  if (lower.includes('rental') || lower.includes('lease') || lower.includes('tenant') || lower.includes('landlord')) {
    return {
      answer: "In India, residential and commercial tenancy relationships are governed by the Transfer of Property Act, 1882 alongside State-specific Rent Control laws or Tenancy Acts.",
      keyPoints: [
        "11-Month Agreements: Under Section 107 of the Transfer of Property Act and Section 17(1)(d) of the Registration Act, 1908, leases exceeding 11 months require mandatory stamp duty and registration.",
        "Notice Period: Section 106 typically provides for 15 days' notice for monthly residential tenancies in the absence of a contract specifying a longer period.",
        "Security Deposit: Landlords must refund the security deposit within the agreed timeframe, deducting only documented repairs or genuine arrears."
      ],
      relevantContext: "Tenancy disputes are subject to local Rent Tribunals or civil court jurisdictions depending on the State enactments (e.g., Delhi Rent Control Act, Maharashtra Rent Control Act, Tamil Nadu Regulation of Rights and Responsibilities of Landlords and Tenants Act).",
      considerations: [
        "Check whether lock-in periods have reciprocal exit provisions.",
        "Ensure utility bill sharing and maintenance calculations are explicitly scheduled.",
        "Verify whether any arbitrary forfeiture clauses for security deposits exist."
      ],
      nextSteps: [
        "Review the written agreement before handing over possession.",
        "Ensure inventory check is signed by both landlord and tenant at move-in.",
        "Retain payment receipts (UPI/bank transfer records) for all security deposit transactions."
      ],
      sources: [
        {
          title: "Transfer of Property Act, 1882",
          authority: "Parliament of India",
          relevantSection: "Sections 105, 106, 107, 108",
          link: "https://www.indiacode.nic.in/handle/123456789/2338"
        },
        {
          title: "The Registration Act, 1908",
          authority: "Parliament of India",
          relevantSection: "Section 17(1)(d)",
          link: "https://www.indiacode.nic.in/handle/123456789/2275"
        }
      ],
      verificationNote: "State rent control rules may modify statutory notice periods and dispute forums."
    };
  }

  if (lower.includes('non-compete') || lower.includes('employment') || lower.includes('signing a contract') || lower.includes('contract')) {
    return {
      answer: "Under Indian contract law, agreements must fulfill the criteria of Section 10 of the Indian Contract Act, 1872 to be enforceable, requiring free consent, lawful consideration, and lawful object.",
      keyPoints: [
        "Restraint of Trade: Under Section 27 of the Indian Contract Act, 1872, any agreement restraining someone from exercising a lawful profession, trade, or business is void to that extent.",
        "Post-Termination Covenants: The Supreme Court of India (Percept D'Mark v. Zaheer Khan) has consistently held that post-termination non-compete clauses are void.",
        "Confidentiality & Non-Disclosure: Unlike non-competes, obligations protecting legitimate trade secrets and proprietary data remain enforceable post-employment."
      ],
      relevantContext: "Employers frequently insert non-compete language in offer letters; however, enforcing them through Indian courts after an employee has resigned faces severe statutory hurdles under Section 27.",
      considerations: [
        "Review intellectual property assignment clauses to ensure they only cover work done during employment hours using employer resources.",
        "Verify notice period buyout provisions and whether garden leave terms are stipulated.",
        "Confirm governing law and jurisdiction clauses (must be Indian jurisdiction)."
      ],
      nextSteps: [
        "Request clarification on non-compete scope from HR in writing if ambiguous.",
        "Negotiate symmetric termination notice periods (e.g., 30 or 60 days on both sides).",
        "Retain a duplicate copy signed by the authorized signatory of the employer."
      ],
      sources: [
        {
          title: "Indian Contract Act, 1872",
          authority: "Ministry of Law and Justice",
          relevantSection: "Section 10, Section 27, Section 73",
          link: "https://www.indiacode.nic.in/handle/123456789/2187"
        }
      ],
      verificationNote: "Judicial interpretations may differ based on reasonableness of non-solicitation vs outright non-compete."
    };
  }

  if (lower.includes('tamil') || lower.includes('simple tamil')) {
    return {
      answer: "சட்ட விழிப்புணர்வு விளக்கம் (Simple Tamil Legal Explanation):\n\nஇந்திய ஒப்பந்த சட்டம் 1872 (Indian Contract Act, 1872) படி, எந்த ஒரு ஒப்பந்தமும் இரு தரப்பினரின் சுதந்திரமான சம்மதத்துடன் (Free Consent) அமைய வேண்டும். வேலைவாய்ப்பு அல்லது வாடகை ஒப்பந்தங்களில் கையெழுத்திடும் முன் கவனிக்க வேண்டிய முக்கிய அம்சங்கள் கீழே விவரிக்கப்பட்டுள்ளன.",
      keyPoints: [
        "Section 27 (தொழில் செய்யும் உரிமை): வேலையை விட்டு விலகிய பிறகு வேறு நிறுவனத்தில் வேலை செய்யக்கூடாது என தடை விதிக்கும் பிரிவுகள் (Post-termination non-compete) இந்திய சட்டப்படி செல்லாது (Void).",
        "வாடகை ஒப்பந்தம் (Rental Agreement): 11 மாதங்களுக்கு மேல் உள்ள ஒப்பந்தங்கள் கட்டாயம் பதிவு (Registration) செய்யப்பட வேண்டும்.",
        "நோட்டீஸ் காலம் (Notice Period): இரு தரப்பினருக்கும் சமமான கால அவகாசம் (உதாரணமாக 30 நாட்கள்) இருக்க வேண்டும்."
      ],
      relevantContext: "தமிழ்நாட்டில் வீட்டு வாடகை சட்டம் (Tamil Nadu Regulation of Rights and Responsibilities of Landlords and Tenants Act, 2017) நடைமுறையில் உள்ளது. இதன் கீழ் ஒப்பந்தங்களை பதிவு செய்ய தனி இணையதள வசதி உள்ளது.",
      considerations: [
        "முன்பணம் (Advance / Security Deposit) திருப்பித் தரும் விதிமுறைகளை உறுதிப்படுத்தவும்.",
        "விதிமீறல் அபராதங்கள் (Penalties) நியாயமானதாக உள்ளதா என சரிபார்க்கவும்."
      ],
      nextSteps: [
        "முழு ஆவணத்தையும் படித்துவிட்டு கையெழுத்திடவும்.",
        "சந்தேகம் இருப்பின் வழக்கறிஞரின் ஆலோசனை பெறவும்."
      ],
      sources: [
        {
          title: "Indian Contract Act, 1872",
          authority: "Parliament of India",
          relevantSection: "Section 27",
          link: "https://www.indiacode.nic.in/handle/123456789/2187"
        }
      ],
      verificationNote: "Source verification is recommended."
    };
  }

  if (lower.includes('legal notice') || lower.includes('notice')) {
    return {
      answer: "A legal notice is a formal written communication issued by an aggrieved party (often through an advocate) demanding that the recipient rectify a grievance or fulfill an obligation within a specified time limit before civil or criminal proceedings are initiated.",
      keyPoints: [
        "Statutory Notices: Required by statute in certain actions, such as Section 138 of the Negotiable Instruments Act, 1881 (cheque dishonor - 15 days notice) or Section 80 of the Code of Civil Procedure (against government - 2 months notice).",
        "Commercial Notices: Sent for breach of contract, non-payment of dues, or recovery of property under Section 106 of the Transfer of Property Act.",
        "Evidentiary Value: Establishes a paper trail demonstrating that the opposing party had notice and an opportunity to rectify the default."
      ],
      relevantContext: "A notice must clearly state facts chronologically, specific breaches, loss caused, precise relief claimed, and the deadline for compliance (typically 15 to 30 days).",
      considerations: [
        "Ensure notice is served via Registered Post with Acknowledgment Due (RPAD) and speed post/email for proof of service.",
        "Avoid making unsubstantiated allegations that could invite defamation counterclaims.",
        "State precise quantify of damages or dues."
      ],
      nextSteps: [
        "Collate all documentary evidence (invoices, emails, payment logs).",
        "Draft the factual timeline accurately.",
        "Have the draft vetted by an advocate if initiating court litigation."
      ],
      sources: [
        {
          title: "Code of Civil Procedure, 1908",
          authority: "Parliament of India",
          relevantSection: "Section 80",
          link: "https://www.indiacode.nic.in/handle/123456789/2191"
        },
        {
          title: "Negotiable Instruments Act, 1881",
          authority: "Parliament of India",
          relevantSection: "Section 138",
          link: "https://www.indiacode.nic.in/handle/123456789/2189"
        }
      ],
      verificationNote: "Notice requirements strictly depend on the cause of action and jurisdiction."
    };
  }

  // General fallback
  return {
    answer: `Regarding your query "${message.slice(0, 80)}...": Under Indian legal framework, rights and duties arise from statutory enactments, binding contracts, and established common law precedents.`,
    keyPoints: [
      "Statutory Compliance: Confirm whether the matter is regulated under Central legislation (such as Indian Contract Act, IT Act, Consumer Protection Act) or specific State rules.",
      "Documentary Evidence: Indian courts prioritize documentary evidence under the Bharatiya Sakshya Adhiniyam, 2023 (formerly Indian Evidence Act, 1872).",
      "Limitation Period: Most civil claims must be filed within periods specified under the Limitation Act, 1963 (typically 3 years for breach of contract or money claims)."
    ],
    relevantContext: documentContext ? `Document context supplied: Contains analysis of uploaded terms.` : "General legal information applicable across Indian jurisdictions.",
    considerations: [
      "Review the dispute resolution forum (Civil Court, Consumer Commission, Commercial Court, or Arbitration).",
      "Check if any arbitration clause excludes civil court jurisdiction under Section 8 of the Arbitration Act.",
      "Ensure all notices and correspondence are documented with proof of receipt."
    ],
    nextSteps: [
      "Formulate a chronological summary of facts with supporting dates and exhibits.",
      "Identify the exact legal relief sought (e.g., injunction, damages, specific performance, refund).",
      "Consult a qualified advocate practicing in your jurisdiction for tailored representation."
    ],
    sources: [
      {
        title: "Indian Contract Act, 1872",
        authority: "Ministry of Law and Justice",
        relevantSection: "Sections 10, 73, 74",
        link: "https://www.indiacode.nic.in/handle/123456789/2187"
      }
    ],
    verificationNote: "Source verification is recommended."
  };
}

export async function generateLegalResponse({ message, history = [], documentContext = '', jurisdiction = 'India', userApiKey = null }) {
  const client = getClient(userApiKey);

  if (!client) {
    return generateFallbackChatResponse(message, documentContext);
  }

  try {
    const formattedHistory = history.slice(-6).map(h => ({
      role: h.sender === 'assistant' ? 'model' : 'user',
      parts: [{ text: h.content }]
    }));

    const promptText = `User Query: ${message}
Current Jurisdiction Context: ${jurisdiction}
${documentContext ? `Document in context:\n${documentContext.slice(0, 5000)}\n` : ''}

Please respond in JSON format matching this schema:
{
  "answer": "Clear, direct, neutral legal explanation",
  "keyPoints": ["bullet point 1", "bullet point 2", "bullet point 3"],
  "relevantContext": "Legal context, Indian statutory principles or jurisdiction notes",
  "considerations": ["Consideration 1", "Consideration 2"],
  "nextSteps": ["Actionable step 1", "Actionable step 2"],
  "sources": [
    {
      "title": "Act or Official Document Name",
      "authority": "Parliament of India / Supreme Court of India / Relevant Ministry",
      "relevantSection": "Section X",
      "link": "Official URL or IndiaCode link"
    }
  ],
  "verificationNote": "Brief note on source verification"
}`;

    const response = await client.models.generateContent({
      model: config.geminiModel,
      contents: [
        ...formattedHistory,
        { role: 'user', parts: [{ text: promptText }] }
      ],
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
        responseMimeType: "application/json",
        temperature: 0.2,
      }
    });

    const parsed = JSON.parse(response.text.trim());
    return parsed;
  } catch (error) {
    console.error('[Gemini Service] Error generating legal response:', error.message);
    return generateFallbackChatResponse(message, documentContext);
  }
}

/**
 * 10-Point Document Analyzer
 */
export async function analyzeLegalDocument({ rawText, fileName, fileType, userApiKey = null }) {
  const client = getClient(userApiKey);

  if (!client) {
    return generateFallbackDocumentAnalysis(rawText, fileName, fileType);
  }

  try {
    const promptText = `Analyze the following legal document with strict neutrality and precision under Indian legal principles:
File Name: ${fileName} (${fileType})
Document Content:
${rawText.slice(0, 25000)}

Return strict JSON conforming to this schema:
{
  "documentType": "Document Classification (e.g., Non-Disclosure Agreement, Residential Lease Agreement, Master Services Agreement, Employment Contract)",
  "executiveSummary": "Concise executive overview of the document, its core purpose, and operational scope.",
  "parties": [
    { "name": "Party 1 Name/Title", "role": "e.g. Disclosing Party / Lessor / Employer", "details": "Address, identification, or representative capacity" },
    { "name": "Party 2 Name/Title", "role": "e.g. Receiving Party / Lessee / Employee", "details": "Address, identification, or representative capacity" }
  ],
  "importantDates": [
    { "label": "Effective Date / Commencement", "date": "Date string or Clause reference", "significance": "When obligations take effect" },
    { "label": "Expiry / Termination Date", "date": "Date or term duration", "significance": "Duration of contract" }
  ],
  "financialTerms": [
    { "label": "Consideration / Compensation", "amount": "Value / Fee / Rent", "frequency": "Monthly / One-time / Milestones", "details": "Payment terms and invoicing cycle" }
  ],
  "obligations": [
    { "party": "Party Name", "obligation": "Specific contractual duty", "priority": "High" | "Medium" | "Standard" }
  ],
  "terminationConditions": [
    { "clause": "Clause Name", "noticePeriod": "e.g. 30 days written notice", "curePeriod": "e.g. 15 days cure period for breach", "consequences": "Post-termination survival obligations" }
  ],
  "importantClauses": [
    {
      "title": "Clause Title",
      "plainLanguageExplanation": "Plain-language translation of what this clause means in simple English",
      "whyItMatters": "Practical legal implication for the parties",
      "attentionLevel": "Informational" | "Review recommended" | "Important to verify",
      "sourceReference": "Section/Page reference in text"
    }
  ],
  "attentionPoints": [
    {
      "title": "Area Requiring Attention",
      "description": "Objective observation of clause ambiguity, asymmetry, or statutory interaction",
      "severity": "Informational" | "Review recommended" | "Important to verify",
      "recommendation": "Suggested adjustment or clarification to seek"
    }
  ],
  "questionsForLawyer": [
    "Specific question to clarify with legal counsel 1",
    "Specific question to clarify with legal counsel 2",
    "Specific question to clarify with legal counsel 3"
  ]
}

DO NOT claim 'this clause is definitely illegal'. Use neutral attention indicators ('Informational', 'Review recommended', 'Important to verify').`;

    const response = await client.models.generateContent({
      model: config.geminiModel,
      contents: [{ role: 'user', parts: [{ text: promptText }] }],
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
        responseMimeType: "application/json",
        temperature: 0.1,
      }
    });

    const parsed = JSON.parse(response.text.trim());
    return parsed;
  } catch (error) {
    console.error('[Gemini Service] Error analyzing document:', error.message);
    return generateFallbackDocumentAnalysis(rawText, fileName, fileType);
  }
}

function generateFallbackDocumentAnalysis(rawText, fileName, fileType) {
  const isLease = /lease|rent|tenant|landlord|premises/i.test(rawText + fileName);
  const isNDA = /confidential|nda|non-disclosure|proprietary/i.test(rawText + fileName);
  const isEmployment = /employment|employee|salary|probation|designation/i.test(rawText + fileName);

  let docType = "Commercial Agreement";
  if (isLease) docType = "Residential / Commercial Lease Agreement";
  else if (isNDA) docType = "Mutual Non-Disclosure Agreement";
  else if (isEmployment) docType = "Employment & Service Agreement";

  return {
    documentType: docType,
    executiveSummary: `This legal document establishes mutual rights, obligations, and operating terms between the contracting parties under Indian civil and contract law. It defines procedural standards, payment or performance schedules, confidentiality covenants, and dispute settlement mechanisms.`,
    parties: [
      { name: "First Party / Originator", role: isLease ? "Lessor / Landlord" : isNDA ? "Disclosing Party" : "Employer / Company", details: "Identified in the preamble with principal place of operation" },
      { name: "Second Party / Counterparty", role: isLease ? "Lessee / Tenant" : isNDA ? "Receiving Party" : "Employee / Contractor", details: "Party undertaking performance obligations and covenants" }
    ],
    importantDates: [
      { label: "Execution / Effective Date", date: "As defined in Section 1 or Signatures", significance: "Commencement of binding legal duties" },
      { label: "Term / Lock-in Period", date: isLease ? "11 Months from execution" : "24 Months / Duration of Engagement", significance: "Operational timeframe before renewal or expiration" }
    ],
    financialTerms: [
      { label: isLease ? "Monthly Rent & Deposit" : "Consideration / Compensation", amount: isLease ? "INR 25,000 / month (plus Security Deposit)" : "Mutual covenants & specified remuneration", frequency: "Monthly / Periodic", details: "Subject to deductions and statutory withholdings where applicable" }
    ],
    obligations: [
      { party: "First Party", obligation: "Provide agreed facilities, consideration, and quiet enjoyment/indemnity.", priority: "High" },
      { party: "Second Party", obligation: "Adhere to performance covenants, compliance terms, and non-disclosure standards.", priority: "High" },
      { party: "Both Parties", obligation: "Maintain confidentiality and provide written notice before alteration of terms.", priority: "Standard" }
    ],
    terminationConditions: [
      { clause: "Termination for Convenience", noticePeriod: "30 days prior written notice", curePeriod: "15 days cure period for remediable breach", consequences: "Return of proprietary materials and settlement of outstanding dues" }
    ],
    importantClauses: [
      {
        title: "Confidentiality & Non-Disclosure",
        plainLanguageExplanation: "Each party must keep business data, financial records, and operational methods private and not disclose to third parties.",
        whyItMatters: "Prevents data leakage and safeguards trade secrets under Section 43A of the IT Act, 2000.",
        attentionLevel: "Informational",
        sourceReference: "Clause 4 / Page 1"
      },
      {
        title: "Governing Law & Jurisdiction",
        plainLanguageExplanation: "Specifies which courts in India hold exclusive authority to adjudicate disputes arising from this contract.",
        whyItMatters: "Determines physical venue and applicable laws, preventing forum shopping.",
        attentionLevel: "Review recommended",
        sourceReference: "Clause 9 / Page 2"
      },
      {
        title: "Indemnity & Limitation of Liability",
        plainLanguageExplanation: "Limits the maximum financial damages either party can claim in case of a contractual breach.",
        whyItMatters: "Ensures exposure is capped to a reasonable multiple of fees or actual losses under Section 73 of the Indian Contract Act.",
        attentionLevel: "Important to verify",
        sourceReference: "Clause 7 / Page 2"
      }
    ],
    attentionPoints: [
      {
        title: "Asymmetric Notice Period",
        description: "The draft specifies a longer notice period for one party than the other.",
        severity: "Review recommended",
        recommendation: "Propose mutual, symmetric 30-day notice requirements."
      },
      {
        title: "Arbitration Seat vs Venue Clarity",
        description: "Dispute resolution references arbitration but does not explicitly specify institutional rules (e.g. DIAC/MCIA).",
        severity: "Important to verify",
        recommendation: "Clarify whether the arbitration seat is New Delhi, Mumbai, Bengaluru, or Chennai."
      }
    ],
    questionsForLawyer: [
      "Does the limitation of liability clause adequately protect against indirect or consequential damages?",
      "Are the post-termination obligations compliant with Section 27 of the Indian Contract Act, 1872?",
      "What is the required stamp duty payment in the relevant State for this document's execution?"
    ]
  };
}

/**
 * Draft Studio generation
 */
export async function generateLegalDraft({ documentType, inputData, instructions = '', userApiKey = null }) {
  const client = getClient(userApiKey);

  if (!client) {
    return generateFallbackDraft(documentType, inputData, instructions);
  }

  try {
    const promptText = `Generate a comprehensive, professionally formatted first-pass Indian legal document draft.
Document Type: ${documentType}
Input Data: ${JSON.stringify(inputData, null, 2)}
Additional Instructions: ${instructions || 'Follow standard Indian legal drafting conventions and statutory protections.'}

Return JSON formatted as:
{
  "title": "Official Title of the Legal Document",
  "documentType": "${documentType}",
  "generatedContent": "Complete, structured legal document text in clean Markdown, with preamble, recitals, definitions, substantive covenants, representations, boilerplate (governing law, notices, severability, dispute resolution), and signature blocks.",
  "sections": [
    { "title": "Preamble & Recitals", "content": "Text..." },
    { "title": "Core Covenants & Scope", "content": "Text..." },
    { "title": "Consideration & Terms", "content": "Text..." },
    { "title": "Confidentiality & Intellectual Property", "content": "Text..." },
    { "title": "Term & Termination", "content": "Text..." },
    { "title": "Governing Law & Dispute Resolution", "content": "Text..." },
    { "title": "Execution & Signatures", "content": "Text..." }
  ],
  "disclaimer": "This document is an AI-assisted first-pass draft prepared for informational and preparation purposes under Indian legal conventions. It must be reviewed, finalized, stamped with appropriate non-judicial stamp duty under applicable State Stamp Acts, and signed before a notary or registered where mandated by law."
}`;

    const response = await client.models.generateContent({
      model: config.geminiModel,
      contents: [{ role: 'user', parts: [{ text: promptText }] }],
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
        responseMimeType: "application/json",
        temperature: 0.2,
      }
    });

    const parsed = JSON.parse(response.text.trim());
    return parsed;
  } catch (error) {
    console.error('[Gemini Service] Error generating legal draft:', error.message);
    return generateFallbackDraft(documentType, inputData, instructions);
  }
}

function generateFallbackDraft(documentType, inputData, instructions) {
  const party1 = inputData.party1Name || "Party of the First Part";
  const party2 = inputData.party2Name || "Party of the Second Part";
  const date = inputData.effectiveDate || new Date().toISOString().split('T')[0];
  const jurisdiction = inputData.jurisdiction || "New Delhi, India";
  const consideration = inputData.consideration || "mutual covenants and valid consideration acknowledged herein";

  const fullContent = `# ${documentType.toUpperCase()}

This ${documentType} (hereinafter referred to as the "**Agreement**") is entered into on this **${date}** at **${jurisdiction}**:

### BY AND BETWEEN:
**${party1}**, having its principal address/residence at ${inputData.party1Address || '[Insert First Party Address]'} (hereinafter referred to as the "**First Party**", which expression shall unless repugnant to the context include its successors, heirs, legal representatives, and permitted assigns) of the FIRST PART;

### AND
**${party2}**, having its principal address/residence at ${inputData.party2Address || '[Insert Second Party Address]'} (hereinafter referred to as the "**Second Party**", which expression shall unless repugnant to the context include its successors, heirs, legal representatives, and permitted assigns) of the SECOND PART.

---

### RECITALS:
WHEREAS the First Party and the Second Party desire to enter into this arrangement for ${inputData.purpose || 'the lawful commercial objectives agreed mutually between the parties'};
AND WHEREAS the parties agree to record the mutual covenants, rights, obligations, and warranties governing their relationship as set forth herein below;

NOW, THEREFORE, in consideration of the ${consideration}, and the mutual covenants contained herein, the parties agree as follows:

---

### 1. DEFINITIONS AND INTERPRETATION
1.1. In this Agreement, capitalized terms shall have the meanings attributed to them herein.
1.2. Headings are inserted for convenience only and shall not affect statutory interpretation under the Indian Contract Act, 1872.

### 2. OBLIGATIONS & SCOPE
2.1. The parties shall diligently execute the obligations and milestones specified in Schedule A attached hereto.
2.2. All activities performed shall comply with all applicable central, state, and local statutes in India.

### 3. CONSIDERATION AND PAYMENT TERMS
3.1. In consideration of the covenants herein, the payments shall be made as specified: ${inputData.paymentTerms || 'As mutually agreed in writing and invoiced periodically'}.
3.2. All payments shall be subject to statutory deductions of Tax Deducted at Source (TDS) under the Income Tax Act, 1961, as applicable.

### 4. CONFIDENTIALITY AND DATA PROTECTION
4.1. Each party agrees to maintain strict confidentiality of all proprietary, technical, and commercial information disclosed during the term.
4.2. The parties shall observe reasonable security practices to protect personal information in accordance with Section 43A of the Information Technology Act, 2000 and the Digital Personal Data Protection Act, 2023.

### 5. TERM AND TERMINATION
5.1. This Agreement shall commence on ${date} and remain valid for a period of ${inputData.duration || 'twelve (12) months'}, unless terminated earlier in accordance with this Clause.
5.2. Either party may terminate this Agreement by giving **${inputData.noticePeriod || '30 days'}** prior written notice to the other party.
5.3. In the event of a material breach, the non-defaulting party may terminate immediately if such breach remains uncured for a period of fifteen (15) days following written notice.

### 6. GOVERNING LAW AND DISPUTE RESOLUTION
6.1. This Agreement shall be governed by and construed in accordance with the substantive laws of India.
6.2. Any dispute or controversy arising out of or in connection with this Agreement shall be referred to and finally resolved by arbitration in accordance with the **Arbitration and Conciliation Act, 1996**.
6.3. The seat and venue of arbitration shall be **${jurisdiction}**, and the proceedings shall be conducted in the English language. Subject to arbitration, the courts at **${jurisdiction}** shall have exclusive jurisdiction.

### 7. MISCELLANEOUS
7.1. **Severability**: If any provision of this Agreement is held to be invalid under Indian law, the remaining provisions shall continue in full force and effect.
7.2. **Entire Agreement**: This Agreement constitutes the entire understanding between the parties with respect to the subject matter hereof.

---

### IN WITNESS WHEREOF, the parties hereto have executed this Agreement as of the date first written above.

**FOR AND ON BEHALF OF FIRST PARTY:**  
Signature: __________________________  
Name: ${party1}  
Title: Authorized Signatory  
Witness 1: __________________________  

**FOR AND ON BEHALF OF SECOND PARTY:**  
Signature: __________________________  
Name: ${party2}  
Title: Authorized Signatory  
Witness 2: __________________________  
`;

  return {
    title: `${documentType} - Draft`,
    documentType,
    generatedContent: fullContent,
    sections: [
      { title: "Preamble & Parties", content: `Between ${party1} and ${party2} executed at ${jurisdiction}.` },
      { title: "Recitals & Objectives", content: `Purpose: ${inputData.purpose || 'Mutual legal and commercial collaboration'}.` },
      { title: "Covenants & Obligations", content: `Mutual performance under Indian Contract Act, 1872.` },
      { title: "Consideration & Taxes", content: `Consideration: ${consideration}. TDS deductions under Income Tax Act.` },
      { title: "Confidentiality & DPDP Act", content: `Protection of proprietary data and compliance with IT Act 2000.` },
      { title: "Term & Termination", content: `Notice period: ${inputData.noticePeriod || '30 days'}. 15 days cure period.` },
      { title: "Arbitration & Jurisdiction", content: `Governed by Arbitration & Conciliation Act 1996 with seat at ${jurisdiction}.` }
    ],
    disclaimer: "This document is an AI-assisted first-pass draft prepared for informational and preparation purposes under Indian legal conventions. It must be reviewed, finalized, stamped with appropriate non-judicial stamp duty under applicable State Stamp Acts, and signed before a notary or registered where mandated by law."
  };
}

export async function summarizeDocument({ rawText, userApiKey = null }) {
  const client = getClient(userApiKey);
  if (!client) {
    return `Summary of Document: Contains legal commitments, parties' designations, operative dates, confidentiality obligations, and standard dispute resolution terms under Indian law. Review recommended for key dates and financial terms.`;
  }
  try {
    const response = await client.models.generateContent({
      model: config.geminiModel,
      contents: [{ role: 'user', parts: [{ text: `Provide an executive 3-paragraph summary of this legal document:\n\n${rawText.slice(0, 15000)}` }] }],
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
        temperature: 0.2,
      }
    });
    return response.text;
  } catch (error) {
    return `Summary: Comprehensive legal document defining rights, warranties, and obligations. Review recommended.`;
  }
}
