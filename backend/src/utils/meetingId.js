const LETTERS = "abcdefghijklmnopqrstuvwxyz";

function randomSegment(len) {
  let out = "";
  for (let i = 0; i < len; i++) {
    out += LETTERS[Math.floor(Math.random() * LETTERS.length)];
  }
  return out;
}

// Produces IDs shaped like "abc-def-ghi"
function generateMeetingId() {
  return `${randomSegment(3)}-${randomSegment(3)}-${randomSegment(3)}`;
}

module.exports = generateMeetingId;
