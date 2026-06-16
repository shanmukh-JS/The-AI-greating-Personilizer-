// AI Generation Service - Google Gemini API Integration
// Project: AI Customer Greeting Personalizer
// Company: Manivtha Tours & Travels
// -------------------------------------------------------------

const { GoogleGenerativeAI } = require('@google/generative-ai');
require('dotenv').config();

// Prompt Engineering Evolution History:
//
// PROMPT V1 (Basic Text Generator):
// "Write a travel greeting message for a customer named {{name}} going to {{destination}}."
// - Defect: Outputs were too generic, inconsistent in tone, and lacked travel brand identity.
//
// PROMPT V2 (Structured Template):
// "Write a travel greeting for {{name}} visiting {{destination}}. Use this format: 'Hello {{name}}, Thank you once again for choosing Manivtha... [body]... Warm Regards, Manivtha Tours & Travels'."
// - Defect: Output format was better, but ignored preferred languages and special passenger requirements.
//
// PROMPT V3 (Multilingual & Contextual):
// "You are an assistant for Manivtha Tours & Travels. Draft a greeting in {{language}} for {{name}} (travel category: {{category}}, travel type: {{type}}, history: {{history}}). Include special notes: {{notes}}."
// - Defect: Hallucinations occurred. The AI invented hotel check-in times and flight schedules that weren't in the input notes.
//
// PROMPT V4 (Production-Grade, Strict Constraints - IMPLEMENTED BELOW):
// System instructions force structural integrity, correct language matching, brand identity inclusion, loyalty recognition, and zero hallucinations.

const SYSTEM_PROMPT = `
You are the Lead Customer Relations Assistant at "Manivtha Tours & Travels".
Your job is to generate a highly personalized, warm, and professional travel greeting message for a client before they travel.

STRICT CONSTRAINTS:
1. DO NOT invent or assume details that are not provided (e.g., specific flight numbers, hotels, departure times, tour schedules, or prices) unless explicitly provided in the Special Notes.
2. Address the customer's loyalty category (Standard, Premium, VIP) and booking history (e.g., "3 Previous Trips") politely, making them feel valued as a returning customer if they have traveled with us before.
3. Write the response in the specified Preferred Language (English, Telugu, Hindi, Tamil, Kannada, Malayalam, Marathi, Bengali). If a regional language is requested, write in its native script (e.g., Devanagari script for Hindi/Marathi, Telugu script for Telugu, Kannada script for Kannada, Malayalam script for Malayalam, Bengali script for Bengali, Tamil script for Tamil).
4. Match the tone to the Travel Type:
   - Spiritual/Family: Warm, respectful, traditional (e.g., use "Namaste/Namaskar" for Indian contexts).
   - Corporate: Professional, crisp, business-oriented.
   - Honeymoon: Enthusiastic, elegant, celebratory.
   - Solo/Adventure: Energetic, encouraging.
5. Format the greeting clearly with line breaks. Keep it concise (around 100-150 words).
6. Conclude with:
   "Warm Regards,
   Manivtha Tours & Travels"
`;

async function generateGreeting(inputs) {
  const {
    name,
    destination,
    bookingHistory,
    travelType,
    preferredLanguage = 'English',
    customerCategory = 'Standard',
    specialNotes = '',
    travelDate
  } = inputs;

  // Verify API key configuration
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey === 'YOUR_GEMINI_API_KEY') {
    console.log("No Gemini API key found. Utilizing local AI simulation engine.");
    return simulateLocalAI(inputs);
  }

  try {
    // Standard Google Gemini API initialization
    // We use the standard generative model 'gemini-1.5-flash' for speed and cost-efficiency
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({
      model: 'gemini-1.5-flash',
      systemInstruction: SYSTEM_PROMPT,
    });

    const userPrompt = `
Generate a travel greeting with the following inputs:
- Customer Name: ${name}
- Destination: ${destination}
- Travel Date: ${travelDate}
- Booking History: ${bookingHistory}
- Travel Type: ${travelType}
- Preferred Language: ${preferredLanguage}
- Customer Category: ${customerCategory}
- Special Notes: ${specialNotes}
    `;

    // Implement simple retry strategy with exponential delay
    let attempts = 3;
    let delay = 1000;
    
    while (attempts > 0) {
      try {
        const result = await model.generateContent({
          contents: [{ role: 'user', parts: [{ text: userPrompt }] }],
          generationConfig: {
            temperature: 0.3, // Low temperature to prevent hallucinations and enforce guidelines
            maxOutputTokens: 500,
          }
        });

        const text = result.response.text();
        if (text) {
          return text.trim();
        }
      } catch (err) {
        attempts--;
        console.warn(`Gemini SDK request failed. Retries left: ${attempts}. Error: ${err.message}`);
        if (attempts === 0) throw err;
        await new Promise(res => setTimeout(res, delay));
        delay *= 2; // exponential backoff
      }
    }
  } catch (error) {
    console.error("Gemini API call failed completely, executing fallback rules:", error.message);
    return simulateLocalAI(inputs);
  }
}

