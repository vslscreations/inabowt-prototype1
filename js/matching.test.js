const test = require('node:test');
const assert = require('node:assert/strict');
const { buildParticipantMatches } = require('./matching.js');

test('buildParticipantMatches ranks compatible profiles highest and excludes unavailable matches', () => {
  const userProfile = {
    neighborhood: 'Downtown Arts District',
    interests: ['Food & Drinks', 'Outdoors'],
    availability: ['Wed', 'Thu', 'Fri'],
    activityRadius: '10'
  };

  const event = {
    title: 'Sunset food crawl',
    category: 'Food & Drinks',
    location: 'Downtown Arts District',
    tags: ['Food', 'Drinks', 'Social'],
    address: '123 Main St',
    date: '2026-11-05T18:30:00'
  };

  const candidates = [
    {
      id: 'nina',
      name: 'Nina',
      neighborhood: 'Downtown Arts District',
      interests: ['Food & Drinks', 'Arts & Culture'],
      availability: ['Thu', 'Fri'],
      activityRadius: 12,
      status: 'available'
    },
    {
      id: 'omar',
      name: 'Omar',
      neighborhood: 'Summerlin',
      interests: ['Fitness', 'Outdoors'],
      availability: ['Sun', 'Mon'],
      activityRadius: 5,
      status: 'available'
    },
    {
      id: 'sasha',
      name: 'Sasha',
      neighborhood: 'Downtown Arts District',
      interests: ['Games'],
      availability: ['Tue'],
      activityRadius: 4,
      status: 'unavailable'
    }
  ];

  const matches = buildParticipantMatches(userProfile, event, candidates);

  assert.equal(matches.length, 2);
  assert.equal(matches[0].id, 'nina');
  assert.equal(matches[1].id, 'omar');
  assert.ok(matches.every((match) => match.status === 'available'));
});
