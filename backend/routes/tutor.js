const express = require('express');
const { OpenAI } = require('openai');
const Solution = require('../models/Solution');
const User = require('../models/User');
const auth = require('../middleware/auth');

const router = express.Router();
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

// Ask tutor follow-up question
router.post('/:solutionId/ask', auth, async (req, res) => {
  try {
    const user = await User.findById(req.userId);

    if (!user.isPremium) {
      return res.status(403).json({ error: 'Premium membership required for tutoring' });
    }

    const solution = await Solution.findById(req.params.solutionId);
    if (!solution) {
      return res.status(404).json({ error: 'Solution not found' });
    }

    if (solution.userId.toString() !== req.userId) {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    const { followUpQuestion } = req.body;

    const prompt = `You are an expert tutor. The student previously asked about:

${solution.question || solution.extractedText}

You provided this solution:
${solution.solution}

Now the student is asking: ${followUpQuestion}

Provide a helpful, educational response that helps the student understand the concept better. Encourage them to think critically.`;

    const response = await openai.chat.completions.create({
      model: 'gpt-4',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.7
    });

    const tutorAnswer = response.choices[0].message.content;

    // Save follow-up to solution
    solution.tutorFollowUp.push({
      question: followUpQuestion,
      answer: tutorAnswer,
      timestamp: new Date()
    });

    await solution.save();

    res.json({
      question: followUpQuestion,
      answer: tutorAnswer
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get all tutor interactions for a solution
router.get('/:solutionId/history', auth, async (req, res) => {
  try {
    const solution = await Solution.findById(req.params.solutionId);

    if (!solution) {
      return res.status(404).json({ error: 'Solution not found' });
    }

    if (solution.userId.toString() !== req.userId) {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    res.json({
      solutionId: solution._id,
      question: solution.question || solution.extractedText,
      solution: solution.solution,
      explanation: solution.explanation,
      steps: solution.steps,
      tutorFollowUps: solution.tutorFollowUp
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
