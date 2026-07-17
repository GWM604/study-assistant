import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import '../styles/SolutionDetail.css';

function SolutionDetail({ user }) {
  const { id } = useParams();
  const [solution, setSolution] = useState(null);
  const [followUpQuestion, setFollowUpQuestion] = useState('');
  const [followUps, setFollowUps] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const token = localStorage.getItem('token');

  useEffect(() => {
    fetchSolutionDetail();
  }, [id]);

  const fetchSolutionDetail = async () => {
    try {
      const response = await fetch(`/api/tutor/${id}/history`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      setSolution(data);
      setFollowUps(data.tutorFollowUps || []);
    } catch (err) {
      console.error('Error fetching solution:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleAskTutor = async (e) => {
    e.preventDefault();

    if (!user.isPremium) {
      alert('Tutoring is only available with Premium membership!');
      return;
    }

    if (!followUpQuestion.trim()) return;

    setSubmitting(true);
    try {
      const response = await fetch(`/api/tutor/${id}/ask`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ followUpQuestion })
      });

      const data = await response.json();
      if (response.ok) {
        setFollowUps([...followUps, { question: data.question, answer: data.answer, timestamp: new Date() }]);
        setFollowUpQuestion('');
      }
    } catch (err) {
      console.error('Error asking tutor:', err);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <div className="loading">Loading...</div>;
  if (!solution) return <div className="error">Solution not found</div>;

  return (
    <div className="solution-detail">
      <div className="solution-content">
        <h1>Solution Details</h1>

        <div className="original-problem">
          <h2>Your Problem</h2>
          <p>{solution.question || solution.extractedText}</p>
        </div>

        <div className="solution-box">
          <h2>Solution</h2>
          <p>{solution.solution}</p>
        </div>

        {solution.explanation && (
          <div className="explanation-box">
            <h2>Explanation</h2>
            <p>{solution.explanation}</p>
          </div>
        )}

        {solution.steps && solution.steps.length > 0 && (
          <div className="steps-box">
            <h2>Step-by-Step</h2>
            <ol>
              {solution.steps.map((step, idx) => (
                <li key={idx}>{step}</li>
              ))}
            </ol>
          </div>
        )}

        {/* Tutor Section */}
        {user.isPremium && (
          <div className="tutor-section">
            <h2>Ask Your AI Tutor</h2>
            <form onSubmit={handleAskTutor}>
              <textarea
                value={followUpQuestion}
                onChange={(e) => setFollowUpQuestion(e.target.value)}
                placeholder="Ask a follow-up question to understand better..."
                rows="3"
              />
              <button type="submit" disabled={submitting || !followUpQuestion.trim()} className="btn-primary">
                {submitting ? 'Getting Response...' : 'Ask Tutor'}
              </button>
            </form>

            {followUps.length > 0 && (
              <div className="tutor-responses">
                <h3>Tutor Responses</h3>
                {followUps.map((followUp, idx) => (
                  <div key={idx} className="followup-item">
                    <p className="followup-question"><strong>You:</strong> {followUp.question}</p>
                    <p className="followup-answer"><strong>Tutor:</strong> {followUp.answer}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {!user.isPremium && (
          <div className="premium-feature">
            <p>💡 Ask unlimited follow-up questions with Premium AI Tutoring</p>
            <button className="btn-premium" onClick={() => window.location.href = '/premium'}>Upgrade to Premium</button>
          </div>
        )}
      </div>
    </div>
  );
}

export default SolutionDetail;
