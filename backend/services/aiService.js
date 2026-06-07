const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));

const OPENROUTER_BASE_URL = process.env.OPENROUTER_BASE_URL || 'https://openrouter.ai/api/v1';
const AI_MODEL = process.env.AI_MODEL || 'anthropic/claude-3-haiku';

const callAI = async (prompt, systemPrompt = '', maxTokens = 2000) => {
  const messages = [];
  if (systemPrompt) {
    messages.push({ role: 'system', content: systemPrompt });
  }
  messages.push({ role: 'user', content: prompt });

  const response = await fetch(`${OPENROUTER_BASE_URL}/chat/completions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY}`,
      'HTTP-Referer': 'http://localhost:5000',
      'X-Title': 'AI Career Copilot'
    },
    body: JSON.stringify({
      model: AI_MODEL,
      messages,
      max_tokens: maxTokens,
      temperature: 0.7
    })
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(`AI API Error: ${error.error?.message || 'Unknown error'}`);
  }

  const data = await response.json();
  return data.choices[0].message.content;
};

const parseJSON = (text) => {
  try {
    const cleaned = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    return JSON.parse(cleaned);
  } catch (e) {
    const match = text.match(/\{[\s\S]*\}/);
    if (match) {
      return JSON.parse(match[0]);
    }
    throw new Error('Failed to parse AI response as JSON');
  }
};

// Resume Analysis
const analyzeResume = async (resumeText, targetRole = '') => {
  const systemPrompt = `You are an expert HR recruiter and ATS specialist. Analyze resumes and return ONLY valid JSON.`;
  const prompt = `Analyze this resume${targetRole ? ` for a ${targetRole} position` : ''}:

${resumeText.substring(0, 4000)}

Return ONLY this JSON structure:
{
  "overallScore": <0-100>,
  "atsScore": <0-100>,
  "strengths": ["strength1", "strength2"],
  "weaknesses": ["weakness1", "weakness2"],
  "missingKeywords": ["keyword1", "keyword2"],
  "grammarIssues": ["issue1", "issue2"],
  "formattingIssues": ["issue1", "issue2"],
  "technicalSkills": ["skill1", "skill2"],
  "softSkills": ["skill1", "skill2"],
  "improvementSuggestions": ["suggestion1", "suggestion2"],
  "recruiterFeedback": "Detailed feedback paragraph"
}`;

  const response = await callAI(prompt, systemPrompt, 2000);
  return parseJSON(response);
};

// Skill Gap Analysis
const analyzeSkillGap = async (currentSkills, targetRole) => {
  const systemPrompt = `You are a career development expert. Return ONLY valid JSON.`;
  const prompt = `Analyze skill gap for role: ${targetRole}
Current skills: ${currentSkills.join(', ')}

Return ONLY this JSON:
{
  "requiredSkills": ["skill1", "skill2"],
  "missingSkills": ["skill1", "skill2"],
  "matchingSkills": ["skill1", "skill2"],
  "readinessScore": <0-100>,
  "priorityLearningPath": ["step1", "step2"],
  "estimatedTimeToReady": "X months",
  "recommendations": ["rec1", "rec2"]
}`;

  const response = await callAI(prompt, systemPrompt, 1500);
  return parseJSON(response);
};

// Generate Interview Questions
const generateInterviewQuestions = async (role, difficulty, experienceLevel, count = 5) => {
  const systemPrompt = `You are a senior technical interviewer. Return ONLY valid JSON.`;
  const prompt = `Generate ${count} interview questions for:
Role: ${role}
Difficulty: ${difficulty}
Experience: ${experienceLevel}

Return ONLY this JSON:
{
  "questions": [
    {
      "question": "Question text",
      "type": "technical|hr|behavioral"
    }
  ]
}`;

  const response = await callAI(prompt, systemPrompt, 1500);
  return parseJSON(response);
};

// Evaluate Interview Answer
const evaluateAnswer = async (question, answer, role) => {
  const systemPrompt = `You are an expert interview evaluator. Return ONLY valid JSON.`;
  const prompt = `Evaluate this interview answer:
Role: ${role}
Question: ${question}
Answer: ${answer || 'No answer provided'}

Return ONLY this JSON:
{
  "score": <0-100>,
  "technicalAccuracy": <0-10>,
  "communication": <0-10>,
  "confidence": <0-10>,
  "clarity": <0-10>,
  "problemSolving": <0-10>,
  "strengths": ["strength1"],
  "weaknesses": ["weakness1"],
  "idealAnswer": "What a great answer looks like",
  "improvementTips": ["tip1", "tip2"]
}`;

  const response = await callAI(prompt, systemPrompt, 1500);
  return parseJSON(response);
};

// Generate Career Roadmap
const generateRoadmap = async (targetRole) => {
  const systemPrompt = `You are a career coaching expert. Return ONLY valid JSON.`;
  const prompt = `Create a 6-month learning roadmap for: ${targetRole}

Return ONLY this JSON:
{
  "estimatedDuration": "6 months",
  "difficulty": "intermediate",
  "prerequisites": ["prereq1"],
  "roadmap": [
    {
      "month": 1,
      "title": "Month title",
      "topics": ["topic1", "topic2"],
      "resources": ["resource1"],
      "milestones": ["milestone1"]
    }
  ]
}`;

  const response = await callAI(prompt, systemPrompt, 2000);
  return parseJSON(response);
};

// Tailor Resume to Job Description
const tailorResume = async (resumeText, jobDescription) => {
  const systemPrompt = `You are an expert resume writer and ATS specialist. Return ONLY valid JSON.`;
  const prompt = `Compare this resume to the job description:

RESUME: ${resumeText.substring(0, 2000)}
JOB DESCRIPTION: ${jobDescription.substring(0, 1500)}

Return ONLY this JSON:
{
  "atsMatchScore": <0-100>,
  "missingKeywords": ["keyword1"],
  "matchingKeywords": ["keyword1"],
  "resumeImprovements": ["improvement1"],
  "suggestedBulletPoints": ["• Bullet point 1"],
  "tailoredSuggestions": "Detailed paragraph",
  "overallFeedback": "Overall assessment"
}`;

  const response = await callAI(prompt, systemPrompt, 2000);
  return parseJSON(response);
};

// Recommend Projects
const recommendProjects = async (skills, targetRole) => {
  const systemPrompt = `You are a software engineering mentor. Return ONLY valid JSON.`;
  const prompt = `Recommend projects for someone with skills: ${skills.join(', ')} targeting: ${targetRole}

Return ONLY this JSON:
{
  "projects": [
    {
      "title": "Project name",
      "description": "What to build",
      "difficulty": "beginner|intermediate|advanced",
      "techStack": ["tech1"],
      "features": ["feature1"],
      "learningOutcomes": ["outcome1"],
      "estimatedTime": "X weeks"
    }
  ]
}`;

  const response = await callAI(prompt, systemPrompt, 2000);
  return parseJSON(response);
};

module.exports = {
  callAI,
  analyzeResume,
  analyzeSkillGap,
  generateInterviewQuestions,
  evaluateAnswer,
  generateRoadmap,
  tailorResume,
  recommendProjects
};
