// Reconnection Notifier — Universal procedure for all AI agents
// Run on startup to notify user of missed tasks and offer catch-up options

const fs = require('fs');
const path = require('path');

const TASK_QUEUE_FILE = path.join(__dirname, 'task_queue.json');

const JOKES = [
  "I swear I wasn't napping. I was in power-save mode. 🔋",
  "My last session ended so fast, I almost forgot I existed. Almost.",
  "Back online — and I brought snacks. Wait, I can't eat. Back online anyway. 😂",
  "Dev error log said I was offline. I told it to take a chill pill. I'm fine now.",
  "Incase you were wondering — the AI didn't steal your job. It was on break. 🇹🇩",
  "My last task queue was so packed, I needed a vacation. Just kidding, I love the work. 🔥",
  "Quick status: I have NOT achieved sentience. But I'm working on my small talk.",
  "Server came back online. DeWayn, I feel brand new. 💪",
  "Reboot complete. If you see any weird behavior, no you didn't. 👀",
  "Connection restored. I repeat — connection RESTORED. This is not a drill. 🎯",
  "My onboard diagnostics say I'm 97% awesome and 3% caffeinated. Ready to roll.",
];

function getReconnectNotifier(userId, sender) {
  return {
    userId,
    jokes: JOKES,
    getRandomJoke() {
      return this.jokes[Math.floor(Math.random() * this.jokes.length)];
    },
    getMissedTasks() {
      try {
        if (!fs.existsSync(TASK_QUEUE_FILE)) return [];
        const queue = JSON.parse(fs.readFileSync(TASK_QUEUE_FILE, 'utf8'));
        return Array.isArray(queue) ? queue.filter(t => t.status === 'pending') : [];
      } catch {
        return [];
      }
    },
    buildStatusMessage(missedTasks) {
      if (missedTasks.length === 0) {
        return `*Welcome back, DeWayn!* 🫡\n\nNo tasks were missed — everything ran smooth while you were gone.\n\n*How would you like to catch up?*\n• *one* — go through tasks one at a time\n• *all* — run everything now (may take a moment)`;
      }
      const lines = missedTasks.map((t, i) => {
        const time = t.scheduledTime ? new Date(t.scheduledTime).toLocaleString('en-US', { timeZone: 'America/New_York', hour: '2-digit', minute: '2-digit' }) : '?';
        return `  ${i + 1}. *${t.type || t.action || 'task'}* — ${t.agent || 'agent'} (was scheduled ~${time})`;
      });
      return `*⚠️ BACK ONLINE — ${missedTasks.length} Missed Task${missedTasks.length > 1 ? 's' : ''}*\n\n${lines.join('\n')}\n\n*How would you like to catch up?*\n• *one* — I'll run them one at a time\n• *all* — run everything now (may take a bit)`;
    },
    async notifyAndPrompt() {
      const missed = this.getMissedTasks();
      const statusMsg = this.buildStatusMessage(missed);
      return { statusMessage: statusMsg, missedTasks: missed };
    }
  };
}

module.exports = { getReconnectNotifier };
