const fs = require("fs");
const path = require("path");

const configFilePath = path.join(__dirname, "config.json");

class ConfigService {
  constructor() {
    this.config = this.loadConfig();
  }

  loadConfig() {
    return JSON.parse(fs.readFileSync(configFilePath, "utf8"));
  }

  getCurrentSeason() {
    return this.config.currentSeason;
  }

  setCurrentSeason(newSeason) {
    this.config.currentSeason = newSeason;
    this.saveConfig();
  }

  saveConfig() {
    fs.writeFileSync(configFilePath, JSON.stringify(this.config, null, 2));
  }
}

const configService = new ConfigService();
module.exports = configService;
