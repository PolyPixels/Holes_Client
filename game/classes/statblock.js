const BASE_STATS = [
    {
        "name": "gnome",
        "hp": 100,
        "mhp": 100,
        "regen": 0.2,
        "attack": 2,
        "magic": 1,
        "mp": 100,
        "mmp": 100,
        "magicResistance": 2,
        "luck": 10,
        "credit": 1,
        "hearing": 1,
        "speakingRange": 2,
        "Fear": 1,
        "powerLevel": 1,
        "handDigSpeed": 0.05,
        "runningSpeed": 1,
        "growth": {
            "hp": 10,
            "mhp": 10,
            "attack": 2,
            "magic": 0.5,
            "regen": 0.05,
            "mp": 1,
            "mmp": 1,
            "magicResistance": 0.2,
            "luck": 1
        }
    },
    {
        "name": "aylah",
        "hp": 100,
        "mhp": 100,
        "regen": 0.1,
        "attack": 1,
        "magic": 5,
        "mp": 150,
        "mmp": 150,
        "magicResistance": 10,
        "luck": 1,
        "credit": 1,
        "hearing": 10,
        "speakingRange": 1,
        "Fear": 1,
        "powerLevel": 1,
        "handDigSpeed": 0.07,
        "runningSpeed": 1,
        "growth": {
            "hp": 5,
            "mhp": 5,
            "attack": 0.5,
            "magic": 2,
            "regen": 0.02,
            "mp": 20,
            "mmp": 20,
            "magicResistance": 0.5,
            "luck": 0.5
        }
    },
    {
        "name": "skizzard",
        "hp": 100,
        "mhp": 100,
        "regen": 0.5,
        "attack": 1,
        "magic": 1,
        "mp": 100,
        "mmp": 100,
        "magicResistance": 1,
        "luck": 1,
        "credit": 1,
        "hearing": 5,
        "speakingRange": 1,
        "Fear": 2,
        "powerLevel": 1,
        "handDigSpeed": 0.08,
        "runningSpeed": 1,
        "growth": {
            "hp": 8,
            "mhp": 8,
            "attack": 0.5,
            "magic": 0.5,
            "regen": 0.05,
            "mp": 10,
            "mmp": 10,
            "magicResistance": 0.1,
            "luck": 0.5
        }
    }
];

class StatBlock{
    constructor(race, health){
        this.race = race;
        this.stats = JSON.parse(JSON.stringify(BASE_STATS[this.race]));
        if(health != undefined) this.stats.hp = health;
        this.level = 1;
        this.xp = 0;
        this.xpNeeded = 10;
    }
setXP(amount) {
    this.xp += amount;

    if (this.xp >= this.xpNeeded) {
        console.log("level up")
        this.level++;
        this.xpNeeded = Math.floor(this.xpNeeded * 1.5);

        // Apply growth per level
        const growth = BASE_STATS[this.race].growth;
        for (let key in growth) {
            if (this.stats[key] !== undefined) {
                this.stats[key] += growth[key];
            }
        }
        this.xp =0;
    }

    console.log("my xp currently", this.xp, "xp required", this.xpNeeded)
}



    heal(amount) {
        this.stats.hp = this.stats.hp + amount;

        if(this.stats.hp > this.stats.mhp) {
            this.stats.hp = this.stats.mhp;
        }

        socket.emit("update_player", {
            id: curPlayer.id,
            pos: curPlayer.pos,
            holding: curPlayer.holding,
            update_names: ["stats.hp"],
            update_values: [this.stats.hp]
        });
    }

    addXP(amount){
        this.xp += amount;
        if(this.xp > this.xpNeeded){
            this.xp = 0;
            this.level ++;
            this.xpNeeded *= 2;

            this.updateStats(this.level);
        }
    }

    updateStats(lvl){
        this.level = lvl;
        this.runningSpeed += 0.1;
    }
}