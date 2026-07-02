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

  // 1. Cases intent
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

  // 2. Hearings intent
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

  // 3. Clients intent
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

  // 4. Lawyer intent
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

  // 5. Help or Default fallback
  return `Hello! I am your **Coderlly Manage AI Legal Assistant**. 

I can help you query case files, check upcoming hearings, and retrieve client records using natural language queries.

**Try asking me:**
- *"How many active cases do we have?"*
- *"Show me my upcoming court hearings"*
- *"List all registered firm clients"*
- *"Tell me about the attorneys in the firm"*

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