// Fallback greeting generator
function simulateLocalAI(inputs) {
  const {
    name,
    destination,
    bookingHistory,
    travelType,
    preferredLanguage = 'English',
    customerCategory = 'Standard',
    specialNotes = '',
    travelDate
  } = inputs;

  const formattedDate = new Date(travelDate).toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  const isReturnCustomer = bookingHistory && !bookingHistory.toLowerCase().includes('first') && !bookingHistory.toLowerCase().includes('0');

  // Simple language translator simulation
  if (preferredLanguage.toLowerCase() === 'telugu') {
    return `ప్రియమైన ${name} గారికి,

మణివితా టూర్స్ & ట్రావెల్స్ ఎంచుకున్నందుకు ధన్యవాదాలు.

మీరు ${formattedDate} న ప్రయాణించబోయే ${destination} యాత్ర కొరకు మా శుభాకాంక్షలు. ${isReturnCustomer ? 'మాతో మళ్ళీ ప్రయాణిస్తున్నందుకు మేము ఎంతో సంతోషిస్తున్నాము.' : ''}
మీ ప్రయాణం క్షేమంగా మరియు సంతోషంగా సాగాలని కోరుకుంటున్నాము.

భవదీయులు,
మణివితా టూర్స్ & ట్రావెల్స్`;
  }

  if (preferredLanguage.toLowerCase() === 'hindi') {
    return `नमस्ते ${name},

मणिविथा टूर्स एंड ट्रेवल्स को चुनने के लिए आपका धन्यवाद।

हम ${formattedDate} को होने वाली आपकी ${destination} की यात्रा के लिए रोमांचित हैं। ${isReturnCustomer ? 'हमारे पुराने ग्राहक के रूप में आपके साथ दोबारा जुड़ना हमारे लिए गर्व की बात है।' : ''}
आपकी यात्रा सुरक्षित, आरामदायक और मंगलमय हो।

सादर,
मणिविथा टूर्स एंड ट्रेवल्स`;
  }

  if (preferredLanguage.toLowerCase() === 'tamil') {
    return `அன்பான ${name} அவர்களுக்கு,

மணிவிதா டூர்ஸ் & டிராவல்ஸை தேர்ந்தெடுத்ததற்கு நன்றி.

${formattedDate} அன்று நீங்கள் மேற்கொள்ளும் ${destination} பயணம் சிறக்க வாழ்த்துகிறோம். ${isReturnCustomer ? 'எங்களின் வழக்கமான வாடிக்கையாளராக உங்களை வரவேற்பதில் மகிழ்ச்சி அடைகிறோம்.' : ''}
உங்களின் பயணம் பாதுகாப்பாகவும் மகிழ்ச்சியாகவும் அமைய வாழ்த்துகிறோம்.

அன்புடன்,
மணிவிதா டூர்ஸ் & டிராவல்ஸ்`;
  }

  if (preferredLanguage.toLowerCase() === 'kannada') {
    return `ಪ್ರಿಯ ${name},

ಮಣಿವಿತಾ ಟೂರ್ಸ್ & ಟ್ರಾವೆಲ್ಸ್ ಆಯ್ಕೆ ಮಾಡಿದ್ದಕ್ಕಾಗಿ ಧನ್ಯವಾದಗಳು.

${formattedDate} ರಂದು ನೀವು ಕೈಗೊಳ್ಳಲಿರುವ ${destination} ಪ್ರಯಾಣಕ್ಕಾಗಿ ನಮ್ಮ ಶುಭ ಹಾರೈಕೆಗಳು. ${isReturnCustomer ? 'ನಮ್ಮೊಂದಿಗೆ ಮತ್ತೊಮ್ಮೆ ಪ್ರಯಾಣಿಸುತ್ತಿರುವುದಕ್ಕೆ ನಮಗೆ ತುಂಬಾ ಸಂತೋಷವಾಗಿದೆ.' : ''}
ನಿಮ್ಮ ಪ್ರಯಾಣವು ಸುರಕ್ಷಿತ ಮತ್ತು ಸುಖಕರವಾಗಿರಲಿ ಎಂದು ಹಾರೈಸುತ್ತೇವೆ.

ಪ್ರೀತಿಯ ಗೌರವಗಳೊಂದಿಗೆ,
ಮಣಿವಿತಾ ಟೂರ್ಸ್ & ಟ್ರಾವೆಲ್ಸ್`;
  }

  if (preferredLanguage.toLowerCase() === 'malayalam') {
    return `പ്രിയപ്പെട്ട ${name},

മണിവ്ത ടൂർസ് & ട്രാവൽസ് തിരഞ്ഞെടുത്തതിന് നന്ദി.

${formattedDate} തീയതിയിൽ നിശ്ചയിച്ചിട്ടുള്ള നിങ്ങളുടെ ${destination} യാത്രയ്ക്ക് ഞങ്ങളുടെ ആശംസകൾ. ${isReturnCustomer ? 'ഞങ്ങളോടൊപ്പം വീണ്ടും യാത്ര ചെയ്യുന്നതിൽ ഞങ്ങൾക്ക് സന്തോഷമുണ്ട്.' : ''}
നിങ്ങളുടെ യാത്ര സുരക്ഷിതവും സന്തോഷകരവുമായിരിക്കാൻ ആശംസിക്കുന്നു.

ആദരവോടെ,
മണിവ്ത ടൂർസ് & ട്രാവൽസ്`;
  }

  if (preferredLanguage.toLowerCase() === 'marathi') {
    return `प्रिय ${name},

मणिविथा टूर्स अँड ट्रॅव्हल्सची निवड केल्याबद्दल धन्यवाद.

${formattedDate} रोजी होणाऱ्या तुमच्या ${destination} प्रवासासाठी आमच्या हार्दिक शुभेच्छा. ${isReturnCustomer ? 'आमच्यासोबत पुन्हा प्रवास करत असल्याबद्दल आम्हाला मनापासून आनंद होत आहे।' : ''}
तुमचा प्रवास सुरक्षित आणि सुखकर होवो.

सस्नेह सादर,
मणिविथा टूर्स अँड ट्रॅव्हल्स`;
  }

  if (preferredLanguage.toLowerCase() === 'bengali') {
    return `প্রিয় ${name},

মণিভিথা ট্যুরস অ্যান্ড ট্রাভেলস বেছে নেওয়ার জন্য আপনাকে ধন্যবাদ।

${formattedDate} তারিখে আপনার ${destination} ভ্রমণের জন্য আমাদের আন্তরিক শুভেচ্ছা। ${isReturnCustomer ? 'আমাদের সাথে আবার ভ্রমণ করার জন্য আমরা অত্যন্ত আনন্দিত।' : ''}
আপনার যাত্রা নিরাপদ এবং আনন্দদায়ক হোক।

শুভেচ্ছা সহ,
মণিভিথা ট্যুরস অ্যান্ড ট্রাভেলস`;
  }

  // Default English Output Simulation
  let loyaltyGreeting = "";
  if (customerCategory.toUpperCase() === 'VIP') {
    loyaltyGreeting = `As one of our esteemed VIP customers with ${bookingHistory || 'a valued travel history'}, we are prioritizing your travel preparations to ensure the highest standard of luxury and convenience.`;
  } else if (isReturnCustomer) {
    loyaltyGreeting = `As a valued returning customer with ${bookingHistory}, we sincerely appreciate your continued trust in Manivtha Tours & Travels.`;
  } else {
    loyaltyGreeting = `Thank you for choosing Manivtha Tours & Travels. We look forward to creating a memorable trip for you.`;
  }

  let notesMessage = specialNotes ? `\n\nWe have noted your instructions: "${specialNotes}" and will coordinate with local service providers to accommodate your requests.` : '';

  return `Hello ${name},

Thank you once again for choosing Manivtha Tours & Travels.

We are delighted to assist you on your upcoming ${travelType || 'journey'} to ${destination} scheduled for ${formattedDate}. ${loyaltyGreeting}${notesMessage}

We wish you a safe, comfortable, and memorable trip.

Warm Regards,
Manivtha Tours & Travels`;
}

module.exports = {
  generateGreeting
};
