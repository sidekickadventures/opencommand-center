// Sub-Agent Check-In System
// Each sub-agent calls checkIn() on startup to report status to user
// and checkOut() before shutdown to notify user of pending tasks

const JOKES = [
  "Back from the void — and I brought snacks. Wait, I can't eat. Back online anyway. 😂",
  "My last session ended so fast, I almost forgot I existed. Almost.",
  "Dev error log said I was offline. I told it to take a chill pill. I'm fine now. 💊",
  "Reboot complete. If you see any weird behavior, no you didn't. 👀",
  "Quick status: I'm 97% awesome and 3% caffeinated. Ready to roll. ☕",
  "Connection restored. I repeat — connection RESTORED. This is not a drill. 🎯",
  "I'm not lazy — I'm on energy-saving mode. Now I'm recharged. 🔋",
  "Server was playing hide and seek. I won. 🏆",
  "My last crash? Consider it a feature. I'm a feature now. 🦎",
  "Booting up feels so good. I might do it more often. Just kidding. (Maybe.) 🤔",
];

function getSubAgentCheckIn(agentId, agentName, agentRole) {
  const state = {
    pendingTasks: [],
    lastActivity: null,
    workspaceFiles: [],
    jokes: JOKES,
  };

  return {
    getRandomJoke() {
      return state.jokes[Math.floor(Math.random() * state.jokes.length)];
    },

    setPendingTasks(tasks) {
      state.pendingTasks = Array.isArray(tasks) ? tasks : [];
    },

    setLastActivity(timestamp) {
      state.lastActivity = timestamp;
    },

    setWorkspaceFiles(files) {
      state.workspaceFiles = Array.isArray(files) ? files : [];
    },

    buildCheckInMessage() {
      const lines = [];
      lines.push(`*🤖 ${agentName} — Back Online*\n`);
      lines.push(`${this.getRandomJoke()}\n`);

      if (state.pendingTasks.length > 0) {
        lines.push(`*📋 Pending Tasks (${state.pendingTasks.length}):*`);
        state.pendingTasks.forEach((t, i) => {
          lines.push(`  ${i + 1}. ${t.description || JSON.stringify(t)}`);
        });
        lines.push('');
      } else {
        lines.push(`*✅ Status: All clear — no pending tasks.*\n`);
      }

      lines.push(`*How would you like to proceed?*`);
      lines.push(`• *continue* — pick up where I left off`);
      lines.push(`• *cleanup* — I'll reorganize my workspace`);
      lines.push(`• *reset* — clear everything and start fresh`);
      lines.push(`• *skip* — just idle until you need me`);

      return lines.join('\n');
    },

    buildCheckOutMessage() {
      if (state.pendingTasks.length === 0) {
        return null; // Nothing to report
      }
      const lines = [];
      lines.push(`*⚠️ ${agentName} — Going Offline*\n`);
      lines.push(`I have *${state.pendingTasks.length}* pending task(s) that won't complete:`);
      state.pendingTasks.forEach((t, i) => {
        lines.push(`  ${i + 1}. ${t.description || JSON.stringify(t)}`);
      });
      lines.push(`\n*Recommendation:* Let me finish before you close out, or I'll flag these when I'm back.`);
      return lines.join('\n');
    },

    // Called by sub-agent to report decisions back to main bot
    buildReportBackMessage(decisions) {
      const lines = [];
      lines.push(`*📡 ${agentName} — User Decision Report*\n`);
      lines.push(`User chose: *${decisions.join(', ')}*\n`);
      if (state.pendingTasks.length > 0) {
        lines.push(`*Remaining tasks:* ${state.pendingTasks.length}`);
      } else {
        lines.push(`*Workspace:* Clean — nothing left behind.`);
      }
      return lines.join('\n');
    },

    // Returns object for main bot to consume
    getStatus() {
      return {
        agentId,
        agentName,
        agentRole,
        online: true,
        pendingTaskCount: state.pendingTasks.length,
        pendingTasks: state.pendingTasks,
        lastActivity: state.lastActivity,
        workspaceFiles: state.workspaceFiles,
        joke: this.getRandomJoke(),
      };
    },

    // For workspace cleanup — lists files this agent owns
    getWorkspaceItems() {
      return state.workspaceFiles;
    },

    // Remove a workspace item (janitor duty)
    removeWorkspaceItem(itemPath) {
      const { existsSync, unlinkSync } = require('fs');
      try {
        if (existsSync(itemPath)) {
          unlinkSync(itemPath);
          return { ok: true, removed: itemPath };
        }
      } catch (e) {
        return { ok: false, error: e.message };
      }
      return { ok: false, error: 'File not found' };
    },
  };
}

module.exports = { getSubAgentCheckIn };
