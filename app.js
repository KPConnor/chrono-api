const express = require('express');
const chrono = require('chrono-node');
const cors = require('cors');

const app = express();
app.use(express.json());
app.use(cors());

app.post('/parse', (req, res) => {
  const { phrase } = req.body;
  if (!phrase) return res.status(400).json({ error: 'Missing phrase' });

  const parsed = chrono.parse(phrase);
  if (!parsed.length) return res.status(400).json({ error: 'Could not parse phrase' });

  const startDate = parsed[0].start.date();
  const endDate = new Date(startDate.getTime() + 60 * 60 * 1000);

  res.json({
    summary: phrase.replace(parsed[0].text, '').trim() || 'Untitled Event',
    start: startDate.toISOString(),
    end: endDate.toISOString(),
    timezone: 'America/New_York', // Static fallback for now
    allDay: /\ball day\b|\bbirthday\b|\bholiday\b/i.test(phrase)
  });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Chrono API listening on port ${PORT}`));
