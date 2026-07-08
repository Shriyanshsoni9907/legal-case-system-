const db = require('../config/db');
const Case = require('../models/caseModel');
const Client = require('../models/clientModel');
const Lawyer = require('../models/lawyerModel');
const Hearing = require('../models/hearingModel');
const { GoogleGenAI } = require('@google/generative-ai');

/**
 * Perform a local contextual fallback response if Gemini API is not configured
 */
const synthesizeLocalResponse = (message, context, role) => {
  const query = message.toLowerCase();

  // 1. Specific Case Details Search
  if (query.includes('case') && (query.includes('details') || query.includes('about') || query.includes('find') || query.includes('show') || query.includes('info'))) {
    const words = query.split(/\s+/);
    const foundCase = context.cases.find(c => {
      const titleLower = c.case_title.toLowerCase();
      const numberLower = c.case_number.toLowerCase();
      return words.some(w => w.length > 2 && w !== 'case' && w !== 'show' && w !== 'find' && w !== 'details' && w !== 'about' && (titleLower.includes(w) || numberLower.includes(w)));
    });

    if (foundCase) {
      let text = `🔍 **Case File Found:**\n\n`;
      text += `📅 **Title:** ${foundCase.case_title}\n`;
      text += `🔢 **Case Number:** \`${foundCase.case_number}\`\n`;
      text += `🏷️ **Type:** ${foundCase.case_type}\n`;
      text += `🏛️ **Court:** ${foundCase.court}\n`;
      text += `🟢 **Status:** **${foundCase.status}**\n`;
      text += `👤 **Client:** ${foundCase.client_name || 'Unassigned'}\n`;
      text += `💼 **Lead Counsel:** ${foundCase.lawyer_name || 'Unassigned'}\n`;
      if (foundCase.filing_date) {
        const dateStr = new Date(foundCase.filing_date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
        text += `📝 **Filing Date:** ${dateStr}\n`;
      }
      return text;
    }
  }

  // 2. Draft NDA Intent
  if (query.includes('nda') || query.includes('non-disclosure') || query.includes('nondisclosure')) {
    let text = `📄 **Mutual Non-Disclosure Agreement (NDA) Draft**\n\n`;
    text += `*Below is a standard boilerplate legal draft compiled by Coderlly Manage AI. You can copy and customize this contract template:* \n\n`;
    text += `---\n\n`;
    text += `### **MUTUAL NON-DISCLOSURE AGREEMENT**\n\n`;
    text += `This Mutual Non-Disclosure Agreement (the "Agreement") is entered into as of **${new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}** (the "Effective Date"), by and between:\n`;
    text += `- **Party A (Disclosing/Receiving Party)**: [Full Legal Name / Company]\n`;
    text += `- **Party B (Disclosing/Receiving Party)**: [Full Legal Name / Company]\n\n`;
    text += `**1. Purpose:** The parties wish to explore a potential business relationship or transaction of mutual interest. In connection with this, each party may disclose proprietary or confidential technical and business information (the "Confidential Information").\n\n`;
    text += `**2. Standard of Care:** The receiving party agrees to hold the disclosing party's Confidential Information in strict confidence and protect it with the same degree of care it uses for its own confidential information (but not less than a reasonable standard of care).\n\n`;
    text += `**3. Term:** This Agreement and the obligations of confidentiality herein shall remain in force for a period of **two (2) years** from the Effective Date.\n\n`;
    text += `**IN WITNESS WHEREOF**, the parties have executed this Agreement:\n\n`;
    text += `**For Party A:** _________________ \n`;
    text += `**For Party B:** _________________\n`;
    return text;
  }

  // 3. Draft Retainer Agreement Intent
  if (query.includes('retainer') || query.includes('client agreement') || query.includes('engagement letter')) {
    let text = `📄 **Attorney-Client Retainer Agreement Draft**\n\n`;
    text += `*Below is a standard attorney retainer engagement draft. You can copy and modify this for your clients:* \n\n`;
    text += `---\n\n`;
    text += `### **ATTORNEY RETAINER AGREEMENT**\n\n`;
    text += `This Attorney Retainer Agreement is entered into by and between **Coderlly Manage Law Firm** (the "Attorney") and the undersigned **[Client Name]** (the "Client") on this **${new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}**.\n\n`;
    text += `**1. Scope of Representation:** The Client retains the Attorney to represent them in connection with the following legal matter: **[Specify legal matter, e.g. Dispute, Civil Suit]**.\n\n`;
    text += `**2. Retainer Fee & Billing Rate:** The Client agrees to pay the Attorney a non-refundable initial retainer fee of **$[Amount]** to begin work. Services will be billed at an hourly rate of **$[Rate]/hour** against the retainer fund.\n\n`;
    text += `**3. Duties & Responsibilities:** The Attorney will keep the Client reasonably informed of progress and respond to inquiries. The Client agrees to cooperate fully, tell the truth, and pay billing statements promptly.\n\n`;
    text += `**Client Signature**: _________________ \n`;
    text += `**Attorney Signature**: _________________\n`;
    return text;
  }

  // 4. Draft Cease & Desist Letter Intent
  if (query.includes('cease') || query.includes('desist') || query.includes('stop letter')) {
    let text = `📄 **Cease & Desist Demand Letter Draft**\n\n`;
    text += `*Below is a standard formal legal notice demanding cessation of unauthorized actions:* \n\n`;
    text += `---\n\n`;
    text += `### **CEASE & DESIST DEMAND NOTICE**\n\n`;
    text += `**Date:** ${new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}\n`;
    text += `**To:** [Recipients Full Name / Company Name]\n`;
    text += `**Address:** [Recipients Address]\n\n`;
    text += `**RE: CEASE AND DESIST DEMAND - UNAUTHORIZED ACTIVITY**\n\n`;
    text += `Dear **[Recipient Name]**,\n\n`;
    text += `This firm represents **[Your Clients Name]**. It has come to our attention that you are engaged in unauthorized activities, specifically **[Describe activity, e.g., trademark infringement, harassment, lease violation]**.\n\n`;
    text += `Your actions constitute a direct violation of law and have caused significant harm to our client. \n\n`;
    text += `**WE HEREBY DEMAND THAT YOU IMMEDIATELY CEASE AND DESIST** all such activities. If you fail to confirm compliance within **ten (10) business days**, we have instruction to take immediate legal action against you, including seeking damages and injunctive relief without further notice.\n\n`;
    text += `Sincerely,\n\n`;
    text += `**Lead Counsel**  \n`;
    text += `*Coderlly Manage Legal Services*\n`;
    return text;
  }

  // 5. Date calculation intent
  if (query.includes('calculate') || query.includes('deadline') || query.includes('add days') || query.includes('date calculator')) {
    const numberMatches = query.match(/\d+/g);
    const days = numberMatches ? parseInt(numberMatches[0]) : 30;
    
    const targetDate = new Date();
    targetDate.setDate(targetDate.getDate() + days);
    const formattedTarget = targetDate.toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
    
    let text = `📅 **Legal Deadline Calculation:**\n\n`;
    text += `- **Starting Date**: Today (${new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })})\n`;
    text += `- **Interval**: **${days} days**\n`;
    text += `- **Projected Filing/Response Deadline**: ⚖️ **${formattedTarget}**\n\n`;
    text += `*Tip: You can change the interval by asking me "calculate 45 days from today".*`;
    return text;
  }

  // 6. Cases intent
  if (query.includes('case') || query.includes('lawsuit') || query.includes('matter')) {
    const total = context.cases.length;
    const active = context.cases.filter(c => c.status === 'Active').length;
    const pending = context.cases.filter(c => c.status === 'Pending').length;
    const closed = context.cases.filter(c => c.status === 'Closed').length;
    const onHold = context.cases.filter(c => c.status === 'On Hold').length;

    let text = `You currently have **${total}** case(s) registered in your database. \n\n`;
    if (total > 0) {
      text += `**Breakdown by Status:**\n`;
      text += `- 🟢 **Active:** ${active}\n`;
      text += `- 🟡 **Pending:** ${pending}\n`;
      text += `- 🟠 **On Hold:** ${onHold}\n`;
      text += `- ⚪ **Closed:** ${closed}\n\n`;
      text += `**Recent Cases:**\n`;
      context.cases.slice(0, 3).forEach(c => {
        text += `- **${c.case_title}** (${c.case_number}) - *Status: ${c.status}* at *Court: ${c.court}*\n`;
      });
    } else {
      text += `No cases were found. You can add cases via the Case Management module.`;
    }
    return text;
  }

  // 7. Hearings intent
  if (query.includes('hearing') || query.includes('court date') || query.includes('judge') || query.includes('calendar')) {
    const total = context.hearings.length;
    let text = `There are **${total}** upcoming hearing(s) scheduled. \n\n`;
    if (total > 0) {
      text += `**Hearing Schedule:**\n`;
      context.hearings.slice(0, 5).forEach((h, i) => {
        const dateStr = new Date(h.hearing_date).toLocaleDateString('en-IN', {
          weekday: 'short', day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit'
        });
        text += `${i+1}. 🏛️ **${dateStr}** - Case: *${h.case_title}* at *${h.court}* (Judge: ${h.judge})\n`;
      });
    } else {
      text += `No upcoming hearings found in the calendar.`;
    }
    return text;
  }

  // 8. Clients intent
  if (query.includes('client') || query.includes('customer')) {
    if (role !== 'Admin') {
      return `For data privacy regulations, only Administrators have direct directory query permissions. Please contact your administrator.`;
    }
    const total = context.clients.length;
    let text = `There are **${total}** clients registered in the directory. \n\n`;
    if (total > 0) {
      text += `**Recent Clients:**\n`;
      context.clients.slice(0, 5).forEach(c => {
        text += `- 👤 **${c.name}** (Email: ${c.email || 'N/A'}, Phone: ${c.phone || 'N/A'})\n`;
      });
    } else {
      text += `No clients found in the directory database.`;
    }
    return text;
  }

  // 9. Lawyer intent
  if (query.includes('lawyer') || query.includes('attorney') || query.includes('counsel')) {
    const total = context.lawyers.length;
    let text = `The firm currently has **${total}** registered lawyers/attorneys. \n\n`;
    if (total > 0) {
      text += `**Firm Attorneys:**\n`;
      context.lawyers.forEach(l => {
        text += `- 💼 **${l.name}** - *Specialization: ${l.specialization || 'General Practice'}* (Status: ${l.status})\n`;
      });
    } else {
      text += `No registered lawyer profiles found.`;
    }
    return text;
  }

  // Help or Default fallback
  return `Hello! I am your **Coderlly Manage AI Legal Assistant**. 

I can draft legal templates, query cases, check upcoming hearings, and compute filing deadlines.

**Try asking me:**
- *"Draft a Mutual NDA"*
- *"Draft a Cease and Desist demand"*
- *"Draft a Client Retainer Agreement"*
- *"Calculate a 45 days filing deadline"*
- *"Tell me about the Smith case"*
- *"How many active cases do we have?"*
- *"Show me my upcoming court hearings"*

*Note: To enable full generative AI reasoning (letting me draft legal memos, summarize case briefs, and reply to open-ended legal questions), add a \`GEMINI_API_KEY\` to the backend \`.env\` file.*`;
};

/**
 * Controller to handle AI Chat messages
 */
exports.handleChat = async (req, res, next) => {
  try {
    const { message } = req.body;
    if (!message) {
      return res.status(400).json({ status: 'fail', message: 'Please provide a message query.' });
    }

    // Determine lawyerId filter based on roles
    let lawyerFilterId = null;
    if (req.user.role === 'Lawyer') {
      const lawyerProfile = await Lawyer.findByUserId(req.user.id);
      lawyerFilterId = lawyerProfile ? lawyerProfile.id : 'none';
    }

    // Fetch context data from all modules in parallel
    const [casesList, clientsList, lawyersList, upcomingHearings] = await Promise.all([
      Case.findAll({ lawyerId: lawyerFilterId }),
      req.user.role === 'Admin' ? Client.findAll() : Promise.resolve([]),
      Lawyer.findAll(),
      Hearing.findUpcoming(10)
    ]);

    const contextData = {
      cases: casesList,
      clients: clientsList,
      lawyers: lawyersList,
      hearings: upcomingHearings,
    };

    const apiKey = process.env.GEMINI_API_KEY;

    if (apiKey) {
      try {
        // Initialize Gemini model
        const genAI = new GoogleGenAI({ apiKey });
        const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

        // Build context prompt
        const prompt = `
You are Coderlly Manage AI, a premium, context-aware AI Legal Assistant built directly into the Coderlly Manage Practice Management Suite.
You have secure, read-only access to the current system data described below. Address the user's question accurately using this context.
If the user asks questions unrelated to the data, answer them professionally using your general legal knowledge.

### SYSTEM DATA CONTEXT
- **User Role**: ${req.user.role} (Name: ${req.user.name})
- **System Cases**: ${JSON.stringify(contextData.cases.map(c => ({ title: c.case_title, number: c.case_number, type: c.case_type, status: c.status, court: c.court, client: c.client_name, lawyer: c.lawyer_name, filing_date: c.filing_date, next_hearing: c.hearing_date })))}
- **Firm Clients**: ${JSON.stringify(contextData.clients.map(cl => ({ name: cl.name, email: cl.email, phone: cl.phone, address: cl.address })))}
- **Firm Lawyers**: ${JSON.stringify(contextData.lawyers.map(l => ({ name: l.name, email: l.email, phone: l.phone, specialization: l.specialization, status: l.status })))}
- **Upcoming Hearings**: ${JSON.stringify(contextData.hearings.map(h => ({ date: h.hearing_date, court: h.court, judge: h.judge, case: h.case_title })))}

### USER QUERY
"${message}"

Provide a structured, professional, and clear response. Use Markdown for layout formatting.
`;

        const result = await model.generateContent(prompt);
        const responseText = result.response.text();

        return res.status(200).json({
          status: 'success',
          data: {
            reply: responseText,
            mode: 'generative'
          }
        });
      } catch (geminiError) {
        console.error('Gemini API call failed, falling back to local NLP synthesizer:', geminiError.message);
        // Fall through to local parser if API key is invalid or request fails
      }
    }

    // Local parser fallback
    const reply = synthesizeLocalResponse(message, contextData, req.user.role);
    res.status(200).json({
      status: 'success',
      data: {
        reply,
        mode: 'local-fallback'
      }
    });
  } catch (err) {
    next(err);
  }
};
