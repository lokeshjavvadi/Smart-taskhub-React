// AI-based task prioritization algorithm
const calculateAIPriority = async (taskData) => {
  let score = 50; // Base score

  // Priority multiplier
  const priorityWeights = {
    'low': 0.5,
    'medium': 1,
    'high': 1.5,
    'critical': 2
  };

  // Due date urgency
  if (taskData.dueDate) {
    const now = new Date();
    const dueDate = new Date(taskData.dueDate);
    const daysUntilDue = Math.ceil((dueDate - now) / (1000 * 60 * 60 * 24));
    
    if (daysUntilDue <= 0) {
      score += 30; // Overdue
    } else if (daysUntilDue <= 1) {
      score += 25; // Due tomorrow
    } else if (daysUntilDue <= 3) {
      score += 15; // Due in 3 days
    } else if (daysUntilDue <= 7) {
      score += 5; // Due in a week
    }
  }

  // Priority weight
  score *= priorityWeights[taskData.priority] || 1;

  // Estimated effort consideration
  if (taskData.estimatedHours) {
    if (taskData.estimatedHours <= 1) {
      score += 10; // Quick wins get bonus
    } else if (taskData.estimatedHours >= 8) {
      score -= 5; // Large tasks slightly penalized
    }
  }

  // Content analysis (simplified)
  const urgentKeywords = ['urgent', 'asap', 'important', 'critical', 'blocker'];
  const title = (taskData.title || '').toLowerCase();
  const description = (taskData.description || '').toLowerCase();

  urgentKeywords.forEach(keyword => {
    if (title.includes(keyword) || description.includes(keyword)) {
      score += 5;
    }
  });

  // Ensure score is within bounds
  return Math.max(0, Math.min(100, Math.round(score)));
};

module.exports = { calculateAIPriority };