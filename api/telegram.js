// Telegram bot API handler for Vercel serverless function

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const testData = req.body;
    
    // Get Telegram bot token and chat ID from environment variables
    const botToken = process.env.TELEGRAM_BOT_TOKEN;
    const chatId = process.env.TELEGRAM_CHAT_ID;
    
    if (!botToken || !chatId) {
      console.error('Telegram bot token or chat ID not configured');
      return res.status(500).json({ error: 'Telegram configuration missing' });
    }

    // Format message for Telegram
    const message = formatTelegramMessage(testData);
    
    // Send message to Telegram
    const telegramResponse = await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        chat_id: chatId,
        text: message,
        parse_mode: 'HTML'
      })
    });

    const result = await telegramResponse.json();
    
    if (!telegramResponse.ok) {
      console.error('Telegram API error:', result);
      return res.status(500).json({ error: 'Failed to send message to Telegram' });
    }

    res.status(200).json({ success: true, message: 'Answers sent to Telegram' });
  } catch (error) {
    console.error('Error in Telegram handler:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}

function formatTelegramMessage(testData) {
  const timestamp = new Date(testData.timestamp).toLocaleString();
  
  let message = `<b>📝 IELTS WRITING TEST SUBMITTED</b>\n\n`;
  
  // Student Information
  message += `<b>👤 STUDENT INFORMATION</b>\n`;
  message += `• <b>Name:</b> ${testData.studentName}\n`;
  message += `• <b>Test:</b> ${testData.testName}\n`;
  message += `• <b>Timestamp:</b> ${timestamp}\n`;
  message += `• <b>Duration:</b> ${testData.duration}\n\n`;
  
  // Task 1 Details
  message += `<b>📋 TASK 1 - CHART DESCRIPTION</b>\n`;
  message += `<b>Question:</b>\n${testData.task1.question || 'Not provided'}\n\n`;
  message += `<b>📝 Student's Answer:</b>\n`;
  message += `<code>${escapeHtml(testData.task1.answer || 'No answer provided')}</code>\n\n`;
  message += `<b>📊 Task 1 Statistics:</b>\n`;
  message += `• ${testData.task1.wordCount}\n`;
  message += `• Word Count: ${countWords(testData.task1.answer || '')}\n\n`;
  
  // Task 2 Details
  message += `<b>📝 TASK 2 - ESSAY WRITING</b>\n`;
  message += `<b>Question:</b>\n${testData.task2.question || 'Not provided'}\n\n`;
  message += `<b>📝 Student's Answer:</b>\n`;
  message += `<code>${escapeHtml(testData.task2.answer || 'No answer provided')}</code>\n\n`;
  message += `<b>📊 Task 2 Statistics:</b>\n`;
  message += `• ${testData.task2.wordCount}\n`;
  message += `• Word Count: ${countWords(testData.task2.answer || '')}\n\n`;
  
  // Overall Statistics
  const totalWords = countWords(testData.task1.answer || '') + countWords(testData.task2.answer || '');
  message += `<b>📈 OVERALL STATISTICS</b>\n`;
  message += `• Total Words: ${totalWords}\n`;
  message += `• Task 1 Words: ${countWords(testData.task1.answer || '')}\n`;
  message += `• Task 2 Words: ${countWords(testData.task2.answer || '')}\n\n`;
  
  message += `---\n`;
  message += `<i>✅ Test automatically submitted and recorded</i>\n`;
  message += `<i>🕒 Submission Time: ${new Date().toLocaleString()}</i>`;
  
  return message;
}

function escapeHtml(text) {
  if (!text) return '';
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

function countWords(text) {
  if (!text) return 0;
  return text.trim().split(/\s+/).filter(word => word.length > 0).length;
}
