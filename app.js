const express = require('express');
const chrono = require('chrono-node');
const cors = require('cors');

const app = express();
app.use(express.json());
app.use(cors());

// Map abbreviations to IANA zones
const tzMap = {
  EST: 'America/New_York',
  EDT: 'America/New_York',
  CST: 'America/Chicago',
  CDT: 'America/Chicago',
  MST: 'America/Denver',
  MDT: 'America/Denver',
  PST: 'America/Los_Angeles',
  PDT: 'America/Los_Angeles'
};

// Map IANA zones to offsets (simplified version)
const offsetMap = {
  'America/New_York': '-04:00',
  'America/Chicago': '-05:00',
  'America/Denver': '-06:00',
  'America/Los_Angeles': '-07:00'
};

app.post('/parse', (req, res) => {
  const { phrase, timezone = 'America/New_York' } = req.body;

  if (!phrase) return res.status(400).json({ error: 'Missing phrase' });

  const parsed = chrono.parse(phrase);
  if (!parsed.length) return res.status(400).json({ error: 'Could not parse phrase' });

  const startDate = parsed[0].start.date();

  // Look for timezone abbreviation in the phrase
  const tzMatch = phrase.match(/\b(EST|EDT|CST|CDT|MST|MDT|PST|PDT)\b/i);
  const tzName = tzMatch ? tzMap[tzMatch[1].toUpperCase()] : timezone;
  const offset = offsetMap[tzName] || '-04:00'; // default to Eastern

  const startIso = startDate.toISOString().split('.')[0] + offset;
  const endDate = new Date(startDate.getTime() + 60 * 60 * 1000);
  const endIso = endDate.toISOString().split('.')[0] + offset;

  res.json({
    summary: phrase.replace(parsed[0].text, '').trim() || 'Untitled Event',
    start: startIso,
    end: endIso,
    timezone: tzName,
    allDay: /\ball day\b|\bbirthday\b|\bholiday\b/i.test(phrase)
  });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Chrono API listening on port ${PORT}`));
