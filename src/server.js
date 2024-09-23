const express = require('express');
const cors = require('cors');
const { Configuration, OpenAIApi } = require('openai');

const app = express();
const port = 5000;
app.use(cors());
app.use(express.json());

const configuration = new Configuration({
  apiKey: 'YOUR_OPENAI_API_KEY',  // Replace with your OpenAI API key
});
const openai = new OpenAIApi(configuration);

app.post('/api/chat', async (req, res) => {
  const { message } = req.body;

  try {
    const response = await openai.createCompletion({
      model: 'text-davinci-003', // Use appropriate OpenAI model
      prompt: message,
      max_tokens: 150,
    });

    res.json({ reply: response.data.choices[0].text.trim() });
  } catch (error) {
    console.error(error);
    res.status(500).send('Something went wrong');
  }
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
