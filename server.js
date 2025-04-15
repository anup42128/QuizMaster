const express = require('express');
const cors = require('cors');
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 3000;

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY
);

app.use(cors());
app.use(express.json());

app.get('/api/questions/:topic/:level', async (req, res) => {
  const { topic, level } = req.params;
  
  try {
    const { data, error } = await supabase
      .from('questions')
      .select('*')
      .eq('topic', topic)
      .eq('level', level);
      
    if (error) throw error;
    
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/results', async (req, res) => {
  const { userId, topic, level, score, totalQuestions } = req.body;
  
  try {
    const { data, error } = await supabase
      .from('quiz_results')
      .insert([
        {
          user_id: userId,
          topic,
          level,
          score,
          total_questions: totalQuestions,
          completed_at: new Date()
        }
      ]);
      
    if (error) throw error;
    
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/results/:userId', async (req, res) => {
  const { userId } = req.params;
  
  try {
    const { data, error } = await supabase
      .from('quiz_results')
      .select('*')
      .eq('user_id', userId)
      .order('completed_at', { ascending: false });
      
    if (error) throw error;
    
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
