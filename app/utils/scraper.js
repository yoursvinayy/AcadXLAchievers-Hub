import axios from 'axios';
import cheerio from 'cheerio';
import { addQuestion } from '../models/Question';

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

export async function scrapeNCERTQuestions(subject, classLevel) {
  try {
    // Base URL for NCERT questions
    const baseUrl = `https://ncert.nic.in/textbook.php?${subject}${classLevel}`;
    
    const response = await axios.get(baseUrl);
    const $ = cheerio.load(response.data);
    
    const questions = [];
    
    // Example scraping logic - this will need to be adjusted based on the actual website structure
    $('.question').each(async (i, element) => {
      try {
        const questionText = $(element).find('.question-text').text().trim();
        const options = [];
        $(element).find('.option').each((j, opt) => {
          options.push($(opt).text().trim());
        });
        const correctAnswer = $(element).find('.correct-answer').text().trim();
        const explanation = $(element).find('.explanation').text().trim();
        
        const questionData = {
          question: questionText,
          options,
          correctAnswer,
          explanation,
          subject,
          class: classLevel,
          exam: 'Board',
          topic: 'NCERT',
          difficulty: 'Medium',
          source: 'NCERT'
        };
        
        // Add question to Firebase
        await addQuestion(questionData);
        questions.push(questionData);
        
        // Add delay to avoid rate limiting
        await delay(1000);
      } catch (error) {
        console.error('Error processing question:', error);
      }
    });
    
    return questions;
  } catch (error) {
    console.error('Error scraping NCERT questions:', error);
    throw error;
  }
}

export async function scrapePreviousYearQuestions(exam, year) {
  try {
    // Base URL for previous year questions
    let baseUrl;
    if (exam === 'JEE') {
      baseUrl = `https://jeemain.nta.nic.in/webinfo2021/Page/Page?PageId=1&LangId=P&${year}`;
    } else if (exam === 'NEET') {
      baseUrl = `https://neet.nta.nic.in/webinfo2021/Page/Page?PageId=1&LangId=P&${year}`;
    }
    
    const response = await axios.get(baseUrl);
    const $ = cheerio.load(response.data);
    
    const questions = [];
    
    // Example scraping logic - this will need to be adjusted based on the actual website structure
    $('.question-paper').each(async (i, element) => {
      try {
        const questionText = $(element).find('.question').text().trim();
        const options = [];
        $(element).find('.option').each((j, opt) => {
          options.push($(opt).text().trim());
        });
        const correctAnswer = $(element).find('.answer').text().trim();
        
        const questionData = {
          question: questionText,
          options,
          correctAnswer,
          subject: $(element).find('.subject').text().trim(),
          class: '12',
          exam,
          topic: 'Previous Year',
          difficulty: 'Hard',
          source: `${exam} ${year}`,
          year
        };
        
        // Add question to Firebase
        await addQuestion(questionData);
        questions.push(questionData);
        
        // Add delay to avoid rate limiting
        await delay(1000);
      } catch (error) {
        console.error('Error processing question:', error);
      }
    });
    
    return questions;
  } catch (error) {
    console.error(`Error scraping ${exam} questions:`, error);
    throw error;
  }
}

export async function scrapeTopprQuestions(subject, classLevel) {
  try {
    // Base URL for Toppr questions
    const baseUrl = `https://www.toppr.com/ask/en-${classLevel}-${subject.toLowerCase()}/`;
    
    const response = await axios.get(baseUrl);
    const $ = cheerio.load(response.data);
    
    const questions = [];
    
    // Example scraping logic - this will need to be adjusted based on the actual website structure
    $('.question-card').each(async (i, element) => {
      try {
        const questionText = $(element).find('.question-text').text().trim();
        const options = [];
        $(element).find('.option').each((j, opt) => {
          options.push($(opt).text().trim());
        });
        const correctAnswer = $(element).find('.correct-answer').text().trim();
        const explanation = $(element).find('.explanation').text().trim();
        
        const questionData = {
          question: questionText,
          options,
          correctAnswer,
          explanation,
          subject,
          class: classLevel,
          exam: 'Practice',
          topic: 'Toppr',
          difficulty: 'Medium',
          source: 'Toppr'
        };
        
        // Add question to Firebase
        await addQuestion(questionData);
        questions.push(questionData);
        
        // Add delay to avoid rate limiting
        await delay(1000);
      } catch (error) {
        console.error('Error processing question:', error);
      }
    });
    
    return questions;
  } catch (error) {
    console.error('Error scraping Toppr questions:', error);
    throw error;
  }
} 