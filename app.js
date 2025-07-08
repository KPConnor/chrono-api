const express = require('express');
const chrono = require('chrono-node');
const cors = require('cors');

const app = express();
app.use(express.json());
app.use(cors());

// Simple timezone abbreviation mapping
const tzMap = {
  EST: '-05:00',
  EDT: '-04:00',
  CST: '-06:00',
  CDT: '-05:00',
  MST: '-07:00',
  MDT: '-06:00',
  PST: '-08:00',
  PDT: '-07:00',
};

app.post('/parse', (req, res) => {
  const { phrase } = req.body;
  if (!phrase) return res.status(400).json({ error: 'Missing phrase' });

  const parsed = chrono.parse(phrase);
  if (!parsed.length) return res.status(400).json({ error: 'Could not parse phrase' });

  const result = parsed[0];
  const startDate = result.start.date();

  // Detect timezone abbreviation
  const tzMatch = phrase.match(/\b(EST|EDT|CST|CDT|MST|MDT|PST|PDT)\b/i);
  const offset = tzMatch ? tzMap[tzMatch[1].toUpperCase()] : '-04:00'; // default to Eastern

  // Build ISO strings with timezone offset
  const startIso = startDate.toISOString().split('.')[0] + offset;

  const endDate = new Date(startDate.getTime() + 60 * 60 * 1000);
  const endIso = endDate.toISOString().split('.')[0] + offset;

  res.json({
    summary: phrase.replace(result.text, '').trim() || 'Untitled Event',
    start: startIso,
    end: endIso,
    timezone: tzMatch ? tzMatch[1].toUpperCase() : 'EST',
    allDay: /\ball day\b|\bbirthday\b|\bholiday\b/i.test(phrase)
  });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Chrono API listening on port ${PORT}`));
