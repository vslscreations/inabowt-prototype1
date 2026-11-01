(function (global) {
  function normalizeMatchValue(value) {
    return String(value || '').trim().toLowerCase();
  }

  function buildParticipantMatches(userProfile, event, candidates) {
    const profile = userProfile || {};
    const preferredInterests = new Set((profile.interests || []).map((interest) => normalizeMatchValue(interest)));
    const preferredAvailability = new Set((profile.availability || []).map((day) => String(day).trim().slice(0, 3).toLowerCase()));
    const targetNeighborhood = normalizeMatchValue(profile.neighborhood || '');
    const targetRadius = Number(profile.activityRadius || 10);
    const eventCategory = normalizeMatchValue(event?.category || '');
    const eventTags = (event?.tags || []).map((tag) => normalizeMatchValue(tag));

    return (Array.isArray(candidates) ? candidates : [])
      .filter((candidate) => candidate && candidate.status !== 'unavailable')
      .map((candidate) => {
        const candidateInterests = (candidate.interests || []).map((interest) => normalizeMatchValue(interest));
        const candidateAvailability = (candidate.availability || []).map((day) => String(day).trim().slice(0, 3).toLowerCase());
        const candidateNeighborhood = normalizeMatchValue(candidate.neighborhood || '');
        const candidateRadius = Number(candidate.activityRadius || 10);

        let score = 0;

        if (targetNeighborhood && candidateNeighborhood && candidateNeighborhood.includes(targetNeighborhood)) {
          score += 26;
        }

        if (eventCategory && candidateInterests.some((interest) => interest.includes(eventCategory) || eventCategory.includes(interest))) {
          score += 22;
        }

        if (eventTags.some((tag) => candidateInterests.some((interest) => interest.includes(tag) || tag.includes(interest)))) {
          score += 18;
        }

        if (preferredInterests.size && candidateInterests.some((interest) => preferredInterests.has(interest))) {
          score += 18;
        }

        const sharedAvailability = candidateAvailability.filter((day) => preferredAvailability.has(day)).length;
        score += sharedAvailability * 10;

        const proximityBonus = Math.max(0, 14 - Math.abs(candidateRadius - targetRadius));
        score += proximityBonus;

        if (candidate.status === 'available') {
          score += 6;
        }

        return {
          ...candidate,
          score,
          matchPercent: Math.min(99, Math.max(48, Math.round(score)))
        };
      })
      .filter((candidate) => candidate.score > 0)
      .sort((left, right) => right.score - left.score);
  }

  if (typeof module !== 'undefined' && module.exports) {
    module.exports = { buildParticipantMatches };
  }

  global.buildParticipantMatches = buildParticipantMatches;
})(typeof window !== 'undefined' ? window : globalThis);
